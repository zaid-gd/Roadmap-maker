import type { Metadata, Viewport } from "next";
import "./globals.css";

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
            <body className="noise-overlay min-h-screen">
                {children}
            </body>
        </html>
    );
}
