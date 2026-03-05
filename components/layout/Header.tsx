"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();
    const isWorkspace = pathname.startsWith("/workspace");

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-obsidian-surface/80 backdrop-blur-xl border-b border-border">
            <div className="w-full px-6 lg:px-12 h-16 flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-4 group"
                >
                    <div className="w-6 h-6 bg-indigo-500 rounded-sm flex items-center justify-center transform group-hover:rotate-45 transition-transform duration-500">
                        <div className="w-2 h-2 bg-obsidian rounded-sm" />
                    </div>
                    <span className="font-sans-display font-black text-sm uppercase tracking-[0.2em] text-text-primary">
                        ZNS <span className="text-text-secondary font-normal">NEXUS</span>
                    </span>
                </Link>

                {!isWorkspace ? (
                    <Link
                        href="/create"
                        className="font-sans-display text-xs uppercase tracking-widest text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/80 px-4 py-2 transition-colors bg-indigo-500/5 hover:bg-indigo-500/10"
                    >
                        INITIATE \ CREATE
                    </Link>
                ) : null}
            </div>
        </header>
    );
}
