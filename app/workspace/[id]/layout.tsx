import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Workspace",
    robots: {
        index: false,
        follow: false,
    },
};

export default function WorkspaceIdLayout({ children }: { children: React.ReactNode }) {
    return children;
}
