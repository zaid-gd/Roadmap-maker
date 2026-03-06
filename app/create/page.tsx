"use client";

import { useState, useRef, useCallback, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, Brain, Sparkles } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getStorage } from "@/lib/storage";
import { getUserConfig } from "@/lib/userConfig";
import type { Roadmap } from "@/types";

/* ═══════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════ */

const LOADING_MESSAGES = [
    "Reading your guide...",
    "Identifying key concepts...",
    "Structuring your modules...",
    "Building your workspace..."
];

const TIPS = [
    {
        icon: "🏷️",
        text: "Use headings like # Phase 1 or ## Week 1 to help the AI identify distinct sections.",
    },
    {
        icon: "🔗",
        text: "Include links to YouTube videos, docs, or articles — they'll be auto-detected as resources.",
    },
    {
        icon: "🎯",
        text: "Mention deliverables or goals like \"Build a portfolio\" for richer task generation.",
    },
    {
        icon: "📝",
        text: "Don't worry about perfect formatting — the AI handles bullet points, numbered lists, and paragraphs equally well.",
    },
];

const STEP_DELAY_MS = 600;

/* ═══════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════ */

export default function CreatePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-obsidian" />}>
            <CreatePageContent />
        </Suspense>
    );
}

function CreatePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // ── State ──
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [mode, setMode] = useState<"general" | "intern">("general");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [tipsOpen, setTipsOpen] = useState(false);
    const [textareaOverflow, setTextareaOverflow] = useState(false);
    const [showOptional, setShowOptional] = useState(false);
    const [goal, setGoal] = useState("");
    const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced" | null>(null);
    const [estimatedDuration, setEstimatedDuration] = useState("");

    // Pre-fill from URL query params (e.g. ?title=...&content=...)
    useEffect(() => {
        const qTitle = searchParams.get("title");
        const qContent = searchParams.get("content");
        if (qTitle) setTitle(qTitle);
        if (qContent) setContent(qContent);
    }, [searchParams]);

    // Loading-screen state
    const [loadingPhase, setLoadingPhase] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isDone, setIsDone] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);

    // For typewriter effect
    const [displayedText, setDisplayedText] = useState("");
    const typewriterRef = useRef<number | NodeJS.Timeout>(0);

    // ── Derived ──
    const wordCount = useMemo(() => (content.trim() ? content.trim().split(/\s+/).length : 0), [content]);
    const charCount = content.length;
    const hasContent = content.trim().length > 0;

    /* ── Check textarea overflow ── */
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        // Check if content overflows the bounded height
        setTextareaOverflow(el.scrollHeight > el.clientHeight);
    }, [content]);

    /* ── File processing (shared) ── */
    const processFile = useCallback(
        (file: File) => {
            if (!file.name.match(/\.(md|txt|markdown)$/i)) {
                setError("Only .md, .txt, and .markdown files are supported.");
                return;
            }
            setError("");
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
        },
        [title],
    );

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    /* ── Drag & Drop ── */
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) processFile(file);
        },
        [processFile],
    );

    /* ── Generate ── */
    const handleGenerate = async () => {
        if (!hasContent) {
            setError("Please paste or upload some content first.");
            return;
        }

        setError("");
        setIsLoading(true);
        setProgress(0);
        setLoadingPhase(0);
        setIsDone(false);
        setIsFadingOut(false);

        const startTime = Date.now();
        let interval: NodeJS.Timeout;

        interval = setInterval(() => {
            const elapsed = Date.now() - startTime;

            if (elapsed < 2000) setLoadingPhase(0);
            else if (elapsed < 4000) setLoadingPhase(1);
            else if (elapsed < 6000) setLoadingPhase(2);
            else setLoadingPhase(3);

            const newProgress = Math.min(90, (elapsed / 8000) * 90);
            setProgress(newProgress);
        }, 100);

        try {
            const userConfig = getUserConfig();
            const useCustomKey = Boolean(userConfig.useCustomKey && userConfig.apiKey);

            const res = await fetch("/api/parse-roadmap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: content.trim(),
                    mode,
                    title: title.trim() || undefined,
                    goal: goal || undefined,
                    difficulty: difficulty || undefined,
                    estimatedDuration: estimatedDuration || undefined,
                    userApiKey: useCustomKey ? userConfig.apiKey : undefined,
                    userProvider: useCustomKey ? userConfig.provider : undefined,
                    userModel: useCustomKey ? userConfig.model : undefined,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: "Failed to parse roadmap" }));
                throw new Error(err.message ?? err.error ?? "Something went wrong");
            }

            const data = await res.json();
            if (!data.success || !data.roadmap) throw new Error(data.error ?? "AI returned an invalid response");

            const roadmap: Roadmap = {
                ...data.roadmap,
                id: crypto.randomUUID(),
                rawContent: content.trim(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            getStorage().saveRoadmap(roadmap);

            clearInterval(interval);
            setProgress(100);
            setIsDone(true);

            setTimeout(() => {
                setIsFadingOut(true);
                setTimeout(() => {
                    router.push(`/workspace/${roadmap.id}`);
                }, 400);
            }, 600);
        } catch (err) {
            clearInterval(interval!);
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
            setIsLoading(false);
        }
    };

    /* ── Typewriter Effect ── */
    useEffect(() => {
        if (!isLoading) return;

        const currentMsg = LOADING_MESSAGES[loadingPhase] || LOADING_MESSAGES[LOADING_MESSAGES.length - 1];
        setDisplayedText("");

        let i = 0;
        clearInterval(typewriterRef.current as NodeJS.Timeout);

        typewriterRef.current = setInterval(() => {
            if (i < currentMsg.length) {
                setDisplayedText(currentMsg.substring(0, i + 1));
                i++;
            } else {
                clearInterval(typewriterRef.current as NodeJS.Timeout);
            }
        }, 30);

        return () => clearInterval(typewriterRef.current as NodeJS.Timeout);
    }, [loadingPhase, isLoading]);

    /* ═══════════════════════════════════════════════════════════
       LOADING SCREEN  — Full-page Notion-style progress
       ═══════════════════════════════════════════════════════════ */
    if (isLoading) {
        return (
            <div className={`create-loading-bg fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 bg-obsidian ${isFadingOut ? "opacity-0" : "opacity-100"}`}>
                <div className="relative z-10 w-full max-w-md mx-auto px-6 text-center flex flex-col items-center">

                    {/* Icon */}
                    <div className={`w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-8 transition-all duration-500 ${isDone ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 scale-110" : "text-indigo-400 animate-pulse shadow-[0_0_40px_rgba(99,102,241,0.2)]"}`}>
                        {isDone ? <Sparkles size={40} className="animate-in zoom-in" /> : <Brain size={40} />}
                    </div>

                    {/* Course title */}
                    {(title || "Untitled Course") && (
                        <p className="font-display text-sm text-text-secondary uppercase tracking-widest font-bold mb-4 animate-fade-in">
                            {title || "Untitled Course"}
                        </p>
                    )}

                    {/* Message */}
                    <div className="h-10 mb-8">
                        <h2 className="font-display text-2xl sm:text-3xl text-white tracking-tight">
                            {isDone ? "Workspace ready" : displayedText}<span className="animate-pulse">_</span>
                        </h2>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-[240px] h-1.5 bg-white/5 rounded-full overflow-hidden relative mb-3">
                        <div
                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ease-out ${isDone ? "bg-emerald-500" : "bg-indigo-500"}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="text-xs text-text-secondary font-mono">
                        {Math.round(progress)}%
                    </div>

                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════════════
       MAIN CREATE PAGE  — Notion-inspired single-column flow
       ═══════════════════════════════════════════════════════════ */
    return (
        <div className="min-h-screen flex flex-col bg-obsidian text-text-primary selection:bg-indigo-500/30 selection:text-indigo-200">
            <Header />

            <main className="flex-1 pt-20 pb-24 flex justify-center">
                <div className="w-full max-w-[720px] px-6 lg:px-4">

                    {/* ── Breadcrumb / context ── */}
                    <div className="animate-fade-in mb-16 pt-8">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-body text-sm text-text-secondary">ZNS Studio</span>
                            <span className="text-text-secondary/40">/</span>
                            <span className="font-body text-sm text-text-secondary">New Course</span>
                        </div>
                    </div>

                    {/* ════════════════════════════════════════
                       STEP 1 — Title
                       ════════════════════════════════════════ */}
                    <div className="mb-14 animate-slide-up">
                        <input
                            id="course-title"
                            type="text"
                            className="w-full bg-transparent border-none outline-none font-display text-4xl sm:text-5xl font-bold text-text-primary placeholder:text-text-secondary/25 leading-tight tracking-tight"
                            placeholder="Name your course…"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoComplete="off"
                            spellCheck={false}
                        />
                        <p className="font-body text-sm text-text-secondary/60 mt-3 ml-0.5">
                            Leave blank and AI will generate a title from your content
                        </p>
                    </div>

                    {/* ════════════════════════════════════════
                       STEP 2 — Content (Drop zone + Textarea)
                       ════════════════════════════════════════ */}
                    <div className="mb-14 animate-slide-up stagger-2">
                        {/* Drop zone */}
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-10 text-center transition-all duration-300 cursor-pointer group/drop ${isDragging
                                ? "border-indigo-400 bg-indigo-500/8 scale-[1.01]"
                                : "border-border-subtle hover:border-white/20 bg-obsidian-surface/30 hover:bg-obsidian-surface/50"
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            role="button"
                            tabIndex={0}
                            aria-label="Drop zone for file upload"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".md,.txt,.markdown"
                                className="hidden"
                                onChange={handleFileUpload}
                                tabIndex={-1}
                                aria-hidden="true"
                            />

                            {/* Icon */}
                            <div className={`mx-auto w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${isDragging ? "bg-indigo-500/15" : "bg-white/5 group-hover/drop:bg-white/8"}`}>
                                <svg className={`w-7 h-7 transition-colors ${isDragging ? "text-indigo-400" : "text-text-secondary/50 group-hover/drop:text-text-secondary"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                            </div>

                            <p className={`font-body text-sm font-medium mb-1 transition-colors ${isDragging ? "text-indigo-300" : "text-text-secondary"}`}>
                                {isDragging ? "Drop your file here" : "Drop your .md or .txt file here"}
                            </p>
                            <p className="font-body text-sm text-text-secondary/50">
                                or click to browse
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-white/8" />
                            <span className="font-body text-[12px] text-text-secondary/40 uppercase tracking-wider shrink-0">
                                or paste your content below
                            </span>
                            <div className="flex-1 h-px bg-white/8" />
                        </div>

                        {/* Textarea — bounded at 280px max */}
                        <div className="relative">
                            <textarea
                                ref={textareaRef}
                                id="course-content"
                                className="w-full bg-transparent border-none outline-none resize-none font-body text-[15px] text-text-primary/90 leading-relaxed placeholder:text-text-secondary/25 min-h-[200px] max-h-[280px] overflow-y-auto"
                                placeholder="Paste any AI-generated guide, roadmap, curriculum, or research notes here…"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                spellCheck={false}
                            />
                            {/* Scroll-to-read fade indicator */}
                            {textareaOverflow && (
                                <div className="absolute bottom-0 left-0 right-2 h-10 bg-gradient-to-t from-obsidian to-transparent pointer-events-none flex items-end justify-center pb-1">
                                    <span className="font-body text-[12px] text-text-secondary/50 uppercase tracking-wider pointer-events-none select-none">
                                        ↓ Scroll to read more
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Word / char counter */}
                        <div className="flex justify-end gap-4 mt-2">
                            <span className="font-body text-[12px] text-text-secondary/40 tabular-nums">
                                {wordCount.toLocaleString()} word{wordCount !== 1 ? "s" : ""}
                            </span>
                            <span className="font-body text-[12px] text-text-secondary/40 tabular-nums">
                                {charCount.toLocaleString()} character{charCount !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>

                    {/* ════════════════════════════════════════
                       STEP 3 — Mode Selector (two illustrated cards)
                       ════════════════════════════════════════ */}
                    <div className="mb-14 animate-slide-up stagger-3">
                        <p className="font-body text-sm text-text-secondary/60 mb-4 ml-0.5">
                            Choose a mode
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* General Card */}
                            <button
                                type="button"
                                id="mode-general"
                                onClick={() => setMode("general")}
                                className={`relative text-left rounded-xl p-6 transition-all duration-300 overflow-hidden group/card ${mode === "general"
                                    ? "bg-indigo-500/8 border-2 border-indigo-500/60 shadow-[0_0_24px_rgba(245,158,11,0.08)] create-mode-selected"
                                    : "bg-obsidian-surface/40 border-2 border-white/6 hover:border-white/15 hover:bg-obsidian-surface/60 opacity-60 hover:opacity-80"
                                    }`}
                            >
                                {/* Illustration / Icon */}
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 ${mode === "general"
                                    ? "bg-indigo-500/15 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
                                    : "bg-white/5 group-hover/card:bg-white/8"
                                    }`}>
                                    <svg className={`w-6 h-6 transition-colors duration-300 ${mode === "general" ? "text-indigo-400" : "text-text-secondary/60"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                    </svg>
                                </div>

                                <h3 className={`font-sans-display text-base font-bold mb-1 transition-colors ${mode === "general" ? "text-text-primary" : "text-text-secondary"}`}>
                                    General
                                </h3>
                                <p className={`font-body text-sm leading-relaxed transition-colors ${mode === "general" ? "text-text-secondary" : "text-text-secondary/60"}`}>
                                    Self-paced learning for anyone studying independently on their own schedule.
                                </p>

                                {/* Selected indicator dot */}
                                {mode === "general" && (
                                    <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                                )}

                                {/* Subtle corner illustration */}
                                <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full transition-opacity duration-300 ${mode === "general" ? "opacity-8" : "opacity-0"}`} style={{ background: "radial-gradient(circle, var(--color-indigo-500) 0%, transparent 70%)" }} />
                            </button>

                            {/* Intern Card */}
                            <button
                                type="button"
                                id="mode-intern"
                                onClick={() => setMode("intern")}
                                className={`relative text-left rounded-xl p-6 transition-all duration-300 overflow-hidden group/card ${mode === "intern"
                                    ? "bg-indigo-500/8 border-2 border-indigo-500/60 shadow-[0_0_24px_rgba(245,158,11,0.08)] create-mode-selected"
                                    : "bg-obsidian-surface/40 border-2 border-white/6 hover:border-white/15 hover:bg-obsidian-surface/60 opacity-60 hover:opacity-80"
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 ${mode === "intern"
                                    ? "bg-indigo-500/15 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
                                    : "bg-white/5 group-hover/card:bg-white/8"
                                    }`}>
                                    <svg className={`w-6 h-6 transition-colors duration-300 ${mode === "intern" ? "text-indigo-400" : "text-text-secondary/60"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                                    </svg>
                                </div>

                                <h3 className={`font-sans-display text-base font-bold mb-1 transition-colors ${mode === "intern" ? "text-text-primary" : "text-text-secondary"}`}>
                                    Intern
                                </h3>
                                <p className={`font-body text-sm leading-relaxed transition-colors ${mode === "intern" ? "text-text-secondary" : "text-text-secondary/60"}`}>
                                    Structured training with deliverables and strict curriculum tracking.
                                </p>

                                {mode === "intern" && (
                                    <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                                )}

                                <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full transition-opacity duration-300 ${mode === "intern" ? "opacity-8" : "opacity-0"}`} style={{ background: "radial-gradient(circle, var(--color-indigo-500) 0%, transparent 70%)" }} />
                            </button>
                        </div>
                    </div>

                    {/* Optional Details Collapsible */}
                    <div className="mb-8 animate-slide-up stagger-3">
                        <button
                            type="button"
                            onClick={() => setShowOptional(!showOptional)}
                            className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm font-medium"
                        >
                            {showOptional ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            Optional Details
                        </button>

                        {showOptional && (
                            <div className="mt-4 p-6 bg-obsidian-surface/30 border border-border rounded-xl space-y-6 animate-fade-in">
                                {/* Goal */}
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-text-secondary font-bold">What do you want to achieve?</label>
                                    <input
                                        type="text"
                                        value={goal}
                                        onChange={(e) => setGoal(e.target.value)}
                                        placeholder="e.g., Learn React, Build a portfolio"
                                        className="w-full bg-obsidian border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    />
                                </div>

                                {/* Difficulty */}
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-text-secondary font-bold">Difficulty Level</label>
                                    <div className="flex gap-2">
                                        {(['beginner', 'intermediate', 'advanced'] as const).map((d) => (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => setDifficulty(difficulty === d ? null : d)}
                                                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium capitalize transition-all ${difficulty === d
                                                        ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                                                        : "bg-obsidian border-border text-text-secondary hover:border-white/20"
                                                    }`}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Estimated Duration */}
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-text-secondary font-bold">Estimated Duration</label>
                                    <input
                                        type="text"
                                        value={estimatedDuration}
                                        onChange={(e) => setEstimatedDuration(e.target.value)}
                                        placeholder="e.g., 2 weeks, 10 hours"
                                        className="w-full bg-obsidian border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ════════════════════════════════════════
                       STEP 4 — Tips (Notion toggle block)
                       ════════════════════════════════════════ */}
                    <div className="mb-14 animate-slide-up stagger-4">
                        <button
                            type="button"
                            id="tips-toggle"
                            className="flex items-center gap-3 py-2 group/toggle w-full text-left"
                            onClick={() => setTipsOpen(!tipsOpen)}
                            aria-expanded={tipsOpen}
                        >
                            {/* Toggle triangle */}
                            <svg
                                className={`w-3.5 h-3.5 text-text-secondary/50 transition-transform duration-200 ${tipsOpen ? "rotate-90" : ""}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M6.5 4L14 10l-7.5 6V4z" />
                            </svg>
                            <span className="font-body text-sm text-text-secondary group-hover/toggle:text-text-primary transition-colors">
                                💡 Tips for better results
                            </span>
                        </button>

                        <div className={`overflow-hidden transition-all duration-400 ease-out ${tipsOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                            <div className="pl-7 pt-2 space-y-3">
                                {TIPS.map((tip, i) => (
                                    <div key={i} className="flex items-start gap-3 py-1.5">
                                        <span className="text-base shrink-0 mt-0.5">{tip.icon}</span>
                                        <p className="font-body text-sm text-text-secondary leading-relaxed">
                                            {tip.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Error ── */}
                    {error && (
                        <div className="mb-8 p-4 rounded-lg bg-red-500/8 border border-red-500/20 animate-scale-in">
                            <p className="font-body text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {/* ════════════════════════════════════════
                       STEP 5 — Generate Button
                       ════════════════════════════════════════ */}
                    <div className="animate-slide-up stagger-5">
                        <button
                            type="button"
                            id="generate-button"
                            disabled={!hasContent}
                            onClick={handleGenerate}
                            className={`relative w-full py-5 rounded-xl font-body text-base font-semibold tracking-wide transition-all duration-500 overflow-hidden ${hasContent
                                ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 text-obsidian hover:brightness-110 cursor-pointer create-btn-glow"
                                : "bg-white/5 text-text-secondary/30 cursor-not-allowed"
                                }`}
                        >
                            {/* Shimmer overlay when active */}
                            {hasContent && (
                                <div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        background: "linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)",
                                        backgroundSize: "200% 100%",
                                        animation: "shimmer 3s ease-in-out infinite",
                                    }}
                                />
                            )}
                            <span className="relative z-10">✨ Generate My Course</span>
                        </button>
                    </div>

                    {/* Bottom spacer */}
                    <div className="h-8" />
                </div>
            </main>

            <Footer />
        </div>
    );
}
