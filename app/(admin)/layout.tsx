import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    // Try to get session
    const session = await auth();

    // For safety, require admin
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
        // Note: If testing locally without real DB auth, you can temporarily bypass this.
        // For now, redirect to public dashboard.
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {children}
        </div>
    );
}
