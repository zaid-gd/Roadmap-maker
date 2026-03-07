"use client";

import Link from "next/link";
import { ArrowRight, Layers, PencilLine, Trash2 } from "lucide-react";
import type { Roadmap } from "@/types";
import { getRelativeTimeLabel, getRoadmapDisplayTitle, getRoadmapStateLabel, getRoadmapStats } from "@/lib/workspace-stats";

interface WorkspaceLibraryCardProps {
    roadmap: Roadmap;
    onDelete?: (id: string) => void;
    onRename?: (id: string, nextTitle: string) => void;
}

export default function WorkspaceLibraryCard({ roadmap, onDelete, onRename }: WorkspaceLibraryCardProps) {
    const stats = getRoadmapStats(roadmap);
    const displayTitle = getRoadmapDisplayTitle(roadmap);
    const tone =
        roadmap.mode === "intern"
            ? "border-emerald-400/18 bg-[linear-gradient(180deg,rgba(18,34,30,0.68),rgba(14,18,22,0.92))]"
            : "border-white/10 bg-[linear-gradient(180deg,rgba(26,29,39,0.96),rgba(15,17,23,0.96))]";

    const badgeTone =
        roadmap.mode === "intern"
            ? "border-emerald-400/28 bg-emerald-500/10 text-emerald-200"
            : "border-indigo-400/28 bg-indigo-500/10 text-indigo-100";

    const progressTone =
        stats.progressState === "completed"
            ? "bg-emerald-400"
            : stats.progressState === "in-progress"
              ? "bg-indigo-400"
              : "bg-amber-400";

    const handleRename = () => {
        if (!onRename) return;

        const nextTitle = window.prompt("Rename workspace", displayTitle);
        if (!nextTitle || !nextTitle.trim() || nextTitle.trim() === displayTitle) {
            return;
        }

        onRename(roadmap.id, nextTitle.trim());
    };

    const handleDelete = () => {
        if (!onDelete) return;

        if (window.confirm("Delete this workspace? This cannot be undone.")) {
            onDelete(roadmap.id);
        }
    };

    return (
        <article className={`group flex h-full flex-col overflow-hidden rounded-[28px] border shadow-[0_22px_60px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_32px_80px_rgba(0,0,0,0.28)] ${tone}`}>
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-6 py-5">
                <div>
                    <div className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${badgeTone}`}>
                        {roadmap.mode === "intern" ? "Intern" : "General"}
                    </div>
                    <h3 className="mt-4 font-display text-2xl leading-tight text-white">{displayTitle}</h3>
                </div>

                <div className="flex items-center gap-2">
                    {onRename && (
                        <button
                            type="button"
                            onClick={handleRename}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-text-secondary transition-colors hover:bg-white/[0.08] hover:text-white"
                            aria-label="Rename workspace"
                        >
                            <PencilLine size={15} />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-text-secondary transition-colors hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-200"
                            aria-label="Delete workspace"
                        >
                            <Trash2 size={15} />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-1 flex-col px-6 py-5">
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-text-secondary">Modules</p>
                        <p className="mt-3 text-2xl font-semibold text-white">{stats.moduleCount}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-text-secondary">Tasks</p>
                        <p className="mt-3 text-2xl font-semibold text-white">
                            {stats.completedTasks}
                            <span className="ml-1 text-base text-text-secondary">/ {stats.totalTasks}</span>
                        </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-text-secondary">Status</p>
                        <p className="mt-3 text-lg font-semibold text-white">{getRoadmapStateLabel(stats.progressState)}</p>
                    </div>
                </div>

                <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-text-secondary">
                        <span>Progress</span>
                        <span className="text-text-primary">{stats.percent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className={`h-full rounded-full transition-all duration-700 ${progressTone}`} style={{ width: `${stats.percent}%` }} />
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-white/[0.08] pt-5">
                    <div className="flex items-center gap-3 text-sm text-text-secondary">
                        <Layers size={15} />
                        <span>{getRelativeTimeLabel(roadmap.updatedAt || roadmap.createdAt)}</span>
                    </div>

                    <Link
                        href={`/workspace/${roadmap.id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-white/[0.1]"
                    >
                        Continue
                        <ArrowRight size={15} />
                    </Link>
                </div>
            </div>
        </article>
    );
}
