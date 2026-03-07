import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { PLANS, type BillingInterval } from "@/lib/plans"
import { createServerClient } from "@/utils/supabase/server"
import { isSupabaseConfigured } from "@/utils/supabase/config"

function getAppUrl() {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

export async function POST(req: NextRequest) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 })
    }

    const supabase = await createServerClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { planId, interval = "monthly" } = (await req.json()) as {
        planId: "pro" | "agency"
        interval?: BillingInterval
    }

    if (planId !== "pro" && planId !== "agency") {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }
    const plan = PLANS[planId]

    const priceId = plan.stripePriceId[interval]
    if (!priceId) {
        return NextResponse.json({ error: "Price not configured" }, { status: 400 })
    }

    try {
        const stripe = getStripe()
        const { data: existingSubscription } = await supabase
            .from("subscriptions")
            .select("stripe_customer_id")
            .eq("user_id", user.id)
            .maybeSingle()

        let customerId = existingSubscription?.stripe_customer_id ?? null

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email ?? undefined,
                name: user.user_metadata?.full_name || user.user_metadata?.name || undefined,
                metadata: { user_id: user.id },
            })
            customerId = customer.id
        }

        const appUrl = getAppUrl()
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${appUrl}/settings?tab=billing&payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/pricing?payment=cancelled`,
            metadata: {
                user_id: user.id,
                plan_id: planId,
                billing_interval: interval,
            },
            subscription_data: {
                metadata: {
                    user_id: user.id,
                    plan_id: planId,
                    billing_interval: interval,
                },
            },
            allow_promotion_codes: true,
            billing_address_collection: "auto",
            automatic_tax: { enabled: false },
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error("Stripe checkout error:", error)
        return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
    }
}
