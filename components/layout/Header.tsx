"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Github } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Logo } from "@/components/shared/Logo";

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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? "bg-obsidian/80 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.2)] md:h-16 h-14"
                    : "bg-transparent border-b border-transparent md:h-20 h-16"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-12 h-full flex items-center justify-between">
                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center transform group-hover:rotate-45 transition-transform duration-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                        <Logo />
                    </div>
                    <span className="font-sans-display font-black text-sm uppercase tracking-[0.2em] text-text-primary">
                        ZNS <span className="text-text-secondary font-medium">RoadMap Studio</span>
                    </span>
                </Link>

                {/* Right Actions Section (Desktop) */}
                <div className="hidden md:flex items-center gap-4">
                    <a
                        href="https://github.com/zaid-gd/Social-Media-Plan-maker"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors border border-border/50 text-text-secondary hover:text-white"
                        title="GitHub Repository"
                    >
                        <Github size={20} />
                    </a>

                    <ThemeToggle />

                    {!isWorkspace && (
                        <Link
                            href="/create"
                            className="ml-2 inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-obsidian font-sans-display font-bold text-xs uppercase tracking-wider px-6 py-2.5 transition-all duration-300 shadow-[0_4px_14px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)]"
                        >
                            Create New
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-3">
                    <ThemeToggle />
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-border/50 text-text-primary"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-obsidian-elevated/95 backdrop-blur-2xl border-b border-border shadow-2xl animate-fade-in p-6 space-y-6">
                    <nav className="flex flex-col gap-4">
                        <Link
                            href="/"
                            className="text-lg font-sans-display uppercase tracking-widest text-text-primary hover:text-indigo-400"
                        >
                            Home
                        </Link>
                        {!isWorkspace && (
                            <Link
                                href="/create"
                                className="text-lg font-sans-display uppercase tracking-widest text-text-primary hover:text-indigo-400"
                            >
                                Start New Project
                            </Link>
                        )}
                        <a
                            href="https://github.com/zaid-gd/Social-Media-Plan-maker"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-lg font-sans-display uppercase tracking-widest text-text-primary hover:text-indigo-400"
                        >
                            <Github size={20} />
                            GitHub
                        </a>
                    </nav>
                </div>
            )}
        </header>
    );
}
