"use client";

import { useState, useEffect, useMemo } from "react";
import type { Roadmap, Section, ModuleSection as ModuleSectionType } from "@/types";
import { useProgress } from "@/hooks/useProgress";
import ProgressRing from "@/components/shared/ProgressRing";
import SectionRenderer from "@/components/workspace/SectionRenderer";
import Link from "next/link";
import { SECTION_LABELS } from "@/lib/constants";
import { Search, Settings, Home, ArrowRight, CheckCircle2, Circle, LayoutDashboard, SearchCode, BookOpen, Video, ListTodo, Trophy, Layers } from "lucide-react";

interface WorkspaceShellProps {
    roadmap: Roadmap;
    onUpdateSection: (sectionId: string, updater: (s: Section) => Section) => void;
}

export default function WorkspaceShell({ roadmap, onUpdateSection }: WorkspaceShellProps) {
    const [activeSectionId, setActiveSectionId] = useState<string>("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const progress = useProgress(roadmap);

    // Keyboard shortcut for sidebar toggle
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === "\\") {
                e.preventDefault();
                setSidebarOpen(prev => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const activeSection = roadmap.sections.find((s) => s.id === activeSectionId);

    // Separate modules from utility sections
    const moduleSections = roadmap.sections.filter((s) => s.type === "module" || s.type === "milestones");
    const utilitySections = roadmap.sections.filter((s) => s.type !== "module" && s.type !== "milestones");

    const getModuleProgress = (section: Section): number => {
        if (section.type === "module") {
            const ms = section as ModuleSectionType;
            const tasks = ms.data.tasks || [];
            const total = tasks.length;
            if (total === 0) return ms.data.completed ? 100 : 0;
            const done = tasks.filter((t) => t.completed).length;
            return Math.round((done / total) * 100);
        }
        return 0;
    };

    const getMotivationalMessage = (percent: number) => {
        if (percent === 0) return "Just getting started 🚀";
        if (percent < 25) return "Off to a great start! 🌱";
        if (percent < 50) return "Building momentum 🔥";
        if (percent < 75) return "More than halfway there! ⭐";
        if (percent < 100) return "Almost complete! 💪";
        return "Course complete! 🎉";
    };

    const firstIncompleteModule = moduleSections.find(m => getModuleProgress(m) < 100) || moduleSections[0];

    // Stats for Dashboard
    const totalModules = moduleSections.length;
    const totalResources = roadmap.sections.reduce((acc, s) => {
        if (s.type === "module") return acc + ((s as ModuleSectionType).data.resources?.length || 0);
        if (s.type === "resources") return acc + (s as any).data?.length || 0;
        return acc;
    }, 0);
    const totalVideos = roadmap.sections.reduce((acc, s) => {
        if (s.type === "module") return acc + ((s as ModuleSectionType).data.videos?.length || 0);
        if (s.type === "videos") return acc + (s as any).data?.length || 0;
        return acc;
    }, 0);

    const getSectionIcon = (type: string, percent: number) => {
        if (type === "module") {
            if (percent === 100) return <CheckCircle2 size={16} className="text-emerald-500" />;
            if (percent > 0) return <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" style={{ animationDuration: '3s' }} />;
            return <Circle size={16} className="text-white/20" />;
        }
        switch (type) {
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

    const onNavigate = (id: string) => {
        setActiveSectionId(id);
        if (window.innerWidth < 1024) setSidebarOpen(false);
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-obsidian selection:bg-indigo-500/30">
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside
                    className={`${sidebarOpen ? "w-64 sm:w-72" : "w-16"} shrink-0 border-r border-white/5 bg-obsidian-surface/60 backdrop-blur-sm overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-30 flex flex-col group`}
                >
                    {/* Header: Collapse Toggle */}
                    <div className="h-14 flex items-center px-4 border-b border-white/5">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-text-muted hover:text-white shrink-0"
                            title="Toggle Sidebar (Ctrl+\)"
                        >
                            ☰
                        </button>
                        {sidebarOpen && (
                            <div className="ml-3 font-sans-display text-xs uppercase tracking-widest text-text-primary truncate font-bold">
                                {roadmap.title}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                        {/* Search & Mini-progress (Only shown when open) */}
                        {sidebarOpen && (
                            <div className="p-4 space-y-4">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                    <input
                                        type="text"
                                        placeholder="Search course..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-obsidian/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    />
                                </div>

                                <div className="bg-obsidian/40 border border-white/5 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-sans-display text-[10px] uppercase tracking-widest text-text-muted">Total Progress</span>
                                        <span className="font-sans-display text-[10px] text-indigo-400 font-bold">{progress.overall}%</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${progress.overall}%` }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={`p-2 space-y-6 ${!sidebarOpen && 'mt-4'}`}>
                            {/* Dashboard Link */}
                            <div>
                                <button
                                    type="button"
                                    onClick={() => onNavigate("dashboard")}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 text-sm hover:bg-white/5 ${activeSectionId === "dashboard" ? "bg-indigo-500/10 text-indigo-300 font-medium" : "text-text-secondary"
                                        } ${!sidebarOpen && 'justify-center'}`}
                                    title="Course Dashboard"
                                >
                                    <LayoutDashboard size={sidebarOpen ? 18 : 20} className="shrink-0" />
                                    {sidebarOpen && <span className="truncate">Course Dashboard</span>}
                                </button>
                            </div>

                            {/* Modules */}
                            {moduleSections.length > 0 && (
                                <div>
                                    {sidebarOpen && (
                                        <div className="font-sans-display text-[10px] uppercase tracking-[0.2em] text-text-muted/50 mb-2 px-3">
                                            Modules
                                        </div>
                                    )}
                                    <nav className="space-y-1">
                                        {moduleSections.map((section, idx) => {
                                            const isActive = section.id === activeSectionId;
                                            const modulePercent = getModuleProgress(section);
                                            // Handle search filtering
                                            if (searchQuery && !section.title.toLowerCase().includes(searchQuery.toLowerCase())) return null;

                                            return (
                                                <button
                                                    key={section.id}
                                                    type="button"
                                                    title={section.title}
                                                    className={`w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-all duration-200 hover:bg-white/5 group ${isActive
                                                        ? "bg-indigo-500/10 border-l-2 border-indigo-500 text-indigo-50"
                                                        : "border-l-2 border-transparent text-text-secondary hover:text-text-primary"
                                                        } ${!sidebarOpen && 'justify-center !px-0'}`}
                                                    onClick={() => onNavigate(section.id)}
                                                >
                                                    {sidebarOpen ? (
                                                        <>
                                                            <div className="w-6 shrink-0 flex items-center justify-center mr-2">
                                                                {getSectionIcon(section.type, modulePercent)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <span className="block text-sm truncate">
                                                                    <span className="text-text-muted/50 mr-2 text-xs font-mono">{String(idx + 1).padStart(2, "0")}</span>
                                                                    {section.title}
                                                                </span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center relative overflow-hidden bg-obsidian">
                                                            {/* Mini circular indicator when collapsed */}
                                                            <svg viewBox="0 0 36 36" className="absolute inset-0 w-full h-full -rotate-90">
                                                                <circle cx="18" cy="18" r="16" fill="transparent" stroke="var(--color-obsidian-elevated)" strokeWidth="4" />
                                                                <circle cx="18" cy="18" r="16" fill="transparent" stroke={modulePercent === 100 ? "var(--color-emerald-500)" : "var(--color-indigo-500)"} strokeWidth="4" strokeDasharray="100" strokeDashoffset={100 - modulePercent} />
                                                            </svg>
                                                            <span className="text-[10px] font-bold z-10">{idx + 1}</span>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </nav>
                                </div>
                            )}

                            {/* Tools / Utility */}
                            {utilitySections.length > 0 && sidebarOpen && (
                                <div>
                                    <div className="font-sans-display text-[10px] uppercase tracking-[0.2em] text-text-muted/50 mb-2 px-3">
                                        Resources & Tools
                                    </div>
                                    <nav className="space-y-1">
                                        {utilitySections.map((section) => {
                                            const isActive = section.id === activeSectionId;
                                            const label = section.title || SECTION_LABELS[section.type] || section.type;
                                            if (searchQuery && !label.toLowerCase().includes(searchQuery.toLowerCase())) return null;

                                            return (
                                                <button
                                                    key={section.id}
                                                    type="button"
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 text-sm hover:bg-white/5 ${isActive ? "text-indigo-300 font-medium bg-indigo-500/5" : "text-text-secondary hover:text-text-primary"
                                                        }`}
                                                    onClick={() => onNavigate(section.id)}
                                                >
                                                    <span className="w-5 shrink-0 text-center opacity-70">{getSectionIcon(section.type, 0)}</span>
                                                    <span className="truncate">{label}</span>
                                                </button>
                                            );
                                        })}
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Footer */}
                    <div className="mt-auto border-t border-white/5 p-3 flex flex-col gap-2">
                        {sidebarOpen ? (
                            <>
                                <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors">
                                    <Home size={16} />
                                    <span>Back to Home</span>
                                </Link>
                                <button type="button" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors text-left w-full">
                                    <Settings size={16} />
                                    <span>Settings</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/" className="flex items-center justify-center p-2 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-colors" title="Back to Home">
                                    <Home size={18} />
                                </Link>
                                <button type="button" className="flex items-center justify-center p-2 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-colors" title="Settings">
                                    <Settings size={18} />
                                </button>
                            </>
                        )}
                    </div>
                </aside>

                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-20 sm:hidden transition-opacity duration-300"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto relative bg-obsidian">
                    {activeSectionId === "dashboard" ? (
                        // COURSE DASHBOARD
                        <div className="animate-fade-in p-6 sm:p-10 lg:p-16 max-w-6xl mx-auto space-y-12">
                            {/* Dashboard Header */}
                            <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
                                <div className="inline-flex items-center justify-center px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10">
                                    <span className="font-sans-display text-[10px] uppercase tracking-widest text-indigo-400 font-bold">
                                        {roadmap.mode} Course
                                    </span>
                                </div>
                                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.1]">
                                    {roadmap.title}
                                </h1>
                                {roadmap.summary && (
                                    <p className="font-body text-text-secondary text-lg leading-relaxed">
                                        {roadmap.summary}
                                    </p>
                                )}
                                {roadmap.objectives && roadmap.objectives.length > 0 && (
                                    <div className="mt-8 text-left w-full bg-obsidian-surface/40 border border-white/5 rounded-2xl p-8 shadow-inner">
                                        <h3 className="font-sans-display text-xs uppercase tracking-[0.2em] text-text-muted mb-6 flex items-center gap-2">
                                            <span className="w-4 h-[1px] bg-indigo-500" />
                                            Learning Objectives
                                        </h3>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {roadmap.objectives.map((obj, i) => (
                                                <div key={i} className="flex items-start gap-4">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex flex-col items-center justify-center shrink-0 mt-0.5">
                                                        <SearchCode size={12} />
                                                    </div>
                                                    <p className="font-body text-text-primary text-sm leading-relaxed">{obj}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Progress Ring & Continue */}
                            <div className="flex flex-col items-center bg-obsidian-surface/30 border border-white/5 rounded-2xl p-10 backdrop-blur-md relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

                                <ProgressRing percent={progress.overall} size={140} strokeWidth={8} className="mb-6 drop-shadow-[0_0_30px_rgba(99,102,241,0.2)]" />

                                <h3 className="font-display text-xl font-medium mb-2">{getMotivationalMessage(progress.overall)}</h3>
                                <p className="text-sm text-text-muted mb-8 font-sans-display uppercase tracking-widest">{progress.completedTasks} of {progress.totalTasks} Tasks Completed</p>

                                <button
                                    onClick={() => onNavigate(firstIncompleteModule.id)}
                                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-sans-display text-xs uppercase tracking-widest font-bold rounded-lg transition-all flex items-center gap-3 group drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                                >
                                    Continue Learning
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>

                            {/* Stats Line */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: "Modules", value: totalModules, icon: <Layers size={18} /> },
                                    { label: "Tasks", value: progress.totalTasks, icon: <ListTodo size={18} /> },
                                    { label: "Resources", value: totalResources, icon: <BookOpen size={18} /> },
                                    { label: "Videos", value: totalVideos, icon: <Video size={18} /> },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-obsidian-surface/40 border border-white/5 rounded-xl p-5 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-indigo-400">
                                            {stat.icon}
                                        </div>
                                        <div>
                                            <div className="font-display text-2xl text-white">{stat.value}</div>
                                            <div className="font-sans-display text-[10px] uppercase tracking-widest text-text-muted">{stat.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Module Grid */}
                            {moduleSections.length > 0 && (
                                <div>
                                    <h3 className="font-sans-display text-xs uppercase tracking-[0.15em] text-text-secondary mb-6 flex items-center gap-2">
                                        <span className="w-4 h-[1px] bg-indigo-500" />
                                        Course Modules
                                    </h3>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {moduleSections.map((mod, idx) => {
                                            const modPercent = getModuleProgress(mod);
                                            const tasksCount = mod.type === "module" ? ((mod as ModuleSectionType).data.tasks || []).length : 0;
                                            const status = modPercent === 100 ? "Complete" : modPercent > 0 ? "In Progress" : "Not Started";

                                            return (
                                                <button
                                                    key={mod.id}
                                                    onClick={() => onNavigate(mod.id)}
                                                    className="group relative flex flex-col items-start bg-obsidian-surface/30 border border-white/5 hover:border-indigo-500/30 rounded-xl p-6 text-left transition-all hover:bg-obsidian-surface/80 overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />

                                                    <div className="flex items-center justify-between w-full mb-4">
                                                        <span className="font-mono text-xs text-text-muted/50 group-hover:text-indigo-400 transition-colors">
                                                            MOD {String(idx + 1).padStart(2, "0")}
                                                        </span>
                                                        <span className={`font-sans-display text-[8px] uppercase tracking-widest px-2 py-1 rounded border ${status === "Complete" ? "border-emerald-500/30 text-emerald-400" :
                                                            status === "In Progress" ? "border-indigo-500/30 text-indigo-400" :
                                                                "border-white/10 text-text-muted"
                                                            }`}>
                                                            {status}
                                                        </span>
                                                    </div>

                                                    <h4 className="font-display text-lg text-white mb-2 line-clamp-2">
                                                        {mod.title}
                                                    </h4>

                                                    {mod.type === "module" && (mod as ModuleSectionType).data.description && (
                                                        <p className="text-text-secondary text-sm line-clamp-2 mb-6 font-body">
                                                            {(mod as ModuleSectionType).data.description}
                                                        </p>
                                                    )}

                                                    <div className="mt-auto w-full">
                                                        <div className="flex items-center justify-between font-sans-display text-[10px] uppercase tracking-widest text-text-muted mb-2">
                                                            <span>{tasksCount} tasks</span>
                                                            <span>{modPercent}%</span>
                                                        </div>
                                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-700 ${modPercent === 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                                                                style={{ width: `${modPercent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : activeSection ? (
                        <div className="p-6 sm:p-8 lg:p-12 max-w-5xl mx-auto relative z-10 min-h-full">
                            <SectionRenderer
                                section={activeSection}
                                roadmap={roadmap}
                                onUpdate={(updater) => onUpdateSection(activeSection.id, updater)}
                            />
                        </div>
                    ) : null}
                </main>
            </div>
        </div>
    );
}
