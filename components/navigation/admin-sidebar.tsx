"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileUp, Replace, CalendarClock, MessageSquare, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface AdminSidebarProps {
    user: {
        name?: string | null;
        email?: string | null;
        role: string;
        ministryId?: string | null;
    };
    ministryName?: string | null;
}

export default function AdminSidebar({ user, ministryName }: AdminSidebarProps) {
    const pathname = usePathname();

    const links = [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Data Upload", href: "/admin/upload", icon: FileUp },
        { name: "Reallocation Engine", href: "/admin/reallocation", icon: Replace },
        { name: "FY 2025-26 Plan", href: "/admin/next-year", icon: CalendarClock },
        { name: "Feedback Inbox", href: "/admin/feedback-inbox", icon: MessageSquare },
    ];

    return (
        <div className="w-64 flex-shrink-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full hidden md:flex">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <span className="font-bold text-lg tracking-tight text-blue-900 dark:text-blue-100 italic">Rashtra</span>
                <span className="font-semibold text-lg tracking-tight text-orange-500 dark:text-orange-400">Kosh</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">ADMIN</span>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
                {links.map((link) => {
                    const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                                }`}
                        >
                            <Icon className="h-5 w-5 shrink-0" />
                            {link.name}
                        </Link>
                    );
                })}
            </div>

            {/* User Footer */}
            <div className="shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-3">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user.name || "Admin User"}</span>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                            {user.role.replace("_", " ")}
                        </span>
                    </div>
                    {user.role === "MINISTRY_ADMIN" && ministryName && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate" title={ministryName}>
                            {ministryName}
                        </span>
                    )}
                </div>

                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors w-full text-left mt-1"
                >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
