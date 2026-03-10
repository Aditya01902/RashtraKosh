"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

interface SparklineProps {
    values: number[]
    color?: string
    width?: number
    height?: number
    className?: string
}

export function Sparkline({
    values,
    color = "var(--accent-saffron)",
    width = 120,
    height = 40,
    className
}: SparklineProps) {
    if (values.length < 2) return null

    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1

    const points = values.map((v, i) => {
        const x = (i / (values.length - 1)) * width
        const y = height - ((v - min) / range) * height
        return `${x},${y}`
    }).join(" ")

    return (
        <div className={cn("inline-block", className)}>
            <svg width={width} height={height} className="overflow-visible">
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                    className="drop-shadow-[0_0_4px_rgba(255,153,51,0.3)]"
                />
            </svg>
        </div>
    )
}
