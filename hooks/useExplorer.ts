import { useQuery } from '@tanstack/react-query';
import { useExplorerStore } from '@/store/explorer';

export function useMinistries() {
    return useQuery({
        queryKey: ['ministries'],
        queryFn: async () => {
            const res = await fetch('/api/ministries');
            if (!res.ok) throw new Error('Failed to fetch ministries');
            return res.json();
        }
    });
}

export function useSchemes() {
    const { ministryId, category, page } = useExplorerStore();

    return useQuery({
        queryKey: ['schemes', ministryId, category, page],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set('page', page.toString());
            if (ministryId) params.set('ministryId', ministryId);
            if (category) params.set('category', category);

            const res = await fetch(`/api/schemes?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch schemes');
            return res.json();
        }
    });
}
