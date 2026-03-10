import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const department = await db.department.findUnique({
            where: { id: params.id },
            include: {
                schemes: {
                    include: {
                        budgetAllocations: {
                            where: { fiscalYear: '2024-25' }
                        },
                        scores: {
                            where: { fiscalYear: '2024-25' }
                        }
                    }
                }
            }
        });

        if (!department) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(department);
    } catch (error) {
        console.error("[DEPARTMENT_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
