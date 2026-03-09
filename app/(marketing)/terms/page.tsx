import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Use",
    description: "Terms governing the use of ZNS RoadMap Studio and its workspace, sync, and billing features.",
    alternates: {
        canonical: "/terms",
    },
};

export default function TermsPage() {
    return (
        <section className="mx-auto w-full max-w-4xl px-6 py-20 md:py-24">
            <h1 className="font-display text-4xl text-text-primary">Terms of Use</h1>
            <div className="mt-8 space-y-6 text-sm leading-7 text-text-secondary">
                <p>This product is provided as a workspace and content-structuring tool. You are responsible for the source material, generated outputs, and any third-party services you connect.</p>
                <p>Subscription features, if enabled, are governed by your Stripe billing agreement and the limits shown in the app.</p>
                <p>Use of the product must comply with applicable law and the terms of any upstream services you configure.</p>
            </div>
        </section>
    );
}
