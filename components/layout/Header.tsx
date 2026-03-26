"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import AuthButton from "@/components/auth/AuthButton";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MARKETING_NAV_ITEMS, STUDIO_NAV_ITEMS } from "@/lib/navigation";

export default function Header() {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const isMarketing =
        pathname === "/" ||
        pathname.startsWith("/pricing") ||
        pathname.startsWith("/gallery") ||
        pathname.startsWith("/privacy") ||
        pathname.startsWith("/terms") ||
        pathname.startsWith("/contact");
    const navItems = isMarketing ? MARKETING_NAV_ITEMS : STUDIO_NAV_ITEMS;
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        const onScroll = () => {
            const threshold = isHome ? window.innerHeight * 0.55 : 8;
            setScrolled(window.scrollY > threshold);
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [isHome]);

    return (
        <header
            className={cn(
                "sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-200",
                scrolled
                    ? "border-b border-border bg-[color:color-mix(in_srgb,var(--color-page)_82%,transparent)] backdrop-blur-xl"
                    : "border-b border-transparent bg-[color:color-mix(in_srgb,var(--color-page)_72%,transparent)]"
            )}
        >
            <div className="page-shell-wide flex h-16 items-center justify-between gap-4">
                <Link href="/" className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-[color:color-mix(in_srgb,var(--color-surface)_94%,var(--color-page))]">
                        <Logo />
                    </span>
                    <span className="truncate text-sm font-medium tracking-[-0.03em] text-text">RoadMap Studio</span>
                </Link>

                <nav aria-label="Main navigation" className="hidden items-center gap-2 rounded-full border border-border bg-[color:color-mix(in_srgb,var(--color-surface)_88%,var(--color-page))] p-1 lg:flex">
                    {navItems.map((item) => {
                        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                    "rounded-full px-4 py-2 text-sm transition-[background-color,color]",
                                    active
                                        ? "bg-[color:color-mix(in_srgb,var(--color-accent)_14%,var(--color-surface))] text-text"
                                        : "text-text-muted hover:bg-[color:color-mix(in_srgb,var(--color-text)_4%,transparent)] hover:text-text"
                                )}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden items-center gap-3 lg:flex">
                    <AuthButton />
                </div>

                <Button
                    type="button"
                    onClick={() => setMobileOpen((value) => !value)}
                    variant="outline"
                    size="icon"
                    className="rounded-full lg:hidden"
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    aria-expanded={mobileOpen}
                    aria-controls="mobile-nav"
                >
                    {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </Button>
            </div>

            {mobileOpen ? (
                <div id="mobile-nav" className="border-t border-border bg-[color:color-mix(in_srgb,var(--color-page)_92%,var(--color-surface))] lg:hidden">
                    <nav aria-label="Mobile navigation" className="page-shell-wide flex flex-col gap-2 py-4">
                        {navItems.map((item) => {
                            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "rounded-[14px] px-3 py-2 text-sm transition-[background-color,color]",
                                        active
                                            ? "bg-[color:color-mix(in_srgb,var(--color-accent)_14%,var(--color-surface))] text-text"
                                            : "text-text-muted hover:bg-[color:color-mix(in_srgb,var(--color-text)_4%,transparent)] hover:text-text"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                        <div className="pt-2">
                            <AuthButton />
                        </div>
                    </nav>
                </div>
            ) : null}
        </header>
    );
}
