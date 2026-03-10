import { create } from 'zustand';

interface UIState {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    submitFeedbackModalOpen: boolean;
    setSubmitFeedbackModalOpen: (open: boolean) => void;
    selectedSchemeIdForFeedback: string | null;
    openFeedbackModalForScheme: (schemeId: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: false,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    submitFeedbackModalOpen: false,
    setSubmitFeedbackModalOpen: (open) => set({ submitFeedbackModalOpen: open }),
    selectedSchemeIdForFeedback: null,
    openFeedbackModalForScheme: (schemeId: string) => set({
        selectedSchemeIdForFeedback: schemeId,
        submitFeedbackModalOpen: true
    }),
}));
