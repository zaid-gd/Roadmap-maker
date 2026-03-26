"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LayoutGrid, PlusCircle, Settings2 } from "lucide-react";
import CreditBadge from "@/components/credits/CreditBadge";
import { cn } from "@/lib/utils";

const PRIMARY_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/create", label: "Create", icon: PlusCircle },
    { href: "/workspaces", label: "Workspaces", icon: LayoutGrid },
] as const;

export default function StudioSidebar() {
    const pathname = usePathname();

    return (
        <aside className="sticky top-24 hidden self-start xl:block">
            <div className="surface-panel flex min-h-[calc(100vh-7rem)] flex-col p-4">
                <nav aria-label="Studio navigation" className="space-y-1">
                    {PRIMARY_ITEMS.map((item) => {
                        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                    "group flex items-center gap-3 rounded-[16px] border px-4 py-3 text-sm transition-all duration-200 ease-out",
                                    active
                                        ? "border-border-strong bg-[color:color-mix(in_srgb,var(--color-surface)_98%,var(--color-page))] text-text shadow-sm"
                                        : "border-transparent bg-transparent text-text-muted hover:border-border hover:bg-[color:color-mix(in_srgb,var(--color-text)_4%,transparent)] hover:text-text"
                                )}
                            >
                                <div
                                    className={cn(
                                        "rounded-xl border p-2 transition-all duration-200",
                                        active
                                            ? "border-border-strong bg-[color:color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface-subtle))] text-[var(--color-accent)]"
                                            : "border-border bg-surface-subtle text-text-muted group-hover:border-border-strong group-hover:bg-[color:color-mix(in_srgb,var(--color-text)_6%,transparent)]"
                                    )}
                                >
                                    <item.icon size={16} />
                                </div>
                                <div className="min-w-0">
                                    <span className="block font-medium">{item.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-border pt-5">
                    <div className="mb-4 rounded-[18px] border border-border bg-surface-subtle p-3">
                        <CreditBadge compact />
                    </div>
                    <Link
                        href="/settings"
                        aria-current={pathname === "/settings" ? "page" : undefined}
                        className={cn(
                            "group flex items-center gap-3 rounded-[16px] border px-4 py-3 text-sm transition-all duration-200 ease-out",
                            pathname === "/settings"
                                ? "border-border-strong bg-[color:color-mix(in_srgb,var(--color-surface)_98%,var(--color-page))] text-text shadow-sm"
                                : "border-transparent bg-transparent text-text-muted hover:border-border hover:bg-[color:color-mix(in_srgb,var(--color-text)_4%,transparent)] hover:text-text"
                        )}
                    >
                        <div
                            className={cn(
                                "rounded-xl border p-2 transition-all duration-200",
                                pathname === "/settings"
                                    ? "border-border-strong bg-[color:color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface-subtle))] text-[var(--color-accent)]"
                                    : "border-border bg-surface-subtle text-text-muted group-hover:border-border-strong group-hover:bg-[color:color-mix(in_srgb,var(--color-text)_6%,transparent)]"
                            )}
                        >
                            <Settings2 size={16} />
                        </div>
                        <div className="min-w-0">
                            <span className="block font-medium">Settings</span>
                        </div>
                    </Link>
                </div>
            </div>
        </aside>
    );
}
