import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import { Providers } from "@/components/shared/Providers";
import { APP_NAME, APP_TAGLINE, BRAND_OWNER } from "@/lib/constants";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://roadmap.znsnexus.com";

export const viewport: Viewport = {
    themeColor: "#0a0e1a",
};

export const metadata: Metadata = {
    title: {
        default: `${APP_NAME} - Paste Any Guide, Get a Full Interactive Workspace`,
        template: `%s | ${APP_NAME}`,
    },
    description: `Transform any roadmap, guide, or curriculum into a fully interactive workspace. Built by ${BRAND_OWNER}.`,
    metadataBase: new URL(appUrl),
    alternates: {
        canonical: "/",
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
    const pathname = (await headers()).get("x-pathname") || "";
    const hideFooter = ["/embed/", "/workspace/", "/share/"].some((prefix) => pathname.startsWith(prefix));

    return (
        <html lang="en">
            <head>
                <meta name="color-scheme" content="dark" />
            </head>
            <body className="noise-overlay min-h-screen bg-obsidian">
                <Providers>
                    <div className="flex min-h-screen flex-col">
                        <div className="flex-1">{children}</div>
                        {!hideFooter && <Footer />}
                    </div>
                </Providers>
            </body>
        </html>
    );
}
