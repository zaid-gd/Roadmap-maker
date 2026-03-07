import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createServerClient } from "@/utils/supabase/server"
import { isSupabaseConfigured } from "@/utils/supabase/config"

function getAppUrl() {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

export async function POST() {
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

    const { data: subscription } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle()

    if (!subscription?.stripe_customer_id) {
        return NextResponse.json({ error: "No billing account found" }, { status: 404 })
    }

    try {
        const stripe = getStripe()
        const session = await stripe.billingPortal.sessions.create({
            customer: subscription.stripe_customer_id,
            return_url: `${getAppUrl()}/settings?tab=billing`,
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error("Stripe portal error:", error)
        return NextResponse.json({ error: "Failed to open billing portal" }, { status: 500 })
    }
}
