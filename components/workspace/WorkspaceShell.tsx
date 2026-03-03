"use client";

import { useState } from "react";
import type { Roadmap, Section } from "@/types";
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

    const getSectionColorIcon = (type: string) => {
        switch (type) {
            case "milestones": return <span className="text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.4)]">🏁</span>;
            case "tasks": return <span className="text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]">✅</span>;
            case "progress": return <span className="text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.4)]">📊</span>;
            case "resources": return <span className="text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.4)]">📚</span>;
            case "videos": return <span className="text-rose-400 drop-shadow-[0_0_5px_rgba(251,113,133,0.4)]">🎥</span>;
            case "calendar": return <span className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]">📅</span>;
            case "notes": return <span className="text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.4)]">📝</span>;
            case "glossary": return <span className="text-teal-400 drop-shadow-[0_0_5px_rgba(45,212,191,0.4)]">📖</span>;
            case "submissions": return <span className="text-indigo-400 drop-shadow-[0_0_5px_rgba(129,140,248,0.4)]">📤</span>;
            default: return <span className="text-gray-400">🔧</span>;
        }
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-obsidian">
            {/* Top Bar */}
            <header className="h-16 shrink-0 glass border-b border-border/50 flex items-center justify-between px-4 sm:px-6 z-40 bg-obsidian-surface/80 backdrop-blur-md">
                <div className="flex items-center gap-4 min-w-0">
                    <Link href="/" className="text-2xl shrink-0 hover:scale-110 transition-transform drop-shadow-md" aria-label="Home">
                        🗺️
                    </Link>
                    <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
                    <button
                        type="button"
                        className="btn btn-ghost p-2 lg:hidden hover:bg-white/5 rounded-lg transition-colors"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle sidebar"
                    >
                        ☰
                    </button>
                    <div className="min-w-0">
                        <h1 className="font-display font-bold text-sm sm:text-base text-text-primary truncate">
                            {roadmap.title}
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                                {roadmap.mode}
                            </span>
                            <span className="text-text-muted text-xs truncate">
                                {roadmap.sections.length} blocks
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 bg-obsidian-elevated/50 px-3 py-1.5 rounded-full border border-white/5 shadow-inner hidden sm:flex">
                    <span className="text-xs font-medium text-text-secondary tabular-nums">
                        <span className="text-text-primary mr-1">{progress.completedTasks}</span>
                        <span className="text-text-muted">/ {progress.totalTasks} tasks</span>
                    </span>
                    <ProgressRing percent={progress.overall} size={36} strokeWidth={4} />
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside
                    className={`${sidebarOpen ? "w-64" : "w-0 -ml-64"
                        } lg:w-64 lg:ml-0 shrink-0 border-r border-border/50 bg-obsidian-light/50 backdrop-blur-sm overflow-y-auto transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-30 flex flex-col`}
                >
                    <div className="p-4">
                        <div className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3 px-2">
                            Workspace
                        </div>
                        <nav className="space-y-1">
                            {roadmap.sections.map((section) => {
                                const isActive = section.id === activeSectionId;
                                const icon = getSectionColorIcon(section.type);
                                const label = section.title || SECTION_LABELS[section.type] || section.type;

                                return (
                                    <button
                                        key={section.id}
                                        type="button"
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 text-sm relative overflow-hidden group ${isActive
                                                ? "text-text-primary bg-indigo-500/10 border border-indigo-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                                                : "text-text-secondary hover:text-text-primary hover:bg-obsidian-surface border border-transparent"
                                            }`}
                                        onClick={() => {
                                            setActiveSectionId(section.id);
                                            if (window.innerWidth < 1024) setSidebarOpen(false);
                                        }}
                                    >
                                        {isActive && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] rounded-r-full" />
                                        )}

                                        <span className={`text-lg shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                            {icon}
                                        </span>
                                        <span className="truncate font-medium flex-1">{label}</span>

                                        {/* Quick progress indicator for tasks */}
                                        {section.type === "tasks" ? (
                                            <span className={`text-xs font-bold tabular-nums transition-colors duration-300 ${isActive ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "text-text-muted group-hover:text-text-secondary"
                                                }`}>
                                                {progress.overall}%
                                            </span>
                                        ) : null}
                                    </button>
                                );
                            })}
                        </nav>
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
                    {/* Subtle background glow fixed to main content area */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none" />

                    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto relative z-10 min-h-full">
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
