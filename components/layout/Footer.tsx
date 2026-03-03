export default function Footer() {
    return (
        <footer className="border-t border-white/5 py-8 mt-auto bg-obsidian-surface">
            <div className="w-full px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans-display text-[10px] uppercase tracking-[0.2em] text-text-muted">
                <p>
                    POWERED BY{" "}
                    <span className="text-text-primary">ZNS NEXUS</span>
                    {" // "}
                    <span className="text-text-secondary">ZNS ENTERPRISES</span>
                </p>
                <p>
                    {new Date().getFullYear()} © ZNS ENTERPRISES. ALL SYSTEMS SECURE.
                </p>
            </div>
        </footer>
    );
}
