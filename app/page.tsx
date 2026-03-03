"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getStorage } from "@/lib/storage";
import type { Roadmap } from "@/types";

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

            <main className="flex-1 flex flex-col pt-14 selection:bg-indigo-500/40">
                {/* Hero Layout: Architectural Asymmetry */}
                <section className="relative w-full pt-16 pb-20 sm:pt-28 sm:pb-32 overflow-hidden border-b border-white/5">
                    {/* Background Texture/Mesh */}
                    <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen isolate">
                        <div className="absolute top-0 right-0 w-[40vw] h-[60vh] bg-indigo-500/10 blur-[150px] rounded-full translate-x-1/4 -translate-y-1/4" />
                        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vh] bg-purple-500/10 blur-[150px] rounded-full -translate-x-1/4 translate-y-1/4" />
                    </div>

                    <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                        {/* Left Column Text Treatment */}
                        <div className="lg:col-span-8 animate-slide-up">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="h-[1px] w-12 bg-indigo-500"></span>
                                <span className="font-sans-display text-xs uppercase tracking-[0.2em] text-indigo-400 font-bold">
                                    ZNS Nexus Enabled
                                </span>
                            </div>

                            <h1 className="font-display font-light text-6xl sm:text-7xl lg:text-8xl tracking-tight leading-[0.95] text-balance mb-8">
                                <span className="block text-text-primary">Design your</span>
                                <span className="block italic text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 via-indigo-500 to-indigo-700 pb-2">
                                    ultimate
                                </span>
                                <span className="block text-text-secondary">workspace.</span>
                            </h1>

                            <p className="font-body text-lg sm:text-xl text-text-secondary max-w-xl leading-relaxed text-balance mb-12 border-l border-white/10 pl-6 stagger-2 animate-slide-up">
                                Immersive learning meets architectural precision. Paste any unstructured guides or generated curricula, and instantly construct a hyper-personalized, fully interactive environment that focuses your mind.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-6 stagger-3 animate-slide-up">
                                <Link
                                    href="/create"
                                    className="group relative inline-flex items-center justify-center gap-4 bg-text-primary text-obsidian px-10 py-5 rounded-none font-sans-display font-bold uppercase tracking-widest text-sm hover:bg-indigo-500 hover:text-white transition-colors duration-500 border border-transparent overflow-hidden"
                                >
                                    <span className="relative z-10">Construct Canvas</span>
                                    <span className="relative z-10 text-lg leading-none transform group-hover:translate-x-1 transition-transform">→</span>
                                </Link>
                                <a
                                    href="#workspaces"
                                    className="font-sans-display text-xs uppercase tracking-[0.1em] text-text-muted hover:text-text-primary hover:border-b hover:border-text-primary pb-1 transition-all duration-300"
                                >
                                    Explore Archives
                                </a>
                            </div>
                        </div>

                        {/* Right Column Editorial Grid Callout */}
                        <div className="lg:col-span-4 hidden lg:grid grid-cols-1 gap-1 animate-slide-in-right">
                            <div className="surface p-8 border border-white/5 border-l-0 border-r-0 sm:border-r backdrop-blur-md relative group">
                                <span className="absolute top-4 right-4 font-sans-display text-xs text-indigo-500/50 group-hover:text-indigo-500 transition-colors">( 01 )</span>
                                <h3 className="font-display italic text-2xl mb-2 text-text-primary">Parse.</h3>
                                <p className="font-body text-sm text-text-muted leading-relaxed">AI ingests structureless markdown and extracts an intelligent web of milestones and deliverables.</p>
                            </div>
                            <div className="surface p-8 border border-white/5 border-l-0 border-r-0 sm:border-r backdrop-blur-md relative group">
                                <span className="absolute top-4 right-4 font-sans-display text-xs text-indigo-500/50 group-hover:text-indigo-500 transition-colors">( 02 )</span>
                                <h3 className="font-display italic text-2xl mb-2 text-text-primary">Construct.</h3>
                                <p className="font-body text-sm text-text-muted leading-relaxed">Automated generation of live tracking rings, video carousels, and rich document readers.</p>
                            </div>
                            <div className="surface p-8 border border-white/5 border-l-0 border-r-0 sm:border-r backdrop-blur-md relative group">
                                <span className="absolute top-4 right-4 font-sans-display text-xs text-indigo-500/50 group-hover:text-indigo-500 transition-colors">( 03 )</span>
                                <h3 className="font-display italic text-2xl mb-2 text-text-primary">Engage.</h3>
                                <p className="font-body text-sm text-text-muted leading-relaxed">Stay enclosed in a zero-exit friction environment. Absolute focus on the curriculum.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Typography / Feature break */}
                <section className="border-b border-white/5 bg-obsidian-surface/30">
                    <div className="flex flex-col md:flex-row w-full max-w-7xl mx-auto items-center justify-between px-6 lg:px-12 py-12 md:py-8 font-sans-display text-xs uppercase tracking-widest text-text-muted">
                        <span className="flex items-center gap-3"><span className="w-2 h-2 rounded bg-indigo-500/50"></span> Architecture</span>
                        <span className="hidden md:block w-px h-8 bg-white/5"></span>
                        <span className="flex items-center gap-3"><span className="w-2 h-2 rounded bg-indigo-500/50"></span> Zero-Exit UI</span>
                        <span className="hidden md:block w-px h-8 bg-white/5"></span>
                        <span className="flex items-center gap-3"><span className="w-2 h-2 rounded bg-indigo-500/50"></span> Spatial Harmony</span>
                    </div>
                </section>

                {/* Saved Roadmaps Grid */}
                <section id="workspaces" className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 py-24 relative z-10 selection:bg-indigo-500/40">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
                        <div>
                            <h2 className="font-display text-5xl font-light text-text-primary italic mb-4 text-balance">
                                Active <span className="text-text-secondary">Archives</span>
                            </h2>
                            <p className="font-sans-display text-xs uppercase tracking-widest text-text-muted">Command your constructed curricula</p>
                        </div>
                        {mounted && roadmaps.length > 0 && (
                            <div className="font-sans-display text-3xl text-indigo-500 font-bold tabular-nums">
                                {roadmaps.length < 10 ? `0${roadmaps.length}` : roadmaps.length}
                            </div>
                        )}
                    </div>

                    {mounted && roadmaps.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-none overflow-hidden hover:bg-white/10 transition-colors">
                            {roadmaps.map((r, i) => {
                                const totalTasks = r.sections.find(s => s.type === 'tasks')?.data.reduce((acc: number, g: any) => acc + (g.tasks || []).length, 0) || 0;
                                const completedTasks = r.sections.find(s => s.type === 'tasks')?.data.reduce((acc: number, g: any) => acc + (g.tasks || []).filter((t: any) => t.completed).length, 0) || 0;
                                const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                                return (
                                    <Link
                                        href={`/workspace/${r.id}`}
                                        key={r.id}
                                        className="group flex flex-col surface relative p-8 h-full bg-obsidian-surface hover:bg-obsidian-elevated transition-colors duration-500"
                                        style={{ animationDelay: `${i * 0.1}s` }}
                                    >
                                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500/0 via-indigo-500 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                        <div className="flex justify-between items-start mb-12">
                                            <span className="font-sans-display text-[10px] bg-white/5 px-2 py-1 uppercase tracking-widest text-text-secondary">
                                                {r.mode === 'intern' ? 'INTERN' : 'GENERAL'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) => handleDelete(r.id, e)}
                                                className="text-text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                aria-label="Delete workspace"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <h3 className="font-display text-2xl font-normal text-text-primary mb-6 transition-colors group-hover:text-indigo-300 line-clamp-2 leading-snug break-words">
                                            {r.title}
                                        </h3>

                                        <div className="mt-auto space-y-6">
                                            {/* Minimalist Progress Line */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-xs font-sans-display uppercase tracking-wider">
                                                    <span className="text-text-muted">Completion</span>
                                                    <span className="text-text-primary tabular-nums font-bold">{percent}%</span>
                                                </div>
                                                <div className="w-full h-px bg-white/10 relative">
                                                    <div
                                                        className="absolute top-0 left-0 h-[2px] -translate-y-[0.5px] bg-indigo-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-1000 ease-out"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <span className="font-sans-display text-[10px] uppercase tracking-widest text-text-muted/60">
                                                    {new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(r.updatedAt))}
                                                </span>
                                                <span className="font-sans-display text-xs text-indigo-500 transform group-hover:translate-x-1 transition-transform">
                                                    ENTER →
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : mounted ? (
                        <div className="w-full min-h-[40vh] flex flex-col items-center justify-center border border-dashed border-white/10 bg-obsidian-surface/20 relative group">
                            <div className="absolute inset-x-0 h-px top-0 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <h3 className="font-display italic text-4xl text-text-secondary mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]">The void is waiting.</h3>
                            <p className="font-body text-sm text-text-muted max-w-md text-center mb-8">
                                Architect your first curriculum workspace to begin.
                            </p>
                            <Link
                                href="/create"
                                className="font-sans-display text-xs uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 border-b border-indigo-400/30 hover:border-indigo-300 pb-1"
                            >
                                Initiate Generation
                            </Link>
                        </div>
                    ) : null}
                </section>
            </main>

            <Footer />
        </div>
    );
}
