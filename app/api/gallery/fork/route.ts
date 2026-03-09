import { NextRequest, NextResponse } from "next/server";
import { forkGalleryRoadmap } from "@/lib/server/gallery";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        if (typeof body.workspaceId !== "string" || body.workspaceId.trim().length === 0) {
            return NextResponse.json({ success: false, error: "workspaceId is required" }, { status: 400 });
        }

        const roadmap = await forkGalleryRoadmap(body.workspaceId);
        return NextResponse.json({ success: true, roadmap });
    } catch (error) {
        console.error("Gallery fork error:", error);
        return NextResponse.json({ success: false, error: "Failed to fork workspace" }, { status: 500 });
    }
}
