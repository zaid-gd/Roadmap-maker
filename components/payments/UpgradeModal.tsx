"use client"

import { useState } from "react"
import { X } from "lucide-react"
import CheckoutButton from "@/components/payments/CheckoutButton"
import { PLANS, type BillingInterval } from "@/lib/plans"

interface UpgradeModalProps {
    message: string
    onClose: () => void
}

export default function UpgradeModal({ message, onClose }: UpgradeModalProps) {
    const [interval, setInterval] = useState<BillingInterval>("monthly")

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="Close upgrade modal"
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.14),_transparent_42%),linear-gradient(180deg,_rgba(26,29,39,0.98),_rgba(15,17,23,0.98))] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.45)]">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className="mb-2 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
                            Limit reached
                        </p>
                        <h2 className="text-2xl font-display text-white">Upgrade your plan</h2>
                        <p className="mt-2 max-w-xl text-sm text-text-secondary">{message}</p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-white/10 bg-white/5 p-2 text-text-secondary transition-colors hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="mb-6 inline-flex rounded-full border border-white/10 bg-black/20 p-1">
                    {(["monthly", "annual"] as BillingInterval[]).map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setInterval(value)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                interval === value
                                    ? "bg-indigo-500 text-obsidian"
                                    : "text-text-secondary hover:text-white"
                            }`}
                        >
                            {value === "annual" ? "Annual · Save 17%" : "Monthly"}
                        </button>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {(["pro", "agency"] as const).map((planId) => {
                        const plan = PLANS[planId]
                        const monthlyDisplay =
                            interval === "annual"
                                ? `$${(plan.annualPrice / 12).toFixed(2)}`
                                : `$${plan.monthlyPrice}`

                        return (
                            <div
                                key={planId}
                                className={`rounded-2xl border p-5 ${
                                    planId === "pro"
                                        ? "border-indigo-400/40 bg-indigo-500/10 shadow-[0_0_0_1px_rgba(129,140,248,0.15)]"
                                        : "border-white/10 bg-white/5"
                                }`}
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                                    {planId === "pro" && (
                                        <span className="rounded-full border border-indigo-400/30 bg-indigo-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-200">
                                            Popular
                                        </span>
                                    )}
                                </div>

                                <div className="mb-1 text-3xl font-display text-white">
                                    {monthlyDisplay}
                                    <span className="ml-1 text-sm font-body text-text-secondary">/mo</span>
                                </div>
                                <p className="mb-5 text-xs uppercase tracking-[0.2em] text-text-secondary">
                                    {interval === "annual"
                                        ? `Billed $${plan.annualPrice}/year`
                                        : "Billed monthly"}
                                </p>

                                <CheckoutButton
                                    planId={planId}
                                    interval={interval}
                                    label={`Get ${plan.name}`}
                                />
                            </div>
                        )
                    })}
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-6 w-full text-sm text-text-secondary transition-colors hover:text-white"
                >
                    Continue with Free plan
                </button>
            </div>
        </div>
    )
}
