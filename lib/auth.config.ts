import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id as string;
                token.role = user.role;
                token.membershipTier = user.membershipTier;
                token.ministryId = user.ministryId;
                token.credentialVerified = user.credentialVerified;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = (token.id as string) || "";
                session.user.role = token.role as string;
                session.user.membershipTier = token.membershipTier as string;
                session.user.ministryId = token.ministryId as string | null;
                session.user.credentialVerified = token.credentialVerified as boolean;
            }
            return session;
        },
    },
    providers: [], // Add providers with empty array for now, will be populated in auth.ts
} satisfies NextAuthConfig;
