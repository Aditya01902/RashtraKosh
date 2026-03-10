"use client"
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIdleFunds } from "@/hooks/useReallocation";

export default function ReallocationConsole() {
    const { data: idleFunds, isLoading } = useIdleFunds();

    return (
        <main className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Reallocation Console</h1>
                    <p className="text-muted mt-2">Identify idle funds and execute smart reallocation workflows.</p>
                </div>
                <Button size="lg">Generate Automatic Plan</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Idle Fund Scanner (Q4 Matrix)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted uppercase bg-black/20 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4">Scheme</th>
                                    <th className="px-6 py-4">Ministry</th>
                                    <th className="px-6 py-4">Utilization</th>
                                    <th className="px-6 py-4">Allocated (Cr)</th>
                                    <th className="px-6 py-4">Idle (Cr)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={5} className="text-center py-8 text-muted">Scanning datastores...</td></tr>
                                ) : idleFunds?.map((fund: { schemeId: string, schemeName: string, ministryName: string, utilizationScore: number, allocatedAmount: number, idleAmount: number }) => (
                                    <tr key={fund.schemeId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{fund.schemeName}</td>
                                        <td className="px-6 py-4 text-primary">{fund.ministryName}</td>
                                        <td className="px-6 py-4"><span className="text-danger font-bold">{fund.utilizationScore}%</span></td>
                                        <td className="px-6 py-4 text-muted">₹{fund.allocatedAmount}</td>
                                        <td className="px-6 py-4 font-bold text-warning">₹{fund.idleAmount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
