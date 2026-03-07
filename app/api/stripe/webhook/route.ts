import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getStripe } from "@/lib/stripe"
import { createServiceRoleClient } from "@/utils/supabase/server"
import { isSupabaseServiceRoleConfigured } from "@/utils/supabase/config"
import { inferPlanFromPriceId } from "@/lib/billing"

export const runtime = "nodejs"

async function resolveUserId(subscription: Stripe.Subscription) {
    const stripe = getStripe()

    if (subscription.metadata?.user_id) {
        return subscription.metadata.user_id
    }

    if (typeof subscription.customer !== "string") {
        return null
    }

    const customer = await stripe.customers.retrieve(subscription.customer)
    if (customer.deleted) {
        return null
    }

    return customer.metadata?.user_id || null
}

async function updateSubscriptionRecord(
    supabase: ReturnType<typeof createServiceRoleClient>,
    subscription: Stripe.Subscription
) {
    const userId = await resolveUserId(subscription)
    if (!userId) return

    const priceId = subscription.items.data[0]?.price.id ?? null
    const currentPeriodStart = subscription.items.data[0]?.current_period_start ?? null
    const currentPeriodEnd = subscription.items.data[0]?.current_period_end ?? null
    const inferred = inferPlanFromPriceId(priceId)

    await supabase.from("subscriptions").upsert(
        {
            user_id: userId,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            plan_id:
                inferred.planId !== "free"
                    ? inferred.planId
                    : subscription.metadata?.plan_id || "free",
            billing_interval:
                inferred.planId !== "free"
                    ? inferred.billingInterval
                    : subscription.metadata?.billing_interval || "monthly",
            status: subscription.status,
            current_period_start:
                typeof currentPeriodStart === "number"
                    ? new Date(currentPeriodStart * 1000).toISOString()
                    : null,
            current_period_end:
                typeof currentPeriodEnd === "number"
                    ? new Date(currentPeriodEnd * 1000).toISOString()
                    : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
    )
}

export async function POST(req: NextRequest) {
    if (!isSupabaseServiceRoleConfigured()) {
        return NextResponse.json({ error: "Supabase service role is not configured" }, { status: 503 })
    }

    const stripe = getStripe()
    const body = await req.text()
    const signature = req.headers.get("stripe-signature")

    if (!signature) {
        return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error) {
        console.error("Webhook signature verification failed:", error)
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session
                if (session.mode === "subscription" && typeof session.subscription === "string") {
                    const subscription = await stripe.subscriptions.retrieve(session.subscription)
                    await updateSubscriptionRecord(supabase, subscription)
                }
                break
            }

            case "customer.subscription.created":
            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription
                await updateSubscriptionRecord(supabase, subscription)
                break
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription
                await supabase
                    .from("subscriptions")
                    .update({
                        plan_id: "free",
                        status: "canceled",
                        stripe_subscription_id: null,
                        stripe_price_id: null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("stripe_subscription_id", subscription.id)
                break
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice
                const subscriptionId =
                    typeof invoice.parent?.subscription_details?.subscription === "string"
                        ? invoice.parent.subscription_details.subscription
                        : null

                if (subscriptionId) {
                    await supabase
                        .from("subscriptions")
                        .update({
                            status: "past_due",
                            updated_at: new Date().toISOString(),
                        })
                        .eq("stripe_subscription_id", subscriptionId)
                }
                break
            }

            case "invoice.payment_succeeded": {
                const invoice = event.data.object as Stripe.Invoice
                const subscriptionId =
                    typeof invoice.parent?.subscription_details?.subscription === "string"
                        ? invoice.parent.subscription_details.subscription
                        : null

                if (subscriptionId) {
                    await supabase
                        .from("subscriptions")
                        .update({
                            status: "active",
                            updated_at: new Date().toISOString(),
                        })
                        .eq("stripe_subscription_id", subscriptionId)
                }
                break
            }

            default:
                console.log(`Unhandled Stripe event: ${event.type}`)
        }
    } catch (error) {
        console.error("Stripe webhook handling error:", error)
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
    }

    return NextResponse.json({ received: true })
}
