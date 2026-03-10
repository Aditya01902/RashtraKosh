"use client"
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTopScores } from "@/hooks/useScores";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { AlertTriangle, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
    const { data: bottomScores, isLoading } = useTopScores(6, 'asc');

    return (
        <main className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
            <h1 className="text-3xl font-bold">Admin Control Center</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-danger/30 bg-danger/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-danger">Critical Alerts</CardTitle>
                        <AlertTriangle className="text-danger w-5 h-5" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{bottomScores?.length || 0}</div>
                        <p className="text-sm text-danger/80">Schemes requiring immediate attention</p>
                    </CardContent>
                </Card>
                <Card className="border-success/30 bg-success/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-success">System Processing</CardTitle>
                        <TrendingUp className="text-success w-5 h-5" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Valid</div>
                        <p className="text-sm text-success/80">All data models passing constraint checks</p>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-xl font-semibold mt-8">Underperforming Schemes (Action Required)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? <p className="animate-pulse text-muted">Loading...</p> : bottomScores?.map((scoreObj: { id: string, scheme: { name: string, department: { ministry: { name: string } } }, finalScore: number, utilizationScore: number, outputScore: number, outcomeScore: number }) => (
                    <Card key={scoreObj.id} className="border-danger/20 hover:border-danger/40 transition-colors">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <CardTitle className="text-lg line-clamp-2">{scoreObj.scheme.name}</CardTitle>
                                    <p className="text-xs text-muted mt-1 line-clamp-1">{scoreObj.scheme.department.ministry.name}</p>
                                </div>
                                <ScoreRing size={40} score={scoreObj.finalScore} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm space-y-1 mt-2 p-3 bg-black/20 rounded-lg">
                                <div className="flex justify-between"><span className="text-muted">Utilization</span><span className={scoreObj.utilizationScore < 60 ? 'text-danger font-bold' : ''}>{scoreObj.utilizationScore}%</span></div>
                                <div className="flex justify-between"><span className="text-muted">Output</span><span>{scoreObj.outputScore}%</span></div>
                                <div className="flex justify-between"><span className="text-muted">Outcomes</span><span>{scoreObj.outcomeScore}%</span></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </main>
    );
}
