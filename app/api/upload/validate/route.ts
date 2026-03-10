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

        if (file.size > 10 * 1024 * 1024) {
            return new NextResponse("File too large. Maximum size is 10MB.", { status: 400 });
        }

        let parsedRows: Record<string, unknown>[] = [];
        const buffer = Buffer.from(await file.arrayBuffer());

        // Magic bytes validation
        const hexSignature = buffer.toString('hex', 0, 4).toUpperCase();
        let isValidSignature = false;

        if (file.name.endsWith(".xlsx") && hexSignature === "504B0304") {
            isValidSignature = true;
            parsedRows = await parseExcel(buffer);
        } else if (file.name.endsWith(".csv")) {
            // Null bytes check to differentiate from binary
            if (!buffer.slice(0, 512).includes(0x00)) {
                isValidSignature = true;
                const text = buffer.toString('utf-8');
                parsedRows = await parseCSV(text);
            }
        }

        if (!isValidSignature) {
            return new NextResponse("Invalid file signature or unsupported type", { status: 400 });
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
