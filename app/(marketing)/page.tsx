"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { ArrowRight, HardDrive, SlidersHorizontal, UserRound } from "lucide-react";
import HowToSchema from "@/components/seo/HowToSchema";
import WebAppSchema from "@/components/seo/WebAppSchema";
import { getStorage, getStorageStatus } from "@/lib/storage";
import { getRelativeTimeLabel, getRoadmapDisplayTitle, getRoadmapStats } from "@/lib/workspace-stats";
import type { Roadmap, StorageStatus } from "@/types";
import { cn } from "@/lib/utils";

const heroItems = [
    "Local-first workspace",
    "Account-ready sync",
    "Structured visibility",
    "Template-ready library",
] as const;

const featureSections = [
    {
        eyebrow: "Capture",
        title: "Start with live material, not a blank operating surface.",
        body: "Bring plans, briefs, notes, and internal documentation into one structured workspace without forcing teams to rewrite how they already work.",
        visual: "capture" as const,
    },
    {
        eyebrow: "Navigate",
        title: "Make active work legible the moment someone returns.",
        body: "Progress, recency, and next actions stay visible in a calm list system that scales from a single workspace to a large internal library.",
        visual: "library" as const,
    },
    {
        eyebrow: "Control",
        title: "Add continuity only when the workflow actually needs it.",
        body: "Use the product privately by default, then introduce account-backed sync, settings, and controlled public access when the work is ready to travel.",
        visual: "control" as const,
    },
];

const revealParent: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const revealChild: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
};

function CaptureFragment() {
    return (
        <div className="surface-panel space-y-4 p-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-muted">Draft surface</p>
                    <p className="mt-1 text-sm text-text-secondary">A single input layer for raw operating material.</p>
                </div>
                <span className="rounded-sm border border-border px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-text-secondary">
                    Private
                </span>
            </div>

            <div className="mono-surface min-h-[230px] rounded-md border border-border px-4 py-4 text-sm leading-7 text-text-secondary">
                <p># Team operating notes</p>
                <p className="mt-3">Week 1: setup, account access, workspace conventions</p>
                <p className="mt-3">Week 2: project ownership, review rhythm, handoff rules</p>
                <p className="mt-3">Week 3: independent delivery, reporting, archive standards</p>
            </div>

            <div className="flex items-center justify-between text-sm">
                <p className="text-text-muted">Import text, structure it, then continue inside the workspace.</p>
                <div className="flex items-center gap-2">
                    <span className="button-ghost !min-h-9">Upload</span>
                    <span className="button-primary !min-h-9">Generate</span>
                </div>
            </div>
        </div>
    );
}

function LibraryFragment({ roadmaps }: { roadmaps: Roadmap[] }) {
    const rows = roadmaps.slice(0, 3);

    return (
        <div className="surface-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                    <p className="text-sm font-medium text-text-primary">Workspace library</p>
                    <p className="mt-1 text-xs text-text-muted">Thin signals. Clear recency. No visual clutter.</p>
                </div>
                <SlidersHorizontal size={15} className="text-text-muted" />
            </div>

            <div className="divide-y divide-border">
                {rows.length > 0
                    ? rows.map((roadmap) => {
                          const stats = getRoadmapStats(roadmap);

                          return (
                              <div
                                  key={roadmap.id}
                                  className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1.5fr)_120px_132px_24px] md:items-center"
                              >
                                  <div className="min-w-0">
                                      <p className="truncate text-sm font-medium text-text-primary">
                                          {getRoadmapDisplayTitle(roadmap)}
                                      </p>
                                      <p className="mt-1 text-xs text-text-muted">{stats.moduleCount} modules</p>
                                  </div>
                                  <div>
                                      <div className="mb-2 flex items-center justify-between text-[11px] text-text-muted">
                                          <span>{stats.percent}%</span>
                                      </div>
                                      <div className="h-1.5 rounded-full bg-[var(--color-surface-muted)]">
                                          <div
                                              className="h-full rounded-full bg-[var(--color-accent)]"
                                              style={{ width: `${stats.percent}%` }}
                                          />
                                      </div>
                                  </div>
                                  <p className="text-xs text-text-muted">
                                      {getRelativeTimeLabel(roadmap.updatedAt || roadmap.createdAt)}
                                  </p>
                                  <ArrowRight size={15} className="text-text-muted" />
                              </div>
                          );
                      })
                    : [1, 2, 3].map((item) => (
                          <div
                              key={item}
                              className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1.5fr)_120px_132px_24px] md:items-center"
                          >
                              <div className="space-y-2">
                                  <div className="h-3 w-40 rounded-full bg-[var(--color-surface-muted)]" />
                                  <div className="h-3 w-20 rounded-full bg-[var(--color-surface-muted)]" />
                              </div>
                              <div className="h-1.5 rounded-full bg-[var(--color-surface-muted)]" />
                              <div className="h-3 w-16 rounded-full bg-[var(--color-surface-muted)]" />
                              <div className="h-3 w-3 rounded-full bg-[var(--color-surface-muted)]" />
                          </div>
                      ))}
            </div>
        </div>
    );
}

