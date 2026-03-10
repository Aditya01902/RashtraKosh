import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await db.user.findUnique({
                    where: { email: credentials.email as string }
                });

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    membershipTier: user.membershipTier,
                    ministryId: user.ministryId,
                    credentialVerified: user.credentialVerified,
                };
            }
        })
    ],
    session: {
        strategy: "jwt"
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
        }
    },
    pages: {
        signIn: "/login",
    }
});
