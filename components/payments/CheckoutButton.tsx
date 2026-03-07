"use client"

import { useState } from "react"
import { type BillingInterval } from "@/lib/plans"

interface CheckoutButtonProps {
    planId: "pro" | "agency"
    interval: BillingInterval
    label?: string
    className?: string
}

export default function CheckoutButton({
    planId,
    interval,
    label = "Upgrade now",
    className = "",
}: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleCheckout = async () => {
        setLoading(true)

        try {
            const res = await fetch("/api/stripe/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId, interval }),
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || "Checkout failed")
            }

            window.location.assign(data.url)
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Something went wrong. Please try again."
            window.alert(message)
            setLoading(false)
        }
    }

    return (
        <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className={`w-full rounded-xl border border-indigo-400/30 bg-indigo-500 px-4 py-3 text-sm font-semibold text-obsidian transition-all duration-200 hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
            {loading ? "Redirecting to Stripe..." : label}
        </button>
    )
}
