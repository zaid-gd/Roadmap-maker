"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoadingExperience from "@/components/layout/LoadingExperience";
import { getStorage } from "@/lib/storage";
import type { Roadmap } from "@/types";

export default function CreatePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [mode, setMode] = useState<"general" | "intern">("general");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            setContent(text);
            if (!title) {
                // Infer title from first heading or filename
                const firstLine = text.split("\n").find((l) => l.trim().length > 0);
                const inferred = firstLine?.replace(/^#+\s*/, "").trim() ?? file.name.replace(/\.\w+$/, "");
                setTitle(inferred);
            }
        };
        reader.readAsText(file);
    };

    const handleGenerate = async () => {
        if (!content.trim()) {
            setError("Please paste or upload some content first.");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/parse-roadmap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: content.trim(), mode, title: title.trim() || undefined }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: "Failed to parse roadmap" }));
                throw new Error(err.error ?? "Something went wrong");
            }

            const data = await res.json();

            if (!data.success || !data.roadmap) {
                throw new Error(data.error ?? "AI returned an invalid response");
            }

            const roadmap: Roadmap = {
                ...data.roadmap,
                id: crypto.randomUUID(),
                rawContent: content.trim(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            getStorage().saveRoadmap(roadmap);
            router.push(`/workspace/${roadmap.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <LoadingExperience />;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-14">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
                    <div className="animate-slide-up">
                        <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
                            Create Your Workspace
                        </h1>
                        <p className="text-text-secondary mb-8">
                            Paste a roadmap, guide, curriculum, or workflow—the AI will build your interactive workspace.
                        </p>
                    </div>

                    <div className="space-y-6 animate-slide-up stagger-2">
                        {/* Title */}
                        <div>
                            <label htmlFor="roadmap-title" className="block text-sm font-medium text-text-secondary mb-1.5">
                                Title <span className="text-text-muted">(optional — AI will infer…)</span>
                            </label>
                            <input
                                id="roadmap-title"
                                type="text"
                                className="input"
                                placeholder="e.g. DaVinci Resolve Mastery Roadmap…"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                autoComplete="off"
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="roadmap-content" className="block text-sm font-medium text-text-secondary">
                                    Content
                                </label>
                                <button
                                    type="button"
                                    className="btn btn-ghost text-xs py-1 px-2"
                                    onClick={() => fileInputRef.current?.click()}
                                    aria-label="Upload a file"
                                >
                                    📎 Upload .md / .txt
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".md,.txt,.markdown"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    aria-hidden="true"
                                />
                            </div>
                            <textarea
                                id="roadmap-content"
                                className="input min-h-[280px] resize-y font-mono text-sm leading-relaxed"
                                placeholder="Paste your roadmap, guide, or curriculum here…

Example:
# Phase 1: Foundations
- Learn basic editing concepts
- Watch: https://youtube.com/...
- Read: https://docs.example.com/...

# Phase 2: Intermediate
- Color correction fundamentals
..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                spellCheck={false}
                            />
                            {content ? (
                                <p className="text-text-muted text-xs mt-1 tabular-nums">
                                    {content.length.toLocaleString()} characters · {content.split("\n").length} lines
                                </p>
                            ) : null}
                        </div>

                        {/* Mode Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Mode
                            </label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    className={`flex-1 p-4 rounded-xl border text-left transition-all duration-200 ${mode === "general"
                                            ? "border-indigo-accent bg-obsidian-elevated glow-indigo"
                                            : "border-border bg-obsidian-surface hover:border-obsidian-hover"
                                        }`}
                                    onClick={() => setMode("general")}
                                >
                                    <div className="font-display font-bold text-sm mb-1">📘 General</div>
                                    <p className="text-text-muted text-xs">
                                        Standard workspace for learning, reference, and self-paced study.
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    className={`flex-1 p-4 rounded-xl border text-left transition-all duration-200 ${mode === "intern"
                                            ? "border-indigo-accent bg-obsidian-elevated glow-indigo"
                                            : "border-border bg-obsidian-surface hover:border-obsidian-hover"
                                        }`}
                                    onClick={() => setMode("intern")}
                                >
                                    <div className="font-display font-bold text-sm mb-1">🎓 Intern</div>
                                    <p className="text-text-muted text-xs">
                                        Includes submissions & review features for training programs.
                                    </p>
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error ? (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-error text-sm animate-scale-in">
                                {error}
                            </div>
                        ) : null}

                        {/* Generate Button */}
                        <button
                            type="button"
                            className="btn btn-primary w-full text-base py-3.5"
                            onClick={handleGenerate}
                            disabled={!content.trim()}
                        >
                            Generate Workspace ✨
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
