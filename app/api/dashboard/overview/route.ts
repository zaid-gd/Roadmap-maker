import { NextResponse } from "next/server";
import { getDashboardOverview } from "@/lib/server/dashboard";

export async function GET() {
    try {
        const overview = await getDashboardOverview();
        return NextResponse.json({ success: true, overview });
    } catch (error) {
        console.error("Dashboard overview error:", error);
        return NextResponse.json({ success: false, error: "Failed to load dashboard overview" }, { status: 500 });
    }
}
