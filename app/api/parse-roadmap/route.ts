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

function generateMockResponse(content: string, mode: string, title?: string) {
    const inferredTitle = title || content.split("\n")[0]?.replace(/^#+\s*/, "").trim() || "My Roadmap";
    const now = new Date().toISOString();

    return {
        success: true,
        roadmap: {
            title: inferredTitle,
            mode,
            sections: [
                {
                    id: "sec-milestones",
                    type: "milestones",
                    title: "Milestones",
                    order: 0,
                    data: [
                        {
                            id: "m1",
                            title: "Phase 1: Getting Started",
                            description: "Foundation concepts and initial setup to begin your journey.",
                            tasks: [
                                { id: "m1t1", title: "Review the introduction material", completed: false, notes: "", subtasks: [], attachments: [] },
                                {
                                    id: "m1t2", title: "Set up your environment", completed: false, notes: "", subtasks: [
                                        { id: "m1t2s1", title: "Install required tools", completed: false },
                                        { id: "m1t2s2", title: "Configure your workspace", completed: false },
                                    ], attachments: []
                                },
                            ],
                            resources: [
                                { id: "r1", title: "Official Documentation", url: "https://docs.example.com", type: "doc", description: "Complete reference documentation" },
                            ],
                            videos: [],
                            completed: false,
                            order: 0,
                        },
                        {
                            id: "m2",
                            title: "Phase 2: Core Concepts",
                            description: "Deep dive into the fundamental concepts and techniques.",
                            tasks: [
                                { id: "m2t1", title: "Learn the core principles", completed: false, notes: "", subtasks: [], attachments: [] },
                                { id: "m2t2", title: "Practice with exercises", completed: false, notes: "", subtasks: [], attachments: [] },
                                {
                                    id: "m2t3", title: "Build a practice project", completed: false, notes: "", subtasks: [
                                        { id: "m2t3s1", title: "Plan the project scope", completed: false },
                                        { id: "m2t3s2", title: "Implement core features", completed: false },
                                        { id: "m2t3s3", title: "Review and refine", completed: false },
                                    ], attachments: []
                                },
                            ],
                            resources: [],
                            videos: [
                                { id: "v1", title: "Core Concepts Tutorial", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", videoId: "dQw4w9WgXcQ", platform: "youtube", description: "Comprehensive walkthrough of core concepts" },
                            ],
                            completed: false,
                            order: 1,
                        },
                        {
                            id: "m3",
                            title: "Phase 3: Advanced Techniques",
                            description: "Master advanced workflows and professional techniques.",
                            tasks: [
                                { id: "m3t1", title: "Study advanced patterns", completed: false, notes: "", subtasks: [], attachments: [] },
                                { id: "m3t2", title: "Complete the capstone project", completed: false, notes: "", subtasks: [], attachments: [] },
                            ],
                            resources: [],
                            videos: [],
                            completed: false,
                            order: 2,
                        },
                    ],
                },
                {
                    id: "sec-tasks",
                    type: "tasks",
                    title: "Tasks",
                    order: 1,
                    data: [
                        {
                            id: "tg1",
                            title: "Setup & Configuration",
                            tasks: [
                                { id: "t1", title: "Download and install required software", completed: false, notes: "", subtasks: [], attachments: [] },
                                {
                                    id: "t2", title: "Complete initial configuration", completed: false, notes: "", subtasks: [
                                        { id: "t2s1", title: "Set preferences", completed: false },
                                        { id: "t2s2", title: "Import starter templates", completed: false },
                                    ], attachments: []
                                },
                            ],
                        },
                        {
                            id: "tg2",
                            title: "Learning & Practice",
                            tasks: [
                                { id: "t3", title: "Complete all tutorial exercises", completed: false, notes: "", subtasks: [], attachments: [] },
                                { id: "t4", title: "Watch recommended video tutorials", completed: false, notes: "", subtasks: [], attachments: [] },
                                { id: "t5", title: "Build your portfolio project", completed: false, notes: "", subtasks: [], attachments: [] },
                            ],
                        },
                    ],
                },
                {
                    id: "sec-progress",
                    type: "progress",
                    title: "Progress",
                    order: 2,
                    data: {},
                },
                {
                    id: "sec-resources",
                    type: "resources",
                    title: "Resources",
                    order: 3,
                    data: [
                        { id: "res1", title: "Official Documentation", url: "https://docs.example.com", type: "doc", description: "Complete reference documentation", category: "Documentation" },
                        { id: "res2", title: "Getting Started Guide", url: "https://guide.example.com", type: "link", description: "Quick start guide for beginners", category: "Guides" },
                        { id: "res3", title: "Community Forum", url: "https://forum.example.com", type: "link", description: "Ask questions and connect with others", category: "Community" },
                        { id: "res4", title: "Cheat Sheet PDF", url: "https://example.com/cheatsheet.pdf", type: "pdf", description: "Quick reference cheat sheet", category: "Reference" },
                    ],
                },
                {
                    id: "sec-videos",
                    type: "videos",
                    title: "Videos",
                    order: 4,
                    data: [
                        { id: "vid1", title: "Introduction & Overview", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", videoId: "dQw4w9WgXcQ", platform: "youtube", description: "A complete introduction to get you started", duration: "15:30" },
                        { id: "vid2", title: "Advanced Techniques Deep Dive", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", videoId: "dQw4w9WgXcQ", platform: "youtube", description: "Going deeper into professional workflows", duration: "28:45" },
                    ],
                },
                {
                    id: "sec-notes",
                    type: "notes",
                    title: "Notes",
                    order: 5,
                    data: [
                        { id: "n1", title: "Key Takeaways", content: "Add your personal notes and key takeaways here as you progress through the roadmap.", createdAt: now, updatedAt: now },
                    ],
                },
                {
                    id: "sec-glossary",
                    type: "glossary",
                    title: "Glossary",
                    order: 6,
                    data: [
                        { id: "g1", term: "Roadmap", definition: "A structured plan outlining the steps and milestones needed to achieve a specific goal.", relatedSections: ["sec-milestones"] },
                        { id: "g2", term: "Milestone", definition: "A significant checkpoint or achievement point within a roadmap that marks progress.", relatedSections: ["sec-milestones"] },
                        { id: "g3", term: "Workspace", definition: "The interactive environment generated from your content where all learning and tracking happens.", relatedSections: [] },
                    ],
                },
                ...(mode === "intern"
                    ? [
                        {
                            id: "sec-submissions",
                            type: "submissions" as const,
                            title: "Submissions",
                            order: 7,
                            data: [],
                        },
                    ]
                    : []),
            ],
        },
    };
}

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

        // If no AI provider configured, return mock response
        if (!apiKey) {
            console.warn("No GEMINI_API_KEY provided. Using fallback mock response.");
            const mock = generateMockResponse(content, mode || "general", title);
            return NextResponse.json(mock);
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
                { success: false, error: "AI provider returned an error. Using fallback." },
                { status: 502 }
            );
        }

        const aiData = await aiResponse.json();
        const rawContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawContent) {
            return NextResponse.json(
                { success: false, error: "AI returned empty response" },
                { status: 500 }
            );
        }

        // Parse JSON from the AI response (handle potential code fences)
        let parsed;
        try {
            const cleaned = rawContent.replace(/^```json?\n?/g, "").replace(/\n?```$/g, "").trim();
            parsed = JSON.parse(cleaned);
        } catch {
            console.error("Failed to parse AI JSON:", rawContent);
            // Fallback to mock
            const mock = generateMockResponse(content, mode || "general", title);
            return NextResponse.json(mock);
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
