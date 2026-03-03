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
        <div className="min-h-screen flex flex-col bg-obsidian text-text-primary selection:bg-indigo-500/30 selection:text-indigo-200">
            <Header />

            <main className="flex-1 pt-14 flex justify-center selection:bg-indigo-500/40">
                <div className="w-full max-w-4xl px-6 lg:px-12 py-16 sm:py-24">
                    <div className="animate-slide-up mb-12 border-b border-white/5 pb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="h-[1px] w-8 bg-indigo-500"></span>
                            <span className="font-sans-display text-xs uppercase tracking-[0.2em] text-indigo-400 font-bold">
                                Initialization
                            </span>
                        </div>
                        <h1 className="font-display font-light text-5xl sm:text-6xl tracking-tight leading-[0.95] text-balance mb-4">
                            Construct <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-600">Workspace</span>
                        </h1>
                        <p className="font-body text-text-secondary text-lg max-w-lg leading-relaxed text-balance">
                            Supply structureless curriculum data. The AI architect will compile a fully intractable web experience.
                        </p>
                    </div>

                    <div className="space-y-10 animate-slide-up stagger-2 relative">
                        {/* Title */}
                        <div className="relative group">
                            <label htmlFor="roadmap-title" className="block font-sans-display text-xs uppercase tracking-[0.15em] text-text-secondary mb-3">
                                Designation <span className="text-text-muted/50 ml-2">(Optional)</span>
                            </label>
                            <input
                                id="roadmap-title"
                                name="title"
                                type="text"
                                className="w-full bg-obsidian-surface border-0 border-b border-white/10 px-0 py-3 font-display text-2xl text-text-primary placeholder:text-text-muted/30 focus:border-indigo-500 focus:ring-0 transition-colors bg-transparent rounded-none"
                                placeholder="E.g. Advanced System Architecture..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                autoComplete="off"
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-3 gap-4">
                                <label htmlFor="roadmap-content" className="block font-sans-display text-xs uppercase tracking-[0.15em] text-text-secondary">
                                    Raw Curriculum Source
                                </label>
                                <button
                                    type="button"
                                    className="font-sans-display text-[10px] uppercase tracking-widest text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/80 px-4 py-1.5 transition-colors bg-indigo-500/5 hover:bg-indigo-500/10"
                                    onClick={() => fileInputRef.current?.click()}
                                    aria-label="Upload a file"
                                >
                                    + Ingest Document
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".md,.txt,.markdown"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    tabIndex={-1}
                                    aria-hidden="true"
                                />
                            </div>
                            <div className="relative group">
                                <textarea
                                    id="roadmap-content"
                                    name="content"
                                    className="w-full bg-obsidian-elevated/40 border border-white/5 p-6 min-h-[400px] resize-y font-mono text-sm leading-relaxed text-text-primary placeholder:text-text-muted/30 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all rounded-none"
                                    placeholder="Paste your unformatted roadmap, guide, or curriculum here...

Example:
# Phase 1: Foundations
- Learn basic concepts
- Watch: https://youtube.com/...
- Read: https://docs.example.com/...

# Phase 2: Operations
..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    spellCheck={false}
                                />
                                {/* Scanning line effect on focus */}
                                <div className="absolute top-0 left-0 w-[2px] h-0 bg-indigo-500 transition-all duration-500 group-focus-within:h-full" />
                            </div>
                            {content ? (
                                <p className="text-text-muted/50 font-sans-display text-[10px] uppercase tracking-widest mt-3 flex justify-end gap-4">
                                    <span>{content.length.toLocaleString()} BYTES</span>
                                    <span>{content.split("\n").length} LINES</span>
                                </p>
                            ) : null}
                        </div>

                        {/* Mode Toggle */}
                        <div className="pt-4 border-t border-white/5">
                            <label className="block font-sans-display text-xs uppercase tracking-[0.15em] text-text-secondary mb-4">
                                Operation Mode
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    className={`relative p-6 border text-left transition-all duration-300 flex flex-col h-full ${mode === "general"
                                            ? "border-indigo-500 bg-indigo-500/5"
                                            : "border-white/5 bg-obsidian-surface hover:border-white/20"
                                        }`}
                                    onClick={() => setMode("general")}
                                >
                                    {mode === "general" && <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500" />}
                                    <div className="font-sans-display text-sm tracking-widest uppercase font-bold mb-2 flex justify-between items-center text-text-primary">
                                        Standard Issue
                                        {mode === "general" && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                                    </div>
                                    <p className="font-body text-text-muted text-sm leading-relaxed max-w-[90%]">
                                        Self-paced study interface optimized for individual acquisition and reference.
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    className={`relative p-6 border text-left transition-all duration-300 flex flex-col h-full ${mode === "intern"
                                            ? "border-indigo-500 bg-indigo-500/5"
                                            : "border-white/5 bg-obsidian-surface hover:border-white/20"
                                        }`}
                                    onClick={() => setMode("intern")}
                                >
                                    {mode === "intern" && <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500" />}
                                    <div className="font-sans-display text-sm tracking-widest uppercase font-bold mb-2 flex justify-between items-center text-text-primary">
                                        Intern Protocol
                                        {mode === "intern" && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                                    </div>
                                    <p className="font-body text-text-muted text-sm leading-relaxed max-w-[90%]">
                                        Strict curriculum tracking including deliverables intended for training programs.
                                    </p>
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error ? (
                            <div className="p-4 bg-red-500/5 border-l-2 border-red-500 font-sans-display text-xs uppercase tracking-widest text-red-400 animate-scale-in">
                                ERR: {error}
                            </div>
                        ) : null}

                        {/* Generate Button */}
                        <div className="pt-8">
                            <button
                                type="button"
                                className={`group relative w-full overflow-hidden flex items-center justify-between px-8 py-6 transition-all duration-500 ${content.trim()
                                        ? "bg-text-primary text-obsidian hover:bg-indigo-500 hover:text-white cursor-pointer"
                                        : "bg-white/5 text-text-muted/50 cursor-not-allowed"
                                    }`}
                                onClick={handleGenerate}
                                disabled={!content.trim()}
                            >
                                <span className="font-sans-display text-sm uppercase tracking-[0.2em] font-bold relative z-10 transition-colors">
                                    {isLoading ? "Compiling..." : "Initialize Architecture"}
                                </span>
                                <span className={`text-xl leading-none relative z-10 font-bold transition-all duration-300 ${content.trim() ? "group-hover:translate-x-2" : ""}`}>
                                    →
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
