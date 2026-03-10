"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { cn } from "@/lib/utils";
import { ThemeToggle } from '@/components/ui/ThemeToggle';

import { useTheme } from '@/components/providers/ThemeProvider';

export function Navbar() {
    const { theme } = useTheme();
    const pathname = usePathname();
    const { data: session } = useSession();

    const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'MINISTRY_ADMIN';

    const links = [
        { href: '/', label: 'Overview' },
        { href: '/explorer', label: 'Budget Explorer' },
        { href: '/analytics', label: 'Analytics' },
        { href: '/intelligence', label: 'Intelligence' },
        { href: '/community', label: 'Community' },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/40 dark:bg-transparent backdrop-blur-3xl border-b border-white/40 dark:border-border-default transition-all duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group relative">
                        <div className="absolute inset-0 bg-accent-saffron/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <img
                            src={theme === 'light' ? '/logo-light.png' : '/logo.png'}
                            alt="RashtraKosh"
                            className="h-[56px] w-auto object-contain transition-all duration-500 group-hover:scale-105 group-hover:brightness-110 relative z-10"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1 h-full">
                        {links.map(link => {
                            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "px-4 h-16 flex items-center text-xs font-bold uppercase tracking-[0.2em] transition-all relative group/link",
                                        isActive ? "text-accent-saffron" : "text-text-muted hover:text-text-primary"
                                    )}
                                >
                                    {link.label}
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-accent-saffron shadow-[0_0_15px_rgba(255,153,51,0.6)] animate-pulse" />
                                    )}
                                    <div className="absolute inset-0 bg-accent-saffron/5 opacity-0 group-hover/link:opacity-100 transition-opacity rounded-lg m-2" />
                                </Link>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        {isAdmin && (
                            <Link href="/dashboard">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20 border border-accent-purple/20"
                                >
                                    Admin Console
                                </Button>
                            </Link>
                        )}

                        {session ? (
                            <div className="w-8 h-8 rounded-full bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue">
                                <User size={18} />
                            </div>
                        ) : (
                            <Button size="sm" className="bg-accent-saffron text-white hover:bg-accent-saffron/90">
                                Join / Login
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tricolor Accent Bar */}
            <div className="w-full h-[4px] flex relative overflow-hidden">
                <div className="flex-1 bg-[#FF9933] shadow-[0_0_10px_rgba(255,153,51,0.3)]" /> {/* Saffron */}
                <div className={cn("flex-1 transition-colors duration-500", theme === 'light' ? "bg-[#0F172A]" : "bg-white")} /> {/* Blue/White */}
                <div className="flex-1 bg-[#138808] shadow-[0_0_10px_rgba(19,136,8,0.3)]" /> {/* Green */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
            </div>
        </nav>
    );
}
