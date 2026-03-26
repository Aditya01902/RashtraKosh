import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AdminSidebar from "@/components/navigation/admin-sidebar";
import AdminTopbar from "@/components/navigation/admin-topbar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    // Try to get session
    const session = await auth();

    // For safety, require admin
    if (!session || !session.user) {
        redirect("/login");
    }

    const role = session.user.role;

    if (role === "GENERAL_MEMBER" || role === "EXPERT_MEMBER") {
        redirect("/");
    }

    let ministryName = null;
    const ministryId = session.user.ministryId;
    if (role === "MINISTRY_ADMIN" && ministryId) {
        const ministry = await db.ministry.findUnique({
            where: { id: ministryId },
            select: { name: true }
        });
        if (ministry) {
            ministryName = ministry.name;
        }
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
            {/* Sidebar Navigation */}
            <AdminSidebar user={session.user} ministryName={ministryName} />

            {/* Main Content */}
            <div className="flex flex-col flex-1 w-full relative h-screen">
                <AdminTopbar user={session.user} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto w-full p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
