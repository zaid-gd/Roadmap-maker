"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";

import { getStorage } from "@/lib/storage";
import type { Roadmap } from "@/types";
import {
    Plus,
    Sparkles,
    MoreHorizontal,
    Pencil,
    Trash2,
    Layers,
    CheckSquare,
    Clock,
    ArrowRight,
    Map,
    Upload,
    Cpu,
    BarChart2,
    Shield,
} from "lucide-react";

const SAMPLE_MARKDOWN = `# Social Media Strategy
## Phase 1: Setup
- Create Instagram & TikTok accounts
- Set up Google Business Profile
## Phase 2: Content
- Post 3x per week
- Use Reels for maximum reach
## Resources
- Hootsuite Instagram Guide
- Buffer TikTok Algorithm Guide`;

/* ═══════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════ */

function relativeTime(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(dateStr));
}

function getCourseStats(r: Roadmap) {
    const moduleCount = r.sections.filter((s) => s.type === "module").length;
    let totalTasks = 0;
    let completedTasks = 0;

    // Count tasks from task sections
    r.sections.forEach((s) => {
        if (s.type === "tasks") {
            (s.data as any[]).forEach((g: any) => {
                totalTasks += (g.tasks || []).length;
                completedTasks += (g.tasks || []).filter((t: any) => t.completed).length;
            });
        }
        // Also count tasks inside module sections
        if (s.type === "module") {
            const mod = s.data as any;
            totalTasks += (mod.tasks || []).length;
            completedTasks += (mod.tasks || []).filter((t: any) => t.completed).length;
        }
    });

    const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { moduleCount, totalTasks, completedTasks, percent };
}

type FilterKey = "all" | "general" | "intern" | "in-progress" | "completed";

/* ═══════════════════════════════════════════════════════════
   Workspace Mockup Illustration (CSS + SVG)
   ═══════════════════════════════════════════════════════════ */

