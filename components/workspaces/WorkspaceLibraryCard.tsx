"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, PencilLine, Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Roadmap } from "@/types";
import { cn } from "@/lib/utils";
import { getRelativeTimeLabel, getRoadmapDisplayTitle, getRoadmapStateLabel, getRoadmapStats } from "@/lib/workspace-stats";

interface WorkspaceLibraryCardProps {
    roadmap: Roadmap;
    onDelete?: (id: string) => void;
    onRename?: (id: string, nextTitle: string) => void;
}

export default function WorkspaceLibraryCard({ roadmap, onDelete, onRename }: WorkspaceLibraryCardProps) {
    const stats = getRoadmapStats(roadmap);
    const displayTitle = getRoadmapDisplayTitle(roadmap);
    const [isRenaming, setIsRenaming] = useState(false);
    const [nextTitle, setNextTitle] = useState(displayTitle);

    const handleRename = () => {
        if (!onRename) return;
        const trimmedTitle = nextTitle.trim();
        if (!trimmedTitle || trimmedTitle === displayTitle) {
            setNextTitle(displayTitle);
            setIsRenaming(false);
            return;
        }

        onRename(roadmap.id, trimmedTitle);
        setIsRenaming(false);
    };

    const handleDelete = () => {
        if (!onDelete) return;
        onDelete(roadmap.id);
    };

    return (
        <Card className="flex h-full flex-col">
            <CardHeader className="gap-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                            <CardTitle className="truncate text-base">{displayTitle}</CardTitle>
                            <span className="rounded-sm border border-border px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-text-secondary">
                                {roadmap.mode === "intern" ? "Intern" : "General"}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-text-secondary">{getRoadmapStateLabel(stats.progressState)}</p>
                    </div>

                    <Button asChild variant="ghost" size="icon" aria-label={`Open ${displayTitle}`}>
                        <Link href={`/workspace/${roadmap.id}`}>
                            <ArrowRight size={16} />
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                    <span>{stats.moduleCount} modules</span>
                    <span aria-hidden="true">/</span>
                    <span>{getRelativeTimeLabel(roadmap.updatedAt || roadmap.createdAt)}</span>
                </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-5">
                {isRenaming ? (
                    <div className="space-y-3">
                        <label htmlFor={`rename-${roadmap.id}`} className="text-sm font-medium text-text-primary">
                            Rename workspace
                        </label>
                        <Input
                            id={`rename-${roadmap.id}`}
                            value={nextTitle}
                            onChange={(event) => setNextTitle(event.target.value)}
                        />
                        <div className="flex gap-2">
                            <Button type="button" size="sm" onClick={handleRename}>
                                Save
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setNextTitle(displayTitle);
                                    setIsRenaming(false);
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : null}

                <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-text-muted">
                        <span>{stats.percent}% complete</span>
                        <span>
                            {stats.completedTasks}/{stats.totalTasks}
                        </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
                        <div
                            className={cn(
                                "h-full rounded-full transition-[width] duration-300",
                                stats.progressState === "completed"
                                    ? "bg-[var(--color-success)]"
                                    : stats.progressState === "in-progress"
                                      ? "bg-[var(--color-accent)]"
                                      : "bg-[var(--color-border-strong)]",
                            )}
                            style={{ width: `${stats.percent}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-text-secondary">
                    <div className="rounded-2xl border border-border bg-[var(--color-surface-subtle)] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.12em] text-text-muted">State</p>
                        <p className="mt-2 font-medium text-text-primary">{getRoadmapStateLabel(stats.progressState)}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-[var(--color-surface-subtle)] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Updated</p>
                        <p className="mt-2 font-medium text-text-primary">{getRelativeTimeLabel(roadmap.updatedAt || roadmap.createdAt)}</p>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="mt-auto flex flex-wrap justify-between gap-2 border-t border-border pt-4">
                <div className="flex flex-wrap gap-2">
                    {onRename ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setNextTitle(displayTitle);
                                setIsRenaming((current) => !current);
                            }}
                        >
                            <PencilLine size={14} />
                            {isRenaming ? "Editing" : "Rename"}
                        </Button>
                    ) : null}
                    {onDelete ? (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button type="button" variant="ghost" size="sm">
                                    <Trash2 size={14} />
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This removes the workspace from your library. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>Delete workspace</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    ) : null}
                </div>

                <Button asChild variant="secondary" size="sm">
                    <Link href={`/workspace/${roadmap.id}`}>
                        Open
                        <ArrowRight size={14} />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
