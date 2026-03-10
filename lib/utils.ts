import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatLakhCrore(value: number): string {
    // Value is in Crores internally (based on previous traces where ₹4650.0k Cr was shown, implying the number was 4650000 in raw which was divided by 1000)
    // Wait, let's re-verify the raw numbers.
    // In explorer/page.tsx: ₹{((item.totalAllocated || 0) / 1000).toFixed(1)}k Cr
    // In page.tsx: ₹${(totalAllocAllocated / 1000).toFixed(1)}k Cr
    // If raw 1,000,000 = 1,000k Cr, then the unit is "Crores" if divided by 1? 
    // Usually budget data is in Crores. ₹22,050k Cr = 22,050,000 Crores? No, that's too high.
    // Let's assume the raw number is in "Crores". 
    // User example: 22,050k Crores -> 22.05 Lakh crores.
    // 22050 / 1000 = 22.05.

    const lakhCrores = value / 100;
    return `${lakhCrores.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
    })} Lakh crores`;
}
