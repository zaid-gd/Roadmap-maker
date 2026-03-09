import type { Roadmap } from "@/types";
import { requireServerUser } from "@/lib/server/auth";
import { createServiceRoleClient } from "@/utils/supabase/server";

type RoadmapRow = {
    id: string;
    user_id: string;
    roadmap: Roadmap;
    title?: string | null;
    summary?: string | null;
    mode?: string | null;
    content_type?: string | null;
    is_public?: boolean | null;
    fork_count?: number | null;
    forked_from?: string | null;
    updated_at?: string | null;
};

function toMetadataRow(roadmap: Roadmap, userId: string) {
    return {
        id: roadmap.id,
        user_id: userId,
        roadmap,
        title: roadmap.title,
        summary: roadmap.summary ?? null,
        mode: roadmap.mode,
        content_type: roadmap.contentType ?? null,
        is_public: roadmap.isPublic ?? false,
        fork_count: roadmap.forkCount ?? 0,
        forked_from: roadmap.forkedFrom ?? null,
        updated_at: roadmap.updatedAt,
    };
}

export async function listUserWorkspaces() {
    const { supabase, user } = await requireServerUser();
    const { data, error } = await supabase
        .from("roadmaps")
        .select("roadmap")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row) => (row as RoadmapRow).roadmap);
}

export async function upsertUserWorkspace(roadmap: Roadmap) {
    const { supabase, user } = await requireServerUser();
    const { error } = await supabase.from("roadmaps").upsert(toMetadataRow(roadmap, user.id), {
        onConflict: "id",
    });

    if (error) throw error;
}

export async function getPublicWorkspace(id: string) {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
        .from("roadmaps")
        .select("roadmap, is_public")
        .eq("id", id)
        .maybeSingle();

    if (error) throw error;
    if (!data || !(data as RoadmapRow).is_public) return null;
    return (data as RoadmapRow).roadmap;
}
