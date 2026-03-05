export async function generateStructuredContent(
    prompt: string,
    userKey?: string,
    userProvider?: string
): Promise<string> {
    const provider = (userProvider || process.env.AI_PROVIDER || "gemini").toLowerCase();

    // Determine API Key
    let apiKey = userKey;
    if (!apiKey) {
        if (provider === "gemini") apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
        else if (provider === "openai") apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
        else if (provider === "groq") apiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY;
        else if (provider === "openrouter") apiKey = process.env.OPENROUTER_API_KEY || process.env.AI_API_KEY;
        else apiKey = process.env.AI_API_KEY;
    }

    if (!apiKey) {
        throw new Error(`API key is required for provider: ${provider}`);
    }

    if (provider === "gemini") {
        const model = "gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    responseMimeType: "application/json"
                }
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Gemini API Error: ${response.status} ${errText}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    // OpenAI-compatible providers
    let url = "";
    let model = "";

    switch (provider) {
        case "openai":
            url = "https://api.openai.com/v1/chat/completions";
            model = "gpt-4o";
            break;
        case "groq":
            url = "https://api.groq.com/openai/v1/chat/completions";
            model = "llama3-70b-8192";
            break;
        case "openrouter":
            url = "https://openrouter.ai/api/v1/chat/completions";
            model = "anthropic/claude-3.5-sonnet"; // Default fallback
            break;
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`${provider} API Error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
}
