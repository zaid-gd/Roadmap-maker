import type { Roadmap, StorageProvider } from "@/types";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";

export const ROADMAPS_KEY = "zns:v1:roadmaps";
const LEGACY_ROADMAPS_KEY = "zns_workspaces";

type SupabaseRoadmapRow = {
    id: string;
    roadmap: Roadmap;
    updated_at?: string | null;
};

class SupabaseRoadmapClient {
    async fetchRoadmaps(): Promise<Roadmap[] | null> {
        try {
            const supabase = createSupabaseClient();
            const { data, error } = await supabase
                .from("roadmaps")
                .select("id, roadmap, updated_at")
                .order("updated_at", { ascending: false });

            if (error || !Array.isArray(data)) return null;

            return data
                .map((row) => (row as SupabaseRoadmapRow).roadmap)
                .filter((value): value is Roadmap => Boolean(value?.id));
        } catch {
            return null;
        }
    }

    async upsertRoadmap(roadmap: Roadmap): Promise<void> {
        try {
            const supabase = createSupabaseClient();
            await supabase.from("roadmaps").upsert(
                {
                    id: roadmap.id,
                    roadmap,
                    updated_at: roadmap.updatedAt ?? new Date().toISOString(),
                },
                { onConflict: "id" },
            );
        } catch {
            // Best effort cloud sync; local remains source of truth on failure.
        }
    }

    async upsertRoadmaps(roadmaps: Roadmap[]): Promise<void> {
        if (roadmaps.length === 0) return;

        try {
            const supabase = createSupabaseClient();
            await supabase.from("roadmaps").upsert(
                roadmaps.map((roadmap) => ({
                    id: roadmap.id,
                    roadmap,
                    updated_at: roadmap.updatedAt ?? new Date().toISOString(),
                })),
                { onConflict: "id" },
            );
        } catch {
            // Best effort cloud sync; local remains source of truth on failure.
        }
    }

    async deleteRoadmap(id: string): Promise<void> {
        try {
            const supabase = createSupabaseClient();
            await supabase.from("roadmaps").delete().eq("id", id);
        } catch {
            // Best effort cloud sync; local remains source of truth on failure.
        }
    }
}

function getTimestamp(value?: string): number {
    if (!value) return 0;
    const ms = new Date(value).getTime();
    return Number.isFinite(ms) ? ms : 0;
}

function mergeRoadmaps(local: Roadmap[], cloud: Roadmap[]): Roadmap[] {
    const merged = new Map<string, Roadmap>();

    for (const roadmap of [...local, ...cloud]) {
        const existing = merged.get(roadmap.id);
        if (!existing) {
            merged.set(roadmap.id, roadmap);
            continue;
        }

        const existingTs = getTimestamp(existing.updatedAt);
        const incomingTs = getTimestamp(roadmap.updatedAt);
        if (incomingTs >= existingTs) merged.set(roadmap.id, roadmap);
    }

    return [...merged.values()].sort((a, b) => getTimestamp(b.updatedAt) - getTimestamp(a.updatedAt));
}

function hasSupabaseEnv(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

class LocalStorageProvider implements StorageProvider {
    private cloudClient: SupabaseRoadmapClient | null = hasSupabaseEnv() ? new SupabaseRoadmapClient() : null;

    private readStore(): Roadmap[] {
        try {
            const raw = localStorage.getItem(ROADMAPS_KEY);
            if (raw) return JSON.parse(raw) as Roadmap[];

            // One-time migration from legacy key.
            const legacy = localStorage.getItem(LEGACY_ROADMAPS_KEY);
            if (legacy) {
                const migrated = JSON.parse(legacy) as Roadmap[];
                localStorage.setItem(ROADMAPS_KEY, JSON.stringify(migrated));
                localStorage.removeItem(LEGACY_ROADMAPS_KEY);
                return migrated;
            }

            return [];
        } catch {
            return [];
        }
    }

    private writeStore(roadmaps: Roadmap[]): void {
        try {
            localStorage.setItem(ROADMAPS_KEY, JSON.stringify(roadmaps));
        } catch {
            // Quota exceeded or private browsing; fail silently.
        }
    }

    getRoadmaps(): Roadmap[] {
        return this.readStore();
    }

    getRoadmap(id: string): Roadmap | null {
        return this.readStore().find((r) => r.id === id) ?? null;
    }

    saveRoadmap(roadmap: Roadmap): void {
        const all = this.readStore();
        const idx = all.findIndex((r) => r.id === roadmap.id);
        if (idx >= 0) {
            all[idx] = roadmap;
        } else {
            all.unshift(roadmap);
        }

        this.writeStore(all);
        void this.cloudClient?.upsertRoadmap(roadmap);
    }

    deleteRoadmap(id: string): void {
        const all = this.readStore().filter((r) => r.id !== id);
        this.writeStore(all);
        void this.cloudClient?.deleteRoadmap(id);
    }

    updateRoadmap(id: string, updates: Partial<Roadmap>): void {
        const all = this.readStore();
        const idx = all.findIndex((r) => r.id === id);
        if (idx < 0) return;

        const updated = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
        all[idx] = updated;
        this.writeStore(all);
        void this.cloudClient?.upsertRoadmap(updated);
    }

    clearRoadmaps(): void {
        localStorage.removeItem(ROADMAPS_KEY);
        localStorage.removeItem(LEGACY_ROADMAPS_KEY);
    }

    isCloudEnabled(): boolean {
        return Boolean(this.cloudClient);
    }

    async syncFromCloud(): Promise<Roadmap[]> {
        const local = this.readStore();
        if (!this.cloudClient) return local;

        const cloud = await this.cloudClient.fetchRoadmaps();
        if (!cloud) return local;

        const merged = mergeRoadmaps(local, cloud);
        this.writeStore(merged);
        void this.cloudClient.upsertRoadmaps(merged);
        return merged;
    }
}

let _instance: StorageProvider | null = null;

export function getStorage(): StorageProvider {
    if (!_instance) _instance = new LocalStorageProvider();
    return _instance;
}

export function getRoadmapsBackupJson(): string {
    return localStorage.getItem(ROADMAPS_KEY) || "[]";
}
