'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Community Page Error:", error);
    }, [error]);

    return (
        <div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center space-y-6 text-center px-4">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertCircle size={40} />
            </div>
            <div className="space-y-3">
                <h2 className="text-3xl font-bold text-text-primary">Feedback Community Unavailable</h2>
                <p className="text-text-muted max-w-lg mx-auto text-lg hover:text-white transition-colors">
                    We're having trouble retrieving the community feedback right now. This is usually temporary.
                </p>
            </div>
            <Button
                onClick={() => reset()}
                className="bg-accent-saffron text-white hover:bg-orange-600 transition-colors px-8 py-6 rounded-2xl font-semibold shadow-lg shadow-orange-500/20"
            >
                Refresh Data
            </Button>
        </div>
    );
}
