import { NextRequest, NextResponse } from "next/server";
import { deleteAllUserData } from "@/lib/server/settings";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        if (body.confirmation !== "DELETE") {
            return NextResponse.json({ success: false, error: "Confirmation must equal DELETE" }, { status: 400 });
        }

        const result = await deleteAllUserData();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Settings delete error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete user data" }, { status: 500 });
    }
}
