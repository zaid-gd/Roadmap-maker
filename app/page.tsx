"use client";

import { useEffect, useState, useRef, type ReactNode } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getStorage } from "@/lib/storage";
import type { Roadmap } from "@/types";
import {
    Sparkles,
    Play,
    Cpu,
    Video,
    BarChart3,
    CheckSquare,
    BookOpen,
    Send,
    ClipboardPaste,
    Wand2,
    GraduationCap,
    ArrowRight,
    Trash2,
    Calendar,
    Layers,
    ExternalLink,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   Scroll-Reveal Wrapper (Intersection Observer + CSS)
   ═══════════════════════════════════════════════════════════ */

function Reveal({
    children,
    className = "",
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(32px)",
                transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
            }}
        >
            {children}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   Floating Particles (Canvas-free, CSS-only)
   ═══════════════════════════════════════════════════════════ */

function FloatingParticles() {
    const particles = Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${5 + (i * 5.3) % 90}%`,
        top: `${10 + (i * 7.1) % 80}%`,
        size: 2 + (i % 4) * 1.5,
        delay: `${(i * 0.6) % 8}s`,
        duration: `${6 + (i % 5) * 2}s`,
        opacity: 0.15 + (i % 3) * 0.1,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-full animate-float"
                    style={{
                        left: p.left,
                        top: p.top,
                        width: p.size,
                        height: p.size,
                        background: `radial-gradient(circle, var(--color-indigo-400), transparent)`,
                        animationDelay: p.delay,
                        animationDuration: p.duration,
                        opacity: p.opacity,
                    }}
                />
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   Orbiting Ring Decoration
   ═══════════════════════════════════════════════════════════ */

function OrbitRing() {
    return (
        <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[280px] h-[280px] hidden lg:block pointer-events-none" aria-hidden="true">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border border-indigo-500/10" />
            {/* Orbiting dot */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-orbit">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
                </div>
            </div>
            {/* Center glow */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-indigo-400/30 blur-sm" />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   How-It-Works Step
   ═══════════════════════════════════════════════════════════ */

interface StepProps {
    icon: ReactNode;
    number: string;
    title: string;
    description: string;
    delay: number;
}

function StepCard({ icon, number, title, description, delay }: StepProps) {
    return (
        <Reveal delay={delay} className="flex-1 min-w-[260px]">
            <div className="group relative p-8 h-full border border-white/5 bg-obsidian-surface/50 backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-500">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/60 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/40 transition-all duration-500">
                        {icon}
                    </div>
                    <span className="font-sans-display text-xs text-indigo-500/50 uppercase tracking-widest">
                        {number}
                    </span>
                </div>

                <h3 className="font-display text-xl font-normal text-text-primary mb-3 group-hover:text-indigo-300 transition-colors duration-300">
                    {title}
                </h3>
                <p className="font-body text-sm text-text-muted leading-relaxed">
                    {description}
                </p>
            </div>
        </Reveal>
    );
}

/* ═══════════════════════════════════════════════════════════
   Feature Card
   ═══════════════════════════════════════════════════════════ */

interface FeatureProps {
    icon: ReactNode;
    title: string;
    description: string;
    delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureProps) {
    return (
        <Reveal delay={delay}>
            <div className="group relative p-6 h-full border border-white/5 bg-obsidian-surface/30 hover:bg-obsidian-elevated/60 hover:border-indigo-500/20 transition-all duration-500 overflow-hidden">
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="w-10 h-10 flex items-center justify-center mb-5 text-indigo-400/70 group-hover:text-indigo-400 transition-colors duration-300">
                    {icon}
                </div>

                <h4 className="font-sans-display text-sm font-bold uppercase tracking-wider text-text-primary mb-2 group-hover:text-indigo-300 transition-colors duration-300">
                    {title}
                </h4>
                <p className="font-body text-xs text-text-muted leading-relaxed">
                    {description}
                </p>
            </div>
        </Reveal>
    );
}

/* ═══════════════════════════════════════════════════════════
   Roadmap Card  
   ═══════════════════════════════════════════════════════════ */

function RoadmapCard({
    roadmap,
    index,
    onDelete,
}: {
    roadmap: Roadmap;
    index: number;
    onDelete: (id: string, e: React.MouseEvent) => void;
}) {
    // Count tasks from both task sections and module sections
    let totalTasks = 0;
    let completedTasks = 0;
    for (const s of roadmap.sections) {
        if (s.type === "tasks") {
            for (const g of (s as any).data || []) {
                for (const t of g.tasks || []) {
                    totalTasks++;
                    if (t.completed) completedTasks++;
                }
            }
        }
        if (s.type === "module") {
            for (const t of (s as any).data?.tasks || []) {
                totalTasks++;
                if (t.completed) completedTasks++;
            }
        }
    }
    const percent =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const sectionCount = roadmap.sections.length;

    return (
        <Reveal delay={index * 0.08}>
            <div className="group relative flex flex-col h-full border border-white/5 bg-obsidian-surface hover:bg-obsidian-elevated transition-all duration-500 overflow-hidden">
                {/* Top gradient line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500/0 via-indigo-500 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="p-7 flex flex-col flex-1">
                    {/* Header: badge + delete */}
                    <div className="flex justify-between items-start mb-8">
                        <span className="font-sans-display text-[10px] bg-indigo-500/10 text-indigo-400 px-2.5 py-1 uppercase tracking-widest border border-indigo-500/20">
                            {roadmap.mode === "intern" ? "INTERN" : "GENERAL"}
                        </span>
                        <button
                            type="button"
                            onClick={(e) => onDelete(roadmap.id, e)}
                            className="text-text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                            aria-label="Delete workspace"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-xl font-normal text-text-primary mb-4 group-hover:text-indigo-300 transition-colors duration-300 line-clamp-2 leading-snug break-words">
                        {roadmap.title}
                    </h3>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 mb-6 text-text-muted">
                        <span className="flex items-center gap-1.5 text-xs font-sans-display">
                            <Layers size={12} className="text-indigo-500/50" />
                            {sectionCount} sections
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-sans-display">
                            <Calendar size={12} className="text-indigo-500/50" />
                            {new Intl.DateTimeFormat("en-US", {
                                month: "short",
                                day: "2-digit",
                            }).format(new Date(roadmap.updatedAt))}
                        </span>
                    </div>

                    {/* Progress */}
                    <div className="mt-auto space-y-3">
                        <div className="flex items-center justify-between text-xs font-sans-display uppercase tracking-wider">
                            <span className="text-text-muted">Progress</span>
                            <span className="text-text-primary tabular-nums font-bold">
                                {percent}%
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 relative overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 shadow-[0_0_10px_rgba(245,158,11,0.4)] transition-all duration-1000 ease-out"
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-5 mt-5 border-t border-white/5">
                        <span className="font-sans-display text-[10px] uppercase tracking-widest text-text-muted/50">
                            {new Intl.DateTimeFormat("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                            }).format(new Date(roadmap.updatedAt))}
                        </span>
                        <Link
                            href={`/workspace/${roadmap.id}`}
                            className="inline-flex items-center gap-2 font-sans-display text-xs text-indigo-400 hover:text-indigo-300 uppercase tracking-wider group/link"
                        >
                            Open
                            <ExternalLink
                                size={12}
                                className="transform group-hover/link:translate-x-0.5 transition-transform"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </Reveal>
    );
}

/* ═══════════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════════ */

export default function HomePage() {
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setRoadmaps(getStorage().getRoadmaps());
    }, []);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("Delete this workspace? This cannot be undone.")) return;
        getStorage().deleteRoadmap(id);
        setRoadmaps(getStorage().getRoadmaps());
    };

    return (
        <div className="min-h-screen flex flex-col relative bg-obsidian text-text-primary selection:bg-indigo-500/30 selection:text-indigo-200">
            <Header />

            <main className="flex-1 flex flex-col pt-14">
                {/* ┌─────────────────────────────────────────────┐
                    │   HERO SECTION                              │
                    └─────────────────────────────────────────────┘ */}
                <section className="relative w-full min-h-[100vh] flex items-center overflow-hidden border-b border-white/5">
                    {/* Animated gradient mesh background */}
                    <div className="absolute inset-0 hero-mesh-gradient pointer-events-none" />
                    <div className="absolute inset-0 landing-grid-bg pointer-events-none" />

                    {/* Floating particles */}
                    <FloatingParticles />

                    {/* Large rotating gradient orb — top right */}
                    <div
                        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full animate-mesh pointer-events-none opacity-20"
                        style={{
                            background:
                                "conic-gradient(from 0deg, rgba(245,158,11,0.15), rgba(217,119,6,0.08), rgba(251,191,36,0.12), rgba(180,83,9,0.06), rgba(245,158,11,0.15))",
                            filter: "blur(80px)",
                        }}
                        aria-hidden="true"
                    />

                    {/* Orbit decoration */}
                    <OrbitRing />

                    <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full py-24 sm:py-32">
                        <div className="max-w-3xl">
                            {/* Badge */}
                            <Reveal delay={0}>
                                <div className="flex items-center gap-3 mb-10">
                                    <span className="h-[1px] w-12 bg-indigo-500" />
                                    <span className="font-sans-display text-[10px] uppercase tracking-[0.25em] text-indigo-400 font-bold flex items-center gap-2">
                                        <Sparkles size={12} />
                                        ZNS Nexus Enabled
                                    </span>
                                </div>
                            </Reveal>

                            {/* Headline */}
                            <Reveal delay={0.1}>
                                <h1 className="font-display font-light text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] mb-8">
                                    <span className="block text-text-primary">
                                        RoadMap
                                    </span>
                                    <span className="block text-shimmer-gold italic pb-2 mt-1">
                                        Studio
                                    </span>
                                    <span className="block text-text-secondary text-3xl sm:text-4xl md:text-5xl font-display font-light mt-2">
                                        by ZNS Nexus
                                    </span>
                                </h1>
                            </Reveal>

                            {/* Tagline */}
                            <Reveal delay={0.2}>
                                <p className="font-body text-lg sm:text-xl text-text-secondary max-w-xl leading-relaxed mb-12 border-l-2 border-indigo-500/30 pl-6">
                                    Paste any unstructured guide or AI-generated
                                    curriculum. Instantly construct a
                                    hyper-personalized, fully interactive
                                    learning workspace that keeps you in the
                                    zone.
                                </p>
                            </Reveal>

                            {/* CTA Buttons */}
                            <Reveal delay={0.3}>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                                    <Link
                                        href="/create"
                                        className="group relative inline-flex items-center justify-center gap-3 bg-indigo-500 text-obsidian px-10 py-4 font-sans-display font-bold uppercase tracking-widest text-sm hover:bg-indigo-400 transition-all duration-500 animate-cta-glow"
                                    >
                                        <Sparkles
                                            size={16}
                                            className="group-hover:rotate-12 transition-transform duration-300"
                                        />
                                        <span>Create Roadmap</span>
                                        <ArrowRight
                                            size={16}
                                            className="group-hover:translate-x-1 transition-transform duration-300"
                                        />
                                    </Link>
                                    <a
                                        href="#your-roadmaps"
                                        className="font-sans-display text-xs uppercase tracking-[0.15em] text-text-muted hover:text-text-primary transition-colors duration-300 border-b border-white/10 hover:border-white/30 pb-1"
                                    >
                                        View Your Roadmaps ↓
                                    </a>
                                </div>
                            </Reveal>
                        </div>
                    </div>

                    {/* Bottom fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-obsidian to-transparent pointer-events-none" />
                </section>

                {/* ┌─────────────────────────────────────────────┐
                    │   HOW IT WORKS                              │
                    └─────────────────────────────────────────────┘ */}
                <section className="relative w-full py-28 sm:py-36 bg-obsidian border-b border-white/5 overflow-hidden">
                    <div className="absolute inset-0 landing-grid-bg pointer-events-none opacity-50" />

                    <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
                        {/* Section header */}
                        <Reveal>
                            <div className="text-center mb-20">
                                <span className="font-sans-display text-[10px] uppercase tracking-[0.3em] text-indigo-500 block mb-4">
                                    Workflow
                                </span>
                                <h2 className="font-display text-4xl sm:text-5xl font-light text-text-primary italic mb-4">
                                    How it{" "}
                                    <span className="text-gradient">works</span>
                                </h2>
                                <p className="font-body text-text-muted max-w-md mx-auto">
                                    Three steps from raw content to an immersive
                                    learning environment.
                                </p>
                            </div>
                        </Reveal>

                        {/* Steps */}
                        <div className="flex flex-col md:flex-row gap-px bg-white/5 overflow-hidden">
                            <StepCard
                                icon={<ClipboardPaste size={24} />}
                                number="01"
                                title="Paste your guide"
                                description="Drop in any unstructured markdown, text curriculum, or AI-generated learning plan. No formatting required."
                                delay={0.1}
                            />
                            <StepCard
                                icon={<Wand2 size={24} />}
                                number="02"
                                title="AI builds your workspace"
                                description="Our AI engine intelligently parses milestones, tasks, resources, and videos — constructing a complete interactive environment."
                                delay={0.2}
                            />
                            <StepCard
                                icon={<GraduationCap size={24} />}
                                number="03"
                                title="Learn interactively"
                                description="Track progress, watch embedded videos, complete tasks, and stay focused in a zero-exit-friction learning environment."
                                delay={0.3}
                            />
                        </div>

                        {/* Connecting line decoration */}
                        <div className="hidden md:block mt-8">
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-px w-16 bg-gradient-to-r from-transparent to-indigo-500/30" />
                                <Play
                                    size={10}
                                    className="text-indigo-500/30"
                                />
                                <div className="h-px w-16 bg-gradient-to-r from-indigo-500/30 to-transparent" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ┌─────────────────────────────────────────────┐
                    │   FEATURES                                  │
                    └─────────────────────────────────────────────┘ */}
                <section className="relative w-full py-28 sm:py-36 bg-obsidian-surface/20 border-b border-white/5">
                    <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
                        {/* Section header */}
                        <Reveal>
                            <div className="text-center mb-20">
                                <span className="font-sans-display text-[10px] uppercase tracking-[0.3em] text-indigo-500 block mb-4">
                                    Capabilities
                                </span>
                                <h2 className="font-display text-4xl sm:text-5xl font-light text-text-primary italic mb-4">
                                    Engineered for{" "}
                                    <span className="text-gradient">focus</span>
                                </h2>
                                <p className="font-body text-text-muted max-w-lg mx-auto">
                                    Every feature is designed to keep you immersed
                                    in your curriculum with zero friction.
                                </p>
                            </div>
                        </Reveal>

                        {/* Feature grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 overflow-hidden">
                            <FeatureCard
                                icon={<Cpu size={22} />}
                                title="AI-Powered Parsing"
                                description="Gemini-powered intelligence extracts structure from any raw text — milestones, tasks, resources, and timelines."
                                delay={0.05}
                            />
                            <FeatureCard
                                icon={<Video size={22} />}
                                title="Video Embeds"
                                description="YouTube and Vimeo videos embedded directly in your workspace with timestamp navigation and progress tracking."
                                delay={0.1}
                            />
                            <FeatureCard
                                icon={<BarChart3 size={22} />}
                                title="Progress Tracking"
                                description="Real-time completion rings and percentage bars across all sections. Visualize your journey at a glance."
                                delay={0.15}
                            />
                            <FeatureCard
                                icon={<CheckSquare size={22} />}
                                title="Task Management"
                                description="Grouped tasks with subtasks, notes, and attachments. Check them off as you learn and build momentum."
                                delay={0.2}
                            />
                            <FeatureCard
                                icon={<BookOpen size={22} />}
                                title="Resource Library"
                                description="Docs, PDFs, courses, tools, and code references organized and accessible from a single, unified panel."
                                delay={0.25}
                            />
                            <FeatureCard
                                icon={<Send size={22} />}
                                title="Intern Submissions"
                                description="Built-in submission workflow with status tracking, reviewer feedback, and attachment support for team learning."
                                delay={0.3}
                            />
                        </div>
                    </div>
                </section>

                {/* ┌─────────────────────────────────────────────┐
                    │   YOUR ROADMAPS                             │
                    └─────────────────────────────────────────────┘ */}
                <section
                    id="your-roadmaps"
                    className="relative w-full py-28 sm:py-36 bg-obsidian"
                >
                    <div className="absolute inset-0 landing-grid-bg pointer-events-none opacity-30" />

                    <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
                        {/* Section header */}
                        <Reveal>
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
                                <div>
                                    <span className="font-sans-display text-[10px] uppercase tracking-[0.3em] text-indigo-500 block mb-4">
                                        Your Workspace
                                    </span>
                                    <h2 className="font-display text-4xl sm:text-5xl font-light text-text-primary italic mb-2">
                                        Your{" "}
                                        <span className="text-text-secondary">
                                            Roadmaps
                                        </span>
                                    </h2>
                                    <p className="font-body text-sm text-text-muted">
                                        Saved workspaces with live progress
                                        tracking.
                                    </p>
                                </div>
                                {mounted && roadmaps.length > 0 && (
                                    <div className="font-sans-display text-4xl text-indigo-500 font-bold tabular-nums">
                                        {roadmaps.length < 10
                                            ? `0${roadmaps.length}`
                                            : roadmaps.length}
                                    </div>
                                )}
                            </div>
                        </Reveal>

                        {/* Roadmap cards */}
                        {mounted && roadmaps.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {roadmaps.map((r, i) => (
                                    <RoadmapCard
                                        key={r.id}
                                        roadmap={r}
                                        index={i}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        ) : mounted ? (
                            <Reveal>
                                <div className="w-full min-h-[40vh] flex flex-col items-center justify-center border border-dashed border-white/10 bg-obsidian-surface/20 relative group">
                                    <div className="absolute inset-x-0 h-px top-0 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="w-16 h-16 flex items-center justify-center border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 mb-6">
                                        <Sparkles size={28} />
                                    </div>

                                    <h3 className="font-display italic text-3xl sm:text-4xl text-text-secondary mb-3">
                                        No roadmaps yet
                                    </h3>
                                    <p className="font-body text-sm text-text-muted max-w-md text-center mb-8">
                                        Create your first workspace to start
                                        learning interactively.
                                    </p>
                                    <Link
                                        href="/create"
                                        className="inline-flex items-center gap-2 font-sans-display text-xs uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/60 px-6 py-3 transition-all duration-300 bg-indigo-500/5 hover:bg-indigo-500/10"
                                    >
                                        <Sparkles size={14} />
                                        Create Roadmap
                                    </Link>
                                </div>
                            </Reveal>
                        ) : null}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
