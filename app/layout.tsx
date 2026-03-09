import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";
import { APP_NAME, APP_TAGLINE, BRAND_OWNER } from "@/lib/constants";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://roadmap.znsnexus.com";

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
        { media: "(prefers-color-scheme: dark)", color: "#0C0E14" },
    ],
};

export const metadata: Metadata = {
    title: {
        default: `${APP_NAME} - Paste Any Guide, Get a Full Interactive Workspace`,
        template: `%s | ${APP_NAME}`,
    },
    description: `Transform any roadmap, guide, or curriculum into a fully interactive workspace. Built by ${BRAND_OWNER}.`,
    metadataBase: new URL(appUrl),
    manifest: "/manifest.json",
    alternates: {
        canonical: "/",
    },
    icons: {
        icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
        shortcut: ["/favicon.svg"],
        apple: ["/favicon.svg"],
    },
    openGraph: {
        title: `${APP_NAME} - Paste Any Guide, Get a Full Interactive Workspace`,
        description: APP_TAGLINE,
        type: "website",
        url: appUrl,
        siteName: APP_NAME,
        images: [
            {
                url: "/opengraph-image",
                width: 1200,
                height: 630,
                alt: APP_NAME,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: `${APP_NAME} - Paste Any Guide, Get a Full Interactive Workspace`,
        description: APP_TAGLINE,
        images: ["/twitter-image"],
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
            <body className="min-h-screen bg-page text-text">
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded focus:bg-[var(--color-accent)] focus:px-4 focus:py-2 focus:text-white"
                >
                    Skip to main content
                </a>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
