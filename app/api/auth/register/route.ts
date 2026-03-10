import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { Resend } from "resend";

import { registerSchema } from "@/lib/validations/api";
import { limitRate } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

export async function POST(req: Request) {
    try {
        // Rate limiting - Max 5 registration attempts per 15 minutes per IP
        const rateLimitResponse = await limitRate(req, 5, 15 * 60 * 1000, "register");
        if (rateLimitResponse) return rateLimitResponse;

        const body = await req.json();

        // Input validation using Zod
        const parsed = registerSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: "Invalid input fields", errors: parsed.error.format() }, { status: 400 });
        }

        const { name, email, password, institution, membershipTier, credentials } = parsed.data;

        const existingUser = await db.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ message: "User already exists with this email" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const credentialVerified = false; // explicitly false for EXPERT/INSTITUTIONAL, though default is false

        await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                institution,
                membershipTier: membershipTier as "GENERAL" | "EXPERT" | "INSTITUTIONAL",
                credentials: (membershipTier === "EXPERT" || membershipTier === "INSTITUTIONAL") ? credentials : null,
                credentialVerified,
                role: "GENERAL_MEMBER",
            }
        });

        try {
            // Send welcome email via Resend
            // Will only work if valid RESEND_API_KEY is given
            if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_dummy_key") {
                await resend.emails.send({
                    from: "RashtraKosh <onboarding@resend.dev>",
                    to: [email],
                    subject: "Welcome to RashtraKosh",
                    html: "<p>Thank you for registering on RashtraKosh. Your account has been created successfully.</p>"
                });
            }
        } catch (emailError) {
            console.error("Failed to send email", emailError);
            // We don't fail registration if email fails
        }

        return NextResponse.json({ message: "Account created" }, { status: 201 });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
