import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;

    const isAdminRoute = pathname.startsWith("/admin");
    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

    if (isAuthRoute) {
        if (isLoggedIn) {
            const role = req.auth?.user?.role;
            if (role === "GENERAL_MEMBER" || role === "EXPERT_MEMBER") {
                return Response.redirect(new URL("/", req.nextUrl));
            }
            return Response.redirect(new URL("/admin/dashboard", req.nextUrl));
        }
        return;
    }

    if (isAdminRoute) {
        if (!isLoggedIn) {
            return Response.redirect(new URL("/login", req.nextUrl));
        }

        const role = req.auth?.user?.role;

        // EXPERT_MEMBER, GENERAL_MEMBER: NO admin access
        if (role === "EXPERT_MEMBER" || role === "GENERAL_MEMBER" || !role) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        if (role === "SUPER_ADMIN") {
            return;
        }

        if (role === "MINISTRY_ADMIN") {
            if (pathname.startsWith("/admin/upload") || pathname.startsWith("/admin/feedback-inbox") || pathname === "/admin/dashboard" || pathname === "/admin") {
                return;
            }
            return new NextResponse("Forbidden", { status: 403 });
        }

        if (role === "ANALYST") {
            // ANALYST: only read-only admin routes
            if (req.method !== "GET") {
                return new NextResponse("Forbidden", { status: 403 });
            }
            return;
        }

        // Fallback denied
        return new NextResponse("Forbidden", { status: 403 });
    }

    // CSRF Protection for custom POST/PUT/DELETE routes outside NextAuth
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) && !isAuthRoute) {
        const origin = req.headers.get("origin");
        const host = req.headers.get("host");

        // Use a simple partial match for localhost and production hosts
        if (origin && host) {
            const originHost = new URL(origin).host;
            if (originHost !== host) {
                return new NextResponse("Invalid Origin - CSRF Protection", { status: 403 });
            }
        }
    }

    return;
});
