"use client"
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ScoreRingProps {
    score: number;
    size?: number;
    label?: string;
}

export function ScoreRing({ score, size = 120, label }: ScoreRingProps) {
    const data = [
        { name: 'Score', value: score },
        { name: 'Rem', value: 100 - score },
    ];

    const getColor = (s: number) => {
        if (s >= 75) return '#10b981'; // success
        if (s >= 50) return '#f59e0b'; // warning
        return '#ef4444'; // danger
    };

    const color = getColor(score);

    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    if (!mounted) return <div style={{ width: size, height: size }} />;

    return (
        <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius="75%"
                        outerRadius="100%"
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                    >
                        <Cell fill={color} />
                        <Cell fill="rgba(255,255,255,0.05)" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold" style={{ color }}>{score}</span>
                {label && <span className="text-[10px] text-muted uppercase tracking-wider">{label}</span>}
            </div>
        </div>
    );
}
