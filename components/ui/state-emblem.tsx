"use client"
import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface StateEmblemProps {
    className?: string;
}

export function StateEmblem({ className }: StateEmblemProps) {
    const { theme } = useTheme();

    return (
        <div className={cn(
            "relative pointer-events-none select-none overflow-hidden",
            className
        )}>
            {/* 
                We use clip-path to precisely remove the bottom "Satyameva Jayate" text.
                Inset(0 0 35% 0) is very aggressive to ensure the entire pedestal and text are removed.
            */}
            <div className={cn(
                "relative w-full h-full transition-all duration-700 ease-in-out",
                theme === 'dark'
                    ? "opacity-50 [filter:invert(65%)_sepia(91%)_saturate(1915%)_hue-rotate(338deg)_brightness(140%)_contrast(110%)_drop-shadow(0_0_60px_rgba(249,115,22,1))]"
                    : "opacity-50 [filter:invert(4%)_sepia(18%)_saturate(7480%)_hue-rotate(211deg)_brightness(96%)_contrast(92%)_drop-shadow(0_0_20px_rgba(2,6,23,0.3))]"
            )}>
                <Image
                    src="/state-emblem-new.png"
                    alt="State Emblem of India"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
        </div>
    );
}
