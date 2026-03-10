"use client"
import { useQuery } from "@tanstack/react-query";

export function useMinistries() {
    return useQuery<any[]>({
        queryKey: ["ministries"],
        queryFn: async () => {
            const res = await fetch("/api/ministries");
            if (!res.ok) throw new Error("Failed to fetch ministries");
            return res.json();
        },
        retry: 3,
        staleTime: 60000,
    });
}
