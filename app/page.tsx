"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import StorageStatusCard from "@/components/shared/StorageStatusCard";
import WorkspaceLibraryCard from "@/components/workspaces/WorkspaceLibraryCard";
import { getStorage, getStorageStatus } from "@/lib/storage";
import { getRoadmapStats } from "@/lib/workspace-stats";
import type { Roadmap, StorageStatus } from "@/types";
import {
    ArrowRight,
    CheckCircle2,
    Clock3,
    CreditCard,
    HardDrive,
    LayoutGrid,
    PlusCircle,
    Settings2,
    ShieldCheck,
    Sparkles,
    Upload,
    UserRound,
} from "lucide-react";

type LibraryFilter = "all" | "in-progress" | "completed";

function countByState(roadmaps: Roadmap[], state: LibraryFilter) {
    if (state === "all") return roadmaps.length;

    return roadmaps.filter((roadmap) => {
        const stats = getRoadmapStats(roadmap);
        if (state === "completed") return stats.progressState === "completed";
        return stats.progressState === "in-progress";
    }).length;
}

function averageCompletion(roadmaps: Roadmap[]) {
    if (roadmaps.length === 0) return 0;
    const total = roadmaps.reduce((sum, roadmap) => sum + getRoadmapStats(roadmap).percent, 0);
    return Math.round(total / roadmaps.length);
}

