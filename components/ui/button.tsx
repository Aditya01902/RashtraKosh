import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "danger" | "success"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"

        const variants = {
            default: "glass-button",
            outline: "border border-white/20 hover:bg-white/10 text-foreground",
            ghost: "hover:bg-white/10 text-foreground",
            danger: "glass-button !bg-red-500/20 !border-red-500/50 hover:!bg-red-500/30 text-red-200",
            success: "glass-button !bg-emerald-500/20 !border-emerald-500/50 hover:!bg-emerald-500/30 text-emerald-200"
        }

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-8 px-3 text-xs",
            lg: "h-12 px-8 text-base",
            icon: "h-10 w-10 flex items-center justify-center"
        }

        return (
            <button
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
