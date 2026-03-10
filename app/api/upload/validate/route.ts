import { NextResponse } from "next/server";
import { parseExcel, parseCSV } from "@/lib/upload/parser";
import { autoMapColumns, applyMapping } from "@/lib/upload/column-mapper";
import { validateRows } from "@/lib/upload/validator";
import { auth } from "@/lib/auth";
import { UserRole } from "@/lib/types";

import { limitRate } from "@/lib/rate-limit";

export async function POST(req: Request) {
    try {
        // Rate limiting - Max 5 file validations per minute per IP to prevent DoS
        const rateLimitResponse = await limitRate(req, 5, 60 * 1000, "upload_validate");
        if (rateLimitResponse) return rateLimitResponse;

        const session = await auth();
        const isAdmin = session?.user?.role === UserRole.SUPER_ADMIN || session?.user?.role === UserRole.MINISTRY_ADMIN;

        if (!session || !isAdmin) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const userMappingStr = formData.get("mapping") as string;

        if (!file) {
            return new NextResponse("File required", { status: 400 });
        }

        let parsedRows: Record<string, unknown>[] = [];

        if (file.name.endsWith(".xlsx")) {
            const buffer = Buffer.from(await file.arrayBuffer());
            parsedRows = await parseExcel(buffer);
        } else if (file.name.endsWith(".csv")) {
            const text = await file.text();
            parsedRows = await parseCSV(text);
        } else {
            return new NextResponse("Unsupported file type", { status: 400 });
        }

        if (parsedRows.length === 0) {
            return new NextResponse("File is empty", { status: 400 });
        }

        const headers = Object.keys(parsedRows[0]);
        let mapping = {};

        if (userMappingStr) {
            mapping = JSON.parse(userMappingStr);
        } else {
            mapping = autoMapColumns(headers);
        }

        const mappedRows = applyMapping(parsedRows, mapping);
        const validationResult = validateRows(mappedRows);

        return NextResponse.json({
            headers,
            suggestedMapping: mapping,
            validation: validationResult
        });

    } catch (error) {
        console.error("[UPLOAD_VALIDATE_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
