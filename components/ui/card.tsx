import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glow'
    noHover?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', noHover = false, ...props }, ref) => {
        const localRef = React.useRef<HTMLDivElement>(null);
        const combinedRef = (ref as React.RefObject<HTMLDivElement>) || localRef;

        const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
            if (!combinedRef.current || noHover) return;
            const { left, top } = combinedRef.current.getBoundingClientRect();
            combinedRef.current.style.setProperty("--mouse-x", `${e.clientX - left}px`);
            combinedRef.current.style.setProperty("--mouse-y", `${e.clientY - top}px`);
        };

        return (
            <div
                ref={combinedRef}
                onMouseMove={handleMouseMove}
                className={cn(
                    "spotlight-card bg-card border border-border-default rounded-2xl overflow-hidden transition-all duration-500",
                    !noHover && "hover:bg-card-hover hover:border-accent-saffron/30 hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(255,153,51,0.05)]",
                    variant === 'glow' ? "border-accent-saffron/20 animate-border-glow shadow-glow-saffron" : "",
                    className
                )}
                {...props}
            />
        );
    }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex flex-col space-y-1.5 p-6", className)}
            {...props}
        />
    )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn("font-serif font-semibold leading-none tracking-tight text-xl text-text-primary", className)}
            {...props}
        />
    )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p
            ref={ref}
            className={cn("text-sm text-text-muted", className)}
            {...props}
        />
    )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("p-6 pt-0 font-sans", className)} {...props} />
    )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex items-center p-6 pt-0 border-t border-border-default bg-white/[0.02]", className)}
            {...props}
        />
    )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
