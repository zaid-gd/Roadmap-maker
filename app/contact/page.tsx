import type { Metadata } from "next";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
    title: "Contact",
    description: "Contact ZNS RoadMap Studio for support, billing help, and partnership inquiries.",
    alternates: {
        canonical: "/contact",
    },
};

export default function ContactPage() {
    return (
        <div className="flex min-h-full flex-col bg-obsidian text-text-primary">
            <Header />
            <main className="mx-auto flex-1 w-full max-w-4xl px-6 py-28">
                <h1 className="font-display text-4xl text-white">Contact</h1>
                <div className="mt-8 space-y-6 text-sm leading-7 text-text-secondary">
                    <p>
                        For support, billing issues, or data questions, email{" "}
                        <a className="text-indigo-300 hover:text-indigo-200" href="mailto:support@znsnexus.com">support@znsnexus.com</a>.
                    </p>
                    <p>
                        For partnerships or enterprise requests, visit{" "}
                        <a className="text-indigo-300 hover:text-indigo-200" href="https://znsnexus.com" target="_blank" rel="noopener noreferrer">znsnexus.com</a>.
                    </p>
                </div>
            </main>
        </div>
    );
}
