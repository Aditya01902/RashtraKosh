import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useTopScores(limit = 10, order: 'asc' | 'desc' = 'desc') {
    return useQuery({
        queryKey: ['scores', 'top', limit, order],
        queryFn: async () => {
            const res = await fetch(`/api/scores/top?limit=${limit}&order=${order}`);
            if (!res.ok) throw new Error('Failed to fetch top scores');
            return res.json();
        }
    });
}

export function useScoreDistribution() {
    return useQuery({
        queryKey: ['scores', 'distribution'],
        queryFn: async () => {
            const res = await fetch(`/api/scores/distribution`);
            if (!res.ok) throw new Error('Failed to fetch distribution');
            return res.json();
        }
    });
}

export function useRecalculateScores() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (fiscalYear: string) => {
            const res = await fetch('/api/scores/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fiscalYear })
            });
            if (!res.ok) throw new Error('Failed to recalculate scores');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scores'] });
            queryClient.invalidateQueries({ queryKey: ['schemes'] });
        }
    });
}
