"use client";

import { useState } from "react";
import type { Roadmap, Section, ModuleSection as ModuleSectionType } from "@/types";
import { useProgress } from "@/hooks/useProgress";
import ProgressRing from "@/components/shared/ProgressRing";
import SectionRenderer from "@/components/workspace/SectionRenderer";
import Link from "next/link";
import { SECTION_LABELS } from "@/lib/constants";

interface WorkspaceShellProps {
    roadmap: Roadmap;
    onUpdateSection: (sectionId: string, updater: (s: Section) => Section) => void;
}

export default function WorkspaceShell({ roadmap, onUpdateSection }: WorkspaceShellProps) {
    const [activeSectionId, setActiveSectionId] = useState<string>(
        roadmap.sections[0]?.id || ""
    );
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const progress = useProgress(roadmap);

    const activeSection = roadmap.sections.find((s) => s.id === activeSectionId) || roadmap.sections[0];

    // Separate modules from utility sections for sidebar grouping
    const moduleSections = roadmap.sections.filter((s) => s.type === "module" || s.type === "milestones");
    const utilitySections = roadmap.sections.filter((s) => s.type !== "module" && s.type !== "milestones");

    const getModuleProgress = (section: Section): number => {
        if (section.type === "module") {
            const ms = section as ModuleSectionType;
            const tasks = ms.data.tasks || [];
            const total = tasks.length;
            if (total === 0) return 0;
            const done = tasks.filter((t) => t.completed).length;
            return Math.round((done / total) * 100);
        }
        return 0;
    };

    const getSectionIcon = (type: string): string => {
        switch (type) {
            case "module": return "📦";
            case "milestones": return "🏁";
            case "tasks": return "✅";
            case "progress": return "📊";
            case "resources": return "📚";
            case "videos": return "🎥";
            case "calendar": return "📅";
            case "notes": return "📝";
            case "glossary": return "📖";
            case "submissions": return "📤";
            default: return "🔧";
        }
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-obsidian">
            {/* Top Bar */}
            <header className="h-16 shrink-0 border-b border-white/5 flex items-center justify-between px-6 lg:px-8 z-40 bg-obsidian-surface/80 backdrop-blur-xl">
                <div className="flex items-center gap-4 min-w-0">
                    <Link href="/" className="shrink-0 group flex items-center gap-3" aria-label="Home">
                        <div className="w-6 h-6 bg-indigo-500 rounded-sm flex items-center justify-center transform group-hover:rotate-45 transition-transform duration-500">
                            <div className="w-2 h-2 bg-obsidian rounded-sm" />
                        </div>
                    </Link>
                    <div className="w-px h-6 bg-white/10 hidden sm:block" />
                    <button
                        type="button"
                        className="p-2 lg:hidden text-text-muted hover:text-text-primary transition-colors"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle sidebar"
                    >
                        ☰
                    </button>
                    <div className="min-w-0">
                        <h1 className="font-sans-display font-bold text-xs sm:text-sm uppercase tracking-[0.15em] text-text-primary truncate">
                            {roadmap.title}
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-sans-display text-[10px] uppercase tracking-widest text-indigo-400 font-bold">
                                {roadmap.mode}
                            </span>
                            <span className="text-text-muted/30">·</span>
                            <span className="font-sans-display text-[10px] uppercase tracking-widest text-text-muted">
                                {moduleSections.length} modules
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 hidden sm:flex">
                    <div className="flex items-center gap-3 border border-white/5 px-4 py-2 bg-obsidian-elevated/30">
                        <span className="font-sans-display text-[10px] uppercase tracking-widest text-text-muted tabular-nums">
                            <span className="text-text-primary font-bold">{progress.completedTasks}</span>
                            <span className="mx-1">/</span>
                            <span>{progress.totalTasks}</span>
                        </span>
                        <ProgressRing percent={progress.overall} size={28} strokeWidth={3} />
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside
                    className={`${sidebarOpen ? "w-72" : "w-0 -ml-72"
                        } lg:w-72 lg:ml-0 shrink-0 border-r border-white/5 bg-obsidian-surface/40 backdrop-blur-sm overflow-y-auto transition-all duration-300 z-30 flex flex-col`}
                >
                    {/* Summary Banner */}
                    {roadmap.summary && (
                        <div className="p-5 border-b border-white/5 bg-indigo-500/5">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-4 h-[1px] bg-indigo-500" />
                                <span className="font-sans-display text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold">
                                    Course Overview
                                </span>
                            </div>
                            <p className="font-body text-text-secondary text-xs leading-relaxed">
                                {roadmap.summary}
                            </p>
                        </div>
                    )}

                    <div className="p-4 flex-1">
                        {/* Course Modules */}
                        {moduleSections.length > 0 && (
                            <div className="mb-6">
                                <div className="font-sans-display text-[10px] uppercase tracking-[0.2em] text-text-muted mb-3 px-2">
                                    Course Modules
                                </div>
                                <nav className="space-y-1">
                                    {moduleSections.map((section, idx) => {
                                        const isActive = section.id === activeSectionId;
                                        const modulePercent = getModuleProgress(section);

                                        return (
                                            <button
                                                key={section.id}
                                                type="button"
                                                className={`w-full flex items-start gap-3 px-3 py-3 text-left transition-all duration-200 text-sm relative overflow-hidden group ${isActive
                                                    ? "bg-indigo-500/10 border-l-2 border-indigo-500"
                                                    : "border-l-2 border-transparent hover:border-white/10 hover:bg-obsidian-surface/60"
                                                    }`}
                                                onClick={() => {
                                                    setActiveSectionId(section.id);
                                                    if (window.innerWidth < 1024) setSidebarOpen(false);
                                                }}
                                            >
                                                <span className="font-sans-display text-[10px] uppercase tracking-widest text-text-muted tabular-nums shrink-0 mt-0.5 w-5">
                                                    {String(idx + 1).padStart(2, "0")}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <span className={`block text-sm font-medium truncate transition-colors ${isActive ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"
                                                        }`}>
                                                        {section.title}
                                                    </span>
                                                    {section.type === "module" && (
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <div className="flex-1 h-[2px] bg-white/5 overflow-hidden">
                                                                <div
                                                                    className="h-full bg-indigo-500/60 transition-all duration-500"
                                                                    style={{ width: `${modulePercent}%` }}
                                                                />
                                                            </div>
                                                            <span className="font-sans-display text-[9px] tabular-nums text-text-muted">
                                                                {modulePercent}%
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        )}

                        {/* Utility Sections */}
                        {utilitySections.length > 0 && (
                            <div>
                                <div className="font-sans-display text-[10px] uppercase tracking-[0.2em] text-text-muted mb-3 px-2">
                                    Tools
                                </div>
                                <nav className="space-y-0.5">
                                    {utilitySections.map((section) => {
                                        const isActive = section.id === activeSectionId;
                                        const icon = getSectionIcon(section.type);
                                        const label = section.title || SECTION_LABELS[section.type] || section.type;

                                        return (
                                            <button
                                                key={section.id}
                                                type="button"
                                                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-all duration-200 text-sm ${isActive
                                                    ? "text-text-primary bg-white/5 border-l-2 border-indigo-500"
                                                    : "text-text-muted hover:text-text-secondary border-l-2 border-transparent hover:border-white/10"
                                                    }`}
                                                onClick={() => {
                                                    setActiveSectionId(section.id);
                                                    if (window.innerWidth < 1024) setSidebarOpen(false);
                                                }}
                                            >
                                                <span className="text-sm shrink-0">{icon}</span>
                                                <span className="truncate">{label}</span>
                                                {section.type === "tasks" && (
                                                    <span className="ml-auto font-sans-display text-[10px] tabular-nums text-text-muted">
                                                        {progress.overall}%
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto relative bg-obsidian">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/3 blur-[150px] rounded-full pointer-events-none" />

                    <div className="p-6 sm:p-8 lg:p-12 max-w-5xl mx-auto relative z-10 min-h-full">
                        {activeSection ? (
                            <SectionRenderer
                                section={activeSection}
                                roadmap={roadmap}
                                onUpdate={(updater) => onUpdateSection(activeSection.id, updater)}
                            />
                        ) : null}
                    </div>
                </main>
            </div>
        </div>
    );
}