function WorkspaceMockup() {
    return (
        <div className="relative w-full max-w-[380px] aspect-[4/3] select-none" aria-hidden="true">
            {/* Window chrome */}
            <div className="absolute inset-0 rounded-lg border border-white/[0.08] bg-obsidian-surface/80 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/40">
                {/* Title bar */}
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border">
                    <div className="w-2 h-2 rounded-full bg-red-500/60" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                    <div className="w-2 h-2 rounded-full bg-green-500/60" />
                    <span className="ml-2 text-[9px] font-sans-display text-text-secondary tracking-wider">WORKSPACE</span>
                </div>

                {/* Content area */}
                <div className="p-3 space-y-2.5">
                    {/* Progress ring row */}
                    <div className="flex items-center gap-3 p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                        {/* Mini progress ring SVG */}
                        <svg width="32" height="32" viewBox="0 0 36 36" className="shrink-0">
                            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                            <circle
                                cx="18" cy="18" r="15" fill="none"
                                stroke="var(--color-indigo-500)"
                                strokeWidth="3"
                                strokeDasharray="94.25"
                                strokeDashoffset="30"
                                strokeLinecap="round"
                                transform="rotate(-90 18 18)"
                                className="animate-[dash_2s_ease-in-out_infinite_alternate]"
                            />
                            <text x="18" y="20" textAnchor="middle" fill="var(--color-text-primary)" fontSize="9" fontFamily="var(--font-sans-display)" fontWeight="700">68%</text>
                        </svg>
                        <div className="flex-1 min-w-0">
                            <div className="text-[9px] font-sans-display text-text-secondary uppercase tracking-wider">Progress</div>
                            <div className="text-[8px] text-text-secondary mt-0.5">12 of 18 tasks</div>
                        </div>
                    </div>

                    {/* Module cards */}
                    {[
                        { title: "Fundamentals", color: "bg-indigo-500", w: "w-3/4" },
                        { title: "Advanced Concepts", color: "bg-indigo-400", w: "w-1/2" },
                        { title: "Final Project", color: "bg-indigo-600", w: "w-1/4" },
                    ].map((m, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 p-2 rounded bg-white/[0.02] border border-white/[0.04] group/mod"
                            style={{ animationDelay: `${i * 0.15}s` }}
                        >
                            <div className={`w-1 h-6 rounded-full ${m.color} shrink-0`} />
                            <div className="flex-1 min-w-0">
                                <div className="text-[9px] font-sans-display text-text-primary truncate">{m.title}</div>
                                <div className="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full ${m.color} rounded-full transition-all duration-1000`} style={{ width: m.w === "w-3/4" ? "75%" : m.w === "w-1/2" ? "50%" : "25%" }} />
                                </div>
                            </div>
                            <CheckSquare size={10} className="text-text-secondary/40 shrink-0" />
                        </div>
                    ))}

                    {/* Resource row */}
                    <div className="flex gap-1.5">
                        {["📹", "📄", "🔗"].map((e, i) => (
                            <div key={i} className="flex-1 text-center py-1.5 rounded bg-white/[0.02] border border-white/[0.04] text-xs">
                                {e}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ambient glow behind */}
            <div className="absolute -inset-8 rounded-full bg-indigo-500/[0.06] blur-3xl -z-10" />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   Three-Dot Menu Dropdown
   ═══════════════════════════════════════════════════════════ */

function CardMenu({
    roadmapId,
    roadmapTitle,
    onDelete,
    onRename,
}: {
    roadmapId: string;
    roadmapTitle: string;
    onDelete: (id: string) => void;
    onRename: (id: string, newTitle: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const handleRename = () => {
        setOpen(false);
        const newTitle = prompt("Rename course:", roadmapTitle);
        if (newTitle && newTitle.trim() && newTitle.trim() !== roadmapTitle) {
            onRename(roadmapId, newTitle.trim());
        }
    };

    const handleDelete = () => {
        setOpen(false);
        if (confirm("Delete this course? This cannot be undone.")) {
            onDelete(roadmapId);
        }
    };

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
                className="p-1.5 rounded text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                aria-label="Course menu"
            >
                <MoreHorizontal size={16} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 w-40 py-1 bg-obsidian-elevated border border-border-subtle shadow-xl shadow-black/50 z-50 animate-scale-in origin-top-right">
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRename(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-body text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors text-left"
                    >
                        <Pencil size={13} /> Rename
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-body text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors text-left"
                    >
                        <Trash2 size={13} /> Delete
                    </button>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   Course Card (Domestika-inspired)
   ═══════════════════════════════════════════════════════════ */

function CourseCard({
    roadmap,
    onDelete,
    onRename,
}: {
    roadmap: Roadmap;
    onDelete: (id: string) => void;
    onRename: (id: string, newTitle: string) => void;
}) {
    const { moduleCount, totalTasks, completedTasks, percent } = getCourseStats(roadmap);
    const accentColor = roadmap.mode === "intern"
        ? "bg-emerald-500"
        : "bg-indigo-500";
    const accentBorder = roadmap.mode === "intern"
        ? "group-hover:border-emerald-500/30"
        : "group-hover:border-indigo-500/30";

    return (
        <div
            className={`group relative flex flex-col bg-obsidian-surface border border-white/[0.06] hover:border-white/[0.12] ${accentBorder} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30`}
        >
            {/* Colored top accent bar */}
            <div className={`h-[3px] w-full ${accentColor}`} />

            <div className="p-5 flex flex-col flex-1">
                {/* Top row: badge + menu */}
                <div className="flex items-center justify-between mb-4">
                    <span
                        className={`font-sans-display text-xs uppercase tracking-widest px-2 py-0.5 border ${roadmap.mode === "intern"
                            ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                            : "text-indigo-400 border-indigo-500/20 bg-indigo-500/5"
                            }`}
                    >
                        {roadmap.mode === "intern" ? "Intern" : "General"}
                    </span>
                    <CardMenu
                        roadmapId={roadmap.id}
                        roadmapTitle={roadmap.title}
                        onDelete={onDelete}
                        onRename={onRename}
                    />
                </div>

                {/* Title */}
                <h3 className="font-display text-base font-semibold text-text-primary leading-snug line-clamp-2 mb-4 group-hover:text-indigo-300 transition-colors duration-300 min-h-[2.5rem]">
                    {roadmap.title}
                </h3>

                {/* Inline stats */}
                <div className="flex items-center gap-4 mb-5 text-text-secondary">
                    <span className="flex items-center gap-1 text-[11px] font-sans-display">
                        <Layers size={11} className="text-indigo-500/50" />
                        {moduleCount} modules
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-sans-display">
                        <CheckSquare size={11} className="text-indigo-500/50" />
                        {completedTasks}/{totalTasks} tasks
                    </span>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px] font-sans-display text-text-secondary uppercase tracking-wider">Progress</span>
                        <span className="text-[11px] font-sans-display text-text-primary font-bold tabular-nums">{percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${roadmap.mode === "intern"
                                ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                                : "bg-gradient-to-r from-indigo-600 to-indigo-400"
                                }`}
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                </div>

                {/* Bottom row: time + continue button */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-border">
                    <span className="flex items-center gap-1 text-[12px] font-sans-display text-text-secondary/60">
                        <Clock size={10} />
                        {relativeTime(roadmap.updatedAt)}
                    </span>
                    <Link
                        href={`/workspace/${roadmap.id}`}
                        className={`inline-flex items-center gap-1.5 text-[11px] font-sans-display font-bold uppercase tracking-wider px-3 py-1.5 transition-all duration-300 ${roadmap.mode === "intern"
                            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                            : "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20"
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        Continue
                        <ArrowRight size={11} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   BEFORE / AFTER Visual Section
   ═══════════════════════════════════════════════════════════ */

function BeforeAfterSection() {
    const router = useRouter();

    const handleTrySample = () => {
        const params = new URLSearchParams({
            title: "Social Media Strategy Sample",
            content: SAMPLE_MARKDOWN,
        });
        router.push(`/create?${params.toString()}`);
    };

    return (
        <section className="w-full border-b border-white/[0.04]">
            <div className="max-w-7xl mx-auto px-5 lg:px-10 py-14">
                <div className="text-center mb-10">
                    <p className="font-sans-display text-[11px] uppercase tracking-[0.25em] text-indigo-400/80 mb-3">See it in action</p>
                    <h2 className="font-display text-3xl sm:text-4xl font-light text-text-primary leading-tight tracking-tight">
                        From raw content <span className="text-gradient italic">to structured workspace</span>
                    </h2>
                </div>

                <div className="relative rounded-2xl border border-indigo-500/20 bg-obsidian-surface/50 shadow-[0_0_60px_rgba(99,102,241,0.06)] overflow-hidden p-6 md:p-10">
                    {/* Ambient glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.04] via-transparent to-transparent pointer-events-none" />

                    <div className="relative grid md:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
                        {/* LEFT — Your Content */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="font-sans-display text-[10px] uppercase tracking-[0.25em] text-text-secondary/70 px-2 py-0.5 border border-white/10 bg-white/[0.03]">Your Content</span>
                            </div>
                            <div className="bg-obsidian rounded-xl border border-white/[0.07] p-5 h-full overflow-auto">
                                <pre className="font-mono text-xs leading-relaxed text-text-secondary whitespace-pre-wrap select-none">
                                    {`# Social Media Strategy
`}<span className="text-text-primary/60">{`## Phase 1: Setup
`}</span>{`- Create Instagram & TikTok accounts
- Set up Google Business Profile
`}<span className="text-text-primary/60">{`## Phase 2: Content
`}</span>{`- Post 3x per week
- Use Reels for maximum reach
`}<span className="text-text-primary/60">{`## Resources
`}</span>{`- Hootsuite Instagram Guide
- Buffer TikTok Algorithm Guide`}
                                </pre>
                            </div>
                        </div>

                        {/* DIVIDER arrow */}
                        <div className="hidden md:flex items-center justify-center px-2">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-px h-16 bg-gradient-to-b from-transparent via-indigo-500/40 to-transparent" />
                                <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                                    →
                                </div>
                                <div className="w-px h-16 bg-gradient-to-b from-transparent via-indigo-500/40 to-transparent" />
                            </div>
                        </div>

                        {/* RIGHT — Your Workspace mockup */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="font-sans-display text-[10px] uppercase tracking-[0.25em] text-indigo-400/80 px-2 py-0.5 border border-indigo-500/20 bg-indigo-500/5">Your Workspace</span>
                            </div>
                            <div className="bg-obsidian rounded-xl border border-white/[0.07] overflow-hidden h-full flex">
                                {/* Mini sidebar */}
                                <div className="w-[110px] shrink-0 bg-obsidian-light border-r border-white/[0.06] p-2 flex flex-col gap-1">
                                    <div className="h-6 rounded-md bg-indigo-500/20 border-l-2 border-indigo-500 px-2 flex items-center">
                                        <span className="text-[9px] text-indigo-400 font-sans-display font-bold truncate">Dashboard</span>
                                    </div>
                                    {["01 Phase 1: Setup", "02 Phase 2: Content", "📚 Resources"].map((label, i) => (
                                        <div key={i} className="h-6 rounded-md px-2 flex items-center gap-1.5 opacity-60">
                                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${i < 1 ? "bg-emerald-400" : "bg-white/20"}`} />
                                            <span className="text-[8px] text-text-secondary truncate">{label}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Content area */}
                                <div className="flex-1 p-3 space-y-2.5">
                                    {/* Progress ring row */}
                                    <div className="flex items-center gap-2 bg-white/[0.02] rounded-lg p-2 border border-white/[0.04]">
                                        <svg width="36" height="36" viewBox="0 0 36 36" className="shrink-0">
                                            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                                            <circle cx="18" cy="18" r="15" fill="none" stroke="#6366F1" strokeWidth="3"
                                                strokeDasharray="94.25" strokeDashoffset="61" strokeLinecap="round"
                                                transform="rotate(-90 18 18)" />
                                            <text x="18" y="21" textAnchor="middle" fill="#E8EAF0" fontSize="8" fontFamily="Cabinet Grotesk" fontWeight="700">35%</text>
                                        </svg>
                                        <div>
                                            <div className="text-[9px] text-text-secondary font-sans-display uppercase tracking-wide">Progress</div>
                                            <div className="text-[9px] text-indigo-400 font-bold">4 of 11 tasks done</div>
                                        </div>
                                    </div>
                                    {/* Task list */}
                                    <div className="space-y-1">
                                        {[
                                            { done: true, label: "Create Instagram account" },
                                            { done: true, label: "Set up Google Business" },
                                            { done: false, label: "Post 3x per week" },
                                            { done: false, label: "Use Reels for reach" },
                                        ].map((task, i) => (
                                            <div key={i} className="flex items-center gap-2 px-2 py-1 rounded bg-white/[0.02]">
                                                <div className={`w-3 h-3 rounded-sm border shrink-0 flex items-center justify-center ${task.done ? "bg-emerald-500/30 border-emerald-500/60" : "border-white/20"}`}>
                                                    {task.done && <span className="text-[7px] text-emerald-400">✓</span>}
                                                </div>
                                                <span className={`text-[9px] ${task.done ? "text-text-secondary/50 line-through" : "text-text-secondary"}`}>{task.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Resource card */}
                                    <div className="flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-2">
                                        <span className="text-sm">📚</span>
                                        <div>
                                            <div className="text-[9px] text-indigo-400 font-bold">Hootsuite Guide</div>
                                            <div className="text-[8px] text-text-secondary/60">hootsuite.com →</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA below panels */}
                    <div className="mt-8 flex justify-center">
                        <button
                            type="button"
                            onClick={handleTrySample}
                            className="inline-flex items-center gap-2.5 font-sans-display text-xs uppercase tracking-widest text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/5 hover:bg-indigo-500/10 px-6 py-3 rounded-lg transition-all duration-300"
                        >
                            Try it with this sample <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════
   HOW IT WORKS Section
   ═══════════════════════════════════════════════════════════ */

function HowItWorksSection() {
    const steps = [
        {
            icon: "📋",
            num: "1",
            title: "Paste or Upload",
            desc: "Any text, guide, or .md file",
        },
        {
            icon: "🤖",
            num: "2",
            title: "AI Structures It",
            desc: "Modules, tasks & a learning path built automatically",
        },
        {
            icon: "🚀",
            num: "3",
            title: "Track & Learn",
            desc: "Work through tasks and track your progress",
        },
    ];

    return (
        <section className="w-full border-b border-white/[0.04]">
            <div className="max-w-7xl mx-auto px-5 lg:px-10 py-14">
                <div className="text-center mb-10">
                    <p className="font-sans-display text-[11px] uppercase tracking-[0.25em] text-indigo-400/80 mb-3">Simple process</p>
                    <h2 className="font-display text-3xl sm:text-4xl font-light text-text-primary leading-tight tracking-tight">
                        How it works
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {steps.map((step, i) => (
                        <div 
                            key={i} 
                            className="relative flex flex-col p-6 rounded-xl border border-white/10 bg-obsidian-surface/40 hover:-translate-y-1 hover:shadow-md hover:border-white/20 transition-all duration-200"
                        >
                            {/* Numbered Badge */}
                            <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-400">
                                {step.num}
                            </div>
                            
                            <div className="text-4xl mt-6 mb-4 text-center">
                                {step.icon}
                            </div>
                            <h3 className="font-display text-xl font-semibold text-text-primary mb-2 text-center">{step.title}</h3>
                            <p className="font-body text-sm text-text-secondary leading-relaxed text-center">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════════ */

export default function HomePage() {
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [mounted, setMounted] = useState(false);
    const [filter, setFilter] = useState<FilterKey>("all");
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const storage = getStorage();
        let active = true;

        setMounted(true);
        setRoadmaps(storage.getRoadmaps());

        if (storage.syncFromCloud) {
            void storage.syncFromCloud().then((synced) => {
                if (active) setRoadmaps(synced);
            });
        }

        if (!localStorage.getItem("zns_onboarded")) {
            setShowOnboarding(true);
        }

        return () => {
            active = false;
        };
    }, []);

    const dismissOnboarding = () => {
        localStorage.setItem("zns_onboarded", "true");
        setShowOnboarding(false);
    };

    const handleDelete = useCallback((id: string) => {
        getStorage().deleteRoadmap(id);
        setRoadmaps(getStorage().getRoadmaps());
    }, []);

    const handleRename = useCallback((id: string, newTitle: string) => {
        getStorage().updateRoadmap(id, { title: newTitle });
        setRoadmaps(getStorage().getRoadmaps());
    }, []);

    // Filter logic
    const filtered = mounted
        ? roadmaps.filter((r) => {
            if (filter === "all") return true;
            if (filter === "general") return r.mode === "general";
            if (filter === "intern") return r.mode === "intern";
            const { percent } = getCourseStats(r);
            if (filter === "completed") return percent === 100;
            if (filter === "in-progress") return percent > 0 && percent < 100;
            return true;
        })
        : [];

    const filters: { key: FilterKey; label: string }[] = [
        { key: "all", label: "All" },
        { key: "general", label: "General" },
        { key: "intern", label: "Intern" },
        { key: "in-progress", label: "In Progress" },
        { key: "completed", label: "Completed" },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-obsidian text-text-primary selection:bg-indigo-500/30">
            <Header />

            <main className="flex-1 flex flex-col pt-20">
                {/* ═══════════════════════════════════════════════
                    ZONE 1 — MINI HERO (max ~35vh)
                   ═══════════════════════════════════════════════ */}
                <section className="relative w-full overflow-hidden border-b border-white/[0.04]" style={{ maxHeight: "35vh", minHeight: "200px" }}>
                    {/* Subtle background gradient */}
                    <div className="absolute inset-0 hero-mesh-gradient opacity-60 pointer-events-none" />
                    <div className="absolute inset-0 landing-grid-bg opacity-30 pointer-events-none" />

                    <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-10 py-8 lg:py-10 flex items-center justify-between gap-8 h-full">
                        {/* Left — text */}
                        <div className="flex-1 min-w-0 animate-slide-up">
                            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight leading-[1.15] mb-3">
                                <span className="text-text-primary">Turn any guide into a full </span>
                                <span className="text-gradient italic">interactive course</span>
                            </h1>
                            <p className="font-body text-sm text-text-secondary max-w-lg leading-relaxed mb-5">
                                Paste any text or <code className="text-[12px] px-1.5 py-0.5 bg-white/5 border border-border-subtle text-text-secondary">.md</code> file — AI builds your complete learning workspace with modules, tasks, progress tracking, and more.
                            </p>
                            <Link
                                href="/create"
                                className="inline-flex items-center gap-2 font-sans-display text-xs uppercase tracking-wider text-indigo-400 hover:text-indigo-300 border-b border-indigo-500/30 hover:border-indigo-400 pb-0.5 transition-colors"
                            >
                                <Sparkles size={12} />
                                Get started
                                <ArrowRight size={12} />
                            </Link>
                        </div>

                        {/* Right — workspace mockup */}
                        <div className="hidden lg:flex items-center justify-end flex-shrink-0 animate-slide-in-right">
                            <WorkspaceMockup />
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════
                    ZONE 1.5 — BEFORE / AFTER VISUAL
                   ═══════════════════════════════════════════════ */}
                <BeforeAfterSection />

                {/* ═══════════════════════════════════════════════
                    ZONE 1.6 — HOW IT WORKS
                   ═══════════════════════════════════════════════ */}
                <HowItWorksSection />

                {/* ═══════════════════════════════════════════════
                    ZONE 2 — COURSE LIBRARY
                   ═══════════════════════════════════════════════ */}
                <section className="flex-1 w-full max-w-7xl mx-auto px-5 lg:px-10 py-8">
                    {/* Header row: title + count + filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="font-sans-display text-lg font-bold text-text-primary text-text-primary tracking-tight">
                                Your Courses
                            </h2>
                            {mounted && roadmaps.length > 0 && (
                                <span className="font-sans-display text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 tabular-nums">
                                    {roadmaps.length}
                                </span>
                            )}
                        </div>

                        {/* Filter pills */}
                        {mounted && roadmaps.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {filters.map((f) => (
                                    <button
                                        key={f.key}
                                        type="button"
                                        onClick={() => setFilter(f.key)}
                                        className={`font-sans-display text-[11px] uppercase tracking-wider px-3 py-1.5 border transition-all duration-200 ${filter === f.key
                                            ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                                            : "bg-transparent text-text-secondary border-white/[0.06] hover:text-text-secondary hover:border-border-subtle"
                                            }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Course grid */}
                    {mounted && filtered.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                            {filtered.map((r) => (
                                <CourseCard
                                    key={r.id}
                                    roadmap={r}
                                    onDelete={handleDelete}
                                    onRename={handleRename}
                                />
                            ))}
                        </div>
                    ) : mounted && roadmaps.length > 0 && filtered.length === 0 ? (
                        /* Filtered to nothing */
                        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                            <div className="text-3xl mb-3">🔍</div>
                            <h3 className="font-sans-display text-sm font-bold text-text-primary text-text-secondary mb-1">No matching courses</h3>
                            <p className="font-body text-sm text-text-secondary">Try a different filter.</p>
                        </div>
                    ) : mounted ? (
                        /* Empty state */
                        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                            <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-indigo-500/5 border border-indigo-500/10 mb-6">
                                <Map size={36} className="text-indigo-500/40" />
                            </div>
                            <h3 className="font-display text-2xl font-light text-text-primary italic mb-2">
                                No courses yet
                            </h3>
                            <p className="font-body text-sm text-text-secondary max-w-sm mb-8">
                                Paste any guide and turn it into an interactive course
                                with AI-generated modules, tasks, and progress tracking.
                            </p>
                            <Link
                                href="/create"
                                className="inline-flex items-center gap-2.5 bg-indigo-500 hover:bg-indigo-400 text-obsidian font-sans-display font-bold text-sm uppercase tracking-wider px-8 py-3 transition-all duration-300 animate-cta-glow"
                            >
                                <Plus size={16} strokeWidth={2.5} />
                                Create Your First Course
                            </Link>
                        </div>
                    ) : (
                        /* Loading skeleton */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-56 bg-obsidian-surface border border-white/[0.04] shimmer" />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* ═══════════════════════════════════════════════
                FOOTER
               ═══════════════════════════════════════════════ */}
            <footer className="border-t border-white/[0.04] py-5 mt-auto">
                <div className="max-w-7xl mx-auto px-5 lg:px-10 text-center font-sans-display text-xs uppercase tracking-[0.2em] text-text-secondary/60">
                    Powered by <span className="text-text-secondary">ZNS Nexus</span> · ZNS Enterprises © {new Date().getFullYear()} · All rights reserved
                </div>
            </footer>

            {/* ═══════════════════════════════════════════════
                ONBOARDING MODAL
               ═══════════════════════════════════════════════ */}
            {mounted && showOnboarding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-obsidian-elevated border border-border-subtle rounded-2xl w-full max-w-lg p-8 shadow-2xl animate-scale-in">
                        <div className="text-center mb-8">
                            <h2 className="font-display text-2xl mb-2 text-white">Welcome to ZNS RoadMap Studio</h2>
                            <p className="text-text-secondary text-sm">Turn any knowledge into an interactive learning experience in seconds.</p>
                        </div>

                        <div className="space-y-6 mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center shrink-0">
                                    <span className="text-xl">📄</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-primary text-white text-sm">Paste any guide, roadmap, or .md file</h3>
                                    <p className="text-sm text-text-secondary">Simply copy and paste your content.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center shrink-0">
                                    <span className="text-xl">🤖</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-primary text-white text-sm">AI reads it and builds your workspace</h3>
                                    <p className="text-sm text-text-secondary">Automatic modules, tasks, and resources.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center shrink-0">
                                    <span className="text-xl">📈</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-primary text-white text-sm">Learn, track progress, and never leave the app</h3>
                                    <p className="text-sm text-text-secondary">Everything you need in one place.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <Link
                                href="/create"
                                onClick={dismissOnboarding}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-obsidian font-sans-display font-bold text-xs uppercase tracking-wider px-6 py-4 rounded-lg transition-all duration-300"
                            >
                                <Sparkles size={14} />
                                Create My First Course <ArrowRight size={14} />
                            </Link>
                            <button
                                type="button"
                                onClick={dismissOnboarding}
                                className="text-xs text-text-secondary hover:text-white transition-colors uppercase tracking-widest font-sans-display"
                            >
                                Skip
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
