import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Notes",
    description: "Private notes tied to the authenticated Supabase user.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function NotesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
