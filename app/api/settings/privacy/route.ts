import { NextRequest, NextResponse } from "next/server";
import { getPrivacySettings, updatePrivacySettings } from "@/lib/server/settings";

export async function GET() {
    try {
        const settings = await getPrivacySettings();
        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error("Privacy settings load error:", error);
        return NextResponse.json({ success: false, error: "Failed to load privacy settings" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const settings = await updatePrivacySettings({
            anonymousAnalytics: Boolean(body.anonymousAnalytics),
            allowPublicGallery: Boolean(body.allowPublicGallery),
        });
        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error("Privacy settings update error:", error);
        return NextResponse.json({ success: false, error: "Failed to update privacy settings" }, { status: 500 });
    }
}
