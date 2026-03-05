"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getStorage } from "@/lib/storage";
import type { Roadmap } from "@/types";
import { ArrowRight, Trash2, PlusCircle, LayoutGrid } from "lucide-react";

// Helper to get stats for the progress ring
function getWorkspaceStats(r: Roadmap) {
    let totalTasks = 0;
    let completedTasks = 0;

    r.sections.forEach((s) => {
        if (s.type === "tasks") {
            (s.data as any[]).forEach((g: any) => {
                totalTasks += (g.tasks || []).length;
                completedTasks += (g.tasks || []).filter((t: any) => t.completed).length;
            });
        }
        if (s.type === "module") {
            const mod = s.data as any;
            totalTasks += (mod.tasks || []).length;
            completedTasks += (mod.tasks || []).filter((t: any) => t.completed).length;
        }
    });

    const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { totalTasks, completedTasks, percent };
}

// Mini progress ring component
function MiniProgressRing({ percent, size = 40, strokeWidth = 3 }: { percent: number, size?: number, strokeWidth?: number }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    className="text-white/10"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className="text-indigo-500 transition-all duration-1000 ease-out"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-text-primary">{percent}%</span>
            </div>
        </div>
    );
}

export default function WorkspacesPage() {
    const [workspaces, setWorkspaces] = useState<Roadmap[]>([]);
    const [mounted, setMounted] = useState(false);

    const loadWorkspaces = () => {
        try {
            const raw = localStorage.getItem("zns_workspaces");
            if (raw) {
                setWorkspaces(JSON.parse(raw));
            } else {
                setWorkspaces([]);
            }
        } catch (e) {
            setWorkspaces([]);
        }
    };

    useEffect(() => {
        loadWorkspaces();
        setMounted(true);
    }, []);

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this workspace? This cannot be undone.")) {
            const updated = workspaces.filter(w => w.id !== id);
            localStorage.setItem("zns_workspaces", JSON.stringify(updated));
            setWorkspaces(updated);
        }
    };

    if (!mounted) return null; // avoid hydration mismatch

    return (
        <div className="min-h-screen flex flex-col bg-obsidian">
            <Header />

            <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-24">
                <div className="mb-10">
                    <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2 tracking-tight">Your Workspaces</h1>
                    <p className="text-text-secondary text-sm">Resume where you left off or create a new learning path.</p>
                </div>

                {workspaces.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-obsidian-surface/30 rounded-2xl border border-border border-dashed">
                        <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400">
                            <LayoutGrid size={32} />
                        </div>
                        <h2 className="text-xl font-display font-semibold text-white mb-2">No workspaces yet</h2>
                        <p className="text-text-secondary max-w-sm mb-8">
                            Generate your first roadmap to start organizing your learning journey.
                        </p>
                        <Link 
                            href="/create" 
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm uppercase tracking-widest transition-all"
                        >
                            <PlusCircle size={18} />
                            Generate First Roadmap
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workspaces.map((workspace) => {
                            const { totalTasks, completedTasks, percent } = getWorkspaceStats(workspace);
                            const formattedDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(workspace.createdAt || Date.now()));
                            
                            // Determine title from first heading if not explicitly set
                            let displayTitle = workspace.title;
                            if (!displayTitle || displayTitle === "Untitled Course") {
                                const lines = (workspace.rawContent || "").split("\n");
                                const firstHeading = lines.find(l => l.startsWith("#") || l.trim().length > 0);
                                if (firstHeading) {
                                    displayTitle = firstHeading.replace(/^#+\s*/, "").trim();
                                } else {
                                    displayTitle = "Untitled Workspace";
                                }
                            }

                            return (
                                <div 
                                    key={workspace.id} 
                                    className="flex flex-col bg-obsidian-surface border border-border hover:border-indigo-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(99,102,241,0.1)] group"
                                >
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="text-xl font-display font-semibold text-white line-clamp-2 leading-tight group-hover:text-indigo-300 transition-colors">
                                                {displayTitle}
                                            </h3>
                                            <button 
                                                onClick={() => handleDelete(workspace.id)}
                                                className="text-text-secondary hover:text-red-400 p-2 -mr-2 -mt-2 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete workspace"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4 mt-auto pt-6">
                                            <MiniProgressRing percent={percent} size={44} strokeWidth={4} />
                                            <div>
                                                <p className="text-sm font-medium text-white">{completedTasks} of {totalTasks} tasks complete</p>
                                                <p className="text-xs text-text-secondary">Created {formattedDate}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-border bg-obsidian-elevated/50 px-6 py-4">
                                        <Link 
                                            href={`/workspace/${workspace.id}`}
                                            className="flex items-center justify-between w-full text-sm font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors"
                                        >
                                            Continue Learning
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
