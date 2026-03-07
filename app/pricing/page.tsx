"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, HelpCircle, ShieldCheck, Sparkles, X } from "lucide-react"
import Header from "@/components/layout/Header"
import CheckoutButton from "@/components/payments/CheckoutButton"
import { PLANS, type BillingInterval, type PlanId } from "@/lib/plans"

const FAQS = [
    {
        question: "Which payment methods are accepted?",
        answer: "All major credit and debit cards are supported, including Visa, Mastercard, and Amex. International cards are supported as well.",
    },
    {
        question: "Can I cancel anytime?",
        answer: "Yes. Cancel from Settings and you keep access until the end of the current billing period.",
    },
    {
        question: "What happens to my workspaces if I downgrade?",
        answer: "Your existing workspaces stay available. If you are over the free limit, you can still view them but cannot create new ones until you are back under the limit or upgrade again.",
    },
    {
        question: "Is there a free trial?",
        answer: "The Free plan is permanently free and includes 3 workspaces.",
    },
    {
        question: "Do you offer refunds?",
        answer: "Yes. Contact support within 7 days and we will process a full refund.",
    },
    {
        question: "Can I switch between monthly and annual?",
        answer: "Yes. You can change billing cadence from Settings at any time through Stripe Customer Portal.",
    },
]

function formatMonthlyEquivalent(value: number) {
    return Number.isInteger(value / 12) ? `${value / 12}` : `${(value / 12).toFixed(2)}`
}

function PlanCard({
    planId,
    interval,
}: {
    planId: PlanId
    interval: BillingInterval
}) {
    const plan = PLANS[planId]
    const isPopular = planId === "pro"
    const isFree = planId === "free"
    const priceDisplay = useMemo(() => {
        if (isFree) {
            return {
                primary: "$0",
                secondary: "forever",
                tertiary: "No credit card required",
            }
        }

        if (interval === "annual") {
            return {
                primary: `$${formatMonthlyEquivalent(plan.annualPrice)}`,
                secondary: "/mo",
                tertiary: `Billed $${plan.annualPrice}/year`,
            }
        }

        return {
            primary: `$${plan.monthlyPrice}`,
            secondary: "/mo",
            tertiary: "Billed monthly in USD",
        }
    }, [interval, isFree, plan])

    return (
        <article
            className={`relative flex h-full flex-col overflow-hidden rounded-[30px] border p-7 ${
                isPopular
                    ? "border-indigo-400/40 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_44%),linear-gradient(180deg,_rgba(26,29,39,0.98),_rgba(15,17,23,0.98))] shadow-[0_0_0_1px_rgba(129,140,248,0.18),0_24px_60px_rgba(28,39,122,0.3)]"
                    : "border-white/10 bg-[linear-gradient(180deg,rgba(26,29,39,0.98),rgba(15,17,23,0.98))]"
            }`}
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-text-secondary">{plan.name}</p>
                    <h2 className="mt-3 text-4xl font-display text-white">
                        {priceDisplay.primary}
                        <span className="ml-2 text-base font-body text-text-secondary">
                            {priceDisplay.secondary}
                        </span>
                    </h2>
                    <p className="mt-2 text-sm text-text-secondary">{priceDisplay.tertiary}</p>
                </div>

                {isPopular && (
                    <span className="rounded-full border border-indigo-300/40 bg-indigo-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-100 shadow-[0_0_24px_rgba(99,102,241,0.25)]">
                        Most Popular
                    </span>
                )}
            </div>

            <div className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm text-text-primary">
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" />
                        <span>{feature}</span>
                    </div>
                ))}
                {plan.notIncluded.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm text-text-secondary">
                        <X size={18} className="mt-0.5 shrink-0 text-text-muted" />
                        <span>{feature}</span>
                    </div>
                ))}
            </div>

            <div className="mt-auto">
                {isFree ? (
                    <Link
                        href="/create"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                    >
                        Get Started Free
                        <ArrowRight size={16} />
                    </Link>
                ) : (
                    <CheckoutButton
                        planId={planId}
                        interval={interval}
                        label={planId === "pro" ? "Upgrade to Pro" : "Upgrade to Agency"}
                    />
                )}
            </div>
        </article>
    )
}

export default function PricingPage() {
    const [interval, setInterval] = useState<BillingInterval>("monthly")

    return (
        <div className="flex min-h-full flex-col bg-obsidian text-text-primary">
            <Header />

            <main className="relative flex-1 overflow-hidden pt-24">
                <div className="pointer-events-none absolute inset-0 hero-mesh-gradient opacity-60" />
                <div className="pointer-events-none absolute inset-0 landing-grid-bg opacity-25" />

                <section className="relative mx-auto max-w-7xl px-6 pb-10 pt-14 lg:px-12">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                            <Sparkles size={14} className="text-indigo-300" />
                            Billing for creators, teams, and agencies
                        </div>
                        <h1 className="text-5xl font-display leading-none text-white sm:text-6xl">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="mx-auto mt-5 max-w-2xl text-base text-text-secondary">
                            Start free, scale when the studio becomes mission-critical, and manage billing in Stripe without hidden add-ons or platform lock-in.
                        </p>
                    </div>

                    <div className="mt-10 flex justify-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
                            {(["monthly", "annual"] as BillingInterval[]).map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setInterval(value)}
                                    className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                                        interval === value
                                            ? "bg-indigo-500 text-obsidian"
                                            : "text-text-secondary hover:text-white"
                                    }`}
                                >
                                    {value === "annual" ? "Annual" : "Monthly"}
                                </button>
                            ))}
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-500/15 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                                Save 2 months
                            </span>
                        </div>
                    </div>
                </section>

                <section className="relative mx-auto max-w-7xl px-6 pb-16 lg:px-12">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <PlanCard planId="free" interval={interval} />
                        <PlanCard planId="pro" interval={interval} />
                        <PlanCard planId="agency" interval={interval} />
                    </div>
                </section>

                <section className="relative mx-auto max-w-6xl px-6 pb-20 lg:px-12">
                    <div className="mb-8 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                            <HelpCircle size={18} className="text-indigo-300" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-display text-white">Frequently Asked Questions</h2>
                            <p className="text-sm text-text-secondary">Everything operational, billing, and downgrade related in one place.</p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {FAQS.map((item) => (
                            <article
                                key={item.question}
                                className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
                            >
                                <h3 className="mb-3 text-lg font-semibold text-white">{item.question}</h3>
                                <p className="text-sm leading-7 text-text-secondary">{item.answer}</p>
                            </article>
                        ))}
                    </div>

                    <div className="mt-8 flex items-center gap-3 rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(34,211,238,0.06))] p-5 text-sm text-text-secondary">
                        <ShieldCheck size={18} className="shrink-0 text-emerald-300" />
                        Stripe Checkout handles card entry, SCA, and international card support. Your app only receives Stripe-managed session and subscription state.
                    </div>
                </section>
            </main>
        </div>
    )
}
