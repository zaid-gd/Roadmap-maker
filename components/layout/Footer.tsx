import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { FOOTER_NAV_GROUPS } from "@/lib/navigation";

type FooterLink = (typeof FOOTER_NAV_GROUPS)[number]["items"][number];

export default function Footer() {
    const links: FooterLink[] = FOOTER_NAV_GROUPS.flatMap((group) => [...group.items]);

    return (
        <footer className="relative z-10 overflow-hidden border-t border-border bg-page">
            <div className="page-shell-wide flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface">
                        <Logo />
                    </span>
                    <div>
                        <p className="text-sm font-medium text-text">Studio</p>
                        <p className="text-xs text-text-soft">A structured workspace platform.</p>
                    </div>
                </div>

                <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
                    {links.map((link) => (
                        <Link key={link.href} href={link.href} className="text-sm text-text-muted transition-colors hover:text-text">
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <p className="text-xs text-text-soft">&copy; {new Date().getFullYear()} All rights reserved.</p>
            </div>
        </footer>
    );
}
