import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const ceilingParam = searchParams.get("ceiling") || "50000";
    const ceiling = parseFloat(ceilingParam);

    // Mock data for projection table
    const plans = [
        {
            id: "scheme_1",
            name: "Pradhan Mantri Awas Yojana (Urban)",
            ministry: "MoHUA",
            score: 88,
            currentAllocation: 16000,
            currentCapital: 15000,
            currentRevenue: 1000,
            proposedAllocation: 18400,
            proposedCapital: 17200,
            proposedRevenue: 1200,
            deltaAmount: 2400,
            deltaPercent: 15.0,
            scoreMultiplier: 1.15,
            priorityWeight: 1.2,
            absorptionFactor: 0.95,
            rationale: "High score, high priority infrastructure scheme with proven absorption",
            isFloorApplied: false
        },
        {
            id: "scheme_2",
            name: "Jal Jeevan Mission",
            ministry: "Jal Shakti",
            score: 82,
            currentAllocation: 22000,
            currentCapital: 20000,
            currentRevenue: 2000,
            proposedAllocation: 24200,
            proposedCapital: 22000,
            proposedRevenue: 2200,
            deltaAmount: 2200,
            deltaPercent: 10.0,
            scoreMultiplier: 1.05,
            priorityWeight: 1.3,
            absorptionFactor: 0.9,
            rationale: "Consistent performer in critical sector",
            isFloorApplied: false
        },
        {
            id: "scheme_3",
            name: "National Highway Expansion Phase II",
            ministry: "MoRTH",
            score: 50,
            currentAllocation: 12500,
            currentCapital: 12000,
            currentRevenue: 500,
            proposedAllocation: 9000,
            proposedCapital: 8600,
            proposedRevenue: 400,
            deltaAmount: -3500,
            deltaPercent: -28.0,
            scoreMultiplier: 0.7,
            priorityWeight: 1.0,
            absorptionFactor: 0.6,
            rationale: "Score penalty applied due to persistent idle funds. Floor protection prevented further cut.",
            isFloorApplied: true
        },
        {
            id: "scheme_4",
            name: "Rural Digital Literacy",
            ministry: "MeitY",
            score: 65,
            currentAllocation: 2000,
            currentCapital: 500,
            currentRevenue: 1500,
            proposedAllocation: 1800,
            proposedCapital: 400,
            proposedRevenue: 1400,
            deltaAmount: -200,
            deltaPercent: -10.0,
            scoreMultiplier: 0.9,
            priorityWeight: 0.8,
            absorptionFactor: 0.7,
            rationale: "Low utilization driven revenue rollback",
            isFloorApplied: false
        }
    ];

    const totalCurrent = plans.reduce((sum, p) => sum + p.currentAllocation, 0);
    const totalProposed = plans.reduce((sum, p) => sum + p.proposedAllocation, 0);
    const netChange = totalProposed - totalCurrent;
    const netChangePercent = (netChange / totalCurrent) * 100;
    const envelopeRemaining = ceiling - totalProposed;

    const summary = {
        totalCurrent,
        totalProposed,
        netChange,
        netChangePercent,
        envelopeRemaining
    };

    return NextResponse.json({ summary, plans });
}
