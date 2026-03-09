import { NextResponse } from "next/server";
import { getCreditStatus, listCreditTransactions } from "@/lib/server/credits";

export async function GET() {
    try {
        const [status, transactions] = await Promise.all([getCreditStatus(), listCreditTransactions()]);
        return NextResponse.json({ success: true, status, transactions });
    } catch (error) {
        if (
            (error as { code?: string } | null)?.code === "AUTH_ERROR" ||
            (error as Error | null)?.message?.includes("not authenticated") ||
            (error as Error | null)?.message === "Authentication required"
        ) {
            return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
        }
        console.error("Credit status error:", error);
        return NextResponse.json({ success: false, error: "Failed to load credit status" }, { status: 500 });
    }
}
