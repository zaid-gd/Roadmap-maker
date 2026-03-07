import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Read how ZNS RoadMap Studio handles local storage, Supabase sync, billing, and user data.",
    alternates: {
        canonical: "/privacy",
    },
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-obsidian text-text-primary">
            <Header />
            <main className="mx-auto max-w-4xl px-6 py-28">
                <h1 className="font-display text-4xl text-white">Privacy Policy</h1>
                <div className="mt-8 space-y-6 text-sm leading-7 text-text-secondary">
                    <p>ZNS RoadMap Studio stores workspace data locally by default. When Supabase sync is enabled, account-owned records are stored in your configured Supabase project.</p>
                    <p>Custom AI keys are stored in browser storage and only sent to the provider you selected to fulfill requests. Billing is processed through Stripe when enabled.</p>
                    <p>If you need data deletion or account support, use the contact page linked in the footer.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
