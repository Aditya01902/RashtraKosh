"use client"
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFeedbackList } from "@/hooks/useFeedback";

export default function FeedbackInbox() {
    const [statusFilter, setStatusFilter] = useState("PENDING");
    const { data: list, isLoading } = useFeedbackList(undefined, statusFilter);

    const handleUpdateStatus = async (id: string, status: string) => {
        await fetch(`/api/feedback/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });
        window.location.reload();
    };

    return (
        <main className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Feedback Inbox</h1>
                <div className="flex gap-2">
                    {["PENDING", "REVIEWED", "ACTIONED"].map(status => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? "default" : "outline"}
                            onClick={() => setStatusFilter(status)}
                            size="sm"
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {isLoading ? <p className="animate-pulse text-muted">Loading inbox...</p> : list?.map((fb: { id: string, category: string, title: string, body: string, user: { name: string }, scheme: { name: string }, upvotes: number, downvotes: number }) => (
                    <Card key={fb.id} className="border-white/5 bg-black/20 hover:border-primary/30 transition-colors shadow-none">
                        <CardContent className="p-6 flex flex-col md:flex-row gap-6 justify-between items-center md:items-start">
                            <div className="space-y-3 flex-1 w-full">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <Badge color={fb.category === 'PRAISE' ? 'green' : fb.category === 'COMPLAINT' ? 'red' : 'blue'}>{fb.category}</Badge>
                                    <span className="font-semibold text-lg">{fb.title}</span>
                                </div>
                                <p className="text-foreground/80 text-sm leading-relaxed border-l-2 border-white/10 pl-3 italic">&quot;{fb.body}&quot;</p>
                                <div className="flex gap-4 text-xs text-muted/70 flex-wrap">
                                    <span>From: <span className="font-medium text-muted">{fb.user.name}</span></span>
                                    <span>Scheme: <span className="text-primary font-medium">{fb.scheme.name}</span></span>
                                    <span className="bg-primary/10 px-2 py-0.5 rounded text-primary">Votes: {fb.upvotes} 👍 / {fb.downvotes} 👎</span>
                                </div>
                            </div>
                            <div className="flex md:flex-col gap-2 min-w-[140px] w-full md:w-auto">
                                {statusFilter === "PENDING" && <Button variant="outline" size="sm" className="w-full" onClick={() => handleUpdateStatus(fb.id, "REVIEWED")}>Mark Reviewed</Button>}
                                {statusFilter !== "ACTIONED" && <Button variant="success" size="sm" className="w-full" onClick={() => handleUpdateStatus(fb.id, "ACTIONED")}>Mark Actioned</Button>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {list?.length === 0 && <p className="text-muted text-center py-12 glass-panel shadow-none border-dashed border-2">Inbox zero! No feedback found for this status.</p>}
            </div>
        </main>
    );
}
