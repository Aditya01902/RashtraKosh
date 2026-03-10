import { NextResponse } from 'next/server';

export interface ApiResponse<T = undefined> {
    data?: T;
    error?: string;
    code?: string;
    details?: unknown;
}

export function successResponse<T>(data: T, status = 200) {
    return NextResponse.json(data, { status });
}

export function errorResponse(message: string, code: string, status = 500, details?: unknown) {
    return NextResponse.json(
        { error: message, code, details },
        { status }
    );
}

// Helper to catch generic/Prisma errors without leaking DB specifics to the client
export function handleApiError(error: unknown) {
    console.error('[API_ERROR]', error);

    // In a real production app, you might parse Prisma errors here explicitly
    return errorResponse(
        "An unexpected error occurred.",
        "INTERNAL_SERVER_ERROR",
        500
    );
}
