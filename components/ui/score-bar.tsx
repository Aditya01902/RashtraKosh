import * as React from "react"
import { cn } from "@/lib/utils"

interface ScoreBarProps {
    label: string
    value: number
    color?: string
    animate?: boolean
}

export function ScoreBar({
    label,
    value: rawValue,
    color = "var(--accent-blue)",
    animate = true
}: ScoreBarProps) {
    const value = typeof rawValue === 'number' ? rawValue : (Number(rawValue) || 0)
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
                <span className="text-text-muted mono uppercase tracking-wider">{label}</span>
                <span className="font-bold mono" style={{ color }}>{value.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-1000 ease-out",
                        animate ? "origin-left scale-x-100" : ""
                    )}
                    style={{
                        width: `${Math.min(100, Math.max(0, value))}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}44`
                    }}
                />
            </div>
        </div>
    )
}
