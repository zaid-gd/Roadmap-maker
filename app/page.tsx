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
        if (!confirm("Delete this roadmap? This cannot be undone.")) return;
        getStorage().deleteRoadmap(id);
        setRoadmaps(getStorage().getRoadmaps());
    };

    return (
        <div className="min-h-screen flex flex-col relative">
            <Header />

            <main className="flex-1 flex flex-col pt-14">
                {/* Hero Section */}
                <section className="relative overflow-hidden pt-20 pb-16 sm:pt-32 sm:pb-24 flex-shrink-0">
                    {/* Animated Background Mesh */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <div
                            className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-glow"
                            style={{ animationDuration: '8s' }}
                        />
                        <div
                            className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-glow"
                            style={{ animationDuration: '10s', animationDelay: '2s' }}
                        />
                    </div>

                    <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8 animate-fade-in shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            ZNS Nexus Powered
                        </div>

                        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 animate-slide-up leading-tight">
                            <span className="text-text-primary block mb-2">Build Your Ultimate</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient bg-300%">
                                Interactive Workspace
                            </span>
                        </h1>

                        <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-10 animate-slide-up stagger-2 leading-relaxed" style={{ textWrap: "balance" }}>
                            Paste any AI-generated guide, roadmap, or curriculum. We instantly transform it into a premium, self-adapting learning environment.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-3">
                            <Link href="/create" className="btn btn-primary text-base px-8 py-4 rounded-xl shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)] hover:shadow-[0_0_40px_-5px_rgba(99,102,241,0.7)] transition-all duration-300 hover:-translate-y-1">
                                Create Workspace
                            </Link>
                            <a href="#roadmaps" className="btn btn-secondary text-base px-8 py-4 rounded-xl hover:-translate-y-1 transition-transform">
                                View Saved
                            </a>
                        </div>
                    </div>

                    {/* Feature Highlights Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-24 px-4 sm:px-6 animate-slide-up stagger-3 relative z-10">
                        <div className="surface p-6 rounded-2xl border border-white/5 bg-obsidian-surface/60 backdrop-blur-sm group hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                                🧠
                            </div>
                            <h3 className="font-display font-bold text-lg text-text-primary mb-2">AI Understanding</h3>
                            <p className="text-text-secondary text-sm leading-relaxed">Instantly parses unstructured text into meaningful milestones, tasks, and categorized resources.</p>
                        </div>
                        <div className="surface p-6 rounded-2xl border border-white/5 bg-obsidian-surface/60 backdrop-blur-sm group hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                🎯
                            </div>
                            <h3 className="font-display font-bold text-lg text-text-primary mb-2">Zero-Exit Focus</h3>
                            <p className="text-text-secondary text-sm leading-relaxed">Embedded video players and rich document viewers keep you inside the app, focused on learning.</p>
                        </div>
                        <div className="surface p-6 rounded-2xl border border-white/5 bg-obsidian-surface/60 backdrop-blur-sm group hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                📈
                            </div>
                            <h3 className="font-display font-bold text-lg text-text-primary mb-2">Live Progress</h3>
                            <p className="text-text-secondary text-sm leading-relaxed">Visual timelines, progress rings, and milestone tracking adapt as you complete tasks.</p>
                        </div>
                    </div>
                </section>

                {/* Saved Roadmaps */}
                <section id="roadmaps" className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-20 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="font-display text-2xl font-bold text-text-primary">
                            Your Workspaces
                        </h2>
                        {mounted && roadmaps.length > 0 && (
                            <span className="text-sm font-medium text-text-muted bg-obsidian-surface px-3 py-1 rounded-full border border-border">
                                {roadmaps.length} Total
                            </span>
                        )}
                    </div>

                    {mounted && roadmaps.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {roadmaps.map((r, i) => {
                                const totalTasks = r.sections.find(s => s.type === 'tasks')?.data.reduce((acc: number, g: any) => acc + g.tasks.length, 0) || 0;
                                const completedTasks = r.sections.find(s => s.type === 'tasks')?.data.reduce((acc: number, g: any) => acc + g.tasks.filter((t: any) => t.completed).length, 0) || 0;
                                const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                                return (
                                    <Link
                                        href={`/workspace/${r.id}`}
                                        key={r.id}
                                        className="group block surface rounded-2xl p-6 shadow-lg hover:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.2)] transition-all duration-300 hover:-translate-y-1.5 border border-white/5 relative overflow-hidden animate-slide-up"
                                        style={{ animationDelay: `${i * 0.05}s` }}
                                    >
                                        {/* Glowing top border on hover */}
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="font-display font-bold text-lg text-text-primary line-clamp-2 pr-4 group-hover:text-indigo-300 transition-colors">
                                                {r.title}
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={(e) => handleDelete(r.id, e)}
                                                className="text-text-muted hover:text-red-400 p-1.5 rounded-lg hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                                aria-label="Delete workspace"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-obsidian text-xs font-medium text-text-secondary border border-white/5">
                                                {r.mode === 'intern' ? '🎓 Intern' : '📘 General'}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-obsidian text-xs font-medium text-text-secondary border border-white/5">
                                                📦 {r.sections.length} Sections
                                            </span>
                                        </div>

                                        <div className="space-y-2 mt-auto">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-text-muted font-medium">Progress</span>
                                                <span className="text-indigo-400 font-bold tabular-nums">{percent}%</span>
                                            </div>
                                            <div className="w-full h-1.5 rounded-full bg-obsidian overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-text-muted/60 pt-2 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                                                Last updated {new Intl.DateTimeFormat("en-US", { dateStyle: "short", timeStyle: "short" }).format(new Date(r.updatedAt))}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : mounted ? (
                        <div className="surface rounded-2xl p-12 text-center max-w-2xl mx-auto border border-dashed border-white/10 relative overflow-hidden group hover:border-indigo-500/30 transition-colors duration-300">
                            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <div className="w-20 h-20 mx-auto bg-obsidian rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-500">
                                    ✨
                                </div>
                                <h3 className="font-display text-xl font-bold text-text-primary mb-3">
                                    No workspaces yet
                                </h3>
                                <p className="text-text-secondary mb-8 max-w-md mx-auto leading-relaxed">
                                    Start your journey by pasting your first guide or roadmap. Watch it transform into an intelligent, interactive workspace.
                                </p>
                                <Link href="/create" className="btn btn-primary shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)]">
                                    Create First Workspace
                                </Link>
                            </div>
                        </div>
                    ) : null}
                </section>
            </main>

            <Footer />
        </div>
    );
}
