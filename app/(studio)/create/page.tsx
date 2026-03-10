"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, FileUp, Loader2 } from "lucide-react";
import UpgradeModal from "@/components/payments/UpgradeModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { getStorage } from "@/lib/storage";
import { getActiveApiKey, getActiveModel, getUserConfig } from "@/lib/userConfig";
import type { Roadmap } from "@/types";
import { cn } from "@/lib/utils";

const LOADING_STEPS = [
    "Reading your material",
    "Finding the structure",
    "Preparing the workspace",
    "Finalizing the result",
] as const;

export default function CreatePage() {
    return (
        <Suspense fallback={<div className="page-shell-wide flex min-h-[60vh] items-center justify-center" />}>
            <CreatePageContent />
        </Suspense>
    );
}

function CreatePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [mode, setMode] = useState<"general" | "intern">("general");
    const [goal, setGoal] = useState("");
    const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced" | null>(null);
    const [estimatedDuration, setEstimatedDuration] = useState("");
    const [showOptional, setShowOptional] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState("");
    const [upgradeMessage, setUpgradeMessage] = useState("");

    useEffect(() => {
        const queryTitle = searchParams.get("title");
        const queryContent = searchParams.get("content");

        if (queryTitle) setTitle(queryTitle);
        if (queryContent) setContent(queryContent);
    }, [searchParams]);

    useEffect(() => {
        if (!isLoading) return undefined;

        const startedAt = Date.now();
        const interval = window.setInterval(() => {
            const elapsed = Date.now() - startedAt;

            if (elapsed < 1800) setLoadingStep(0);
            else if (elapsed < 3600) setLoadingStep(1);
            else if (elapsed < 5600) setLoadingStep(2);
            else setLoadingStep(3);

            setProgress(Math.min(92, (elapsed / 9000) * 92));
        }, 120);

        return () => {
            window.clearInterval(interval);
        };
    }, [isLoading]);

    const wordCount = useMemo(() => {
        const trimmed = content.trim();
        return trimmed ? trimmed.split(/\s+/).length : 0;
    }, [content]);

    const hasContent = content.trim().length > 0;

    const processFile = useCallback(
        (file: File) => {
            if (!file.name.match(/\.(md|txt|markdown)$/i)) {
                setError("Only .md, .txt, and .markdown files are supported.");
                return;
            }

            setError("");

            const reader = new FileReader();
            reader.onload = (event) => {
                const nextContent = (event.target?.result as string) || "";
                setContent(nextContent);

                if (!title.trim()) {
                    const firstLine = nextContent
                        .split("\n")
                        .find((line) => line.trim().length > 0)
                        ?.replace(/^#+\s*/, "")
                        .trim();

                    setTitle(firstLine || file.name.replace(/\.\w+$/, ""));
                }
            };

            reader.readAsText(file);
        },
        [title],
    );

    const handleGenerate = async () => {
        if (!hasContent) {
            setError("Paste or upload content before generating.");
            return;
        }

        setError("");
        setProgress(8);
        setLoadingStep(0);
        setIsLoading(true);

        try {
            const userConfig = getUserConfig();
            const activeApiKey = getActiveApiKey(userConfig);
            const useCustomKey = Boolean(userConfig.useCustomKey && activeApiKey);

            const response = await fetch("/api/parse-roadmap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: content.trim(),
                    mode,
                    title: title.trim() || undefined,
                    goal: goal || undefined,
                    difficulty: difficulty || undefined,
                    estimatedDuration: estimatedDuration || undefined,
                    userApiKey: useCustomKey ? activeApiKey : undefined,
                    userModel: useCustomKey ? getActiveModel(userConfig) : undefined,
                    userProvider: useCustomKey ? userConfig.provider : undefined,
                }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({ error: "Failed to generate workspace" }));

                if (payload.error === "limit_reached") {
                    setUpgradeMessage(payload.message ?? "You have reached your current plan limit.");
                    setIsLoading(false);
                    return;
                }

                throw new Error(payload.message ?? payload.error ?? "Something went wrong");
            }

            const payload = await response.json();
            if (!payload.success || !payload.roadmap) {
                throw new Error(payload.error ?? "The response was incomplete.");
            }

            const roadmap: Roadmap = {
                ...payload.roadmap,
                id: crypto.randomUUID(),
                rawContent: content.trim(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            setProgress(100);
            getStorage().saveRoadmap(roadmap);

            window.setTimeout(() => {
                router.push(`/workspace/${roadmap.id}`);
            }, 220);
        } catch (nextError) {
            setError(nextError instanceof Error ? nextError.message : "An unexpected error occurred");
            setIsLoading(false);
        }
    };

    return (
        <>
            <main className="page-shell-wide pb-20 pt-8 md:pt-10">
                <section className="app-header-block">
                    <p className="eyebrow">Create workspace</p>
                    <h1 className="text-3xl font-display leading-tight text-text-primary md:text-5xl">
                        Create a workspace from source material.
                    </h1>
                    <p className="max-w-3xl text-sm leading-7 text-text-secondary md:text-base">
                        Paste or upload the source, choose the structure, and generate the workspace.
                    </p>
                </section>

                <div className="two-panel-shell pt-2">
                    <aside className="two-panel-sidebar divide-y divide-border border-y border-border lg:sticky lg:top-24">
                        <div className="py-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">Source material</p>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-text-secondary">
                                <p>Start with the full source text. The content determines the final workspace structure.</p>
                                <p>Use Structured mode for coaching-oriented work. Use Standard mode for general workspace generation.</p>
                            </div>
                        </div>

                        <div className="py-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">Current draft</p>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-text-soft">Word count</p>
                                    <p className="mt-2 text-2xl font-semibold text-text-primary">{wordCount}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-text-soft">Mode</p>
                                    <p className="mt-2 text-base font-semibold capitalize text-text-primary">{mode}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-text-soft">Storage</p>
                                    <p className="mt-2 text-base font-semibold text-text-primary">Local by default</p>
                                </div>
                            </div>
                        </div>

                        <div className="py-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">Before generating</p>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-text-secondary">
                                <p>Anonymous work stays local until you enable sync.</p>
                                <p>If generation fails, verify your provider key in Settings and retry from this page.</p>
                            </div>
                        </div>
                    </aside>

                    <section className="min-w-0 space-y-4">
                        <Card>
                            <CardHeader className="gap-2">
                                <CardTitle className="text-lg font-display">Workspace framing</CardTitle>
                                <CardDescription>Set the title and choose the structure before generating the workspace.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
                                <div>
                                    <label htmlFor="workspace-title" className="mb-2 block text-sm font-medium text-text-primary">
                                        Working title
                                    </label>
                                    <Input
                                        id="workspace-title"
                                        value={title}
                                        onChange={(event) => setTitle(event.target.value)}
                                        placeholder="Optional..."
                                    />
                                </div>

                                <div>
                                    <p className="mb-2 block text-sm font-medium text-text-primary">Mode</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { value: "general" as const, label: "Standard" },
                                            { value: "intern" as const, label: "Structured" },
                                        ].map((option) => (
                                            <Button
                                                key={option.value}
                                                type="button"
                                                variant={mode === option.value ? "default" : "outline"}
                                                onClick={() => setMode(option.value)}
                                                className={mode === option.value ? "text-white" : ""}
                                            >
                                                {option.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <section className="space-y-3">
                            <div>
                                <h2 className="text-lg font-display text-text-primary">Source material</h2>
                                <p className="mt-2 text-sm leading-7 text-text-secondary">
                                    Paste directly or drop a markdown file into the working surface.
                                </p>
                            </div>

                            <Textarea
                                id="workspace-content"
                                value={content}
                                onChange={(event) => setContent(event.target.value)}
                                onDragOver={(event) => {
                                    event.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={(event) => {
                                    event.preventDefault();
                                    setIsDragging(false);
                                }}
                                onDrop={(event) => {
                                    event.preventDefault();
                                    setIsDragging(false);
                                    const file = event.dataTransfer.files[0];
                                    if (file) processFile(file);
                                }}
                                placeholder="Paste notes, outlines, internal documentation, operating instructions, or any structured source material."
                                className={cn(
                                    "mono-surface min-h-[420px] w-full rounded-none bg-transparent px-5 py-5 text-[15px] leading-7 shadow-none focus-visible:ring-0",
                                    isDragging ? "border-[var(--color-accent)]" : "border-border",
                                )}
                            />
                        </section>

                        <div className="flex items-center justify-between gap-4 text-xs text-text-muted">
                            <p>This stays local by default. Shared access is optional later.</p>
                            <p>{wordCount} words</p>
                        </div>

                        <Card>
                            <CardContent className="space-y-4 p-5">
                                <Button
                                    type="button"
                                    onClick={() => setShowOptional((current) => !current)}
                                    variant="ghost"
                                    className="justify-start px-0 text-sm font-medium text-text-secondary hover:bg-transparent hover:text-text-primary"
                                >
                                    {showOptional ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    Optional details
                                </Button>

                                {showOptional ? (
                                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                                        <div>
                                            <label htmlFor="workspace-goal" className="mb-2 block text-sm font-medium text-text-primary">
                                                Goal
                                            </label>
                                            <Input
                                                id="workspace-goal"
                                                value={goal}
                                                onChange={(event) => setGoal(event.target.value)}
                                                placeholder="What should this produce?"
                                            />
                                        </div>

                                        <fieldset>
                                            <legend className="mb-2 block text-sm font-medium text-text-primary">Difficulty</legend>
                                            <div className="flex flex-wrap gap-2">
                                                {(["beginner", "intermediate", "advanced"] as const).map((level) => (
                                                    <Button
                                                        key={level}
                                                        type="button"
                                                        onClick={() => setDifficulty(level)}
                                                        variant={difficulty === level ? "default" : "outline"}
                                                        size="sm"
                                                        className="capitalize"
                                                    >
                                                        {level}
                                                    </Button>
                                                ))}
                                            </div>
                                        </fieldset>

                                        <div>
                                            <label htmlFor="workspace-duration" className="mb-2 block text-sm font-medium text-text-primary">
                                                Duration
                                            </label>
                                            <Input
                                                id="workspace-duration"
                                                value={estimatedDuration}
                                                onChange={(event) => setEstimatedDuration(event.target.value)}
                                                placeholder="e.g. 4 weeks"
                                            />
                                        </div>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>

                        <Separator />

                        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                            <Button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                variant="secondary"
                                disabled={isLoading}
                            >
                                <FileUp size={16} />
                                Upload
                            </Button>

                            <Button
                                type="button"
                                onClick={handleGenerate}
                                disabled={!hasContent || isLoading}
                                className="min-w-[170px]"
                                aria-busy={isLoading}
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                                {isLoading ? "Generating" : "Generate"}
                            </Button>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".md,.markdown,.txt"
                            className="hidden"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) processFile(file);
                            }}
                        />

                        {isLoading ? (
                            <Card>
                                <CardContent className="space-y-4 p-5">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-text-primary">{LOADING_STEPS[loadingStep]}</p>
                                            <p className="mt-1 text-sm text-text-muted">The workspace is being prepared from your source material.</p>
                                        </div>
                                        <p className="text-sm font-medium text-text-secondary">{Math.round(progress)}%</p>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-[var(--color-surface-muted)]">
                                        <div
                                            className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ) : null}

                        {error ? (
                            <div className="rounded-[18px] border border-[color:color-mix(in_srgb,var(--color-accent)_24%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-accent)_10%,var(--color-surface))] px-4 py-3 text-sm text-text-primary">
                                {error}
                            </div>
                        ) : null}
                    </section>
                </div>
            </main>

            {upgradeMessage ? <UpgradeModal message={upgradeMessage} onClose={() => setUpgradeMessage("")} /> : null}
        </>
    );
}
