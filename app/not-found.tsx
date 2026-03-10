import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-24 h-24 bg-surface-elevated rounded-full flex items-center justify-center shadow-lg border border-white/5 mb-8">
                <FileQuestion className="w-12 h-12 text-accent-saffron" />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold font-serif text-text-primary mb-4 text-center">
                404
            </h1>

            <h2 className="text-2xl md:text-3xl font-medium text-text-primary mb-6 text-center">
                Page Not Found
            </h2>

            <p className="text-text-muted text-center max-w-md text-lg mb-10">
                The document or resource you are looking for has been moved, removed, renamed, or might never have existed.
            </p>

            <Link href="/">
                <Button className="bg-accent-saffron text-white hover:bg-orange-600 transition-colors h-12 px-8 rounded-full shadow-[0_0_20px_rgba(255,153,51,0.3)] flex items-center gap-2 text-base font-semibold">
                    <Home className="w-5 h-5" />
                    Return Home
                </Button>
            </Link>
        </div>
    );
}
