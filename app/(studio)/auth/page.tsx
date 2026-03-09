import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/utils/supabase/config";

function normalizePath(value: string | undefined) {
    return value && value.startsWith("/") ? value : "/";
}

const reasons = [
    "Access the same workspace from multiple devices.",
    "Keep billing and account state attached to one session.",
    "Move from browser-only use to account-backed continuity.",
];

export default async function AuthPage({
    searchParams,
}: {
    searchParams: Promise<{ next?: string; error?: string }>;
}) {
    const params = await searchParams;
    const nextPath = normalizePath(params.next);

    if (!isSupabaseConfigured()) {
        return (
            <main className="flex min-h-[calc(100svh-72px)] items-center justify-center px-6 py-10">
                <div className="w-full max-w-xl rounded-md border border-border bg-[var(--color-surface)] p-8">
                    <h1 className="text-3xl font-semibold tracking-[-0.03em] text-text-primary">Supabase is not configured</h1>
                    <p className="mt-4 text-sm leading-7 text-text-secondary">
                        Set `NEXT_PUBLIC_SUPABASE_URL` and either `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` before using account sync.
                    </p>
                </div>
            </main>
        );
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        redirect(nextPath);
    }

    return (
        <main className="min-h-[calc(100svh-72px)] px-6 py-8 lg:px-10">
            <div className="mx-auto grid min-h-[calc(100svh-136px)] max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                <section className="flex h-full flex-col justify-center">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">Account access</p>
                    <h1 className="mt-4 max-w-xl text-5xl font-display leading-[1.02] tracking-[-0.04em] text-text-primary">
                        Keep your workspace available wherever you return to it.
                    </h1>
                    <ol className="mt-10 space-y-6">
                        {reasons.map((reason, index) => (
                            <li key={reason} className="grid grid-cols-[2rem_1fr] items-start gap-4">
                                <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-border text-sm font-medium text-text-primary">
                                    {index + 1}
                                </span>
                                <p className="pt-1 text-base leading-7 text-text-secondary">{reason}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="flex items-center justify-center">
                    <AuthForm nextPath={nextPath} initialError={params.error} />
                </section>
            </div>
        </main>
    );
}
