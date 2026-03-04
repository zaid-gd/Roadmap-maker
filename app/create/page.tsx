"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getStorage } from "@/lib/storage";
import type { Roadmap } from "@/types";

/* ─── Loading Steps ─── */
const LOADING_STEPS = [
    { text: "Reading your content…", icon: "📖", duration: 2200 },
    { text: "Identifying sections & topics…", icon: "🔍", duration: 2600 },
    { text: "Detecting videos & resources…", icon: "🎥", duration: 2000 },
    { text: "Building your workspace…", icon: "🏗️", duration: 2800 },
    { text: "Applying finishing touches…", icon: "✨", duration: 1800 },
];

/* ─── Tips Data ─── */
const TIPS = [
    {
        icon: "📋",
        title: "Use clear headings",
        body: "Structure content with # headings or numbered sections so the AI can identify phases and topics.",
    },
    {
        icon: "🔗",
        title: "Include resource links",
        body: "Paste YouTube URLs, article links, and documentation — they'll be auto-detected as resources.",
    },
    {
        icon: "📝",
        title: "Add descriptions",
        body: "Brief descriptions under each section help the AI generate richer workspace cards.",
    },
    {
        icon: "🎯",
        title: "Be specific with goals",
        body: 'Mention deliverables or objectives like "Build a portfolio project" for better task generation.',
    },
    {
        icon: "📐",
        title: "Don't worry about formatting",
        body: "The AI handles messy text well — bullet points, numbered lists, or plain paragraphs all work.",
    },
];

