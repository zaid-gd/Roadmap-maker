import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/utils/supabase/config";

export default async function NotesPage() {
    if (!isSupabaseConfigured()) {
        return (
            <div className="min-h-full bg-obsidian px-6 py-20 text-text-primary">
                <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-obsidian-surface p-8">
                    <h1 className="font-display text-3xl text-white">Supabase is not configured</h1>
                    <p className="mt-3 text-sm text-text-secondary">
                        Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to enable server-backed notes.
                    </p>
                </div>
            </div>
        );
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return (
            <div className="min-h-full bg-obsidian px-6 py-20 text-text-primary">
                <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-obsidian-surface p-8">
                    <h1 className="font-display text-3xl text-white">Sign in required</h1>
                    <p className="mt-3 text-sm text-text-secondary">
                        Notes are stored per-user in Supabase. Sign in before opening this page.
                    </p>
                </div>
            </div>
        );
    }

    const { data: notes, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

    return (
        <div className="min-h-full bg-obsidian px-6 py-20 text-text-primary">
            <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-obsidian-surface p-8">
                <h1 className="font-display text-3xl text-white">Notes</h1>
                <p className="mt-3 text-sm text-text-secondary">
                    Raw notes table output for the authenticated user.
                </p>
                <pre className="mt-6 overflow-x-auto rounded-xl border border-border bg-obsidian p-4 text-xs text-text-secondary">
                    {JSON.stringify(error ? { error: error.message } : notes, null, 2)}
                </pre>
            </div>
        </div>
    );
}
