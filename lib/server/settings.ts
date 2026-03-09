import type { PrivacySettings } from "@/types";
import { requireServerUser } from "@/lib/server/auth";
import { createServiceRoleClient } from "@/utils/supabase/server";

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
    anonymousAnalytics: false,
    allowPublicGallery: false,
};

export async function getPrivacySettings(): Promise<PrivacySettings> {
    const { supabase, user } = await requireServerUser();
    const { data, error } = await supabase
        .from("user_privacy_settings")
        .select("anonymous_analytics, allow_public_gallery")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) throw error;
    if (!data) return DEFAULT_PRIVACY_SETTINGS;

    return {
        anonymousAnalytics: Boolean(data.anonymous_analytics),
        allowPublicGallery: Boolean(data.allow_public_gallery),
    };
}

export async function updatePrivacySettings(settings: PrivacySettings): Promise<PrivacySettings> {
    const { supabase, user } = await requireServerUser();
    const { error } = await supabase.from("user_privacy_settings").upsert(
        {
            user_id: user.id,
            anonymous_analytics: settings.anonymousAnalytics,
            allow_public_gallery: settings.allowPublicGallery,
            updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
    );

    if (error) throw error;

    if (!settings.allowPublicGallery) {
        await supabase.from("roadmaps").update({ is_public: false }).eq("user_id", user.id);
    }

    return settings;
}

export async function exportUserData() {
    const { supabase, user } = await requireServerUser();

    const [
        { data: roadmaps },
        { data: srsItems },
        { data: creditLedger },
        { data: creditTransactions },
        { data: progressSnapshots },
        { data: coachingSessions },
        { data: privacySettings },
        { data: notes },
    ] = await Promise.all([
        supabase.from("roadmaps").select("*").eq("user_id", user.id),
        supabase.from("srs_items").select("*").eq("user_id", user.id),
        supabase.from("credit_ledgers").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("credit_transactions").select("*").eq("user_id", user.id),
        supabase.from("progress_snapshots").select("*").eq("user_id", user.id),
        supabase.from("coaching_sessions").select("*").eq("user_id", user.id),
        supabase.from("user_privacy_settings").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("notes").select("*").eq("user_id", user.id),
    ]);

    return {
        exportedAt: new Date().toISOString(),
        userId: user.id,
        roadmaps: roadmaps ?? [],
        srsItems: srsItems ?? [],
        creditLedger: creditLedger ?? null,
        creditTransactions: creditTransactions ?? [],
        progressSnapshots: progressSnapshots ?? [],
        coachingSessions: coachingSessions ?? [],
        privacySettings: privacySettings ?? null,
        notes: notes ?? [],
    };
}

export async function deleteAllUserData() {
    const { user } = await requireServerUser();
    const supabase = createServiceRoleClient();

    const tables = [
        "coaching_sessions",
        "progress_snapshots",
        "credit_transactions",
        "credit_ledgers",
        "srs_items",
        "user_privacy_settings",
        "notes",
        "ai_generation_events",
        "roadmaps",
    ] as const;

    for (const table of tables) {
        const { error } = await supabase.from(table).delete().eq("user_id", user.id);
        if (error) throw error;
    }

    return { success: true };
}
