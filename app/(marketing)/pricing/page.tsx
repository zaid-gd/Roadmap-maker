"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import FaqSchema from "@/components/seo/FaqSchema"
import { ArrowRight, CheckCircle2, HelpCircle, ShieldCheck, Sparkles, X } from "lucide-react"
import CheckoutButton from "@/components/payments/CheckoutButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
        <Card
            className={`relative flex h-full flex-col overflow-hidden px-0 py-7 ${
                isPopular ? "border-[var(--color-border-strong)]" : ""
            }`}
        >
            <CardHeader className="mb-8 p-0">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-text-secondary">{plan.name}</p>
                        <CardTitle className="mt-3 text-4xl font-display text-text-primary">
                            {priceDisplay.primary}
                            <span className="ml-2 text-base font-sans text-text-secondary">{priceDisplay.secondary}</span>
                        </CardTitle>
                        <p className="mt-2 text-sm text-text-secondary">{priceDisplay.tertiary}</p>
                    </div>

                    {isPopular && (
                        <span className="border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                            Most Popular
                        </span>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col p-0">
                <div className="mb-8 space-y-3">
                    {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3 text-sm text-text-primary">
                            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-text-primary" />
                            <span>{feature}</span>
                        </div>
                    ))}
                    {plan.notIncluded.map((feature) => (
                        <div key={feature} className="flex items-start gap-3 text-sm text-text-secondary">
                            <X size={18} className="mt-0.5 shrink-0 text-text-soft" />
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="mt-auto p-0">
                {isFree ? (
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="w-full"
                    >
                        <Link href="/create">
                            Get Started Free
                            <ArrowRight size={16} />
                        </Link>
                    </Button>
                ) : (
                    <div className="w-full">
                        <CheckoutButton
                            planId={planId}
                            interval={interval}
                            label={planId === "pro" ? "Upgrade to Pro" : "Upgrade to Agency"}
                        />
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}

export default function PricingPage() {
    const [interval, setInterval] = useState<BillingInterval>("monthly")

    return (
        <div className="relative overflow-hidden pt-24 text-text-primary">
                <FaqSchema faqs={FAQS} />

                <section className="relative mx-auto max-w-7xl px-6 pb-10 pt-14 lg:px-12">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mb-5 inline-flex items-center gap-2 border border-border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                            <Sparkles size={14} className="text-text-primary" />
                            Billing for creators, teams, and agencies
                        </div>
                        <h1 className="text-5xl font-display leading-none text-text-primary sm:text-6xl">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="mx-auto mt-5 max-w-2xl text-base text-text-secondary">
                            Start free, scale when the studio becomes mission-critical, and manage billing in Stripe without hidden add-ons or platform lock-in.
                        </p>
                    </div>

                    <div className="mt-10 flex justify-center">
                        <div className="inline-flex items-center gap-2 border border-border p-1.5">
                            {(["monthly", "annual"] as BillingInterval[]).map((value) => (
                                <Button
                                    key={value}
                                    type="button"
                                    variant={interval === value ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setInterval(value)}
                                    className={interval === value ? "" : "text-text-secondary"}
                                >
                                    {value === "annual" ? "Annual" : "Monthly"}
                                </Button>
                            ))}
                            <span className="min-w-[138px] border border-border px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] whitespace-nowrap text-text-secondary">
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
                        <div className="flex h-11 w-11 items-center justify-center border border-border">
                            <HelpCircle size={18} className="text-text-primary" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-display text-text-primary">Frequently Asked Questions</h2>
                            <p className="text-sm text-text-secondary">Everything operational, billing, and downgrade related in one place.</p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {FAQS.map((item) => (
                            <article
                                key={item.question}
                                className="border-y border-border p-6"
                            >
                                <h3 className="mb-3 text-lg font-semibold text-text-primary">{item.question}</h3>
                                <p className="text-sm leading-7 text-text-secondary">{item.answer}</p>
                            </article>
                        ))}
                    </div>

                    <div className="mt-8 flex items-center gap-3 border-y border-border p-5 text-sm text-text-secondary">
                        <ShieldCheck size={18} className="shrink-0 text-text-primary" />
                        Stripe Checkout handles card entry, SCA, and international card support. Your app only receives Stripe-managed session and subscription state.
                    </div>
                </section>
        </div>
    )
}
