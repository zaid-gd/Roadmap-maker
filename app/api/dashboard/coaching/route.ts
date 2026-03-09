import { NextRequest, NextResponse } from "next/server";
import { saveCoachingSession } from "@/lib/server/dashboard";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        if (typeof body.roadmapId !== "string") {
            return NextResponse.json({ success: false, error: "roadmapId is required" }, { status: 400 });
        }

        const session = await saveCoachingSession({
            roadmapId: body.roadmapId,
            date: typeof body.date === "string" ? body.date : new Date().toISOString(),
            durationMinutes: Number(body.durationMinutes ?? 0),
            topics: Array.isArray(body.topics) ? body.topics.filter((value: unknown): value is string => typeof value === "string") : [],
            nextSteps: typeof body.nextSteps === "string" ? body.nextSteps : "",
        });

        return NextResponse.json({ success: true, session });
    } catch (error) {
        console.error("Dashboard coaching error:", error);
        return NextResponse.json({ success: false, error: "Failed to save coaching session" }, { status: 500 });
    }
}
