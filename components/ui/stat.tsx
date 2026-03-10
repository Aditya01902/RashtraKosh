import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "./card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { motion, useSpring, useTransform } from "framer-motion"

interface StatProps {
    icon: React.ReactNode
    label: string
    value: string | number
    sub?: string
    delta?: string | number
    deltaDirection?: 'up' | 'down'
    className?: string
    iconClassName?: string;
}

function Counter({ value }: { value: number | string }) {
    if (value === undefined || value === null) return null;
    const valStr = value.toString();
    const isNumeric = !isNaN(Number(valStr.replace(/[^0-9.-]/g, '')));
    const numericValue = isNumeric ? Number(valStr.replace(/[^0-9.-]/g, '')) : 0;
    const prefix = valStr.startsWith('₹') ? '₹' : '';
    const suffix = valStr.endsWith('Lakh crores') ? ' Lakh crores' :
        valStr.endsWith('k Cr') ? 'k Cr' :
            valStr.endsWith('Cr') ? ' Cr' : '';

    const count = useSpring(0, {
        bounce: 0,
        duration: 2000,
    });

    React.useEffect(() => {
        if (isNumeric) {
            count.set(numericValue);
        }
    }, [numericValue, isNumeric, count]);

    const displayValue = useTransform(count, (latest) => {
        if (!isNumeric) return value.toString();
        return `${prefix}${latest.toLocaleString(undefined, { maximumFractionDigits: 1 })}`;
    });

    return (
        <span className="flex flex-col">
            <motion.span className="leading-none">{displayValue}</motion.span>
            {suffix && (
                <span className="text-base text-text-muted mt-1.5 font-medium tracking-normal lowercase leading-none">
                    {suffix.trim()}
                </span>
            )}
        </span>
    );
}

export function Stat({
    icon,
    label,
    value,
    sub,
    delta,
    deltaDirection,
    className,
    iconClassName
}: StatProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="h-full"
        >
            <Card className={cn("p-6 flex flex-col gap-4 group relative overflow-hidden h-full", className)}>
                <div className="flex items-center justify-between">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={cn(
                            "p-2.5 rounded-xl bg-accent-saffron/10 text-accent-saffron ring-1 ring-accent-saffron/20 group-hover:bg-accent-saffron/20 transition-colors",
                            iconClassName
                        )}
                    >
                        {icon}
                    </motion.div>
                    {delta && (
                        <div className={cn(
                            "flex items-center text-[10px] font-bold mono px-2 py-1 rounded-lg",
                            deltaDirection === 'up' ? "text-accent-green bg-accent-green/10 ring-1 ring-accent-green/20" : "text-accent-red bg-accent-red/10 ring-1 ring-accent-red/20"
                        )}>
                            {deltaDirection === 'up' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                            {delta}
                        </div>
                    )}
                </div>

                <div className="space-y-1 relative z-10">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mono block mb-1">
                        {label}
                    </span>
                    <h3 className="text-3xl font-bold text-text-primary mono tracking-tight">
                        <Counter value={value} />
                    </h3>
                    {sub && (
                        <p className="text-xs text-text-muted2 font-medium">
                            {sub}
                        </p>
                    )}
                </div>

                {/* Decorative background element */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-accent-saffron/5 rounded-full blur-2xl group-hover:bg-accent-saffron/10 transition-colors duration-500" />
            </Card>
        </motion.div>
    )
}
