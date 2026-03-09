import { NextResponse } from "next/server";
import { exportUserData } from "@/lib/server/settings";

export async function GET() {
    try {
        const payload = await exportUserData();
        return NextResponse.json({ success: true, data: payload });
    } catch (error) {
        console.error("Settings export error:", error);
        return NextResponse.json({ success: false, error: "Failed to export settings" }, { status: 500 });
    }
}
