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
            <div className="flex min-h-[calc(100vh-7rem)] flex-col rounded-[32px] border border-border bg-[linear-gradient(180deg,#ffffff_0%,#f7f3ec_100%)] p-4 shadow-[0_22px_54px_rgba(21,21,21,0.05)]">
                <div className="px-2 pb-5">
                    <p className="eyebrow">Studio navigator</p>
                    <p className="mt-3 text-sm leading-7 text-text-secondary">
                        Move through creation, library, analytics, and account controls without dropping back into narrow page stacks.
                    </p>
                </div>

                <nav className="space-y-2">
                    {PRIMARY_ITEMS.map((item) => {
                        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-[22px] border px-4 py-3 text-sm transition-all",
                                    active
                                        ? "border-blue-200 bg-blue-50 text-text shadow-[0_16px_36px_rgba(79,124,255,0.08)]"
                                        : "border-transparent bg-transparent text-text-muted hover:border-border hover:bg-white hover:text-text"
                                )}
                            >
                                <div
                                    className={cn(
                                        "rounded-2xl border p-2 transition-colors",
                                        active ? "border-blue-200 bg-white" : "border-border bg-surface-subtle"
                                    )}
                                >
                                    <item.icon size={16} />
                                </div>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-border pt-5">
                    <div className="mb-4 rounded-[24px] border border-border bg-white/80 p-3">
                        <CreditBadge compact />
                    </div>
                    <Link
                        href="/settings"
                        className={cn(
                            "group flex items-center gap-3 rounded-[22px] border px-4 py-3 text-sm transition-all",
                            pathname === "/settings"
                                ? "border-blue-200 bg-blue-50 text-text shadow-[0_16px_36px_rgba(79,124,255,0.08)]"
                                : "border-transparent bg-transparent text-text-muted hover:border-border hover:bg-white hover:text-text"
                        )}
                    >
                        <div
                            className={cn(
                                "rounded-2xl border p-2 transition-colors",
                                pathname === "/settings" ? "border-blue-200 bg-white" : "border-border bg-surface-subtle"
                            )}
                        >
                            <Settings2 size={16} />
                        </div>
                        <span className="font-medium">Settings</span>
                    </Link>
                </div>
            </div>
        </aside>
    );
}
