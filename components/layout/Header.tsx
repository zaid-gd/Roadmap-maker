"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Github, Menu, Settings2, Sparkles, X } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Logo } from "@/components/shared/Logo";
import AuthButton from "@/components/auth/AuthButton";
import { PRIMARY_NAV_ITEMS } from "@/lib/navigation";

export default function Header() {
    const pathname = usePathname();
    const isWorkspace = pathname.startsWith("/workspace");
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    return (
        <header
            className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? "border-b border-white/[0.08] bg-obsidian/84 shadow-[0_18px_60px_rgba(0,0,0,0.34)] backdrop-blur-2xl md:h-18 h-16"
                    : "border-b border-transparent bg-transparent md:h-20 h-16"
            }`}
        >
            <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-5 lg:px-10">
                <Link href="/" className="group flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(85,116,232,0.22),rgba(191,148,71,0.14))] shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:rotate-6">
                        <Logo />
                    </div>
                    <div>
                        <span className="block font-sans-display text-[11px] font-black uppercase tracking-[0.26em] text-text-primary">
                            ZNS RoadMap Studio
                        </span>
                        <span className="block text-[11px] text-text-secondary">Premium local-first course workspaces</span>
                    </div>
                </Link>

                {!isWorkspace && (
                    <nav className="hidden items-center gap-1 rounded-full border border-white/8 bg-white/[0.03] px-2 py-2 lg:flex">
                        {PRIMARY_NAV_ITEMS.map((item) => {
                            const active = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition-all ${
                                        active
                                            ? "bg-white/[0.08] text-white"
                                            : "text-text-secondary hover:bg-white/[0.05] hover:text-white"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                )}

                <div className="hidden items-center gap-3 md:flex">
                    <a
                        href="https://github.com/zaid-gd/Social-Media-Plan-maker"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-text-secondary transition-colors hover:bg-white/[0.08] hover:text-white"
                        title="GitHub Repository"
                    >
                        <Github size={20} />
                    </a>
                    <ThemeToggle />
                    <AuthButton />
                    {!isWorkspace && (
                        <Link
                            href="/create"
                            className="ml-1 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-[linear-gradient(135deg,rgba(85,116,232,0.92),rgba(191,148,71,0.74))] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-obsidian transition-all duration-300 hover:brightness-110"
                        >
                            <Sparkles size={14} />
                            Create
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-3 md:hidden">
                    <ThemeToggle />
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-text-primary"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="absolute left-0 right-0 top-full border-b border-white/10 bg-[linear-gradient(180deg,rgba(22,26,34,0.98),rgba(11,13,18,0.98))] px-5 pb-6 pt-4 shadow-2xl backdrop-blur-2xl animate-fade-in md:hidden">
                    <div className="mb-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">Navigation</p>
                        <nav className="mt-4 grid gap-2">
                            {PRIMARY_NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-white/[0.05]"
                                >
                                    <span>{item.label}</span>
                                    <ArrowUpRight size={15} className="text-text-secondary" />
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="grid gap-3">
                        <AuthButton />
                        <Link
                            href="/settings"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-text-primary"
                        >
                            <Settings2 size={16} />
                            Studio Settings
                        </Link>
                        <a
                            href="https://github.com/zaid-gd/Social-Media-Plan-maker"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-text-primary"
                        >
                            <Github size={16} />
                            GitHub
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}
