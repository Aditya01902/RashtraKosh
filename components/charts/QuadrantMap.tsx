"use client"
import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid, ReferenceLine, Cell } from 'recharts';

interface QuadrantMapProps {
    data: Record<string, unknown>[];
    xKey: string; // usually utilization
    yKey: string; // usually outcomes/final score
    nameKey: string;
    height?: number;
}

export function QuadrantMap({ data, xKey, yKey, nameKey, height = 400 }: QuadrantMapProps) {

    const getFill = (x: number, y: number) => {
        if (x >= 75 && y >= 70) return '#10b981'; // Stars
        if (x < 75 && y >= 70) return '#f59e0b';  // Bottlenecked
        if (x >= 75 && y < 70) return '#8b5cf6';  // Inefficient
        return '#ef4444';                         // Idle
    };

    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    if (!mounted) return <div style={{ width: '100%', height }} />;

    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" dataKey={xKey} name="Utilization" unit="%" domain={[0, 100]} stroke="rgba(255,255,255,0.2)" />
                    <YAxis type="number" dataKey={yKey} name="Final Score" unit="%" domain={[0, 100]} stroke="rgba(255,255,255,0.2)" />
                    <ZAxis type="category" dataKey={nameKey} name="Scheme" />

                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        content={(props) => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const payload = props.payload as any[];
                            if (props.active && payload && payload.length) {
                                const params = payload[0].payload;
                                return (
                                    <div className="bg-black/90 border border-white/10 p-3 rounded-md shadow-xl backdrop-blur-md">
                                        <p className="font-semibold text-primary mb-1">{params.name}</p>
                                        <p className="text-sm text-gray-400">Utilization: {params.x}%</p>
                                        <p className="text-sm text-gray-400">Final Score: {params.y}%</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />

                    <ReferenceLine x={75} stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" />
                    <ReferenceLine y={70} stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" />

                    <Scatter data={data} shape="circle">
                        {data.map((entry: Record<string, unknown>, index: number) => (
                            <Cell key={`cell-${index}`} fill={getFill(entry[xKey] as number, entry[yKey] as number)} />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}
