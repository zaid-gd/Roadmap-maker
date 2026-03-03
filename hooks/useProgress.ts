"use client";

import { useMemo } from "react";
import type { Roadmap, Section, TaskSection, MilestoneSection } from "@/types";

interface ProgressData {
    overall: number;
    totalTasks: number;
    completedTasks: number;
    phaseProgress: { id: string; title: string; percent: number }[];
}

/**
 * Compute progress as derived state during render (vercel best practice: 5.1)
 * No useEffect, no separate state — pure computation from roadmap data.
 */
export function useProgress(roadmap: Roadmap | null): ProgressData {
    return useMemo(() => {
        if (!roadmap) {
            return { overall: 0, totalTasks: 0, completedTasks: 0, phaseProgress: [] };
        }

        let totalTasks = 0;
        let completedTasks = 0;
        const phaseProgress: { id: string; title: string; percent: number }[] = [];

        for (const section of roadmap.sections) {
            if (section.type === "tasks") {
                const ts = section as TaskSection;
                for (const group of ts.data) {
                    for (const task of group.tasks) {
                        totalTasks++;
                        if (task.completed) completedTasks++;
                        for (const sub of task.subtasks) {
                            totalTasks++;
                            if (sub.completed) completedTasks++;
                        }
                    }
                }
            }

            if (section.type === "milestones") {
                const ms = section as MilestoneSection;
                for (const milestone of ms.data) {
                    let mTotal = 0;
                    let mDone = 0;
                    for (const task of milestone.tasks) {
                        mTotal++;
                        if (task.completed) mDone++;
                        for (const sub of task.subtasks) {
                            mTotal++;
                            if (sub.completed) mDone++;
                        }
                    }
                    // Also count the milestone itself if it has no tasks
                    if (mTotal === 0) {
                        mTotal = 1;
                        if (milestone.completed) mDone = 1;
                    }
                    phaseProgress.push({
                        id: milestone.id,
                        title: milestone.title,
                        percent: mTotal > 0 ? Math.round((mDone / mTotal) * 100) : 0,
                    });
                    totalTasks += mTotal;
                    completedTasks += mDone;
                }
            }
        }

        const overall = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        return { overall, totalTasks, completedTasks, phaseProgress };
    }, [roadmap]);
}
