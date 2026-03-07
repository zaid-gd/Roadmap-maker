"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, LogOut, UserRound } from "lucide-react";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";
import { isSupabaseConfigured } from "@/utils/supabase/config";

type AuthState = {
    email: string | null;
};

export default function AuthButton() {
    const pathname = usePathname();
    const router = useRouter();
    const [authState, setAuthState] = useState<AuthState | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (!isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        const supabase = createSupabaseClient();
        let active = true;

        void supabase.auth.getUser().then(({ data, error }) => {
            if (!active || error) return;
            setAuthState(data.user ? { email: data.user.email ?? null } : null);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            startTransition(() => {
                setAuthState(session?.user ? { email: session.user.email ?? null } : null);
                setLoading(false);
            });
        });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, []);

    if (!isSupabaseConfigured()) {
        return null;
    }

    if (loading) {
        return (
            <div className="inline-flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2 text-xs uppercase tracking-wider text-text-secondary">
                <Loader2 size={14} className="animate-spin" />
                Account
            </div>
        );
    }

    if (!authState) {
        const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
        return (
            <Link
                href={`/auth${next}`}
                className="inline-flex items-center gap-2 rounded-lg border border-border/50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-text-primary transition-colors hover:border-white/20 hover:bg-white/5"
            >
                <UserRound size={14} />
                Sign In
            </Link>
        );
    }

    const handleSignOut = async () => {
        const supabase = createSupabaseClient();
        await supabase.auth.signOut();
        router.refresh();
    };

    return (
        <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-border/50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-text-primary transition-colors hover:border-white/20 hover:bg-white/5 disabled:opacity-60"
            title={authState.email ?? "Signed in"}
        >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
            {authState.email ? authState.email.split("@")[0] : "Account"}
        </button>
    );
}
