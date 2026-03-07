"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, Mail, ShieldCheck } from "lucide-react";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";

interface AuthFormProps {
    nextPath: string;
    initialError?: string;
}

export default function AuthForm({ nextPath, initialError }: AuthFormProps) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState(initialError ?? "");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const supabase = createSupabaseClient();
            const callbackUrl = new URL("/auth/callback", window.location.origin);
            callbackUrl.searchParams.set("next", nextPath);

            const { error: signInError } = await supabase.auth.signInWithOtp({
                email: email.trim(),
                options: {
                    emailRedirectTo: callbackUrl.toString(),
                },
            });

            if (signInError) {
                throw signInError;
            }

            setMessage("Check your email for the magic link. Once confirmed, you'll return here signed in.");
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Failed to start sign-in.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),_transparent_42%),linear-gradient(180deg,_rgba(26,29,39,0.98),_rgba(15,17,23,0.98))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="mb-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-200">
                    <ShieldCheck size={13} />
                    Supabase Account
                </div>
                <h1 className="text-4xl font-display text-white">Sign in to sync your workspaces</h1>
                <p className="mt-4 text-sm leading-7 text-text-secondary">
                    Local storage still works without auth. Sign in when you want user-owned Supabase sync, notes, and billing state to follow your account.
                </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Email address</span>
                    <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            placeholder="you@example.com"
                            className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-12 pr-4 text-sm text-white outline-none transition-colors focus:border-indigo-400/40"
                        />
                    </div>
                </label>

                {message && (
                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                            <span>{message}</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-obsidian transition-colors hover:bg-indigo-400 disabled:opacity-60"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                    Email me a magic link
                </button>
            </form>

            <button
                type="button"
                onClick={() => router.push(nextPath)}
                className="mt-4 w-full text-sm text-text-secondary transition-colors hover:text-white"
            >
                Continue without signing in
            </button>
        </div>
    );
}
