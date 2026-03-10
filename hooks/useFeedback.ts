import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useFeedbackList(category?: string, status?: string) {
    return useQuery({
        queryKey: ['feedback', category, status],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (category) params.set('category', category);
            if (status) params.set('status', status);

            const res = await fetch(`/api/feedback?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch feedback');
            return res.json();
        }
    });
}

export function useSubmitFeedback() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Record<string, unknown>) => {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to submit feedback');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feedback'] });
        }
    });
}

export function useVoteFeedback() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, type }: { id: string, type: 'UP' | 'DOWN' }) => {
            const res = await fetch(`/api/feedback/${id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type })
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to vote');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feedback'] });
        }
    });
}
