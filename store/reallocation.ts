import { create } from 'zustand';
import { ReallocationItem } from '@/lib/types';

interface ReallocationState {
    planName: string;
    items: ReallocationItem[];
    addItem: (item: ReallocationItem) => void;
    removeItem: (index: number) => void;
    setPlanName: (name: string) => void;
    reset: () => void;
}

export const useReallocationStore = create<ReallocationState>((set) => ({
    planName: '',
    items: [],
    addItem: (item) => set((state) => ({ items: [...state.items, item] })),
    removeItem: (index) => set((state) => ({
        items: state.items.filter((_, i) => i !== index)
    })),
    setPlanName: (name) => set({ planName: name }),
    reset: () => set({ planName: '', items: [] }),
}));
