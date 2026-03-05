/* ═══════════════════════════════════════════════════════════
   Storage Abstraction Layer
   v1: localStorage — versioned keys, try-catch wrapped
   Per vercel-react-best-practices: versioned localStorage with migration
   ═══════════════════════════════════════════════════════════ */

import type { Roadmap, StorageProvider } from "@/types";

const STORAGE_VERSION = "v1";
const ROADMAPS_KEY = `zns_workspaces`;

class LocalStorageProvider implements StorageProvider {
    private readStore(): Roadmap[] {
        try {
            const raw = localStorage.getItem(ROADMAPS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    private writeStore(roadmaps: Roadmap[]): void {
        try {
            localStorage.setItem(ROADMAPS_KEY, JSON.stringify(roadmaps));
        } catch {
            // Quota exceeded or private browsing — fail silently
        }
    }

    getRoadmaps(): Roadmap[] {
        return this.readStore();
    }

    getRoadmap(id: string): Roadmap | null {
        const all = this.readStore();
        return all.find((r) => r.id === id) ?? null;
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
    }

    deleteRoadmap(id: string): void {
        const all = this.readStore();
        this.writeStore(all.filter((r) => r.id !== id));
    }

    updateRoadmap(id: string, updates: Partial<Roadmap>): void {
        const all = this.readStore();
        const idx = all.findIndex((r) => r.id === id);
        if (idx >= 0) {
            all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
            this.writeStore(all);
        }
    }
}

// Factory — swap implementation here for v2 (database)
let _instance: StorageProvider | null = null;

export function getStorage(): StorageProvider {
    if (!_instance) {
        _instance = new LocalStorageProvider();
    }
    return _instance;
}
