import { NextRequest, NextResponse } from "next/server";
import { setWorkspacePublic } from "@/lib/server/gallery";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        if (typeof body.workspaceId !== "string" || body.workspaceId.trim().length === 0) {
            return NextResponse.json({ success: false, error: "workspaceId is required" }, { status: 400 });
        }

        const result = await setWorkspacePublic(body.workspaceId, Boolean(body.isPublic));
        return NextResponse.json(result);
    } catch (error) {
        console.error("Gallery visibility error:", error);
        return NextResponse.json({ success: false, error: "Failed to update visibility" }, { status: 500 });
    }
}
