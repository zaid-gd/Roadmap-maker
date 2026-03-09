import type { SrsItem } from "@/types";
import { requireServerUser } from "@/lib/server/auth";

export async function saveSrsItems(items: SrsItem[]) {
    const { supabase, user } = await requireServerUser();
    if (items.length === 0) return [];

    const { error } = await supabase.from("srs_items").upsert(
        items.map((item) => ({
            id: item.id,
            user_id: user.id,
            roadmap_id: item.roadmapId,
            section_id: item.sectionId ?? null,
            prompt: item.prompt,
            answer: item.answer,
            ease_factor: item.easeFactor,
            interval_days: item.intervalDays,
            repetitions: item.repetitions,
            due_at: item.dueAt,
            last_reviewed_at: item.lastReviewedAt ?? null,
            updated_at: new Date().toISOString(),
        })),
        { onConflict: "id" },
    );

    if (error) throw error;
    return items;
}

export async function getDueSrsItems(limit = 20): Promise<SrsItem[]> {
    const { supabase, user } = await requireServerUser();
    const { data, error } = await supabase
        .from("srs_items")
        .select("id, roadmap_id, section_id, prompt, answer, ease_factor, interval_days, repetitions, due_at, last_reviewed_at")
        .eq("user_id", user.id)
        .lte("due_at", new Date().toISOString())
        .order("due_at", { ascending: true })
        .limit(limit);

    if (error) throw error;

    return (data ?? []).map((row) => ({
        id: row.id,
        roadmapId: row.roadmap_id,
        sectionId: row.section_id ?? undefined,
        prompt: row.prompt,
        answer: row.answer,
        easeFactor: row.ease_factor,
        intervalDays: row.interval_days,
        repetitions: row.repetitions,
        dueAt: row.due_at,
        lastReviewedAt: row.last_reviewed_at ?? undefined,
    }));
}
