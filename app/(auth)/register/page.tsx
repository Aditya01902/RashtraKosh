"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        institution: "",
        membershipTier: "GENERAL",
        credentials: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.message || "Something went wrong");
            } else {
                setIsSuccess(true);
            }
        } catch {
            setError("Network error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 font-sans">
                <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-8 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Registration Submitted</h2>
                    <p className="text-zinc-400 mb-6">
                        Your account has been created. Please check your email to verify your account.
                        {formData.membershipTier !== "GENERAL" && " Your professional credentials will be reviewed shortly."}
                    </p>
                    <Link href="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2 font-medium transition-colors">
                        Return to Login
                    </Link>
                </div>
            </div>
        );
    }

    const showCredentials = formData.membershipTier === "EXPERT" || formData.membershipTier === "INSTITUTIONAL";

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 p-4 font-sans py-12">
            <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Request Access</h1>
                    <p className="text-zinc-400">Join RashtraKosh for analysis and reallocation</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Full Name</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-blue-500 focus:outline-none focus:ring-2" placeholder="Jane Doe" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
                        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-blue-500 focus:outline-none focus:ring-2" placeholder="jane@example.com" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
                            <input required type="password" name="password" minLength={8} value={formData.password} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-blue-500 focus:outline-none focus:ring-2" placeholder="••••••••" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">Confirm Password</label>
                            <input required type="password" name="confirmPassword" minLength={8} value={formData.confirmPassword} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-blue-500 focus:outline-none focus:ring-2" placeholder="••••••••" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Institution / Organization (Optional)</label>
                        <input type="text" name="institution" value={formData.institution} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-blue-500 focus:outline-none focus:ring-2" placeholder="IIT Delhi" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Membership Tier</label>
                        <select name="membershipTier" value={formData.membershipTier} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-blue-500 focus:outline-none focus:ring-2">
                            <option value="GENERAL">General Member (Read Only)</option>
                            <option value="EXPERT">Expert (Feedback Access)</option>
                            <option value="INSTITUTIONAL">Institutional</option>
                        </select>
                    </div>

                    {showCredentials && (
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">Credentials (LinkedIn / Profile URL)</label>
                            <input required type="url" name="credentials" value={formData.credentials} onChange={handleChange} placeholder="https://linkedin.com/in/..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-blue-500 focus:outline-none focus:ring-2" />
                        </div>
                    )}

                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-50 mt-4">
                        {isLoading ? "Submitting..." : "Submit Registration"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-zinc-400">
                    <Link href="/login" className="hover:text-white transition-colors">
                        Already have an account? Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
