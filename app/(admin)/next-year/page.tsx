"use client"
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNextYearProjections } from "@/hooks/useReallocation";
import { Badge } from "@/components/ui/badge";

export default function NextYearProjections() {
    const fiscalYear = "2024-25"; // Base year
    const { data: projections, isLoading } = useNextYearProjections(fiscalYear);

    return (
        <main className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Next-Year Projections</h1>
                    <p className="text-muted mt-2">AI-assisted budget modeling for FY 2025-26 based on deterministic outcomes.</p>
                </div>
                <Button variant="outline">Export CSV</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? <p className="animate-pulse text-muted">Running projection models...</p> : projections?.map((proj: { schemeId: string, delta: number, deltaPercentage: number, quadrant: string, schemeName: string, currentBudget: number, projectedBudget: number, rationale: string }) => (
                    <Card key={proj.schemeId} className="flex flex-col border-white/5 hover:border-white/10 transition-colors">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge color={proj.delta > 0 ? 'green' : proj.delta < 0 ? 'red' : 'blue'}>
                                    {proj.delta > 0 ? '+' : ''}{proj.deltaPercentage}%
                                </Badge>
                                <span className="text-xs font-mono text-muted">{proj.quadrant}</span>
                            </div>
                            <CardTitle className="text-lg line-clamp-1 mt-2">{proj.schemeName}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-end space-y-4">
                            <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                <div>
                                    <p className="text-xs text-muted mb-1">Current (24-25)</p>
                                    <p className="font-medium">₹{proj.currentBudget}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-primary mb-1">Projected (25-26)</p>
                                    <p className="text-xl font-bold text-primary">₹{proj.projectedBudget}</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted/80 leading-relaxed italic border-l-2 border-white/20 pl-3">
                                &quot;{proj.rationale}&quot;
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </main>
    );
}
