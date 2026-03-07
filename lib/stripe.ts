import Stripe from "stripe"

let stripeClient: Stripe | null = null

export function getStripe() {
    if (stripeClient) return stripeClient

    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
        throw new Error("STRIPE_SECRET_KEY is not configured")
    }

    stripeClient = new Stripe(secretKey, {
        apiVersion: "2026-02-25.clover",
        typescript: true,
    })

    return stripeClient
}
