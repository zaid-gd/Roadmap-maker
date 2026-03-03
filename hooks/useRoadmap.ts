"use client";

import { useState, useCallback, useEffect } from "react";
import type { Roadmap, Section } from "@/types";
import { getStorage } from "@/lib/storage";

export function useRoadmap(id?: string) {
    // Lazy state initialization (vercel best practice: 5.10)
    const [roadmap, setRoadmap] = useState<Roadmap | null>(() => {
        if (typeof window === "undefined" || !id) return null;
        return getStorage().getRoadmap(id);
    });

    const [roadmaps, setRoadmaps] = useState<Roadmap[]>(() => {
        if (typeof window === "undefined") return [];
        return getStorage().getRoadmaps();
    });

    // Refresh roadmaps list from storage
    const refreshList = useCallback(() => {
        setRoadmaps(getStorage().getRoadmaps());
    }, []);

    // Load a specific roadmap
    const loadRoadmap = useCallback((roadmapId: string) => {
        const r = getStorage().getRoadmap(roadmapId);
        setRoadmap(r);
        return r;
    }, []);

    // Save a new or updated roadmap
    const saveRoadmap = useCallback((r: Roadmap) => {
        getStorage().saveRoadmap(r);
        setRoadmap(r);
        setRoadmaps(getStorage().getRoadmaps());
    }, []);

    // Delete a roadmap
    const deleteRoadmap = useCallback((roadmapId: string) => {
        getStorage().deleteRoadmap(roadmapId);
        if (roadmap?.id === roadmapId) setRoadmap(null);
        setRoadmaps(getStorage().getRoadmaps());
    }, [roadmap?.id]);

    // Update a specific section within the roadmap (functional setState: 5.9)
    const updateSection = useCallback(
        (sectionId: string, updater: (section: Section) => Section) => {
            setRoadmap((prev) => {
                if (!prev) return prev;
                const updated: Roadmap = {
                    ...prev,
                    updatedAt: new Date().toISOString(),
                    sections: prev.sections.map((s) =>
                        s.id === sectionId ? updater(s) : s
                    ),
                };
                getStorage().saveRoadmap(updated);
                return updated;
            });
        },
        []
    );

    // Sync on mount if id changes
    useEffect(() => {
        if (id) {
            const r = getStorage().getRoadmap(id);
            setRoadmap(r);
        }
    }, [id]);

    return {
        roadmap,
        roadmaps,
        refreshList,
        loadRoadmap,
        saveRoadmap,
        deleteRoadmap,
        updateSection,
    };
}
