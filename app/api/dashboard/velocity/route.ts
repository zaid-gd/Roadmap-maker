import { NextResponse } from "next/server";
import { getDashboardVelocity } from "@/lib/server/dashboard";

export async function GET() {
    try {
        const velocity = await getDashboardVelocity();
        return NextResponse.json({ success: true, velocity });
    } catch (error) {
        console.error("Dashboard velocity error:", error);
        return NextResponse.json({ success: false, error: "Failed to load dashboard velocity" }, { status: 500 });
    }
}
