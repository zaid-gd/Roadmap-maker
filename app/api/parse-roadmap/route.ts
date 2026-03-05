import { NextRequest, NextResponse } from "next/server";
import { generateStructuredContent } from "@/lib/aiClient";

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
  * A roadmap -> phases, milestones, timeline, tasks per phase.
  * A playbook -> strategies, platform-specific sections, tactics, content calendar.
  * A curriculum -> modules, lessons, objectives, assessments.
  * A strategy -> goals, initiatives, KPIs, action items.
- Section titles MUST reflect the actual content, not boilerplate text.
- Use the "module" section type for most rich parent sections (phases, strategies, modules, goals, etc.) because it is the most capable container.
- Use the "milestones" section type if the content specifically calls for sequential sequential milestone tracking.
- For a "module" or "milestones" section, place ALL relevant tasks, resources, and videos directly INSIDE that section's data. Do NOT strip them out into global sections unless they are truly global.
- Extract nested details: Look deeply into the text to extract specific tools, platforms, websites, and YouTube links and put them in the corresponding "videos" or "resources" array of their related section.

STEP 3: JSON OUTPUT SCHEMA
Return ONLY valid JSON (no markdown wrapping, no explanations). Use this exact shape:

{
  "title": "string - inferred from content if not provided",
  "summary": "1-3 sentence summary of overall goals and what the content covers",
  "contentType": "string - the detected type from Step 1 (roadmap|playbook|curriculum|etc)",
  "detectedContext": "One sentence describing what the content is about",
  "totalEstimatedDuration": "e.g. 12 hours or 3 weeks",
  "difficulty": "beginner|intermediate|advanced",
  "goal": "What the user will achieve by completing this",
  "mode": "general|intern",
  "sections": [
    {
      "id": "unique-id",
      "type": "module|milestones|tasks|progress|resources|videos|calendar|notes|glossary|submissions|custom",
      "title": "Section Title (e.g., Phase 1: Foundation, Strategy: Organic Growth)",
      "order": 0,
      "metadata": {
        "estimatedDuration": "2 hours",
        "difficulty": "beginner|intermediate|advanced",
        "taskCount": 5,
        "keyOutcome": "One sentence — what the learner will be able to do after this module"
      },
      "data": <section-specific data object>
    }
  ]
}

Section "data" Shapes:
- type "module": {"description": "...", "estimatedTime": "...", "concepts": "key points", "objectives": ["..."], "tasks": [{"id":"...","text":"...","description":"...","estimatedTime":"~30 mins","priority":"core|optional|advanced","done":false,"notes":"","subtasks":[{"id":"...","title":"...","completed":false}],"attachments":[]}], "resources": [{"id":"...","title":"...","url":"...", "type":"video|doc|pdf|link|code|tool|course|book", "description":"..."}], "videos": [{"id":"...","title":"...","url":"...","videoId":"...","platform":"youtube|vimeo|other","description":"...", "duration": "...", "timestamps": [{"time": "...", "label": "..."}]}], "completed": false}
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
        const { content, mode, title, goal, difficulty, estimatedDuration, userApiKey, userProvider, userModel } = body;

        if (!content || typeof content !== "string") {
            return NextResponse.json(
                { success: false, error: "Content is required" },
                { status: 400 }
            );
        }

        // Use user key if provided
        const useUserKey = userApiKey && userProvider;

        let extraContext = "";
        if (goal) extraContext += `User Goal: ${goal}\n`;
        if (difficulty) extraContext += `Target Difficulty: ${difficulty}\n`;
        if (estimatedDuration) extraContext += `Estimated Duration: ${estimatedDuration}\n`;

        const fullPrompt = `${SYSTEM_PROMPT}\n\n${title ? `Title: ${title}\n` : ""}Mode: ${mode || "general"}\n${extraContext}Content:\n${content}`;
        
        let rawContent;
        try {
            rawContent = await generateStructuredContent(fullPrompt, useUserKey ? userApiKey : undefined, useUserKey ? userProvider : undefined);
        } catch (aiError: any) {
            const errMsg = aiError.message || "";
            if (errMsg.includes("401") || errMsg.includes("403") || errMsg.includes("API key") || errMsg.includes("permission")) {
                return NextResponse.json(
                    { success: false, error: "invalid_key", message: "Your API key is invalid or expired. Update it in Settings." },
                    { status: 401 }
                );
            }
            throw aiError;
        }

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

            // Backward compatibility map for Task schema
            // AI returns `text` and `done`, we duplicate they into `title` and `completed` if missing
            if (parsed.sections) {
                parsed.sections.forEach((section: any) => {
                    if (section.type === "module" || section.type === "milestones") {
                        const tasks = section.data?.tasks;
                        if (Array.isArray(tasks)) {
                            tasks.forEach((t: any) => {
                                if (t.text && !t.title) t.title = t.text;
                                if (t.done !== undefined && t.completed === undefined) t.completed = t.done;
                            });
                        }
                    }
                });
            }

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
