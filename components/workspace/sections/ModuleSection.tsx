"use client";

import { useState } from "react";
import type { ModuleSection, Section, Task } from "@/types";
import SmartEmbed from "@/components/shared/SmartEmbed";

interface Props {
    section: ModuleSection;
    onUpdate: (updater: (s: Section) => Section) => void;
}

export default function ModuleRenderer({ section, onUpdate }: Props) {
    const [expandedResource, setExpandedResource] = useState<string | null>(null);
    const data = section.data;
    const tasks = data.tasks || [];
    const resources = data.resources || [];
    const videos = data.videos || [];

    const completedCount = tasks.filter((t) => t.completed).length;
    const totalCount = tasks.length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const toggleTask = (taskId: string) => {
        onUpdate((s) => {
            const ms = s as ModuleSection;
            return {
                ...ms,
                data: {
                    ...ms.data,
                    tasks: (ms.data.tasks || []).map((t) =>
                        t.id === taskId ? { ...t, completed: !t.completed } : t
                    ),
                },
            };
        });
    };

    const toggleSubtask = (taskId: string, subId: string) => {
        onUpdate((s) => {
            const ms = s as ModuleSection;
            return {
                ...ms,
                data: {
                    ...ms.data,
                    tasks: (ms.data.tasks || []).map((t) =>
                        t.id === taskId
                            ? {
                                ...t,
                                subtasks: (t.subtasks || []).map((st) =>
                                    st.id === subId ? { ...st, completed: !st.completed } : st
                                ),
                            }
                            : t
                    ),
                },
            };
        });
    };

    const resourceTypeIcon = (type: string) => {
        switch (type) {
            case "video": return "▶";
            case "doc": return "📄";
            case "pdf": return "📕";
            case "link": return "🔗";
            case "code": return "💻";
            case "tool": return "🛠";
            case "course": return "🎓";
            case "book": return "📖";
            default: return "📎";
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            {/* Module Header */}
            <div className="border-b border-white/5 pb-8 mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <span className="h-[1px] w-8 bg-indigo-500" />
                    <span className="font-sans-display text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold">
                        Course Module
                    </span>
                    {data.estimatedTime && (
                        <>
                            <span className="text-text-muted/30">·</span>
                            <span className="font-sans-display text-[10px] uppercase tracking-[0.2em] text-text-muted">
                                {data.estimatedTime}
                            </span>
                        </>
                    )}
                </div>

                <h2 className="font-display font-light text-4xl sm:text-5xl tracking-tight leading-[0.95] mb-4">
                    {section.title}
                </h2>

                {data.description && (
                    <p className="font-body text-text-secondary text-lg max-w-2xl leading-relaxed">
                        {data.description}
                    </p>
                )}

                {/* Progress bar */}
                {totalCount > 0 && (
                    <div className="mt-6 flex items-center gap-4">
                        <div className="flex-1 h-1 bg-white/5 overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 transition-all duration-700 ease-out"
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                        <span className="font-sans-display text-[10px] uppercase tracking-widest text-text-muted tabular-nums whitespace-nowrap">
                            {completedCount}/{totalCount} COMPLETE
                        </span>
                    </div>
                )}
            </div>

            {/* Key Concepts */}
            {data.concepts && (
                <div className="mb-10 p-6 border border-indigo-500/10 bg-indigo-500/5">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-indigo-400 text-sm">💡</span>
                        <span className="font-sans-display text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold">
                            Key Concepts
                        </span>
                    </div>
                    <p className="font-body text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                        {data.concepts}
                    </p>
                </div>
            )}

            {/* Action Items / Tasks */}
            {tasks.length > 0 && (
                <div className="mb-10">
                    <h3 className="font-sans-display text-xs uppercase tracking-[0.15em] text-text-secondary mb-4 flex items-center gap-2">
                        <span className="w-4 h-[1px] bg-emerald-500" />
                        Action Items
                    </h3>
                    <div className="space-y-2">
                        {tasks.map((task: Task) => (
                            <div key={task.id} className="group">
                                <button
                                    type="button"
                                    className="w-full flex items-start gap-3 p-4 border border-white/5 hover:border-white/10 bg-obsidian-surface/40 hover:bg-obsidian-surface/60 transition-all text-left"
                                    onClick={() => toggleTask(task.id)}
                                >
                                    <div className={`w-5 h-5 shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all ${task.completed
                                            ? "bg-emerald-500 border-emerald-500 text-obsidian"
                                            : "border-white/20 group-hover:border-emerald-500/50"
                                        }`}>
                                        {task.completed && <span className="text-xs font-bold">✓</span>}
                                    </div>
                                    <span className={`font-body text-sm leading-relaxed transition-colors ${task.completed
                                            ? "text-text-muted line-through"
                                            : "text-text-primary"
                                        }`}>
                                        {task.title}
                                    </span>
                                </button>

                                {/* Subtasks */}
                                {(task.subtasks || []).length > 0 && (
                                    <div className="ml-8 border-l border-white/5 pl-4 space-y-1 mt-1">
                                        {(task.subtasks || []).map((sub) => (
                                            <button
                                                key={sub.id}
                                                type="button"
                                                className="w-full flex items-center gap-2.5 py-2 px-3 hover:bg-obsidian-surface/40 transition-all text-left"
                                                onClick={() => toggleSubtask(task.id, sub.id)}
                                            >
                                                <div className={`w-3.5 h-3.5 shrink-0 border flex items-center justify-center transition-all ${sub.completed
                                                        ? "bg-emerald-500/80 border-emerald-500/80 text-obsidian"
                                                        : "border-white/15"
                                                    }`}>
                                                    {sub.completed && <span className="text-[8px] font-bold">✓</span>}
                                                </div>
                                                <span className={`text-xs leading-relaxed ${sub.completed ? "text-text-muted line-through" : "text-text-secondary"
                                                    }`}>
                                                    {sub.title}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Videos */}
            {videos.length > 0 && (
                <div className="mb-10">
                    <h3 className="font-sans-display text-xs uppercase tracking-[0.15em] text-text-secondary mb-4 flex items-center gap-2">
                        <span className="w-4 h-[1px] bg-rose-500" />
                        Videos
                    </h3>
                    <div className="space-y-4">
                        {videos.map((video) => (
                            <div key={video.id} className="space-y-3">
                                <SmartEmbed
                                    url={video.url}
                                    title={video.title}
                                    description={video.description}
                                />
                                <div className="flex items-center justify-between px-1">
                                    <div>
                                        <h4 className="font-sans-display text-sm font-bold text-text-primary">{video.title}</h4>
                                        {video.description && <p className="text-text-muted text-xs mt-0.5">{video.description}</p>}
                                    </div>
                                    {video.duration && (
                                        <span className="font-sans-display text-[10px] uppercase tracking-widest text-text-muted tabular-nums">
                                            {video.duration}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Resources */}
            {resources.length > 0 && (
                <div className="mb-10">
                    <h3 className="font-sans-display text-xs uppercase tracking-[0.15em] text-text-secondary mb-4 flex items-center gap-2">
                        <span className="w-4 h-[1px] bg-amber-500" />
                        Resources
                    </h3>
                    <div className="space-y-3">
                        {resources.map((res) => (
                            <div key={res.id}>
                                <button
                                    type="button"
                                    className={`w-full flex items-center gap-4 p-4 border text-left transition-all ${expandedResource === res.id
                                            ? "border-indigo-500/30 bg-indigo-500/5"
                                            : "border-white/5 bg-obsidian-surface/40 hover:border-white/10"
                                        }`}
                                    onClick={() => setExpandedResource(expandedResource === res.id ? null : res.id)}
                                >
                                    <span className="text-lg shrink-0">{resourceTypeIcon(res.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-sans-display text-sm font-bold text-text-primary truncate">{res.title}</h4>
                                        {res.description && <p className="text-text-muted text-xs mt-0.5 truncate">{res.description}</p>}
                                    </div>
                                    <span className="font-sans-display text-[10px] uppercase tracking-widest text-text-muted shrink-0">{res.type}</span>
                                    <span className={`text-text-muted text-xs transition-transform ${expandedResource === res.id ? "rotate-180" : ""}`}>▼</span>
                                </button>

                                {expandedResource === res.id && (
                                    <div className="border border-t-0 border-white/5 p-4 animate-fade-in">
                                        <SmartEmbed url={res.url} title={res.title} description={res.description} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
