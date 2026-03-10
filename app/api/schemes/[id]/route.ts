import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/api-response';


export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { searchParams } = new URL(request.url);
    const fy = searchParams.get('fy') || '2024-25';

    try {
        const scheme = await db.scheme.findUnique({
            where: { id: params.id },
            include: {
                department: {
                    include: { ministry: true }
                },
                scores: {
                    where: { fiscalYear: fy }
                },
                budgetAllocations: {
                    where: { fiscalYear: fy }
                },
                outputData: {
                    where: { fiscalYear: fy }
                },
                outcomeData: {
                    where: { fiscalYear: fy }
                }
            }
        });

        if (!scheme) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json({
            id: scheme.id,
            name: scheme.name,
            description: scheme.description,
            launchYear: scheme.launchYear,
            priorityCategory: scheme.priorityCategory,
            isActive: scheme.isActive,
            ministry: {
                id: scheme.department.ministry.id,
                name: scheme.department.ministry.name,
                shortCode: scheme.department.ministry.shortCode,
            },
            department: {
                id: scheme.department.id,
                name: scheme.department.name,
            },
            allocation: scheme.budgetAllocations[0] || null,
            score: scheme.scores[0] || null,
            outputData: scheme.outputData[0] || null,
            outcomeData: scheme.outcomeData[0] || null,
        });
    } catch (error) {
        console.error('[SCHEME_GET]', error);
        return handleApiError(error);
    }
}
