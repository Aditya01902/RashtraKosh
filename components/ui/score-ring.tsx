"use client"
import * as React from "react"
import { classifyScore } from "@/lib/scoring"
import { cn } from "@/lib/utils"

interface ScoreRingProps {
    score: number
    size?: number
    strokeWidth?: number
    className?: string
}

const colorMap = {
    EXCELLENT: 'var(--accent-green)',
    GOOD: 'var(--accent-saffron)',
    AVERAGE: 'var(--accent-gold)',
    POOR: 'var(--accent-red)',
    CRITICAL: 'var(--accent-red)',
}

export function ScoreRing({
    score: rawScore,
    size = 60,
    strokeWidth = 6,
    className
}: ScoreRingProps) {
    const score = typeof rawScore === 'number' ? rawScore : (Number(rawScore) || 0)

    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference

    const rating = classifyScore(score)
    const color = colorMap[rating] || 'var(--accent-blue)'

    return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background Ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-black/5 dark:text-white/5"
                />
                {/* Progress Ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold mono" style={{ color, filter: `drop-shadow(0 0 4px ${color})` }}>
                    {score.toFixed(0)}
                </span>
            </div>
        </div>
    )
}
