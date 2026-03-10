import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatLakhCrore(value: number): string {
    const lakhCrores = value / 100;
    if (lakhCrores < 1) {
        // Show in plain Crores
        const crores = value;
        return `${crores.toLocaleString(undefined, { maximumFractionDigits: 0 })} Cr`;
    }
    return `${lakhCrores.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
    })} Lakh crores`;
}

/**
 * Smart budget formatter for raw seed values (in Crores).
 * - Values >= 1 Lakh Crore (100,000 Cr): "19.72L Cr"
 * - Values >= 1,000 Cr but < 1 Lakh Crore: "90,000 Cr"  
 * - Values < 1,000 Cr: "2,005 Cr"
 */
export function formatBudget(rawValue: number): string {
    const lakhCrores = rawValue / 100000;
    if (lakhCrores >= 1) {
        return `${lakhCrores.toFixed(2)}L Cr`;
    }
    return `${rawValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Cr`;
}
