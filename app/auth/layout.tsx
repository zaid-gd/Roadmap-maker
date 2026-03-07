import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Account Sign In",
    description: "Sign in with Supabase to sync workspaces and access account-backed features.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return children;
}
