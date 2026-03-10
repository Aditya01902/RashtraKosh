import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        // Allow MINISTRY_ADMIN and SUPER_ADMIN
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const role = (session.user as any)?.role;
        if (role !== "SUPER_ADMIN" && role !== "MINISTRY_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { adminNote } = await req.json();

        const updated = await db.feedbackItem.update({
            where: { id: params.id },
            data: { adminNote },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