export default function HomePage() {
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [storageStatus, setStorageStatus] = useState<StorageStatus>({
        mode: "local-only",
        cloudAvailable: false,
        email: null,
    });
    const [mounted, setMounted] = useState(false);
    const [filter, setFilter] = useState<LibraryFilter>("all");

    useEffect(() => {
        const storage = getStorage();
        let active = true;

        setMounted(true);
        setRoadmaps(storage.getRoadmaps());

        void getStorageStatus().then((status) => {
            if (active) {
                setStorageStatus(status);
            }
        });

        if (storage.syncFromCloud) {
            void storage.syncFromCloud().then((synced) => {
                if (active) {
                    setRoadmaps(synced);
                }
            });
        }

        return () => {
            active = false;
        };
    }, []);

    const filteredRoadmaps = useMemo(() => {
        if (filter === "all") return roadmaps;

        return roadmaps.filter((roadmap) => {
            const stats = getRoadmapStats(roadmap);
            if (filter === "completed") {
                return stats.progressState === "completed";
            }

            return stats.progressState === "in-progress";
        });
    }, [filter, roadmaps]);

    const accountHref =
        storageStatus.mode === "synced-account"
            ? "/settings?tab=privacy"
            : storageStatus.cloudAvailable
              ? "/auth?next=%2F"
              : "/settings?tab=privacy";

    const accountLabel = storageStatus.mode === "synced-account" ? "Account sync" : "Enable sync";
    const accountIcon = storageStatus.mode === "synced-account" ? UserRound : HardDrive;

    const commandHubItems = [
        {
            href: "/create",
            label: "Create",
            title: "Build a new roadmap",
            description: "Paste a guide, playbook, or curriculum and turn it into a working course workspace.",
            icon: PlusCircle,
        },
        {
            href: "/workspaces",
            label: "Workspaces",
            title: "Open your library",
            description: "Jump into your active workspace collection with clearer progress and status context.",
            icon: LayoutGrid,
        },
        {
            href: "/settings",
            label: "Settings",
            title: "Tune the studio",
            description: "Manage AI providers, privacy, billing, data export, and local-first behavior from one place.",
            icon: Settings2,
        },
        {
            href: "/pricing",
            label: "Pricing",
            title: "Review plans",
            description: "Compare free, pro, and agency access without losing the local-first workflow.",
            icon: CreditCard,
        },
        {
            href: accountHref,
            label: accountLabel,
            title: storageStatus.mode === "synced-account" ? "Manage account sync" : "Connect your email account",
            description:
                storageStatus.mode === "synced-account"
                    ? "Your work is already syncing to a signed-in account. Review storage mode and billing in settings."
                    : "Keep working locally now, then sign in later when you want cloud backup and cross-device continuity.",
            icon: accountIcon,
        },
    ] as const;

    const quickMetrics = [
        { label: "Total workspaces", value: roadmaps.length.toString().padStart(2, "0") },
        { label: "In progress", value: countByState(roadmaps, "in-progress").toString().padStart(2, "0") },
        { label: "Completion average", value: `${averageCompletion(roadmaps)}%` },
    ];

    const libraryFilters: { key: LibraryFilter; label: string }[] = [
        { key: "all", label: "All" },
        { key: "in-progress", label: "In progress" },
        { key: "completed", label: "Completed" },
    ];

    return (
        <div className="min-h-full bg-obsidian text-text-primary selection:bg-indigo-500/30">
            <Header />

            <main className="pt-24">
                <section className="relative overflow-hidden border-b border-white/[0.06]">
                    <div className="pointer-events-none absolute inset-0 hero-mesh-gradient opacity-75" />
                    <div className="pointer-events-none absolute inset-0 landing-grid-bg opacity-30" />

                    <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.2fr,0.95fr] lg:px-10 lg:py-18">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-text-secondary">
                                <Sparkles size={13} className="text-amber-300" />
                                Editorial Dark Academy
                            </div>

                            <h1 className="mt-6 font-display text-5xl leading-none text-white sm:text-6xl lg:text-7xl">
                                Turn any guide into a{" "}
                                <span className="text-gradient italic">premium course workspace</span>
                            </h1>

                            <p className="mt-6 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg">
                                Start locally, organize instantly, and reveal account-backed sync only when it adds value.
                                ZNS RoadMap Studio is built to feel like a professional course control desk, not a loose
                                utility panel.
                            </p>

                            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                                <Link
                                    href="/create"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-300/20 bg-[linear-gradient(135deg,rgba(85,116,232,0.92),rgba(191,148,71,0.78))] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-obsidian transition-all duration-300 hover:brightness-110"
                                >
                                    <PlusCircle size={16} />
                                    Create a roadmap
                                </Link>

                                <Link
                                    href={accountHref}
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-text-primary transition-colors hover:bg-white/[0.09]"
                                >
                                    {storageStatus.mode === "synced-account" ? <UserRound size={16} /> : <HardDrive size={16} />}
                                    {storageStatus.mode === "synced-account" ? "Review sync" : "Sign in for sync"}
                                </Link>
                            </div>

                            <div className="mt-10 grid gap-4 sm:grid-cols-3">
                                {quickMetrics.map((metric) => (
                                    <div key={metric.label} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                                        <p className="text-[11px] uppercase tracking-[0.24em] text-text-secondary">{metric.label}</p>
                                        <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-5">
                            <StorageStatusCard
                                status={storageStatus}
                                actionHref={accountHref}
                                actionLabel={storageStatus.mode === "synced-account" ? "Open privacy controls" : "Enable account sync"}
                            />

                            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,26,34,0.98),rgba(11,13,18,0.96))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">How the studio works</p>
                                <div className="mt-5 space-y-4">
                                    {[
                                        {
                                            icon: Upload,
                                            title: "Paste or upload source material",
                                            description: "Roadmaps, course notes, markdown, or internal playbooks all work.",
                                        },
                                        {
                                            icon: Sparkles,
                                            title: "Structure it into modules and tasks",
                                            description: "The studio turns raw content into a trackable learning workspace.",
                                        },
                                        {
                                            icon: ShieldCheck,
                                            title: "Keep control of where it lives",
                                            description: "Anonymous users stay local-first. Signed-in users get owned, account-scoped sync.",
                                        },
                                    ].map((item) => (
                                        <div key={item.title} className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
                                                <item.icon size={18} className="text-indigo-200" />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-semibold text-white">{item.title}</h2>
                                                <p className="mt-1 text-sm leading-7 text-text-secondary">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="border-b border-white/[0.06]">
                    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                                <LayoutGrid size={18} className="text-indigo-200" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">Command hub</p>
                                <h2 className="font-display text-3xl text-white">Everything important is one click away</h2>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                            {commandHubItems.map((item) => (
                                <Link
                                    key={item.href + item.label}
                                    href={item.href}
                                    className="group rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,26,34,0.98),rgba(11,13,18,0.94))] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[linear-gradient(180deg,rgba(28,34,44,0.98),rgba(11,13,18,0.94))]"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                                        <item.icon size={18} className="text-indigo-100" />
                                    </div>
                                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">{item.label}</p>
                                    <h3 className="mt-2 text-lg font-semibold text-white">{item.title}</h3>
                                    <p className="mt-2 text-sm leading-7 text-text-secondary">{item.description}</p>
                                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-text-primary">
                                        Open
                                        <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
                    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">Recent work</p>
                            <h2 className="mt-2 font-display text-4xl text-white">Your workspace library</h2>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
                                Home now acts as a premium command surface. The library stays visible here for quick
                                continuation, while the dedicated workspace page remains your full collection view.
                            </p>
                        </div>

                        {mounted && roadmaps.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {libraryFilters.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setFilter(item.key)}
                                        className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition-all ${
                                            filter === item.key
                                                ? "border-indigo-300/20 bg-indigo-500/12 text-indigo-100"
                                                : "border-white/10 bg-white/[0.03] text-text-secondary hover:text-white"
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {mounted && filteredRoadmaps.length > 0 ? (
                        <div className="grid gap-5 lg:grid-cols-2">
                            {filteredRoadmaps.slice(0, 6).map((roadmap) => (
                                <WorkspaceLibraryCard
                                    key={roadmap.id}
                                    roadmap={roadmap}
                                    onDelete={(id) => {
                                        getStorage().deleteRoadmap(id);
                                        setRoadmaps(getStorage().getRoadmaps());
                                    }}
                                    onRename={(id, nextTitle) => {
                                        getStorage().updateRoadmap(id, { title: nextTitle });
                                        setRoadmaps(getStorage().getRoadmaps());
                                    }}
                                />
                            ))}
                        </div>
                    ) : mounted ? (
                        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,26,34,0.98),rgba(11,13,18,0.96))] px-8 py-16 text-center shadow-[0_28px_80px_rgba(0,0,0,0.24)]">
                            <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.04]">
                                <PlusCircle size={28} className="text-indigo-200" />
                            </div>
                            <h3 className="mt-6 font-display text-3xl text-white">No workspaces yet</h3>
                            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-text-secondary">
                                Start with one source document and let the studio convert it into a task-driven course
                                workspace. You can stay local-only, or sign in later when you want account-backed sync.
                            </p>
                            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                <Link
                                    href="/create"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-300/20 bg-[linear-gradient(135deg,rgba(85,116,232,0.92),rgba(191,148,71,0.78))] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-obsidian transition-all hover:brightness-110"
                                >
                                    <PlusCircle size={16} />
                                    Create your first roadmap
                                </Link>
                                <Link
                                    href={accountHref}
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-text-primary transition-colors hover:bg-white/[0.09]"
                                >
                                    <HardDrive size={16} />
                                    Learn about sync
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-5 lg:grid-cols-2">
                            {[1, 2, 3, 4].map((item) => (
                                <div key={item} className="h-[296px] rounded-[28px] border border-white/8 shimmer" />
                            ))}
                        </div>
                    )}

                    {mounted && roadmaps.length > 6 && (
                        <div className="mt-8 flex justify-center">
                            <Link
                                href="/workspaces"
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-white/[0.08]"
                            >
                                View full workspace library
                                <ArrowRight size={15} />
                            </Link>
                        </div>
                    )}
                </section>

                <section className="border-t border-white/[0.06]">
                    <div className="mx-auto grid max-w-7xl gap-6 px-6 py-12 lg:grid-cols-3 lg:px-10">
                        {[
                            {
                                icon: CheckCircle2,
                                title: "Local-first by default",
                                description: "Anonymous users can create, review, export, and manage course workspaces without handing over an account first.",
                            },
                            {
                                icon: UserRound,
                                title: "Email unlocks continuity",
                                description: "When users decide to sign in, sync becomes intentional and account-owned instead of silently mixing browser and cloud data.",
                            },
                            {
                                icon: Clock3,
                                title: "Built for ongoing study",
                                description: "The product is now framed as a professional course platform with progress visibility, direct navigation, and fewer dead ends.",
                            },
                        ].map((item) => (
                            <article key={item.title} className="rounded-[26px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
                                    <item.icon size={18} className="text-amber-200" />
                                </div>
                                <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-text-secondary">{item.description}</p>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
