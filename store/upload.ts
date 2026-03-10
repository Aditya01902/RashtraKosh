import { create } from "zustand";

export interface ColumnMapping {
    fileColumn: string;
    dbField: string | null;
    confidence: "high" | "medium" | "low" | "none";
}

export interface ValidationError {
    row: number;
    field: string;
    issue: string;
}

export interface UploadState {
    step: 1 | 2 | 3;
    file: File | null;
    parsedData: any[]; // Raw JSON rows
    columns: string[]; // Headers from file
    mappings: ColumnMapping[];
    validationResults: {
        validCount: number;
        rejectedCount: number;
        errors: ValidationError[];
    } | null;
    scorePreview: any[] | null; // For Step 3 preview
    commitSummary: {
        ministriesAffected: number;
        schemesUpdated: number;
        scoresToRecalculate: number;
    } | null;

    // Actions
    setStep: (step: 1 | 2 | 3) => void;
    setFileData: (file: File | null, data: any[], columns: string[]) => void;
    setMappings: (mappings: ColumnMapping[]) => void;
    updateMapping: (fileColumn: string, newDbField: string | null) => void;
    setValidationResults: (results: any) => void;
    setScorePreview: (preview: any[], summary: any) => void;
    reset: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
    step: 1,
    file: null,
    parsedData: [],
    columns: [],
    mappings: [],
    validationResults: null,
    scorePreview: null,
    commitSummary: null,

    setStep: (step) => set({ step }),
    setFileData: (file, parsedData, columns) => set({ file, parsedData, columns }),
    setMappings: (mappings) => set({ mappings }),
    updateMapping: (fileColumn, newDbField) => set((state) => ({
        mappings: state.mappings.map(m => m.fileColumn === fileColumn ? { ...m, dbField: newDbField, confidence: "high" } : m)
    })),
    setValidationResults: (validationResults) => set({ validationResults }),
    setScorePreview: (scorePreview, commitSummary) => set({ scorePreview, commitSummary }),
    reset: () => set({
        step: 1,
        file: null,
        parsedData: [],
        columns: [],
        mappings: [],
        validationResults: null,
        scorePreview: null,
        commitSummary: null,
    })
}));
