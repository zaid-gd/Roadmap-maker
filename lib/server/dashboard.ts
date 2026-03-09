import type { AIProvider } from "@/lib/ai-config";
import type { CoachingSession, ProgressSnapshot } from "@/types";
import { buildVelocitySeries, computeOverview } from "@/lib/analytics";
import { generateStructuredJson } from "@/lib/server/ai";
import { requireServerUser } from "@/lib/server/auth";
import { deductCredits } from "@/lib/server/credits";
import { listUserWorkspaces } from "@/lib/server/workspaces";

export async function getDashboardOverview() {
    const { supabase, user } = await requireServerUser();
    const roadmaps = await listUserWorkspaces();
    const { data: snapshots, error } = await supabase
        .from("progress_snapshots")
        .select("id, roadmap_id, section_id, completion_rate, completed_tasks, total_tasks, created_at")
        .eq("user_id", user.id);

    if (error) throw error;

    const normalizedSnapshots: ProgressSnapshot[] = (snapshots ?? []).map((row) => ({
        id: row.id,
        roadmapId: row.roadmap_id,
        sectionId: row.section_id,
        completionRate: row.completion_rate,
        completedTasks: row.completed_tasks,
        totalTasks: row.total_tasks,
        createdAt: row.created_at,
    }));

    return computeOverview(roadmaps, normalizedSnapshots);
}

export async function getDashboardVelocity() {
    const { supabase, user } = await requireServerUser();
    const { data, error } = await supabase
        .from("progress_snapshots")
        .select("id, roadmap_id, section_id, completion_rate, completed_tasks, total_tasks, created_at")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: true });

    if (error) throw error;

    const snapshots: ProgressSnapshot[] = (data ?? []).map((row) => ({
        id: row.id,
        roadmapId: row.roadmap_id,
        sectionId: row.section_id,
        completionRate: row.completion_rate,
        completedTasks: row.completed_tasks,
        totalTasks: row.total_tasks,
        createdAt: row.created_at,
    }));

    return buildVelocitySeries(snapshots);
}

export async function saveCoachingSession(input: {
    roadmapId: string;
    date: string;
    durationMinutes: number;
    topics: string[];
    nextSteps: string;
}) {
    const { supabase, user } = await requireServerUser();
    const { data, error } = await supabase
        .from("coaching_sessions")
        .insert({
            user_id: user.id,
            roadmap_id: input.roadmapId,
            date: input.date,
            duration_minutes: input.durationMinutes,
            topics: input.topics,
            next_steps: input.nextSteps,
        })
        .select("id, roadmap_id, date, duration_minutes, topics, next_steps")
        .single();

    if (error) throw error;

    return {
        id: data.id,
        roadmapId: data.roadmap_id,
        date: data.date,
        durationMinutes: data.duration_minutes,
        topics: Array.isArray(data.topics) ? data.topics : [],
        nextSteps: data.next_steps,
    } satisfies CoachingSession;
}

export async function generateNinetyDayReview(input: {
    roadmapId: string;
    userApiKey?: string;
    userModel?: string;
    userProvider?: AIProvider;
}) {
    const { supabase, user } = await requireServerUser();
    const roadmaps = await listUserWorkspaces();
    const roadmap = roadmaps.find((candidate) => candidate.id === input.roadmapId);
    if (!roadmap) {
        throw new Error("Roadmap not found");
    }

    const { data: sessions, error } = await supabase
        .from("coaching_sessions")
        .select("date, duration_minutes, topics, next_steps")
        .eq("user_id", user.id)
        .eq("roadmap_id", roadmap.id)
        .order("date", { ascending: false })
        .limit(12);

    if (error) throw error;

    const creditResult = await deductCredits({
        kind: "review",
        userApiKey: input.userApiKey,
        metadata: { roadmapId: roadmap.id },
    });

    if (creditResult.reason === "insufficient") {
        return { success: false, error: "insufficient_credits", creditStatus: creditResult.status };
    }

    const prompt = `
Return only valid JSON with this shape:
{
  "summary": "string",
  "strengths": ["string"],
  "risks": ["string"],
  "nextActions": ["string"]
}

Create a concise 90-day review for this roadmap:
Title: ${roadmap.title}
Mode: ${roadmap.mode}
Summary: ${roadmap.summary ?? ""}
Recent coaching sessions:
${JSON.stringify(sessions ?? [])}
`;

    const payload = await generateStructuredJson(prompt, {
        apiKey: input.userApiKey,
        model: input.userModel,
        provider: input.userProvider,
    });
    return {
        success: true,
        creditStatus: creditResult.status,
        review: JSON.parse(payload),
    };
}
