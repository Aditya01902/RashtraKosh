'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                <AlertTriangle size={32} />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-text-primary">Something went wrong!</h2>
                <p className="text-text-muted max-w-md mx-auto">
                    We encountered an unexpected error while trying to load the data. It might be a network issue or a temporary glitch.
                </p>
            </div>
            <Button
                onClick={() => reset()}
                className="bg-accent-saffron text-white hover:bg-orange-600 transition-colors"
            >
                Try again
            </Button>
        </div>
    );
}
