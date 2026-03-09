import { NextRequest, NextResponse } from "next/server";
import { saveSrsItems } from "@/lib/server/srs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const items = Array.isArray(body?.items) ? body.items : [];
        const saved = await saveSrsItems(items);
        return NextResponse.json({ success: true, items: saved });
    } catch (error) {
        console.error("SRS save error:", error);
        return NextResponse.json({ success: false, error: "Failed to save spaced repetition state" }, { status: 500 });
    }
}
