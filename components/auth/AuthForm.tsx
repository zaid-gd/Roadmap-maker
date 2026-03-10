"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        <div className="w-full max-w-md rounded-[28px] border border-border bg-[color:color-mix(in_srgb,var(--color-surface)_94%,var(--color-page))] p-8 shadow-[0_24px_64px_color-mix(in_srgb,var(--color-page)_72%,transparent)]">
            <div className="mb-8">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">Sign in</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-text-primary">Continue with email</h1>
                <p className="mt-3 text-sm leading-6 text-text-secondary">Use a magic link to enable account-backed access across devices.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                    <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-text-secondary">Email address</span>
                    <Input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        required
                        placeholder="you@example.com"
                    />
                </label>

                {message ? (
                    <div className="rounded-[18px] border border-[color:color-mix(in_srgb,var(--color-accent)_24%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-accent)_10%,var(--color-surface))] px-4 py-3 text-sm text-text-primary">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
                            <span>{message}</span>
                        </div>
                    </div>
                ) : null}

                {error ? (
                    <div className="rounded-[18px] border border-[color:color-mix(in_srgb,var(--color-accent)_24%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-accent)_10%,var(--color-surface))] px-4 py-3 text-sm text-text-primary">
                        {error}
                    </div>
                ) : null}

                <Button
                    type="submit"
                    disabled={loading}
                    className={cn(
                        "w-full justify-center",
                        focused ? "opacity-100" : "opacity-90",
                    )}
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                    Email me a magic link
                </Button>
            </form>

            <Button
                type="button"
                onClick={() => router.push(nextPath)}
                variant="ghost"
                className="mt-4 px-0 text-sm text-text-secondary hover:bg-transparent hover:text-text-primary"
            >
                Continue in local-only mode
            </Button>
        </div>
    );
}
