"use client"

import { useState } from "react"

export default function ManageBillingButton() {
    const [loading, setLoading] = useState(false)

    const handlePortal = async () => {
        setLoading(true)

        try {
            const res = await fetch("/api/stripe/portal", { method: "POST" })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to open billing portal")
            }

            if (data.url) {
                window.location.assign(data.url)
            }
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to open billing portal. Please try again."
            window.alert(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            type="button"
            onClick={handlePortal}
            disabled={loading}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {loading ? "Opening..." : "Manage Billing"}
        </button>
    )
}
