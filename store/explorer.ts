import { create } from 'zustand';
import { PriorityCategory } from '@/lib/types';

interface ExplorerState {
    ministryId: string | null;
    departmentId: string | null;
    category: PriorityCategory | null;
    page: number;
    setFilters: (filters: Partial<Omit<ExplorerState, 'setFilters'>>) => void;
    reset: () => void;
}

export const useExplorerStore = create<ExplorerState>((set) => ({
    ministryId: null,
    departmentId: null,
    category: null,
    page: 1,
    setFilters: (filters) => set((state) => ({ ...state, ...filters })),
    reset: () => set({ ministryId: null, departmentId: null, category: null, page: 1 }),
}));
