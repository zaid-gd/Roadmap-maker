"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import StorageStatusCard from "@/components/shared/StorageStatusCard";
import WorkspaceLibraryCard from "@/components/workspaces/WorkspaceLibraryCard";
import { getStorage, getStorageStatus } from "@/lib/storage";
import { getRoadmapStats } from "@/lib/workspace-stats";
import type { Roadmap, StorageStatus } from "@/types";
import { ArrowRight, LayoutGrid, PlusCircle, Sparkles } from "lucide-react";

type LibraryFilter = "all" | "in-progress" | "completed";

function countMatches(roadmaps: Roadmap[], filter: LibraryFilter) {
    if (filter === "all") return roadmaps.length;

    return roadmaps.filter((roadmap) => {
        const stats = getRoadmapStats(roadmap);
        if (filter === "completed") {
            return stats.progressState === "completed";
        }

        return stats.progressState === "in-progress";
    }).length;
}

export default function WorkspacesPage() {
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [storageStatus, setStorageStatus] = useState<StorageStatus>({
        mode: "local-only",
        cloudAvailable: false,
        email: null,
    });
    const [filter, setFilter] = useState<LibraryFilter>("all");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const storage = getStorage();
        let active = true;

        setMounted(true);
        setRoadmaps(storage.getRoadmaps());

        void getStorageStatus().then((status) => {
            if (active) {
                setStorageStatus(status);
            }
        });

        if (storage.syncFromCloud) {
            void storage.syncFromCloud().then((synced) => {
                if (active) {
                    setRoadmaps(synced);
                }
            });
        }

        return () => {
            active = false;
        };
    }, []);

    const filteredRoadmaps = useMemo(() => {
        if (filter === "all") return roadmaps;

        return roadmaps.filter((roadmap) => {
            const stats = getRoadmapStats(roadmap);
            if (filter === "completed") {
                return stats.progressState === "completed";
            }

            return stats.progressState === "in-progress";
        });
    }, [filter, roadmaps]);

    const filterOptions: { key: LibraryFilter; label: string }[] = [
        { key: "all", label: "All" },
        { key: "in-progress", label: "In progress" },
        { key: "completed", label: "Completed" },
    ];

    return (
        <div className="min-h-full bg-obsidian">
            <Header />

            <main className="mx-auto max-w-7xl px-6 pb-16 pt-24 lg:px-10">
                <section className="grid gap-6 border-b border-white/[0.06] pb-10 lg:grid-cols-[1.2fr,0.9fr]">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                            <Sparkles size={13} className="text-amber-300" />
                            Workspace library
                        </div>
                        <h1 className="mt-6 font-display text-5xl leading-none text-white">A premium library for active roadmaps</h1>
                        <p className="mt-5 max-w-2xl text-sm leading-8 text-text-secondary">
                            This page is your full collection view. Use it to scan progress, reopen in-flight work, and
                            keep completed course plans discoverable without cluttering the rest of the studio.
                        </p>

                        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                            <Link
                                href="/create"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-300/20 bg-[linear-gradient(135deg,rgba(85,116,232,0.92),rgba(191,148,71,0.78))] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-obsidian transition-all hover:brightness-110"
                            >
                                <PlusCircle size={16} />
                                Create new workspace
                            </Link>
                            <Link
                                href="/settings?tab=privacy"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-text-primary transition-colors hover:bg-white/[0.09]"
                            >
                                Review storage mode
                                <ArrowRight size={15} />
                            </Link>
                        </div>
                    </div>

                    <StorageStatusCard
                        status={storageStatus}
                        actionHref={storageStatus.mode === "synced-account" ? "/settings?tab=privacy" : "/auth?next=%2Fworkspaces"}
                        actionLabel={storageStatus.mode === "synced-account" ? "Open privacy controls" : "Enable account sync"}
                    />
                </section>

                <section className="py-10">
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="grid gap-4 sm:grid-cols-3">
                            {filterOptions.map((item) => (
                                <div key={item.key} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                                    <p className="text-[11px] uppercase tracking-[0.22em] text-text-secondary">{item.label}</p>
                                    <p className="mt-3 text-3xl font-semibold text-white">{countMatches(roadmaps, item.key)}</p>
                                </div>
                            ))}
                        </div>

                        {mounted && roadmaps.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {filterOptions.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setFilter(item.key)}
                                        className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition-all ${
                                            filter === item.key
                                                ? "border-indigo-300/20 bg-indigo-500/12 text-indigo-100"
                                                : "border-white/10 bg-white/[0.03] text-text-secondary hover:text-white"
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {mounted && filteredRoadmaps.length > 0 ? (
                        <div className="grid gap-5 lg:grid-cols-2">
                            {filteredRoadmaps.map((roadmap) => (
                                <WorkspaceLibraryCard
                                    key={roadmap.id}
                                    roadmap={roadmap}
                                    onDelete={(id) => {
                                        getStorage().deleteRoadmap(id);
                                        setRoadmaps(getStorage().getRoadmaps());
                                    }}
                                    onRename={(id, nextTitle) => {
                                        getStorage().updateRoadmap(id, { title: nextTitle });
                                        setRoadmaps(getStorage().getRoadmaps());
                                    }}
                                />
                            ))}
                        </div>
                    ) : mounted ? (
                        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,26,34,0.98),rgba(11,13,18,0.96))] px-8 py-16 text-center shadow-[0_28px_80px_rgba(0,0,0,0.24)]">
                            <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.04]">
                                <LayoutGrid size={28} className="text-indigo-200" />
                            </div>
                            <h2 className="mt-6 font-display text-3xl text-white">
                                {roadmaps.length === 0 ? "No workspaces yet" : "No workspaces match this filter"}
                            </h2>
                            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-text-secondary">
                                {roadmaps.length === 0
                                    ? "Create your first roadmap from a guide, playbook, or markdown document and it will appear here with progress tracking."
                                    : "Change filters or open the home command hub to continue working from another state."}
                            </p>
                            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                <Link
                                    href="/create"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-300/20 bg-[linear-gradient(135deg,rgba(85,116,232,0.92),rgba(191,148,71,0.78))] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-obsidian transition-all hover:brightness-110"
                                >
                                    <PlusCircle size={16} />
                                    Create workspace
                                </Link>
                                {roadmaps.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setFilter("all")}
                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-text-primary transition-colors hover:bg-white/[0.09]"
                                    >
                                        Reset filters
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-5 lg:grid-cols-2">
                            {[1, 2, 3, 4].map((item) => (
                                <div key={item} className="h-[296px] rounded-[28px] border border-white/8 shimmer" />
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
