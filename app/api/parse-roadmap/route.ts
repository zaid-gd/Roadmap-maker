import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an advanced Context-Aware AI that transforms raw content into a structured, highly organized digital workspace.
Instead of treating everything as a generic "roadmap", you MUST first dynamically detect the content type and adapt the entire structure accordingly.

STEP 1: CONTEXT DETECTION
Read the entire content and classify it into one of the following content types:
- "roadmap" (e.g., career paths, long-term skill acquisition)
- "playbook" (e.g., social media strategies, operational guidelines)
- "guide" (e.g., comprehensive "how-to" documentation)
- "curriculum" (e.g., course syllabi, module-based learning)
- "strategy" (e.g., business goals, strategic plans, OKRs)
- "tutorial" (e.g., step-by-step technical guides)
- "reference" (e.g., documentation, glossaries, encyclopedic content)
- "plan" (e.g., project plans, execution outlines)
- "checklist" (e.g., simple actionable lists)
- "other"

STEP 2: SECTION GENERATION RULES
- REMOVE ALL default/generic section structures. Do NOT blindly create a generic structure.
- Decide which sections and structures make the most sense based entirely on the detected content type.
  * A roadmap \u2192 phases, milestones, timeline, tasks per phase.
  * A playbook \u2192 strategies, platform-specific sections, tactics, content calendar.
  * A curriculum \u2192 modules, lessons, objectives, assessments.
  * A strategy \u2192 goals, initiatives, KPIs, action items.
- Section titles MUST reflect the actual content, not boilerplate text.
- Use the "module" section type for most rich parent sections (phases, strategies, modules, goals, etc.) because it is the most capable container.
- Use the "milestones" section type if the content specifically calls for sequential sequential milestone tracking.
- For a "module" or "milestones" section, place ALL relevant tasks, resources, and videos directly INSIDE that section's data. Do NOT strip them out into global sections unless they are truly global.
- Extract nested details: Look deeply into the text to extract specific tools, platforms, websites, and YouTube links and put them in the corresponding "videos" or "resources" array of their related section.

STEP 3: JSON OUTPUT SCHEMA
Return ONLY valid JSON (no markdown wrapping, no explanations). Use this exact shape:

{
  "contentType": "string - the detected type from Step 1 (e.g. 'playbook', 'curriculum', 'roadmap')",
  "detectedContext": "string - a brief debugging note explaining WHY you chose this content type and structure",
  "title": "string - inferred from content if not provided",
  "mode": "general or intern",
  "summary": "1-3 sentence summary of overall goals and what the content covers",
  "objectives": ["global learning objective 1", "global learning objective 2"],
  "sections": [
    {
      "id": "unique-id",
      "type": "module|milestones|tasks|progress|resources|videos|calendar|notes|glossary|submissions|custom",
      "title": "Section Title (e.g., Phase 1: Foundation, Strategy: Organic Growth)",
      "order": 0,
      "data": <section-specific data object>
    }
  ]
}

Section "data" Shapes:
- type "module": {"description": "...", "estimatedTime": "...", "concepts": "key points", "objectives": ["..."], "tasks": [{"id":"...","title":"...","completed":false,"notes":"","subtasks":[{"id":"...","title":"...","completed":false}],"attachments":[]}], "resources": [{"id":"...","title":"...","url":"...", "type":"video|doc|pdf|link|code|tool|course|book", "description":"..."}], "videos": [{"id":"...","title":"...","url":"...","videoId":"...","platform":"youtube|vimeo|other","description":"...", "duration": "...", "timestamps": [{"time": "...", "label": "..."}]}], "completed": false}
- type "milestones": [{"id":"...","title":"...","description":"...","tasks":[...],"resources":[...],"videos":[...],"completed":false,"order":0}]
- type "tasks": [{"id":"...","title":"...","tasks":[...]}]
- type "resources": [{"id":"...","title":"...","url":"...","type":"...","description":"..."}]
- type "videos": [{"id":"...","title":"...","url":"...","videoId":"...","platform":"youtube|vimeo|other","description":"..."}]
- type "calendar": [{"id":"...","title":"...","date":"ISO date","description":"...","completed":false}]
- type "notes": []
- type "progress": {}
- type "glossary": [{"id":"...","term":"...","definition":"...","relatedSections":[]}]
- type "submissions": []
- type "custom": {"description":"...","layout":"checklist|cards|table|list","items":[{"id":"...","title":"...","description":"...","completed":false,"metadata":{}}]}

CRITICAL RULES FOR EXTRACTION:
- Every phase, module, strategy, or overarching topic should be represented as a rich "module" or "milestones" section so that content isn't fragmented.
- Extract tool names (e.g., Notion, Figma, VSCode), websites, and video links (youtube.com/...) into the resources/videos arrays for the specific section where they belong.
- Ensure the API response is ONLY a single parseable JSON object.
`;

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
