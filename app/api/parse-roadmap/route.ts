import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an AI that transforms raw content (roadmaps, guides, curricula, workflows, .md files) into a structured COURSE EXPERIENCE. You MUST return ONLY valid JSON — no explanation, no markdown wrapping, no code fences.

Your PRIMARY goal is to create SELF-CONTAINED COURSE MODULES. Each meaningful topic, phase, or section in the content becomes its own module. Each module contains ALL of its related content — its own tasks, resources, videos, and key notes.

RULES:
1. EVERY distinct topic/phase/section in the content becomes a "module" type section
2. Each module MUST contain: description, tasks (action items for that module), resources (links relevant to that module), videos (if any), and key concepts/notes
3. Do NOT create standalone "Tasks" or "Resources" or "Videos" sections that strip items out of their parent module. Keep everything with its parent.
4. Only create a standalone "tasks" section if there are genuinely GLOBAL tasks that don't belong to any specific module
5. Only create a standalone "resources" section if there are genuinely GLOBAL resources not tied to any module
6. Extract a short "summary" field at the top level that captures the overall goals/objectives of the content (1-3 sentences)
7. Always include a "progress" section (computed live, just include it)
8. If content has terminology, create a "glossary" section
9. If content mentions dates/deadlines, create a "calendar" section
10. A "notes" section is always included for the user's personal notes
11. For videos, extract URL, video ID, platform, and any timestamps
12. For resources, classify by type: video, doc, pdf, link, code, tool, course, book

Return JSON in this exact shape:
{
  "title": "string - inferred from content if not provided",
  "mode": "general or intern",
  "summary": "1-3 sentence summary of overall goals and what this course covers",
  "sections": [
    {
      "id": "unique-id",
      "type": "module|tasks|progress|resources|videos|calendar|notes|glossary|submissions|milestones|custom",
      "title": "Section Title",
      "order": 0,
      "data": <section-specific data>
    }
  ]
}

Section data shapes:
- module: { description: "what this module covers", estimatedTime: "optional time estimate", concepts: "key concepts/notes for this module", tasks: [{id, title, completed: false, notes: "", subtasks: [{id, title, completed: false}], attachments: [{id, title, url, type, description}]}], resources: [{id, title, url, type, description, category}], videos: [{id, title, url, videoId, platform, description, duration, timestamps: [{time, label}]}], completed: false }
- milestones: Array of { id, title, description, tasks: [{id, title, completed: false, notes: "", subtasks: [], attachments: []}], resources: [{id, title, url, type, description}], videos: [{id, title, url, videoId, platform, description}], completed: false, order }
- tasks: Array of { id, title, tasks: [{id, title, completed: false, notes: "", subtasks: [{id, title, completed: false}], attachments: []}] }
- progress: {} (empty object, computed live)
- resources: Array of { id, title, url, type, description, category }
- videos: Array of { id, title, url, videoId, platform, description, duration, timestamps: [{time, label}] }
- calendar: Array of { id, title, date (ISO string), description, completed: false }
- notes: Array of { id, title, content, createdAt (ISO string), updatedAt (ISO string) }
- glossary: Array of { id, term, definition, relatedSections: [] }
- submissions: [] (empty array, users will add)
- custom: { description, layout: "checklist|cards|table|list", items: [{id, title, description, completed, metadata}] }

CRITICAL: Return ONLY the JSON object. No wrapping, no explanation. Prefer "module" type sections over splitting content into milestones+tasks+resources+videos.`;

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
