import { NextRequest, NextResponse } from "next/server";
import { generateQuiz } from "@/lib/server/quiz";
import { isAiProvider } from "@/lib/ai-config";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        if (!body?.roadmap || typeof body.sectionId !== "string") {
            return NextResponse.json({ success: false, error: "roadmap and sectionId are required" }, { status: 400 });
        }

        const result = await generateQuiz({
            roadmap: body.roadmap,
            sectionId: body.sectionId,
            userApiKey: typeof body.userApiKey === "string" ? body.userApiKey : undefined,
            userModel: typeof body.userModel === "string" ? body.userModel : undefined,
            userProvider: isAiProvider(body.userProvider) ? body.userProvider : undefined,
        });

        return NextResponse.json(result, { status: result.success ? 200 : 402 });
    } catch (error) {
        console.error("Quiz generation error:", error);
        return NextResponse.json({ success: false, error: "Failed to generate quiz" }, { status: 500 });
    }
}
