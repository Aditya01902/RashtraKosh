import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

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

    return;
});
