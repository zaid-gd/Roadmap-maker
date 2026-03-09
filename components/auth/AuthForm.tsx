"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

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
    const [focused, setFocused] = useState(false);

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
        <div className="w-full max-w-md rounded-md border border-border bg-[var(--color-surface-subtle)] p-8">
            <div className="mb-8">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">Sign in</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-text-primary">Continue with email</h1>
                <p className="mt-3 text-sm leading-6 text-text-secondary">Use a magic link to enable account-backed access across devices.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                    <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-text-secondary">Email address</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        required
                        placeholder="you@example.com"
                        className="field-input"
                    />
                </label>

                {message ? (
                    <div className="rounded-md border border-[color:rgba(47,166,125,0.24)] bg-[color:rgba(47,166,125,0.08)] px-4 py-3 text-sm text-text-primary">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                            <span>{message}</span>
                        </div>
                    </div>
                ) : null}

                {error ? (
                    <div className="rounded-md border border-[color:rgba(216,104,104,0.24)] bg-[color:rgba(216,104,104,0.08)] px-4 py-3 text-sm text-[var(--color-danger)]">
                        {error}
                    </div>
                ) : null}

                <button
                    type="submit"
                    disabled={loading}
                    className={cn(
                        "button-primary w-full justify-center",
                        focused ? "opacity-100" : "opacity-90",
                    )}
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                    Email me a magic link
                </button>
            </form>

            <button
                type="button"
                onClick={() => router.push(nextPath)}
                className="mt-4 inline-flex min-h-11 items-center text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
                Continue in local-only mode
            </button>
        </div>
    );
}
