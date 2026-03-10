"use client";

import { useEffect } from "react";
import { useReallocationStore, IdleScheme, ReallocationCandidate } from "@/store/reallocation";

interface ReallocationInitProps {
    idleSchemes: IdleScheme[];
    recipientCandidates: ReallocationCandidate[];
}

export default function ReallocationInit({ idleSchemes, recipientCandidates }: ReallocationInitProps) {
    const { setIdleSchemes, setRecipientCandidates } = useReallocationStore();

    useEffect(() => {
        setIdleSchemes(idleSchemes);
        setRecipientCandidates(recipientCandidates);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    return null;
}
