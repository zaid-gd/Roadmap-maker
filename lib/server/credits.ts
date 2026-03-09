import type { CreditStatus, CreditTransaction } from "@/types";
import { CREDIT_COSTS, firstOfNextMonth, getPlanAllowance, maybeResetCredits, type CreditKind } from "@/lib/credits";
import { getEffectivePlanId } from "@/lib/billing";
import { requireServerUser } from "@/lib/server/auth";

type LedgerRow = {
    user_id: string;
    plan_id: string;
    allowance: number;
    used: number;
    reset_at: string;
    updated_at?: string;
};

type TransactionRow = {
    id: string;
    kind: CreditTransaction["kind"];
    amount: number;
    created_at: string;
    metadata?: Record<string, string>;
};

async function getOrCreateLedger() {
    const { supabase, user } = await requireServerUser();
    const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan_id, status")
        .eq("user_id", user.id)
        .maybeSingle();

    const planId = getEffectivePlanId(subscription);
    const allowance = getPlanAllowance(planId);

    const { data } = await supabase
        .from("credit_ledgers")
        .select("user_id, plan_id, allowance, used, reset_at")
        .eq("user_id", user.id)
        .maybeSingle();

    const baseLedger: LedgerRow = data ?? {
        user_id: user.id,
        plan_id: planId,
        allowance,
        used: 0,
        reset_at: firstOfNextMonth().toISOString(),
    };

    const normalized = maybeResetCredits({
        ...baseLedger,
        plan_id: planId,
        allowance,
    });

    const { data: upserted, error } = await supabase
        .from("credit_ledgers")
        .upsert(
            {
                user_id: user.id,
                plan_id: normalized.plan_id,
                allowance: normalized.allowance,
                used: normalized.used,
                reset_at: normalized.reset_at,
            },
            { onConflict: "user_id" },
        )
        .select("user_id, plan_id, allowance, used, reset_at")
        .single();

    if (error) throw error;
    return { supabase, user, ledger: upserted as LedgerRow };
}

export async function getCreditStatus(): Promise<CreditStatus> {
    const { ledger } = await getOrCreateLedger();

    return {
        planId: ledger.plan_id,
        allowance: ledger.allowance,
        used: ledger.used,
        remaining: Math.max(0, ledger.allowance - ledger.used),
        resetDate: ledger.reset_at,
    };
}

export async function listCreditTransactions(limit = 20): Promise<CreditTransaction[]> {
    const { supabase, user } = await requireServerUser();
    const { data, error } = await supabase
        .from("credit_transactions")
        .select("id, kind, amount, created_at, metadata")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) throw error;

    return (data ?? []).map((row) => {
        const transaction = row as TransactionRow;
        return {
            id: transaction.id,
            kind: transaction.kind,
            amount: transaction.amount,
            createdAt: transaction.created_at,
            metadata: transaction.metadata,
        };
    });
}

export async function deductCredits(options: {
    kind: CreditKind;
    metadata?: Record<string, string>;
    amount?: number;
    userApiKey?: string | null;
}) {
    const amount = options.amount ?? CREDIT_COSTS[options.kind];
    if (options.userApiKey?.trim()) {
        return {
            charged: false,
            reason: "byok" as const,
            status: await getCreditStatus(),
        };
    }

    const { supabase, user, ledger } = await getOrCreateLedger();
    if (amount <= 0) {
        return {
            charged: false,
            reason: "free_action" as const,
            status: {
                planId: ledger.plan_id,
                allowance: ledger.allowance,
                used: ledger.used,
                remaining: Math.max(0, ledger.allowance - ledger.used),
                resetDate: ledger.reset_at,
            },
        };
    }

    if (ledger.used + amount > ledger.allowance) {
        return {
            charged: false,
            reason: "insufficient" as const,
            status: {
                planId: ledger.plan_id,
                allowance: ledger.allowance,
                used: ledger.used,
                remaining: Math.max(0, ledger.allowance - ledger.used),
                resetDate: ledger.reset_at,
            },
        };
    }

    const nextUsed = ledger.used + amount;
    const { error: ledgerError } = await supabase
        .from("credit_ledgers")
        .update({ used: nextUsed, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

    if (ledgerError) throw ledgerError;

    const { error: transactionError } = await supabase.from("credit_transactions").insert({
        user_id: user.id,
        kind: options.kind,
        amount,
        metadata: options.metadata ?? {},
    });

    if (transactionError) throw transactionError;

    return {
        charged: true,
        reason: "deducted" as const,
        status: {
            planId: ledger.plan_id,
            allowance: ledger.allowance,
            used: nextUsed,
            remaining: Math.max(0, ledger.allowance - nextUsed),
            resetDate: ledger.reset_at,
        },
    };
}
