"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadStore } from "@/store/upload";
import { UploadCloud, FileSpreadsheet, X, ChevronRight, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import Papa from "papaparse";

export default function Step1Upload() {
    const { setFileData, setStep } = useUploadStore();
    const [localFile, setLocalFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [sheetCount, setSheetCount] = useState<number>(0);
    const [rowCount, setRowCount] = useState<number>(0);
    const [errorData, setErrorData] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;
        setErrorData(null);
        setLocalFile(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            if (!data) return;

            try {
                if (file.name.endsWith(".csv")) {
                    Papa.parse(file, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            setSheetCount(1);
                            setRowCount(results.data.length);
                        },
                    });
                } else {
                    const workbook = XLSX.read(data, { type: "binary" });
                    setSheetCount(workbook.SheetNames.length);
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const json = XLSX.utils.sheet_to_json(firstSheet);
                    setRowCount(json.length);
                }
            } catch (err) {
                setErrorData("Failed to parse file. Please ensure it is a valid spreadsheet.");
            }
        };
        reader.readAsBinaryString(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "application/vnd.ms-excel": [".xls"],
            "text/csv": [".csv"],
        },
        maxFiles: 1,
    });

    const handleProcess = () => {
        if (!localFile) return;
        setIsProcessing(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = e.target?.result;
            if (!data) return;

            try {
                let parsedData: any[] = [];
                let columns: string[] = [];

                if (localFile.name.endsWith(".csv")) {
                    Papa.parse(localFile, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            parsedData = results.data;
                            columns = results.meta.fields || [];
                            setFileData(localFile, parsedData, columns);
                            setStep(2);
                        },
                    });
                } else {
                    const workbook = XLSX.read(data, { type: "binary" });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    parsedData = XLSX.utils.sheet_to_json(firstSheet);
                    if (parsedData.length > 0) {
                        columns = Object.keys(parsedData[0]);
                    }
                    setFileData(localFile, parsedData, columns);
                    setStep(2);
                }
            } catch (err) {
                setErrorData("Failed to process file.");
                setIsProcessing(false);
            }
        };
        reader.readAsBinaryString(localFile);
    };

    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Step 1: Upload Data Source</h2>

                {!localFile ? (
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${isDragActive
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            }`}
                    >
                        <input {...getInputProps()} />
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                            <UploadCloud className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-lg font-medium mb-1">Drag and drop your file here</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Supports .xlsx, .xls, .csv (Max 10MB)
                        </p>
                        <button className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                            Browse Files
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-start justify-between p-4 border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                    <FileSpreadsheet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{localFile.name}</h3>
                                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        <span>{(localFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                        <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                                        <span>{sheetCount} Sheet{sheetCount !== 1 ? 's' : ''}</span>
                                        <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                                        <span>{rowCount} Rows</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setLocalFile(null);
                                    setErrorData(null);
                                }}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors"
                                title="Remove file"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {errorData && (
                            <div className="p-3 text-sm text-rose-700 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400 rounded-md border border-rose-200 dark:border-rose-800/50">
                                {errorData}
                            </div>
                        )}

                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
                            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">or</div>
                            <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Google Sheets URL
                            </label>
                            <input
                                type="url"
                                placeholder="https://docs.google.com/spreadsheets/d/..."
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled
                                title="Google Sheets integration coming soon"
                            />
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleProcess}
                                disabled={isProcessing || !localFile}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Process & Validate
                                        <ChevronRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
