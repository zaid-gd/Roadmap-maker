import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Workspace",
    description: "Create a new interactive workspace from your guide, roadmap, or curriculum.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
    return children;
}
