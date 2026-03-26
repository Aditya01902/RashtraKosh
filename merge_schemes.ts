import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: "d:/Codes/India Innovates/RashtraKosh/.env.local" });

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function main() {
    const schemes = await prisma.scheme.findMany({
        select: { id: true, name: true, department: { select: { name: true, ministry: { select: { name: true } } } } }
    });

    console.log(`LOG: Total Schemes: ${schemes.length}`);

    // Batch schemes by name first to find likely duplicates
    const schemeList = schemes.map(s => ({
        id: s.id,
        name: s.name,
        ministry: s.department.ministry.name
    }));

    // Grouping by Ministry to make it easier for LLM
    const ministryGroups: Record<string, typeof schemeList> = {};
    schemeList.forEach(s => {
        if (!ministryGroups[s.ministry]) ministryGroups[s.ministry] = [];
        ministryGroups[s.ministry].push(s);
    });

    const mapping: Record<string, string> = {}; // id -> canonicalName

    for (const [ministry, group] of Object.entries(ministryGroups)) {
        console.log(`LOG: Processing Ministry: ${ministry} (${group.length} schemes)`);
        
        const names = group.map(s => s.name);
        if (names.length < 2) continue;

        const prompt = `
        Below is a list of government scheme names from the Ministry/Department of ${ministry}.
        Some names might be slightly different versions of the same scheme (e.g. abbreviations, full names, or name changes over years).
        Identify pairs (or groups) of names that refer to the EXACT SAME scheme.
        Output a JSON object where the key is the redundant name and the value is the canonical name (the most complete or newer name).
        If a scheme has no duplicates, do NOT include it.
        ONLY return the JSON object.
        Schemes:
        ${JSON.stringify(names, null, 2)}
        `;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const groupMapping = JSON.parse(jsonStr);

            // Apply mapping back to group
            for (const s of group) {
                if (groupMapping[s.name]) {
                    mapping[s.id] = groupMapping[s.name];
                } else {
                    mapping[s.id] = s.name;
                }
            }
        } catch (e) {
            console.error(`Error processing ministry ${ministry}:`, e);
        }
    }

    // Now merge schemes with same mapping
    console.log("LOG: Merging schemes based on mapping...");
    const canonicalMap: Record<string, { id: string, name: string }[]> = {};
    for (const s of schemes) {
        const canonical = mapping[s.id] || s.name;
        if (!canonicalMap[canonical]) canonicalMap[canonical] = [];
        canonicalMap[canonical].push(s);
    }

    let mergeCount = 0;
    for (const [canonical, refs] of Object.entries(canonicalMap)) {
        if (refs.length > 1) {
            // Merge refs[1..n] into refs[0]
            const targetId = refs[0].id;
            for (let i = 1; i < refs.length; i++) {
                const sourceId = refs[i].id;
                console.log(`LOG: Merging ${refs[i].name} (${sourceId}) into ${canonical} (${targetId})`);
                
                // Update budget allocations and handle conflicts
                const allocations = await prisma.budgetAllocation.findMany({ where: { schemeId: sourceId } });
                for (const b of allocations) {
                    try {
                        const existing = await prisma.budgetAllocation.findUnique({
                            where: { schemeId_fiscalYear: { schemeId: targetId, fiscalYear: b.fiscalYear } }
                        });
                        if (existing) {
                            // Update target if it's 0 or similar
                            await prisma.budgetAllocation.update({
                                where: { id: existing.id },
                                data: {
                                    allocated: b.allocated.isZero() ? existing.allocated : b.allocated,
                                    revisedEstimate: b.revisedEstimate === null ? existing.revisedEstimate : b.revisedEstimate,
                                    utilized: b.utilized.isZero() ? existing.utilized : b.utilized
                                }
                            });
                            await prisma.budgetAllocation.delete({ where: { id: b.id } });
                        } else {
                            await prisma.budgetAllocation.update({
                                where: { id: b.id },
                                data: { schemeId: targetId }
                            });
                        }
                    } catch (e) {}
                }

                // Update OutputData
                const outputs = await prisma.outputData.findMany({ where: { schemeId: sourceId } });
                for (const o of outputs) {
                    try {
                        const existing = await prisma.outputData.findUnique({
                            where: { schemeId_fiscalYear: { schemeId: targetId, fiscalYear: o.fiscalYear } }
                        });
                        if (existing) {
                            await prisma.outputData.delete({ where: { id: o.id } });
                        } else {
                            await prisma.outputData.update({
                                where: { id: o.id },
                                data: { schemeId: targetId }
                            });
                        }
                    } catch (e) {}
                }

                // Update OutcomeData
                const outcomes = await prisma.outcomeData.findMany({ where: { schemeId: sourceId } });
                for (const o of outcomes) {
                    try {
                        const existing = await prisma.outcomeData.findUnique({
                            where: { schemeId_fiscalYear: { schemeId: targetId, fiscalYear: o.fiscalYear } }
                        });
                        if (existing) {
                            await prisma.outcomeData.delete({ where: { id: o.id } });
                        } else {
                            await prisma.outcomeData.update({
                                where: { id: o.id },
                                data: { schemeId: targetId }
                            });
                        }
                    } catch (e) {}
                }

                // Update scores
                const scores = await prisma.schemeScore.findMany({ where: { schemeId: sourceId } });
                for (const s of scores) {
                    try {
                        const existing = await prisma.schemeScore.findUnique({
                            where: { schemeId_fiscalYear: { schemeId: targetId, fiscalYear: s.fiscalYear } }
                        });
                        if (existing) {
                            await prisma.schemeScore.delete({ where: { id: s.id } });
                        } else {
                            await prisma.schemeScore.update({
                                where: { id: s.id },
                                data: { schemeId: targetId }
                            });
                        }
                    } catch (e) {}
                }

                // Update Feedback items
                await prisma.feedbackItem.updateMany({
                    where: { schemeId: sourceId },
                    data: { schemeId: targetId }
                });

                // Delete source scheme
                try {
                    await prisma.scheme.delete({ where: { id: sourceId } });
                } catch (e) {}
                mergeCount++;
            }

            // Update target name to canonical
            await prisma.scheme.update({
                where: { id: targetId },
                data: { name: canonical }
            });
        }
    }
    console.log(`LOG: Successfully merged ${mergeCount} schemes.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
