import type { PublicRoadmapCard, Roadmap } from "@/types";
import { SEEDED_GALLERY_ROADMAPS, toSeedCard } from "@/lib/gallery";
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
    updated_at?: string | null;
};

function toCard(row: RoadmapRow): PublicRoadmapCard {
    const roadmap = row.roadmap;
    const moduleCount = roadmap.sections.filter((section) => section.type === "module").length;
    return {
        id: row.id,
        title: row.title ?? roadmap.title,
        summary: row.summary ?? roadmap.summary,
        mode: (row.mode as "general" | "intern") ?? roadmap.mode,
        contentType: row.content_type ?? roadmap.contentType,
        difficulty: roadmap.difficulty,
        totalEstimatedDuration: roadmap.totalEstimatedDuration,
        moduleCount,
        forkCount: row.fork_count ?? roadmap.forkCount ?? 0,
        updatedAt: row.updated_at ?? roadmap.updatedAt,
    };
}

function cloneRoadmapForFork(roadmap: Roadmap, ownerId: string, sourceId: string): Roadmap {
    const timestamp = new Date().toISOString();
    return {
        ...roadmap,
        id: `rm_${Math.random().toString(36).slice(2, 10)}`,
        title: `${roadmap.title} Copy`,
        createdAt: timestamp,
        updatedAt: timestamp,
        ownerId,
        isPublic: false,
        forkedFrom: sourceId,
        forkCount: 0,
        sections: roadmap.sections.map((section) => {
            if (section.type === "module") {
                return {
                    ...section,
                    data: {
                        ...section.data,
                        completed: false,
                        tasks: section.data.tasks.map((task) => ({
                            ...task,
                            completed: false,
                            done: false,
                            subtasks: task.subtasks.map((subtask) => ({
                                ...subtask,
                                completed: false,
                            })),
                        })),
                    },
                };
            }

            if (section.type === "milestones") {
                return {
                    ...section,
                    data: section.data.map((milestone) => ({
                        ...milestone,
                        completed: false,
                        tasks: milestone.tasks.map((task) => ({
                            ...task,
                            completed: false,
                            done: false,
                            subtasks: task.subtasks.map((subtask) => ({
                                ...subtask,
                                completed: false,
                            })),
                        })),
                    })),
                };
            }

            if (section.type === "tasks") {
                return {
                    ...section,
                    data: section.data.map((group) => ({
                        ...group,
                        tasks: group.tasks.map((task) => ({
                            ...task,
                            completed: false,
                            done: false,
                            subtasks: task.subtasks.map((subtask) => ({
                                ...subtask,
                                completed: false,
                            })),
                        })),
                    })),
                };
            }

            return section;
        }),
    };
}

function toPersistedRow(roadmap: Roadmap, userId: string, isPublic: boolean) {
    const updatedAt = roadmap.updatedAt ?? new Date().toISOString();
    return {
        id: roadmap.id,
        user_id: userId,
        roadmap: {
            ...roadmap,
            isPublic,
            updatedAt,
        },
        title: roadmap.title,
        summary: roadmap.summary ?? null,
        mode: roadmap.mode,
        content_type: roadmap.contentType ?? null,
        is_public: isPublic,
        fork_count: roadmap.forkCount ?? 0,
        forked_from: roadmap.forkedFrom ?? null,
        updated_at: updatedAt,
    };
}

export async function listGallery(options?: {
    query?: string;
    mode?: string;
    contentType?: string;
}) {
    const seeded = SEEDED_GALLERY_ROADMAPS.map(toSeedCard);
    let cards: PublicRoadmapCard[] = [];

    try {
        const supabase = createServiceRoleClient();
        const { data, error } = await supabase
            .from("roadmaps")
            .select("id, user_id, roadmap, title, summary, mode, content_type, is_public, fork_count, updated_at")
            .eq("is_public", true)
            .order("fork_count", { ascending: false })
            .order("updated_at", { ascending: false })
            .limit(50);

        if (error) throw error;

        cards = (data ?? []).map((row) => toCard(row as RoadmapRow));
    } catch {
        cards = [];
    }

    const query = options?.query?.trim().toLowerCase();

    return [...seeded, ...cards].filter((card) => {
        if (options?.mode && card.mode !== options.mode) return false;
        if (options?.contentType && card.contentType !== options.contentType) return false;
        if (!query) return true;
        return [card.title, card.summary, card.contentType].some((value) => value?.toLowerCase().includes(query));
    });
}

export async function setWorkspacePublic(workspaceId: string, isPublic: boolean, roadmap?: Roadmap) {
    const { supabase, user } = await requireServerUser();

    if (roadmap) {
        const persisted = toPersistedRow(
            {
                ...roadmap,
                id: workspaceId,
                ownerId: roadmap.ownerId ?? user.id,
                isPublic,
            },
            user.id,
            isPublic,
        );
        const { error } = await supabase.from("roadmaps").upsert(persisted, { onConflict: "id" });
        if (error) throw error;
        return { success: true };
    }

    const { data, error } = await supabase
        .from("roadmaps")
        .update({ is_public: isPublic })
        .eq("id", workspaceId)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

    if (error) throw error;
    if (!data) {
        throw new Error("Workspace must be synced before it can be published");
    }

    return { success: true };
}

export async function forkGalleryRoadmap(workspaceId: string) {
    const { supabase, user } = await requireServerUser();
    const service = createServiceRoleClient();

    const seeded = SEEDED_GALLERY_ROADMAPS.find((roadmap) => roadmap.id === workspaceId);
    let sourceRoadmap: Roadmap | null = seeded ?? null;

    if (!sourceRoadmap) {
        const { data, error } = await service
            .from("roadmaps")
            .select("roadmap, is_public, fork_count")
            .eq("id", workspaceId)
            .maybeSingle();

        if (error) throw error;
        if (!data || !(data as { is_public?: boolean }).is_public) {
            throw new Error("Workspace is not public");
        }

        sourceRoadmap = (data as { roadmap: Roadmap }).roadmap;

        const currentForks = Number((data as { fork_count?: number }).fork_count ?? sourceRoadmap.forkCount ?? 0);
        await service.from("roadmaps").update({ fork_count: currentForks + 1 }).eq("id", workspaceId);
    }

    const forked = cloneRoadmapForFork(sourceRoadmap, user.id, workspaceId);
    const { error: insertError } = await supabase.from("roadmaps").upsert(
        {
            id: forked.id,
            user_id: user.id,
            roadmap: forked,
            title: forked.title,
            summary: forked.summary ?? null,
            mode: forked.mode,
            content_type: forked.contentType ?? null,
            is_public: false,
            fork_count: 0,
            forked_from: workspaceId,
            updated_at: forked.updatedAt,
        },
        { onConflict: "id" },
    );

    if (insertError) throw insertError;

    return forked;
}
