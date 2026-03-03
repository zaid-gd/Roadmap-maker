"use client";

import { useState } from "react";
import type { TaskSection, Section, TaskGroup, Task } from "@/types";

interface Props {
    section: TaskSection;
    onUpdate: (updater: (s: Section) => Section) => void;
}

export default function TaskListSection({ section, onUpdate }: Props) {
    const toggleComplete = (groupId: string, taskId: string, subtaskId?: string) => {
        onUpdate((s) => {
            const ts = s as TaskSection;
            return {
                ...ts,
                data: ts.data.map((g: TaskGroup) => {
                    if (g.id !== groupId) return g;
                    return {
                        ...g,
                        tasks: g.tasks.map((t: Task) => {
                            if (t.id !== taskId) return t;
                            if (subtaskId) {
                                return {
                                    ...t,
                                    subtasks: t.subtasks?.map((st) =>
                                        st.id === subtaskId ? { ...st, completed: !st.completed } : st
                                    ),
                                };
                            }
                            return { ...t, completed: !t.completed };
                        }),
                    };
                }),
            };
        });
    };

    const clearCompleted = (groupId: string) => {
        onUpdate((s) => {
            const ts = s as TaskSection;
            return {
                ...ts,
                data: ts.data.map((g: TaskGroup) => {
                    if (g.id !== groupId) return g;
                    return {
                        ...g,
                        tasks: g.tasks.filter((t: Task) => !t.completed),
                    };
                }),
            };
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center sm:text-left">
                <h2 className="font-display text-3xl font-black text-text-primary mb-2 drop-shadow-md">
                    ✅ {section.title}
                </h2>
                <p className="text-text-secondary text-sm">Actionable items to keep you moving forward.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {section.data.map((group, i) => {
                    const totalCount = group.tasks.length;
                    const completedCount = group.tasks.filter(t => t.completed).length;

                    return (
                        <div
                            key={group.id}
                            className="surface rounded-2xl p-5 sm:p-6 shadow-lg shadow-black/20 hover:shadow-indigo-500/5 transition-all duration-300 border border-white/5 animate-slide-up hover:-translate-y-1 group"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-display font-bold text-sm text-text-primary uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                                    {group.title}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <span className="bg-obsidian-elevated px-2.5 py-1 rounded-full text-xs font-bold text-text-muted border border-white/5 shadow-inner">
                                        {completedCount} / {totalCount} done
                                    </span>
                                    {completedCount > 0 && (
                                        <button
                                            onClick={() => clearCompleted(group.id)}
                                            className="text-[10px] uppercase font-bold text-indigo-400 hover:text-indigo-300 transition-colors opacity-0 group-hover:opacity-100 px-2 py-1 hover:bg-indigo-500/10 rounded"
                                        >
                                            Clear Done
                                        </button>
                                    )}
                                </div>
                            </div>

                            {group.tasks.length === 0 ? (
                                <div className="py-8 text-center border border-dashed border-white/10 rounded-xl bg-obsidian-surface/60">
                                    <p className="text-text-muted text-sm italic">All tasks completed! 🎉</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {group.tasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className={`relative bg-obsidian-elevated/40 border border-white/5 rounded-xl p-3 sm:p-4 transition-all duration-500 ease-out hover:bg-obsidian-hover hover:border-white/10 ${task.completed ? "opacity-40 scale-[0.98] grayscale" : "opacity-100 scale-100"}`}
                                        >
                                            <label className="flex items-start gap-3 cursor-pointer group/label">
                                                <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
                                                    <input
                                                        type="checkbox"
                                                        checked={task.completed}
                                                        onChange={() => toggleComplete(group.id, task.id)}
                                                        className="peer appearance-none w-5 h-5 rounded-md border border-white/20 bg-obsidian-surface checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer hover:border-indigo-400 shadow-inner"
                                                    />
                                                    <span className="absolute text-white text-[10px] font-black pointer-events-none opacity-0 peer-checked:opacity-100 drop-shadow-md">✓</span>
                                                </div>
                                                <div className="flex-1 min-w-0 pt-0.5">
                                                    <span
                                                        className={`block text-sm sm:text-base transition-all duration-300 font-medium ${task.completed
                                                                ? "text-text-muted line-through decoration-white/20"
                                                                : "text-text-primary group-hover/label:text-indigo-100"
                                                            }`}
                                                    >
                                                        {task.title}
                                                    </span>
                                                </div>
                                            </label>

                                            {/* Subtasks */}
                                            {!task.completed && task.subtasks && task.subtasks.length > 0 && (
                                                <div className="mt-3 ml-8 space-y-2 border-l border-white/10 pl-3">
                                                    {task.subtasks.map((st) => (
                                                        <label
                                                            key={st.id}
                                                            className="flex items-start gap-2 cursor-pointer group/sub"
                                                        >
                                                            <div className="relative flex items-center justify-center w-4 h-4 shrink-0 mt-0.5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={st.completed}
                                                                    onChange={() => toggleComplete(group.id, task.id, st.id)}
                                                                    className="peer appearance-none w-4 h-4 rounded border border-white/20 bg-obsidian-surface checked:bg-indigo-500 checked:border-indigo-500 transition-all cursor-pointer hover:border-indigo-400"
                                                                />
                                                                <span className="absolute text-white text-[8px] font-black pointer-events-none opacity-0 peer-checked:opacity-100">✓</span>
                                                            </div>
                                                            <span
                                                                className={`text-xs transition-colors duration-200 mt-0.5 ${st.completed
                                                                        ? "text-text-muted line-through"
                                                                        : "text-text-secondary group-hover/sub:text-text-primary"
                                                                    }`}
                                                            >
                                                                {st.title}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
