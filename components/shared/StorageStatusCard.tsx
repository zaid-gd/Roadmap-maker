"use client";

import Link from "next/link";
import { HardDrive, ShieldCheck, UserRound } from "lucide-react";
import type { StorageStatus } from "@/types";
import { cn } from "@/lib/utils";

function getStatusMeta(status: StorageStatus) {
    if (status.mode === "synced-account") {
        return {
            icon: UserRound,
            eyebrow: "Synced account",
            title: status.email ? status.email : "Cloud sync enabled",
            description: "Work saves locally first, then syncs to your signed-in account.",
            tone: "border-[var(--color-accent)]/20 bg-[var(--color-accent-soft)]/50",
            badge: "text-[var(--color-accent)]",
        };
    }

    if (status.mode === "supabase-unavailable") {
        return {
            icon: ShieldCheck,
            eyebrow: "Browser only",
            title: "Cloud sync unavailable",
            description: "This environment is running without sync configuration.",
            tone: "border-border bg-surface-subtle",
            badge: "text-text-muted",
        };
    }

    return {
        icon: HardDrive,
        eyebrow: "Local only",
        title: "Saved on this device",
        description: "You can work without an account and enable sync later.",
        tone: "border-border bg-surface",
        badge: "text-text-muted",
    };
}

interface StorageStatusCardProps {
    status: StorageStatus;
    actionHref?: string;
    actionLabel?: string;
}

export default function StorageStatusCard({ status, actionHref, actionLabel }: StorageStatusCardProps) {
    const meta = getStatusMeta(status);
    const Icon = meta.icon;
    const showAction = Boolean(actionHref && actionLabel && status.mode !== "synced-account");

    return (
        <div className={cn("surface-panel flex flex-col gap-5 p-5", meta.tone)}>
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                    <div className={cn("inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]", meta.badge)}>
                        <Icon size={14} />
                        <span>{meta.eyebrow}</span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-text-primary">{meta.title}</h3>
                        <p className="max-w-xl text-sm text-text-secondary">{meta.description}</p>
                    </div>
                </div>

                {showAction ? (
                    <Link href={actionHref!} className="button-secondary shrink-0 whitespace-nowrap">
                        {actionLabel}
                    </Link>
                ) : null}
            </div>
        </div>
    );
}