function ControlFragment({ storageStatus }: { storageStatus: StorageStatus }) {
    const synced = storageStatus.mode === "synced-account";

    return (
        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <div className="surface-panel p-4">
                <div className="space-y-2">
                    {["Overview", "Library", "Settings"].map((item, index) => (
                        <div key={item} className="relative flex items-center gap-3 px-1 py-2 text-sm text-text-secondary">
                            <span
                                className={cn(
                                    "h-5 w-px rounded-full",
                                    index === 1 ? "bg-[var(--color-accent)]" : "bg-transparent",
                                )}
                            />
                            <span className={index === 1 ? "text-text-primary" : undefined}>{item}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-8 border-t border-border pt-4">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Credits</p>
                    <p className="mt-1 text-sm text-text-primary">124 remaining</p>
                </div>
            </div>

            <div className="surface-panel p-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-surface-subtle">
                        {synced ? (
                            <UserRound size={16} className="text-[var(--color-accent)]" />
                        ) : (
                            <HardDrive size={16} className="text-text-muted" />
                        )}
                    </div>

                    <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">
                            {synced ? "Synced account" : "Local by default"}
                        </p>
                        <h3 className="mt-2 text-lg font-medium text-text-primary">
                            {synced ? storageStatus.email || "Account-backed access" : "Saved on this device"}
                        </h3>
                        <p className="mt-2 max-w-lg text-sm leading-6 text-text-secondary">
                            {synced
                                ? "Work remains lightweight locally and syncs once an account is present."
                                : "Use the product privately in the browser, then enable account-backed continuity later."}
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-sm border border-border p-3">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Storage state</p>
                        <p className="mt-2 text-sm text-text-primary">Always explicit</p>
                    </div>
                    <div className="rounded-sm border border-border p-3">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Settings</p>
                        <p className="mt-2 text-sm text-text-primary">One place for control</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureVisual({
    type,
    roadmaps,
    storageStatus,
}: {
    type: "capture" | "library" | "control";
    roadmaps: Roadmap[];
    storageStatus: StorageStatus;
}) {
    if (type === "capture") return <CaptureFragment />;
    if (type === "library") return <LibraryFragment roadmaps={roadmaps} />;
    return <ControlFragment storageStatus={storageStatus} />;
}

export default function HomePage() {
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [storageStatus, setStorageStatus] = useState<StorageStatus>({
        mode: "local-only",
        cloudAvailable: false,
        email: null,
    });

    useEffect(() => {
        const storage = getStorage();
        let active = true;

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

    const primaryHref = useMemo(() => {
        return storageStatus.mode === "synced-account" ? "/workspaces" : "/create";
    }, [storageStatus.mode]);

    return (
        <main className="page-shell-wide pb-24 pt-0">
            <WebAppSchema />
            <HowToSchema />

            <motion.section
                className="border-b border-border pb-20 pt-12 md:pb-24 md:pt-16"
                variants={revealParent}
                initial="hidden"
                animate="show"
            >
                <div className="max-w-4xl">
                    <motion.p variants={revealChild} className="eyebrow">
                        Workspace platform
                    </motion.p>
                    <motion.h1
                        variants={revealChild}
                        className="mt-4 max-w-4xl text-5xl font-display leading-[0.94] tracking-[-0.07em] text-text-primary md:text-7xl"
                    >
                        Structure the work, then let the product stay out of the way.
                    </motion.h1>
                    <motion.p variants={revealChild} className="mt-5 max-w-2xl text-lg leading-8 text-text-secondary">
                        A clean operating surface for capturing, organizing, and continuing complex work.
                    </motion.p>
                    <motion.div variants={revealChild} className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
                        <Link href={primaryHref} className="button-primary">
                            Open studio
                        </Link>
                        <Link href="/gallery" className="button-secondary">
                            Browse library
                        </Link>
                    </motion.div>
                </div>
            </motion.section>

            <section className="section-space-compact border-b border-border">
                <div className="mx-auto max-w-3xl divide-y divide-border">
                    {heroItems.map((item, index) => (
                        <div
                            key={item}
                            className={cn("px-0 py-4 text-sm font-medium text-text-secondary", index === 0 && "pt-0")}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </section>

            <section className="section-space">
                <div className="mx-auto max-w-4xl space-y-24">
                    {featureSections.map((section, index) => {
                        const reverse = index % 2 === 1;

                        return (
                            <motion.div
                                key={section.title}
                                className="border-b border-border py-24 last:border-b-0 last:pb-0 md:flex md:items-center md:gap-16"
                                initial={{ opacity: 0, y: 32 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className={cn("order-1 max-w-md", reverse ? "md:order-2" : "md:order-1")}>
                                    <p className="eyebrow">{section.eyebrow}</p>
                                    <h2 className="mt-4 text-3xl font-display leading-tight tracking-[-0.04em] text-text-primary md:text-5xl">
                                        {section.title}
                                    </h2>
                                    <p className="mt-5 text-base leading-8 text-text-secondary">{section.body}</p>
                                </div>

                                <div className={cn("order-2 mt-10 min-w-0 flex-1 md:mt-0", reverse ? "md:order-1" : "md:order-2")}>
                                    <FeatureVisual type={section.visual} roadmaps={roadmaps} storageStatus={storageStatus} />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            <section className="section-space border-t border-border text-center">
                <div className="mx-auto max-w-3xl">
                    <p className="eyebrow justify-center">Ready to begin</p>
                    <h2 className="mt-4 text-4xl font-display leading-tight tracking-[-0.05em] text-text-primary md:text-6xl">
                        Give the work a clearer place to live.
                    </h2>
                    <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-text-secondary">
                        Start privately, keep the interface light, and introduce shared structure only when it helps.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <Link href="/create" className="button-primary">
                            Open studio
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
