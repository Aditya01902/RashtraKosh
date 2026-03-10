import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateAndStoreScores } from "@/lib/scoring";
import { UserRole } from "@/lib/types";

import { limitRate } from "@/lib/rate-limit";
import { handleApiError } from '@/lib/api-response';


export async function POST(req: Request) {
    try {
        // Rate limiting - Max 5 commits per minute per IP
        const rateLimitResponse = await limitRate(req, 5, 60 * 1000, "upload_commit");
        if (rateLimitResponse) return rateLimitResponse;

        const session = await auth();
        const isAdmin = session?.user?.role === UserRole.SUPER_ADMIN || session?.user?.role === UserRole.MINISTRY_ADMIN;

        if (!session || !isAdmin) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { validRows } = body;

        // strict length limits
        if (!validRows || !Array.isArray(validRows) || validRows.length === 0) {
            return new NextResponse("No valid rows to commit", { status: 400 });
        }

        if (validRows.length > 10000) {
            return new NextResponse("Payload too large. Maximum 10,000 rows permitted per commit.", { status: 413 });
        }

        const results = [];

        // Process each row atomically with error handling
        for (const row of validRows) {
            try {
                // For simplicity in this fix, we map the old fields to the new ones
                // In a real scenario, the row would already have the correct structure
                await db.budgetAllocation.upsert({
                    where: {
                        schemeId_fiscalYear: {
                            schemeId: row.schemeId,
                            fiscalYear: row.fiscalYear
                        }
                    },
                    update: {
                        allocated: row.allocatedAmount || row.allocated || 0,
                        utilized: row.actualExpenditure || row.utilized || 0,
                        allocatedCapital: row.allocatedCapital || 0,
                        allocatedRevenue: row.allocatedRevenue || 0,
                        utilizedCapital: row.utilizedCapital || 0,
                        utilizedRevenue: row.utilizedRevenue || 0,
                        expenditureQ1: row.expenditureQ1 || 0,
                        expenditureQ2: row.expenditureQ2 || 0,
                        expenditureQ3: row.expenditureQ3 || 0,
                        expenditureQ4: row.expenditureQ4 || 0,
                        surrendered: row.surrendered || 0,
                    },
                    create: {
                        schemeId: row.schemeId,
                        fiscalYear: row.fiscalYear,
                        allocated: row.allocatedAmount || row.allocated || 0,
                        utilized: row.actualExpenditure || row.utilized || 0,
                        allocatedCapital: row.allocatedCapital || 0,
                        allocatedRevenue: row.allocatedRevenue || 0,
                        utilizedCapital: row.utilizedCapital || 0,
                        utilizedRevenue: row.utilizedRevenue || 0,
                        expenditureQ1: row.expenditureQ1 || 0,
                        expenditureQ2: row.expenditureQ2 || 0,
                        expenditureQ3: row.expenditureQ3 || 0,
                        expenditureQ4: row.expenditureQ4 || 0,
                        surrendered: row.surrendered || 0,
                    }
                });

                // Trigger score recalculation
                await calculateAndStoreScores(row.schemeId, row.fiscalYear);
                results.push({ schemeId: row.schemeId, status: "success" });
            } catch (err) {
                const error = err as Error;
                console.error(`Failed to process row for scheme ${row.schemeId}`, error);
                results.push({ schemeId: row.schemeId, status: "error", error: error.message });
            }
        }

        return NextResponse.json({
            success: true,
            processed: validRows.length,
            results
        });
    } catch (error) {
        console.error("[UPLOAD_COMMIT_POST]", error);
        return handleApiError(error);
    }
}
