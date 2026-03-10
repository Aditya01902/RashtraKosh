import { create } from "zustand";

export interface IdleScheme {
    id: string;
    name: string;
    ministryName: string;
    utilizationScore: number;
    finalScore: number;
    allocatedCapital: number;
    allocatedRevenue: number;
    capitalIdle: number;
    revenueIdle: number;
    totalIdle: number;
    rootCause: string;
    risk: "HIGH" | "MEDIUM" | "LOW";
    quadrant: "EFFICIENT" | "OVERFUNDED" | "STARVED" | "FAILING";
    absorptionCapacity?: number;
}

export interface ReallocationCandidate {
    id: string;
    name: string;
    currentScore: number;
    absorptionCapacity: number;
    capitalNeed: number;
    revenueNeed: number;
}

export interface ReallocationFlow {
    id: string;
    fromSchemeId: string;
    fromSchemeName: string;
    toSchemeId: string;
    toSchemeName: string;
    amount: number;
    type: "CAPITAL" | "REVENUE" | "MIXED";
    rationale: string;
    risk: "HIGH" | "MEDIUM" | "LOW";
}

export interface ReallocationState {
    step: 1 | 2 | 3;
    idleSchemes: IdleScheme[]; // Section C data
    recipientCandidates: ReallocationCandidate[];
    selectedDonorIds: string[];
    selectedRecipientIds: string[];
    generatedFlows: ReallocationFlow[];

    // Actions
    setStep: (step: 1 | 2 | 3) => void;
    setIdleSchemes: (schemes: IdleScheme[]) => void;
    setRecipientCandidates: (candidates: ReallocationCandidate[]) => void;
    toggleDonor: (id: string, isChecked: boolean) => void;
    toggleRecipient: (id: string, isChecked: boolean) => void;
    setGeneratedFlows: (flows: ReallocationFlow[]) => void;
    reset: () => void;
}

export const useReallocationStore = create<ReallocationState>((set) => ({
    step: 1,
    idleSchemes: [],
    recipientCandidates: [],
    selectedDonorIds: [],
    selectedRecipientIds: [],
    generatedFlows: [],

    setStep: (step) => set({ step }),
    setIdleSchemes: (schemes) => set({ idleSchemes: schemes, selectedDonorIds: schemes.map(s => s.id) }),
    setRecipientCandidates: (candidates) => set({ recipientCandidates: candidates }),
    toggleDonor: (id, isChecked) => set((state) => ({
        selectedDonorIds: isChecked ? [...state.selectedDonorIds, id] : state.selectedDonorIds.filter(d => d !== id)
    })),
    toggleRecipient: (id, isChecked) => set((state) => ({
        selectedRecipientIds: isChecked ? [...state.selectedRecipientIds, id] : state.selectedRecipientIds.filter(r => r !== id)
    })),
    setGeneratedFlows: (flows) => set({ generatedFlows: flows }),
    reset: () => set((state) => ({
        step: 1,
        selectedRecipientIds: [],
        generatedFlows: [],
        selectedDonorIds: state.idleSchemes.map(s => s.id)
    }))
}));
