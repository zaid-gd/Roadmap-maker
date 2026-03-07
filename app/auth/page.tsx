import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import AuthForm from "@/components/auth/AuthForm";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/utils/supabase/config";

function normalizePath(value: string | undefined) {
    return value && value.startsWith("/") ? value : "/";
}

export default async function AuthPage({
    searchParams,
}: {
    searchParams: Promise<{ next?: string; error?: string }>;
}) {
    const params = await searchParams;
    const nextPath = normalizePath(params.next);

    if (!isSupabaseConfigured()) {
        return (
            <div className="flex min-h-full flex-col bg-obsidian text-text-primary">
                <Header />
                <main className="flex flex-1 items-center justify-center px-6 pb-12 pt-24">
                    <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-obsidian-surface p-8">
                        <h1 className="text-3xl font-display text-white">Supabase is not configured</h1>
                        <p className="mt-4 text-sm leading-7 text-text-secondary">
                            Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` before using account sync.
                        </p>
                    </div>
                </main>
            </div>
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
        <div className="flex min-h-full flex-col bg-obsidian text-text-primary">
            <Header />
            <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 pb-12 pt-24">
                <div className="pointer-events-none absolute inset-0 hero-mesh-gradient opacity-60" />
                <div className="pointer-events-none absolute inset-0 landing-grid-bg opacity-25" />
                <div className="relative z-10 w-full py-12">
                    <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 lg:flex-row lg:items-stretch">
                        <div className="max-w-lg flex-1">
                            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">Why sign in</p>
                                <h2 className="mt-4 text-3xl font-display text-white">Turn local work into account-backed work</h2>
                                <div className="mt-6 space-y-4 text-sm leading-7 text-text-secondary">
                                    <p>Roadmaps synced to Supabase are now tied to your user account instead of being public rows.</p>
                                    <p>Notes, billing status, and future collaboration features all depend on the same Supabase session.</p>
                                    <p>Magic-link auth keeps this simple: no passwords to manage, just email verification.</p>
                                </div>
                            </div>
                        </div>

                        <AuthForm nextPath={nextPath} initialError={params.error} />
                    </div>
                </div>
            </main>
        </div>
    );
}
