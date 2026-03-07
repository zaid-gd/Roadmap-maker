import { PLANS, type BillingInterval, type PlanId, getPlanFromPriceId } from "@/lib/plans"

export type SubscriptionStatus =
    | "active"
    | "trialing"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired"
    | "paused"

export interface SubscriptionRecord {
    id?: string
    user_id: string
    stripe_customer_id: string | null
    stripe_subscription_id: string | null
    stripe_price_id: string | null
    plan_id: string | null
    billing_interval: BillingInterval | null
    status: string | null
    current_period_start: string | null
    current_period_end: string | null
    cancel_at_period_end: boolean | null
    created_at?: string
    updated_at?: string
}

const ACTIVE_STATUSES = new Set<SubscriptionStatus>(["active", "trialing"])

export function isSubscriptionActive(subscription?: Pick<SubscriptionRecord, "status"> | null) {
    return ACTIVE_STATUSES.has((subscription?.status ?? "") as SubscriptionStatus)
}

export function getEffectivePlanId(subscription?: Pick<SubscriptionRecord, "plan_id" | "status"> | null): PlanId {
    const planId = subscription?.plan_id
    if (isSubscriptionActive(subscription) && planId && planId in PLANS) {
        return planId as PlanId
    }
    return "free"
}

export function isPaidPlan(planId: string | null | undefined) {
    return planId === "pro" || planId === "agency"
}

export function getPlanName(planId: string | null | undefined) {
    if (!planId || !(planId in PLANS)) return PLANS.free.name
    return PLANS[planId as PlanId].name
}

export function inferPlanFromPriceId(priceId: string | null | undefined) {
    const lookup = getPlanFromPriceId(priceId)
    if (!lookup) {
        return {
            planId: "free" as PlanId,
            billingInterval: "monthly" as BillingInterval,
        }
    }

    return {
        planId: lookup.planId,
        billingInterval: lookup.interval,
    }
}
