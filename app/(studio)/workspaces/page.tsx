"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Plus, SlidersHorizontal } from "lucide-react";
import StorageStatusCard from "@/components/shared/StorageStatusCard";
import WorkspaceLibraryCard from "@/components/workspaces/WorkspaceLibraryCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getStorage, getStorageStatus } from "@/lib/storage";
import { getRoadmapStats } from "@/lib/workspace-stats";
import type { Roadmap, StorageStatus } from "@/types";

type LibraryFilter = "all" | "in-progress" | "completed";
type SortMode = "recent" | "title" | "completion";

export default function WorkspacesPage() {
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [storageStatus, setStorageStatus] = useState<StorageStatus>({
        mode: "local-only",
        cloudAvailable: false,
        email: null,
    });
    const [filter, setFilter] = useState<LibraryFilter>("all");
    const [sortMode, setSortMode] = useState<SortMode>("recent");
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
        const nextRoadmaps = [...roadmaps].filter((roadmap) => {
            if (filter === "all") return true;

            const stats = getRoadmapStats(roadmap);
            if (filter === "completed") {
                return stats.progressState === "completed";
            }

            return stats.progressState === "in-progress";
        });

        nextRoadmaps.sort((left, right) => {
            if (sortMode === "title") {
                return left.title.localeCompare(right.title);
            }

            if (sortMode === "completion") {
                return getRoadmapStats(right).percent - getRoadmapStats(left).percent;
            }

            const leftDate = new Date(left.updatedAt || left.createdAt).getTime();
            const rightDate = new Date(right.updatedAt || right.createdAt).getTime();
            return rightDate - leftDate;
        });

        return nextRoadmaps;
    }, [filter, roadmaps, sortMode]);

    const filterOptions: { key: LibraryFilter; label: string }[] = [
        { key: "all", label: "All" },
        { key: "in-progress", label: "In progress" },
        { key: "completed", label: "Completed" },
    ];

    const sortOptions: { key: SortMode; label: string }[] = [
        { key: "recent", label: "Recent" },
        { key: "title", label: "Title" },
        { key: "completion", label: "Completion" },
    ];

    return (
        <main className="studio-page">
            <section className="studio-hero grid gap-8 p-6 lg:p-8 2xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
                <div className="max-w-3xl">
                    <p className="eyebrow">Library</p>
                    <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl font-display leading-tight tracking-[-0.04em] text-text-primary md:text-6xl">
                                Keep every active workspace readable.
                            </h1>
                            <p className="mt-4 text-base leading-8 text-text-secondary">
                                Open, sort, and continue work from one place without adding unnecessary dashboard chrome.
                            </p>
                        </div>

                        <Link href="/create" className="button-primary shrink-0">
                            <Plus size={16} />
                            New workspace
                        </Link>
                    </div>
                </div>

                <StorageStatusCard
                    status={storageStatus}
                    actionHref={storageStatus.mode === "synced-account" ? "/settings?tab=privacy" : "/auth?next=%2Fworkspaces"}
                    actionLabel={storageStatus.mode === "synced-account" ? "Open privacy controls" : "Enable sync"}
                />
            </section>

            <section className="space-y-6 py-2">
                <div className="studio-panel flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-5">
                        <div className="flex items-center gap-3 text-sm text-text-muted">
                            <SlidersHorizontal size={15} />
                            <span>Filter</span>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {filterOptions.map((option) => (
                                <Button
                                    key={option.key}
                                    type="button"
                                    onClick={() => setFilter(option.key)}
                                    variant={filter === option.key ? "default" : "ghost"}
                                    size="sm"
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-5">
                        <div className="flex items-center gap-3 text-sm text-text-muted">
                            <ArrowUpDown size={15} />
                            <span>Sort</span>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {sortOptions.map((option) => (
                                <Button
                                    key={option.key}
                                    type="button"
                                    onClick={() => setSortMode(option.key)}
                                    variant={sortMode === option.key ? "default" : "ghost"}
                                    size="sm"
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {mounted ? (
                    filteredRoadmaps.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
                    ) : (
                        <Card className="mt-8">
                            <CardContent className="studio-empty py-12">
                                <h2 className="text-2xl font-display text-text-primary">
                                    {roadmaps.length === 0 ? "No workspaces yet." : "Nothing matches the current view."}
                                </h2>
                                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-text-secondary">
                                    {roadmaps.length === 0
                                        ? "Create the first workspace and it will appear here as a clean, sortable library."
                                        : "Adjust the filters or sorting to bring another set of workspaces back into view."}
                                </p>
                                <div className="mt-6 flex justify-center gap-3">
                                    <Button asChild>
                                        <Link href="/create">
                                            <Plus size={16} />
                                            New workspace
                                        </Link>
                                    </Button>
                                    {roadmaps.length > 0 ? (
                                        <Button type="button" variant="secondary" onClick={() => setFilter("all")}>
                                            Show all
                                        </Button>
                                    ) : null}
                                </div>
                            </CardContent>
                        </Card>
                    )
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="surface-panel h-56 skeleton" />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
