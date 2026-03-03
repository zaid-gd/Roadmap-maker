"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();
    const isWorkspace = pathname.startsWith("/workspace");

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-2.5 group"
                >
                    <span className="text-xl" role="img" aria-label="Map emoji">
                        🗺️
                    </span>
                    <span className="font-display font-bold text-base text-text-primary tracking-tight">
                        ZNS RoadMap
                        <span className="text-gradient"> Studio</span>
                    </span>
                </Link>

                {!isWorkspace ? (
                    <Link
                        href="/create"
                        className="btn btn-primary text-sm py-2 px-4"
                    >
                        Create Roadmap
                    </Link>
                ) : null}
            </div>
        </header>
    );
}
