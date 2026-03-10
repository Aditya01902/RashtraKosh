import { NextResponse } from 'next/server';

interface RateLimitTracker {
    count: number;
    resetTime: number;
}

const rateLimiter = new Map<string, RateLimitTracker>();

// Cleanup old entries every 15 minutes
setInterval(() => {
    const now = Date.now();
    rateLimiter.forEach((value, key) => {
        if (value.resetTime < now) {
            rateLimiter.delete(key);
        }
    });
}, 15 * 60 * 1000);

/**
 * Basic In-Memory Rate Limiter Helper
 * @param req The incoming Request
 * @param limit Maximum number of requests allowed in the time window
 * @param windowMs Time window in milliseconds
 * @param keyPrefix Prefix for the internal Map key to distinguish routes
 */
export async function limitRate(req: Request, limit: number = 10, windowMs: number = 60000, keyPrefix: string = 'global') {
    const now = Date.now();

    // Attempt to extract an IP address for unauthenticated rate limiting fallback
    // In Vercel, it's often in x-forwarded-for or x-real-ip
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous_ip';

    // Try to get a user identifier if logged in (for example via a token in headers or we'll pass it manually if needed)
    // Actually, usually we limit by IP per route. If we want to limit by user, the route handler can pass a specific key.

    return checkRateLimit(`${keyPrefix}:${ip}`, limit, windowMs);
}

/**
 * Checks if a specific key has exceeded the rate limit.
 * Return a 429 NextResponse if exceeded, otherwise null.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): NextResponse | null {
    const now = Date.now();

    let tracker = rateLimiter.get(key);

    if (!tracker) {
        tracker = { count: 1, resetTime: now + windowMs };
        rateLimiter.set(key, tracker);
    } else {
        if (now > tracker.resetTime) {
            // Reset the window
            tracker.count = 1;
            tracker.resetTime = now + windowMs;
        } else {
            tracker.count += 1;
        }
    }

    const remaining = Math.max(0, limit - tracker.count);

    const headers = {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': tracker.resetTime.toString()
    };

    if (tracker.count > limit) {
        return new NextResponse(JSON.stringify({ message: "Too Many Requests" }), {
            status: 429,
            headers: {
                ...headers,
                'Content-Type': 'application/json',
                'Retry-After': Math.ceil((tracker.resetTime - now) / 1000).toString()
            }
        });
    }

    return null;
}
