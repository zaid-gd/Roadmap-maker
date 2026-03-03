export default function Footer() {
    return (
        <footer className="border-t border-border py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-text-muted text-xs font-body">
                    Powered by{" "}
                    <span className="text-text-secondary font-medium">ZNS Nexus</span>
                    {" · "}
                    <span className="text-text-secondary font-medium">ZNS Enterprises</span>
                </p>
                <p className="text-text-muted text-xs">
                    &copy; {new Date().getFullYear()} ZNS Enterprises. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
