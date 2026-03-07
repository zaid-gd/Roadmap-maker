import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-border py-8 mt-auto bg-obsidian-surface">
            <div className="w-full px-6 lg:px-12 flex flex-col gap-4 font-sans-display text-xs uppercase tracking-[0.2em] text-text-secondary">
                <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
                    <Link href="/pricing" className="hover:text-text-primary transition-colors">Pricing</Link>
                    <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy</Link>
                    <Link href="/terms" className="hover:text-text-primary transition-colors">Terms</Link>
                    <Link href="/contact" className="hover:text-text-primary transition-colors">Contact</Link>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p>
                        POWERED BY{" "}
                        <span className="text-text-primary">ZNS NEXUS</span>
                        {" // "}
                        <span className="text-text-secondary">ZNS ENTERPRISES</span>
                    </p>
                    <p>
                        {new Date().getFullYear()} (c) ZNS ENTERPRISES. ALL SYSTEMS SECURE.
                    </p>
                </div>
            </div>
        </footer>
    );
}
