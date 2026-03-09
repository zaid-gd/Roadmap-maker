import { NextRequest, NextResponse } from "next/server";
import { listGallery } from "@/lib/server/gallery";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const items = await listGallery({
            query: searchParams.get("q") ?? undefined,
            mode: searchParams.get("mode") ?? undefined,
            contentType: searchParams.get("contentType") ?? undefined,
        });
        return NextResponse.json({ success: true, items });
    } catch (error) {
        console.error("Gallery list error:", error);
        return NextResponse.json({ success: false, error: "Failed to load gallery" }, { status: 500 });
    }
}
