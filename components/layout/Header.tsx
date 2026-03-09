"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import AuthButton from "@/components/auth/AuthButton";
import { Logo } from "@/components/shared/Logo";
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
                "sticky top-0 z-50 transition-[background-color,border-color] duration-200",
                scrolled ? "border-b border-border bg-page/92 backdrop-blur-sm" : "border-b border-transparent bg-page/88"
            )}
        >
            <div className="page-shell-wide flex h-16 items-center justify-between gap-4">
                <Link href="/" className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface">
                        <Logo />
                    </span>
                    <span className="truncate text-sm font-medium tracking-[-0.02em] text-text">Studio</span>
                </Link>

                <nav className="hidden items-center gap-8 lg:flex">
                    {navItems.map((item) => {
                        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "text-sm transition-colors",
                                    active ? "text-text" : "text-text-muted hover:text-text"
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

                <button
                    type="button"
                    onClick={() => setMobileOpen((value) => !value)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-text lg:hidden"
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                >
                    {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            {mobileOpen ? (
                <div className="border-t border-border bg-page lg:hidden">
                    <div className="page-shell-wide flex flex-col gap-2 py-4">
                        {navItems.map((item) => {
                            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "rounded-md px-3 py-2 text-sm transition-colors",
                                        active ? "bg-surface-subtle text-text" : "text-text-muted hover:bg-surface-subtle hover:text-text"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                        <div className="pt-2">
                            <AuthButton />
                        </div>
                    </div>
                </div>
            ) : null}
        </header>
    );
}
