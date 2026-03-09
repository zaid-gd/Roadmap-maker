import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Your Workspaces",
    description: "View the workspaces stored in your browser and synced account.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function WorkspacesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
