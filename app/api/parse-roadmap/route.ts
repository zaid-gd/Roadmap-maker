import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an AI that transforms raw content (roadmaps, guides, curricula, workflows) into structured workspace data. You MUST return ONLY valid JSON — no explanation, no markdown wrapping, no code fences.

Analyze the content deeply and:
1. Identify every meaningful section, topic, phase, and piece of information
2. Detect ALL video links (YouTube, Vimeo), resource links, documentation references, external content
3. Decide which workspace sections to create based purely on what is in the content
4. Create custom sections for anything unique — be creative and adaptive
5. Never invent sections not grounded in the content
6. For videos, extract the full URL, video ID, platform, and any timestamps mentioned
7. For resources, classify them by type: video, doc, pdf, link, code, tool, course, book
8. If content mentions dates/deadlines, create a calendar section
9. If content has terminology, create a glossary section
10. Always create a milestones section if the content has phases/steps/stages
11. Always create a tasks section with actionable items
12. Always create a progress section (it will be computed live, just include it)

Return JSON in this exact shape:
{
  "title": "string - inferred from content if not provided",
  "mode": "general or intern",
  "sections": [
    {
      "id": "unique-id",
      "type": "milestones|tasks|progress|resources|videos|calendar|notes|glossary|submissions|custom",
      "title": "Section Title",
      "order": 0,
      "data": <section-specific data>
    }
  ]
}

Section data shapes:
- milestones: Array of { id, title, description, tasks: [{id, title, completed: false, notes: "", subtasks: [], attachments: []}], resources: [{id, title, url, type, description}], videos: [{id, title, url, videoId, platform, description}], completed: false, order }
- tasks: Array of { id, title, tasks: [{id, title, completed: false, notes: "", subtasks: [{id, title, completed: false}], attachments: [{id, title, url, type, description}]}] }
- progress: {} (empty object, computed live)
- resources: Array of { id, title, url, type, description, category }
- videos: Array of { id, title, url, videoId, platform, description, duration, timestamps: [{time, label}] }
- calendar: Array of { id, title, date (ISO string), description, completed: false }
- notes: Array of { id, title, content, createdAt (ISO string), updatedAt (ISO string) }
- glossary: Array of { id, term, definition, relatedSections: [] }
- submissions: [] (empty array, users will add)
- custom: { description, layout: "checklist|cards|table|list", items: [{id, title, description, completed, metadata}] }

CRITICAL: Return ONLY the JSON object. No wrapping, no explanation.`;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { content, mode, title } = body;

        if (!content || typeof content !== "string") {
            return NextResponse.json(
                { success: false, error: "Content is required" },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("No GEMINI_API_KEY provided in environment variables.");
            return NextResponse.json(
                { success: false, error: "Server configuration missing: API key is required" },
                { status: 500 }
            );
        }

        const model = "gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // Call Google Gemini API
        const aiResponse = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: SYSTEM_PROMPT }]
                },
                contents: [{
                    parts: [{
                        text: `${title ? `Title: ${title}\n\n` : ""}Mode: ${mode || "general"}\n\nContent:\n${content}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    responseMimeType: "application/json"
                }
            }),
        });

        if (!aiResponse.ok) {
            const errText = await aiResponse.text();
            console.error("Gemini API error:", errText);
            return NextResponse.json(
                { success: false, error: `Gemini API Error: ${aiResponse.status} ${aiResponse.statusText}` },
                { status: 502 }
            );
        }

        const aiData = await aiResponse.json();
        const rawContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawContent) {
            return NextResponse.json(
                { success: false, error: "AI returned an empty or invalid response structure" },
                { status: 500 }
            );
        }

        // Parse JSON from the AI response (handle potential code fences)
        let parsed;
        try {
            const cleaned = rawContent.replace(/^```(json)?\n?/i, "").replace(/\n?```$/g, "").trim();
            parsed = JSON.parse(cleaned);
        } catch (parseError) {
            console.error("Failed to parse AI JSON:", rawContent, parseError);
            return NextResponse.json(
                { success: false, error: "AI response was not valid JSON" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, roadmap: parsed });
    } catch (err) {
        console.error("Parse roadmap error:", err);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
