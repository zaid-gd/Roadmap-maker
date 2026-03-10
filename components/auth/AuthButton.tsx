"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HardDrive, Loader2, LogOut } from "lucide-react";
import { getStorage } from "@/lib/storage";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";
import { isSupabaseConfigured } from "@/utils/supabase/config";
import { cn } from "@/lib/utils";

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
        const syncFromCloud = getStorage().syncFromCloud;
        let active = true;

        void supabase.auth.getUser().then(({ data, error }) => {
            if (!active || error) return;
            setAuthState(data.user ? { email: data.user.email ?? null } : null);
            if (data.user && syncFromCloud) {
                void syncFromCloud();
            }
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user && syncFromCloud) {
                void syncFromCloud();
            }
            startTransition(() => {
                setAuthState(session?.user ? { email: session.user.email ?? null } : null);
                setLoading(false);
                router.refresh();
            });
        });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, [router]);

    if (!isSupabaseConfigured()) {
        return null;
    }

    if (loading) {
        return (
            <div className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-[color:color-mix(in_srgb,var(--color-surface)_94%,var(--color-page))] px-3 text-sm text-text-muted">
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
                className="button-primary min-h-10 rounded-full px-4 text-sm"
                title="Your work stays in this browser until you sign in."
            >
                <HardDrive size={14} />
                Sign in
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
            className={cn(
                "button-secondary min-h-10 rounded-full px-4 text-sm disabled:opacity-60",
                isPending && "pointer-events-none"
            )}
            title={authState.email ?? "Signed in"}
        >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
            {authState.email ? authState.email.split("@")[0] : "Account"}
        </button>
    );
}
