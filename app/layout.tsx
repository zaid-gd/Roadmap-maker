import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Shield } from "lucide-react";
import { Providers } from "@/components/shared/Providers";
import { APP_NAME, APP_TAGLINE, BRAND_OWNER } from "@/lib/constants";

export const viewport: Viewport = {
    themeColor: "#0a0e1a",
};

export const metadata: Metadata = {
    title: `${APP_NAME} - Paste Any Guide, Get a Full Interactive Workspace`,
    description: `Transform any roadmap, guide, or curriculum into a fully interactive workspace. Built by ${BRAND_OWNER}.`,
    metadataBase: new URL("https://roadmap.znsnexus.com"),
    openGraph: {
        title: APP_NAME,
        description: APP_TAGLINE,
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
                <Providers>{children}</Providers>
                <footer className="border-t border-border bg-obsidian py-3 px-6 flex items-center justify-between text-[12px] text-[#5C6378] select-none">
                    <div>{`Powered by ${BRAND_OWNER} (c) 2026`}</div>
                    <div className="flex items-center gap-1.5">
                        <Shield size={12} />
                        <span>Your content stays local unless you configure cloud sync.</span>
                    </div>
                </footer>
            </body>
        </html>
    );
}
