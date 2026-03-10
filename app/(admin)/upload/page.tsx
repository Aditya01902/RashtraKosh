"use client"
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, CheckCircle2, AlertTriangle } from "lucide-react";

export default function UploadConsole() {
    const [file, setFile] = useState<File | null>(null);
    const [validating, setValidating] = useState(false);
    const [committing, setCommitting] = useState(false);
    const [report, setReport] = useState<{ validation: { errors: { row: number, error: string }[], validRows: Record<string, unknown>[] } } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleValidate = async () => {
        if (!file) return;
        setValidating(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload/validate", { method: "POST", body: formData });
            const data = await res.json(); // Parse JSON first to access potential error message
            if (!res.ok) throw new Error((data as { error?: string }).error || "Validation failed");
            setReport(data);
        } catch (e) {
            const err = e as Error;
            console.error("Validation failed", err);
            alert("Validation failed: " + err.message);
        } finally {
            setValidating(false);
        }
    };

    const handleCommit = async () => {
        if (!report?.validation?.validRows) return;
        setCommitting(true);
        try {
            const res = await fetch("/api/upload/commit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ validRows: report.validation.validRows })
            });
            if (res.ok) {
                setFile(null);
                setReport(null);
                alert("Data committed successfully and scores recalculated!");
            } else {
                throw new Error(await res.text());
            }
        } catch (e) {
            const err = e as Error;
            console.error("Commit failed", err);
            alert("Commit failed: " + err.message);
        } finally {
            setCommitting(false);
        }
    };

    return (
        <main className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in">
            <h1 className="text-3xl font-bold">Data Ingestion Console</h1>
            <p className="text-muted">Upload and validate `.xlsx` or `.csv` files for scheme tracking.</p>

            <Card className="border-dashed border-2 bg-black/20 hover:border-primary/50 transition-colors">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <UploadCloud className="w-16 h-16 text-primary mb-4" />
                    <h3 className="text-lg font-medium mb-2">Drop files here or click to browse</h3>
                    <p className="text-sm text-muted mb-6">Supports .xlsx and .csv files formatted with standard budget headers</p>
                    <div className="flex items-center gap-4">
                        <input type="file" id="file" className="hidden" accept=".xlsx,.csv" onChange={handleFileChange} />
                        <label htmlFor="file" className="glass-button cursor-pointer">
                            Select File
                        </label>
                        {file && <span className="text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">{file.name}</span>}
                    </div>
                </CardContent>
            </Card>

            {file && !report && (
                <div className="flex justify-end">
                    <Button onClick={handleValidate} disabled={validating}>
                        {validating ? "Validating Schema..." : "Validate Data against Rules"}
                    </Button>
                </div>
            )}

            {report && (
                <Card className="border-success/30 bg-success/5 animate-in slide-in-from-bottom-4">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        {report.validation.errors.length === 0 ? <CheckCircle2 className="text-success w-6 h-6" /> : <AlertTriangle className="text-warning w-6 h-6" />}
                        <CardTitle>Validation Report</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                                <p className="text-sm text-muted">Valid Rows Ready</p>
                                <p className="text-3xl font-bold text-success mt-1">{report.validation.validRows.length}</p>
                            </div>
                            <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                                <p className="text-sm text-muted">Errors Detected</p>
                                <p className={`text-3xl font-bold mt-1 ${report.validation.errors.length > 0 ? 'text-danger' : 'text-success'}`}>
                                    {report.validation.errors.length}
                                </p>
                            </div>
                        </div>

                        {report.validation.errors.length > 0 && (
                            <div className="p-4 bg-danger/10 border border-danger/30 rounded-lg max-h-40 overflow-y-auto mt-4">
                                <ul className="list-disc pl-5 text-sm text-danger/90 space-y-1">
                                    {report.validation.errors.map((e: { row: number, error: string }, i: number) => (
                                        <li key={i}>Row {e.row}: {e.error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-white/10 mt-6">
                            <Button onClick={handleCommit} disabled={committing || report.validation.validRows.length === 0} variant="success" className="px-8">
                                {committing ? "Committing and Recalculating..." : "Execute Commit to Database"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </main>
    );
}
