import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { donorIds, recipientIds } = await req.json();

        if (!donorIds || !recipientIds) {
            return NextResponse.json({ error: "Missing donor or recipient IDs" }, { status: 400 });
        }

        // Mock response generating flows
        const flows = [
            {
                id: "flow_1",
                fromSchemeId: donorIds[0] || "scheme_1",
                fromSchemeName: "National Highway Expansion Phase II",
                toSchemeId: recipientIds[0] || "scheme_4",
                toSchemeName: "Pradhan Mantri Awas Yojana (Urban)",
                amount: 2500,
                type: "CAPITAL", // Testing separation of capital and revenue
                rationale: "High absorption capacity in PMAY-U to utilize idle capital from MoRTH",
                risk: "LOW" // Removed extra comma 
            },
            {
                id: "flow_2",
                fromSchemeId: donorIds[1] || "scheme_2",
                fromSchemeName: "Rural Digital Literacy",
                toSchemeId: recipientIds[1] || "scheme_5",
                toSchemeName: "Jal Jeevan Mission",
                amount: 800,
                type: "REVENUE", // Testing separation of capital and revenue
                rationale: "Shifting unutilized MeitY revenue to JJM operations",
                risk: "MEDIUM"
            }
        ];

        return NextResponse.json({ flows });
    } catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
