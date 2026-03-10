import { useQuery } from '@tanstack/react-query';

export function useIdleFunds() {
    return useQuery({
        queryKey: ['reallocation', 'idle'],
        queryFn: async () => {
            const res = await fetch('/api/reallocation/idle');
            if (!res.ok) throw new Error('Failed to fetch idle funds');
            return res.json();
        }
    });
}

export function useNextYearProjections(fiscalYear: string = "2024-25") {
    return useQuery({
        queryKey: ['reallocation', 'next-year', fiscalYear],
        queryFn: async () => {
            const res = await fetch('/api/reallocation/next-year', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fiscalYear })
            });
            if (!res.ok) throw new Error('Failed to fetch projections');
            return res.json();
        }
    });
}
