import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Temporary mock for /api/reallocation/idle
export async function GET(req: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idleSchemes = [
        {
            id: "scheme_1",
            name: "National Highway Expansion Phase II",
            ministryName: "MoRTH",
            utilizationScore: 45,
            finalScore: 50,
            allocatedCapital: 12000,
            allocatedRevenue: 500,
            capitalIdle: 4000,
            revenueIdle: 100,
            totalIdle: 4100,
            rootCause: "Land Acquisition Delay",
            risk: "MEDIUM",
            quadrant: "FAILING",
        },
        {
            id: "scheme_2",
            name: "Rural Digital Literacy",
            ministryName: "MeitY",
            utilizationScore: 30,
            finalScore: 65,
            allocatedCapital: 500,
            allocatedRevenue: 1500,
            capitalIdle: 300,
            revenueIdle: 800,
            totalIdle: 1100,
            rootCause: "Procurement Bottleneck",
            risk: "HIGH",
            quadrant: "OVERFUNDED",
        },
        {
            id: "scheme_3",
            name: "Smart Cities Mission",
            ministryName: "MoHUA",
            utilizationScore: 55,
            finalScore: 58,
            allocatedCapital: 8000,
            allocatedRevenue: 2000,
            capitalIdle: 2000,
            revenueIdle: 500,
            totalIdle: 2500,
            rootCause: "Vendor onboarding",
            risk: "LOW",
            quadrant: "FAILING",
        }
    ];

    const efficientSchemes = [
        {
            id: "scheme_4",
            name: "Pradhan Mantri Awas Yojana (Urban)",
            ministryName: "MoHUA",
            utilizationScore: 95,
            finalScore: 88,
            allocatedCapital: 15000,
            allocatedRevenue: 1000,
            capitalIdle: 0,
            revenueIdle: 0,
            totalIdle: 0,
            rootCause: "None",
            risk: "LOW",
            quadrant: "EFFICIENT",
            absorptionCapacity: 5000,
        },
        {
            id: "scheme_5",
            name: "Jal Jeevan Mission",
            ministryName: "Jal Shakti",
            utilizationScore: 92,
            finalScore: 82,
            allocatedCapital: 20000,
            allocatedRevenue: 2000,
            capitalIdle: 0,
            revenueIdle: 0,
            totalIdle: 0,
            rootCause: "None",
            risk: "LOW",
            quadrant: "STARVED",
            absorptionCapacity: 8000,
        }
    ];

    const allSchemes = [...idleSchemes, ...efficientSchemes];

    const summary = {
        idleCount: idleSchemes.length,
        inefficientCount: idleSchemes.filter(s => s.utilizationScore < 60).length,
        reclaimableCapital: idleSchemes.reduce((sum, s) => sum + s.capitalIdle, 0),
        reclaimableRevenue: idleSchemes.reduce((sum, s) => sum + s.revenueIdle, 0),
    };

    return NextResponse.json({ summary, idleSchemes, allSchemes });
}
