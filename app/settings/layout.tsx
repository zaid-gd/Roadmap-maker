import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Settings",
    description: "Manage your AI configuration, billing, appearance, and privacy settings.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
