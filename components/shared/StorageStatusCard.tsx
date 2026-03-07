"use client";

import Link from "next/link";
import { HardDrive, ShieldCheck, UserRound } from "lucide-react";
import type { StorageStatus } from "@/types";

function getStatusMeta(status: StorageStatus) {
    if (status.mode === "synced-account") {
        return {
            icon: UserRound,
            eyebrow: "Synced account",
            title: status.email ? `Sync enabled for ${status.email}` : "Sync enabled",
            description:
                "Roadmaps still save locally first, then sync to your signed-in Supabase account for backup and cross-device continuity.",
            tone: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
            badge: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
        };
    }

    if (status.mode === "supabase-unavailable") {
        return {
            icon: ShieldCheck,
            eyebrow: "Browser-only mode",
            title: "Supabase sync is not configured",
            description:
                "This studio is currently running as a pure local-browser experience. Your work remains on this device until Supabase credentials are configured.",
            tone: "border-white/10 bg-white/[0.03] text-text-primary",
            badge: "border-white/10 bg-white/5 text-text-secondary",
        };
    }

    return {
        icon: HardDrive,
        eyebrow: "Local-only mode",
        title: "Your roadmaps stay in this browser",
        description:
            "You can create and manage workspaces without an account. Sign in with email later when you want cloud backup, account billing, and cross-device sync.",
        tone: "border-amber-400/30 bg-amber-500/10 text-amber-50",
        badge: "border-amber-400/30 bg-amber-500/10 text-amber-100",
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
        <div className={`rounded-[28px] border p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] ${meta.tone}`}>
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl">
                    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${meta.badge}`}>
                        <Icon size={13} />
                        {meta.eyebrow}
                    </div>
                    <h3 className="mt-4 font-display text-2xl text-white">{meta.title}</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">{meta.description}</p>
                </div>

                {showAction && (
                    <Link
                        href={actionHref!}
                        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-white/[0.1]"
                    >
                        {actionLabel}
                    </Link>
                )}
            </div>
        </div>
    );
}