/* ─── Preview sections mock ─── */
function getPreviewSections(content: string) {
    if (!content.trim()) return [];
    const lines = content.split("\n").filter((l) => l.trim());
    const sections: { title: string; lines: number }[] = [];
    let currentSection = "";
    let lineCount = 0;

    for (const line of lines) {
        const heading = line.match(/^#{1,3}\s+(.+)/);
        const numberedHeading = line.match(/^(?:Phase|Step|Part|Module|Section|Week|Day)\s*\d+[:\s\-–—]+(.+)/i);
        if (heading || numberedHeading) {
            if (currentSection) sections.push({ title: currentSection, lines: lineCount });
            currentSection = (heading?.[1] || numberedHeading?.[1] || "").trim();
            lineCount = 0;
        } else {
            lineCount++;
            if (!currentSection) {
                currentSection = line.trim().slice(0, 40) + (line.trim().length > 40 ? "…" : "");
            }
        }
    }
    if (currentSection) sections.push({ title: currentSection, lines: lineCount });
    return sections.slice(0, 8);
}

export default function CreatePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [mode, setMode] = useState<"general" | "intern">("general");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [tipsOpen, setTipsOpen] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [loadingProgress, setLoadingProgress] = useState(0);

    /* ─── Word / Char counter ─── */
    const stats = useMemo(() => {
        const chars = content.length;
        const words = content.trim() ? content.trim().split(/\s+/).length : 0;
        const lines = content ? content.split("\n").length : 0;
        return { chars, words, lines };
    }, [content]);

    /* ─── Live preview sections ─── */
    const previewSections = useMemo(() => getPreviewSections(content), [content]);

    /* ─── File handling (shared between input and drag-drop) ─── */
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
        [title]
    );

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    /* ─── Drag & drop ─── */
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
        [processFile]
    );

    /* ─── Generate ─── */
    const handleGenerate = async () => {
        if (!content.trim()) {
            setError("Please paste or upload some content first.");
            return;
        }

        setError("");
        setIsLoading(true);
        setLoadingStep(0);
        setLoadingProgress(0);

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
            setLoadingStep(0);
            setLoadingProgress(0);
        }
    };

    /* ─── Loading animation progression ─── */
    useEffect(() => {
        if (!isLoading) return;

        const totalDuration = LOADING_STEPS.reduce((a, s) => a + s.duration, 0);
        let elapsed = 0;
        const intervalMs = 50;

        const interval = setInterval(() => {
            elapsed += intervalMs;
            const progress = Math.min((elapsed / totalDuration) * 100, 98);
            setLoadingProgress(progress);

            // Determine which step we're on
            let acc = 0;
            for (let i = 0; i < LOADING_STEPS.length; i++) {
                acc += LOADING_STEPS[i].duration;
                if (elapsed < acc) {
                    setLoadingStep(i);
                    break;
                }
                if (i === LOADING_STEPS.length - 1) setLoadingStep(i);
            }
        }, intervalMs);

        return () => clearInterval(interval);
    }, [isLoading]);

    /* ═══════════════════════════════════════════════════════════
       LOADING SCREEN
       ═══════════════════════════════════════════════════════════ */
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 bg-obsidian flex items-center justify-center overflow-hidden">
                {/* Background radial glow */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(245,158,11,0.12) 0%, transparent 70%)",
                    }}
                />

                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 rounded-full bg-indigo-500/40"
                            style={{
                                left: `${10 + Math.random() * 80}%`,
                                top: `${10 + Math.random() * 80}%`,
                                animation: `loading-float ${3 + Math.random() * 4}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 3}s`,
                            }}
                        />
                    ))}
                </div>

                <div className="relative z-10 text-center max-w-lg mx-auto px-6 w-full">
                    {/* Pulsing icon */}
                    <div className="mb-10 inline-flex items-center justify-center">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center animate-pulse-glow">
                                <span className="text-4xl">{LOADING_STEPS[loadingStep]?.icon ?? "⚡"}</span>
                            </div>
                            <div
                                className="absolute -inset-3 rounded-3xl border border-indigo-500/20"
                                style={{ animation: "loading-ring-pulse 2s ease-in-out infinite" }}
                            />
                        </div>
                    </div>

                    <h2 className="font-display text-3xl font-bold text-text-primary mb-2 tracking-tight">
                        Generating Your Workspace
                    </h2>
                    <p className="text-text-secondary text-sm mb-10 font-body">
                        The AI is analyzing your content and building something great…
                    </p>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-white/5 rounded-full mb-8 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-300 ease-out"
                            style={{
                                width: `${loadingProgress}%`,
                                background: "linear-gradient(90deg, var(--color-indigo-600), var(--color-indigo-400))",
                                boxShadow: "0 0 20px rgba(245,158,11,0.4)",
                            }}
                        />
                    </div>

                    {/* Steps */}
                    <div className="space-y-2 text-left">
                        {LOADING_STEPS.map((step, i) => (
                            <div
                                key={i}
                                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-500 ${i < loadingStep
                                        ? "opacity-50"
                                        : i === loadingStep
                                            ? "glass border-glow"
                                            : "opacity-15"
                                    }`}
                            >
                                <span className="text-lg shrink-0 w-8 text-center">{step.icon}</span>
                                <span
                                    className={`text-sm font-body flex-1 ${i === loadingStep ? "text-text-primary font-medium" : "text-text-secondary"
                                        }`}
                                >
                                    {step.text}
                                </span>
                                {i < loadingStep ? (
                                    <span className="text-emerald-400 text-xs font-bold tracking-wider">✓ DONE</span>
                                ) : i === loadingStep ? (
                                    <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                                ) : null}
                            </div>
                        ))}
                    </div>

                    {/* Percentage */}
                    <p className="mt-6 font-sans-display text-xs tracking-[0.2em] text-text-muted tabular-nums">
                        {Math.round(loadingProgress)}% COMPLETE
                    </p>
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════════════
       MAIN CREATE PAGE
       ═══════════════════════════════════════════════════════════ */
    return (
        <div className="min-h-screen flex flex-col bg-obsidian text-text-primary selection:bg-indigo-500/30 selection:text-indigo-200">
            <Header />

            <main className="flex-1 pt-20 pb-16">
                <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
                    {/* ─── Page Header ─── */}
                    <div className="animate-slide-up mb-12">
                        <div className="flex items-center gap-3 mb-5">
                            <span className="h-[1px] w-8 bg-indigo-500" />
                            <span className="font-sans-display text-xs uppercase tracking-[0.2em] text-indigo-400 font-bold">
                                New Workspace
                            </span>
                        </div>
                        <h1 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[0.95] text-balance mb-3">
                            Construct{" "}
                            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500">
                                Workspace
                            </span>
                        </h1>
                        <p className="font-body text-text-secondary text-base sm:text-lg max-w-xl leading-relaxed">
                            Paste or upload your roadmap content. The AI architect will transform it into a fully
                            interactive workspace.
                        </p>
                    </div>

                    {/* ─── Two-Column Layout ─── */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-8 lg:gap-12 animate-slide-up stagger-2">
                        {/* ═══ LEFT COLUMN — Input Area ═══ */}
                        <div className="space-y-8">
                            {/* Title Input */}
                            <div className="relative group">
                                <label
                                    htmlFor="roadmap-title"
                                    className="block font-sans-display text-xs uppercase tracking-[0.15em] text-text-secondary mb-3"
                                >
                                    Workspace Title{" "}
                                    <span className="text-text-muted/50 ml-1">(Optional)</span>
                                </label>
                                <input
                                    id="roadmap-title"
                                    name="title"
                                    type="text"
                                    className="w-full bg-transparent border-0 border-b border-white/10 px-0 py-3 font-display text-2xl text-text-primary placeholder:text-text-muted/30 focus:border-indigo-500 focus:ring-0 transition-colors rounded-none"
                                    placeholder="E.g. Advanced System Architecture…"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    autoComplete="off"
                                />
                            </div>

                            {/* Drag & Drop + Textarea */}
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-3 gap-4">
                                    <label
                                        htmlFor="roadmap-content"
                                        className="block font-sans-display text-xs uppercase tracking-[0.15em] text-text-secondary"
                                    >
                                        Raw Content Source
                                    </label>
                                    <button
                                        type="button"
                                        className="font-sans-display text-[10px] uppercase tracking-widest text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/80 px-4 py-1.5 transition-colors bg-indigo-500/5 hover:bg-indigo-500/10"
                                        onClick={() => fileInputRef.current?.click()}
                                        aria-label="Upload a file"
                                    >
                                        + Upload File
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

                                {/* Drop Zone Wrapper */}
                                <div
                                    className={`relative group transition-all duration-300 ${isDragging ? "create-drop-active" : ""
                                        }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    {/* Drop overlay */}
                                    {isDragging && (
                                        <div className="absolute inset-0 z-20 rounded-sm border-2 border-dashed border-indigo-400 bg-indigo-500/10 flex items-center justify-center backdrop-blur-sm pointer-events-none">
                                            <div className="text-center">
                                                <div className="text-4xl mb-3 animate-bounce">📄</div>
                                                <p className="font-sans-display text-sm uppercase tracking-widest text-indigo-300 font-bold">
                                                    Drop your file here
                                                </p>
                                                <p className="font-body text-xs text-text-muted mt-1">
                                                    .md, .txt, .markdown
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <textarea
                                        ref={textareaRef}
                                        id="roadmap-content"
                                        name="content"
                                        className="w-full bg-obsidian-elevated/40 border border-white/5 p-6 min-h-[360px] resize-y font-mono text-sm leading-relaxed text-text-primary placeholder:text-text-muted/30 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all rounded-none"
                                        placeholder={`Paste your roadmap, guide, or curriculum here…\n\nOr drag & drop a .md / .txt file into this area.\n\nExample:\n# Phase 1: Foundations\n- Learn basic concepts\n- Watch: https://youtube.com/...\n- Read: https://docs.example.com/...\n\n# Phase 2: Operations\n...`}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        spellCheck={false}
                                    />

                                    {/* Scanning line */}
                                    <div className="absolute top-0 left-0 w-[2px] h-0 bg-indigo-500 transition-all duration-500 group-focus-within:h-full" />
                                </div>

                                {/* Stats bar */}
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex gap-4">
                                        {content && (
                                            <>
                                                <span className="font-sans-display text-[10px] uppercase tracking-widest text-text-muted/60 tabular-nums">
                                                    {stats.words.toLocaleString()} words
                                                </span>
                                                <span className="font-sans-display text-[10px] uppercase tracking-widest text-text-muted/60 tabular-nums">
                                                    {stats.chars.toLocaleString()} chars
                                                </span>
                                                <span className="font-sans-display text-[10px] uppercase tracking-widest text-text-muted/60 tabular-nums">
                                                    {stats.lines} lines
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    {!content && (
                                        <p className="font-body text-xs text-text-muted/40 italic">
                                            Drag & drop .md or .txt files here
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* ─── Mode Selector Cards ─── */}
                            <div className="pt-2">
                                <label className="block font-sans-display text-xs uppercase tracking-[0.15em] text-text-secondary mb-4">
                                    Choose Mode
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* General Mode Card */}
                                    <button
                                        type="button"
                                        className={`relative p-6 border text-left transition-all duration-300 flex flex-col h-full group/card overflow-hidden ${mode === "general"
                                                ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_30px_rgba(245,158,11,0.08)]"
                                                : "border-white/5 bg-obsidian-surface hover:border-white/20 hover:bg-obsidian-elevated/60"
                                            }`}
                                        onClick={() => setMode("general")}
                                    >
                                        {mode === "general" && (
                                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-600 to-indigo-400" />
                                        )}

                                        {/* Icon */}
                                        <div
                                            className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${mode === "general"
                                                    ? "bg-indigo-500/15 text-indigo-400"
                                                    : "bg-white/5 text-text-muted group-hover/card:text-text-secondary"
                                                }`}
                                        >
                                            <svg
                                                className="w-6 h-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                                                />
                                            </svg>
                                        </div>

                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-sans-display text-sm tracking-widest uppercase font-bold text-text-primary">
                                                General
                                            </span>
                                            {mode === "general" && (
                                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                            )}
                                        </div>
                                        <p className="font-body text-text-muted text-sm leading-relaxed">
                                            Self-paced study — for anyone learning independently with their own
                                            schedule.
                                        </p>
                                    </button>

                                    {/* Intern Mode Card */}
                                    <button
                                        type="button"
                                        className={`relative p-6 border text-left transition-all duration-300 flex flex-col h-full group/card overflow-hidden ${mode === "intern"
                                                ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_30px_rgba(245,158,11,0.08)]"
                                                : "border-white/5 bg-obsidian-surface hover:border-white/20 hover:bg-obsidian-elevated/60"
                                            }`}
                                        onClick={() => setMode("intern")}
                                    >
                                        {mode === "intern" && (
                                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-600 to-indigo-400" />
                                        )}

                                        {/* Icon */}
                                        <div
                                            className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${mode === "intern"
                                                    ? "bg-indigo-500/15 text-indigo-400"
                                                    : "bg-white/5 text-text-muted group-hover/card:text-text-secondary"
                                                }`}
                                        >
                                            <svg
                                                className="w-6 h-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                                                />
                                            </svg>
                                        </div>

                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-sans-display text-sm tracking-widest uppercase font-bold text-text-primary">
                                                Intern
                                            </span>
                                            {mode === "intern" && (
                                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                            )}
                                        </div>
                                        <p className="font-body text-text-muted text-sm leading-relaxed">
                                            Structured training — includes deliverables and strict curriculum tracking.
                                        </p>
                                    </button>
                                </div>
                            </div>

                            {/* ─── Tips Collapsible ─── */}
                            <div className="border border-white/5 bg-obsidian-surface/50 overflow-hidden">
                                <button
                                    type="button"
                                    className="w-full flex items-center justify-between p-5 text-left group/tips hover:bg-obsidian-elevated/30 transition-colors"
                                    onClick={() => setTipsOpen(!tipsOpen)}
                                    aria-expanded={tipsOpen}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">💡</span>
                                        <span className="font-sans-display text-xs uppercase tracking-[0.15em] text-text-secondary font-bold">
                                            Tips for Better Results
                                        </span>
                                    </div>
                                    <svg
                                        className={`w-4 h-4 text-text-muted transition-transform duration-300 ${tipsOpen ? "rotate-180" : ""
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <div
                                    className={`transition-all duration-500 ease-out overflow-hidden ${tipsOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                                        }`}
                                >
                                    <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-4">
                                        {TIPS.map((tip, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-3 p-3 rounded-sm bg-obsidian-elevated/30 hover:bg-obsidian-elevated/60 transition-colors"
                                            >
                                                <span className="text-base mt-0.5 shrink-0">{tip.icon}</span>
                                                <div>
                                                    <p className="font-sans-display text-xs uppercase tracking-wider text-text-primary font-bold mb-1">
                                                        {tip.title}
                                                    </p>
                                                    <p className="font-body text-xs text-text-muted leading-relaxed">
                                                        {tip.body}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ─── Error ─── */}
                            {error && (
                                <div className="p-4 bg-red-500/5 border-l-2 border-red-500 font-sans-display text-xs uppercase tracking-widest text-red-400 animate-scale-in">
                                    ERR: {error}
                                </div>
                            )}

                            {/* ─── Generate Button ─── */}
                            <div className="pt-4">
                                <button
                                    type="button"
                                    id="generate-button"
                                    className={`group relative w-full overflow-hidden flex items-center justify-center gap-4 px-8 py-6 transition-all duration-500 ${content.trim()
                                            ? "bg-gradient-to-r from-indigo-600 to-indigo-400 text-obsidian hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] cursor-pointer create-btn-glow"
                                            : "bg-white/5 text-text-muted/50 cursor-not-allowed"
                                        }`}
                                    onClick={handleGenerate}
                                    disabled={!content.trim()}
                                >
                                    {/* Shimmer sweep */}
                                    {content.trim() && (
                                        <div
                                            className="absolute inset-0 opacity-20"
                                            style={{
                                                background:
                                                    "linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
                                                backgroundSize: "200% 100%",
                                                animation: "shimmer 3s ease-in-out infinite",
                                            }}
                                        />
                                    )}
                                    <span className="font-sans-display text-sm uppercase tracking-[0.2em] font-bold relative z-10">
                                        Generate Workspace
                                    </span>
                                    <span
                                        className={`text-xl leading-none relative z-10 font-bold transition-all duration-300 ${content.trim() ? "group-hover:translate-x-2" : ""
                                            }`}
                                    >
                                        →
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* ═══ RIGHT COLUMN — Live Preview ═══ */}
                        <div className="hidden lg:block">
                            <div className="sticky top-24">
                                <div className="border border-white/5 bg-obsidian-surface/40 p-6 min-h-[500px]">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500/60" />
                                        <span className="font-sans-display text-[10px] uppercase tracking-[0.2em] text-text-muted">
                                            Live Preview
                                        </span>
                                    </div>

                                    {previewSections.length === 0 ? (
                                        /* Empty state */
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="w-16 h-16 rounded-lg bg-white/3 flex items-center justify-center mb-4">
                                                <svg
                                                    className="w-8 h-8 text-text-muted/30"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="font-sans-display text-xs uppercase tracking-wider text-text-muted/40 mb-1">
                                                No content yet
                                            </p>
                                            <p className="font-body text-xs text-text-muted/30 max-w-[200px]">
                                                Start pasting or uploading to see a preview of detected sections
                                            </p>
                                        </div>
                                    ) : (
                                        /* Detected sections */
                                        <div className="space-y-2">
                                            <p className="font-sans-display text-[10px] uppercase tracking-widest text-text-muted/50 mb-4">
                                                {previewSections.length} Section
                                                {previewSections.length !== 1 ? "s" : ""} Detected
                                            </p>
                                            {previewSections.map((section, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-3 p-3 border border-white/3 bg-obsidian-elevated/20 hover:border-indigo-500/20 transition-colors animate-scale-in"
                                                    style={{ animationDelay: `${i * 60}ms` }}
                                                >
                                                    <div className="w-6 h-6 rounded bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                        <span className="font-sans-display text-[10px] font-bold text-indigo-400">
                                                            {i + 1}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-sans-display text-xs tracking-wider text-text-primary truncate font-medium">
                                                            {section.title}
                                                        </p>
                                                        {section.lines > 0 && (
                                                            <p className="font-body text-[10px] text-text-muted/50 mt-0.5">
                                                                ~{section.lines} items
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Mode indicator */}
                                            <div className="mt-6 pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                    <span className="font-sans-display text-[10px] uppercase tracking-widest text-text-muted/50">
                                                        Mode
                                                    </span>
                                                </div>
                                                <p className="font-sans-display text-xs tracking-wider text-text-secondary capitalize">
                                                    {mode === "general" ? "📖 General — Self-paced" : "🎓 Intern — Structured"}
                                                </p>
                                            </div>

                                            {/* Stats summary */}
                                            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
                                                <div className="text-center p-2 bg-obsidian-elevated/20 rounded-sm">
                                                    <p className="font-sans-display text-lg font-bold text-text-primary tabular-nums">
                                                        {previewSections.length}
                                                    </p>
                                                    <p className="font-sans-display text-[9px] uppercase tracking-widest text-text-muted/40">
                                                        Sections
                                                    </p>
                                                </div>
                                                <div className="text-center p-2 bg-obsidian-elevated/20 rounded-sm">
                                                    <p className="font-sans-display text-lg font-bold text-text-primary tabular-nums">
                                                        {stats.words > 999
                                                            ? `${(stats.words / 1000).toFixed(1)}k`
                                                            : stats.words}
                                                    </p>
                                                    <p className="font-sans-display text-[9px] uppercase tracking-widest text-text-muted/40">
                                                        Words
                                                    </p>
                                                </div>
                                                <div className="text-center p-2 bg-obsidian-elevated/20 rounded-sm">
                                                    <p className="font-sans-display text-lg font-bold text-text-primary tabular-nums">
                                                        {stats.lines}
                                                    </p>
                                                    <p className="font-sans-display text-[9px] uppercase tracking-widest text-text-muted/40">
                                                        Lines
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
