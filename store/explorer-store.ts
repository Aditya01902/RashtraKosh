import { create } from 'zustand';

export type ExplorerLevel = 'ministry' | 'department' | 'scheme' | 'methodology';

interface ExplorerState {
    level: ExplorerLevel;
    previousLevel: ExplorerLevel | null;
    selectedMinistryId: string | null;
    selectedDepartmentId: string | null;
    selectedSchemeId: string | null;
    fiscalYear: string;

    // Actions
    setLevel: (level: ExplorerLevel) => void;
    setFiscalYear: (fy: string) => void;
    showMethodology: () => void;
    hideMethodology: () => void;
    selectMinistry: (id: string | null) => void;
    selectDepartment: (id: string | null) => void;
    selectScheme: (id: string | null) => void;
    reset: () => void;
}

export const useExplorerStore = create<ExplorerState>((set) => ({
    level: 'ministry',
    previousLevel: null,
    selectedMinistryId: null,
    selectedDepartmentId: null,
    selectedSchemeId: null,
    fiscalYear: '2024-25',

    setLevel: (level) => set({ level }),
    setFiscalYear: (fy) => set({ fiscalYear: fy }),

    showMethodology: () => set((state) => ({
        previousLevel: state.level,
        level: 'methodology'
    })),

    hideMethodology: () => set((state) => ({
        level: state.previousLevel || 'ministry',
        previousLevel: null
    })),

    selectMinistry: (id) => set({
        selectedMinistryId: id,
        level: id ? 'department' : 'ministry',
        previousLevel: null,
        selectedDepartmentId: null,
        selectedSchemeId: null
    }),

    selectDepartment: (id) => set({
        selectedDepartmentId: id,
        level: id ? 'scheme' : 'department',
        previousLevel: null,
        selectedSchemeId: null
    }),

    selectScheme: (id) => set({
        selectedSchemeId: id,
        level: 'scheme',
        previousLevel: null
    }),

    reset: () => set({
        level: 'ministry',
        previousLevel: null,
        selectedMinistryId: null,
        selectedDepartmentId: null,
        selectedSchemeId: null
    }),
}));
