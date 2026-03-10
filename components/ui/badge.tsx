import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    color?: 'saffron' | 'green' | 'red' | 'blue' | 'gold' | 'purple'
}

const colorMap = {
    saffron: "bg-accent-saffron/10 text-accent-saffron border-accent-saffron/20",
    green: "bg-accent-green/10 text-accent-green border-accent-green/20",
    red: "bg-accent-red/10 text-accent-red border-accent-red/20",
    blue: "bg-accent-blue/10 text-accent-blue border-accent-blue/20",
    gold: "bg-accent-gold/10 text-accent-gold border-accent-gold/20",
    purple: "bg-accent-purple/10 text-accent-purple border-accent-purple/20",
}

function Badge({ className, color = 'saffron', ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mono uppercase tracking-wider",
                colorMap[color],
                className
            )}
            {...props}
        />
    )
}

export { Badge }
