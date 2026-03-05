import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Shield } from "lucide-react";
import { Providers } from "@/components/shared/Providers";
import { Analytics } from "@vercel/analytics/next";

export const viewport: Viewport = {
    themeColor: "#0a0e1a",
};

export const metadata: Metadata = {
    title: "ZNS RoadMap Studio — Paste Any Guide, Get a Full Interactive Workspace",
    description:
        "Transform any AI-generated roadmap, guide, or curriculum into a fully interactive, personalized workspace. Built by ZNS Nexus · ZNS Enterprises.",
    metadataBase: new URL("https://roadmap.znsnexus.com"),
    openGraph: {
        title: "ZNS RoadMap Studio",
        description: "Paste any guide — get a full interactive workspace.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <meta name="color-scheme" content="dark" />
            </head>
            <body className="noise-overlay min-h-screen flex flex-col">
                <Providers>
                    {children}
                </Providers>
                <footer className="border-t border-border bg-obsidian py-3 px-6 flex items-center justify-between text-[12px] text-[#5C6378] select-none">
                    <div>Powered by ZNS Nexus · ZNS Enterprises © 2026</div>
                    <div className="flex items-center gap-1.5">
                        <Shield size={12} />
                        <span>Your content is never stored or used for training</span>
                    </div>
                </footer>
                <Analytics />
            </body>
        </html>
    );
}
