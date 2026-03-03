import { config } from "dotenv";
import fs from "fs";

// Load local environment variables
config({ path: ".env.local" });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ No GEMINI_API_KEY found in .env.local. Please add it before testing.");
    process.exit(1);
}

const sampleRoadmapText = `
# Next.js Masterclass

## Module 1: Foundational Next.js
- Understand App Router concepts
- Deploy your first Next.js application
- Required reading: https://nextjs.org/docs

## Module 2: Advanced Data Fetching
- Learn about server actions and mutations
- Implement streaming and suspense
- Practice with a real database
- Video tutorial: https://www.youtube.com/watch?v=ZjAqacIC_3c
`;

async function testGeminiAPI() {
    console.log("🚀 Testing Gemini API Connection...");
    console.log("Sending sample roadmap content...");

    try {
        const response = await fetch("http://localhost:3000/api/parse-roadmap", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content: sampleRoadmapText,
                title: "Next.js Masterclass",
                mode: "general"
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log("\n✅ Success! Received Structured Roadmap JSON:\n");
            console.log(JSON.stringify(data.roadmap, null, 2));
        } else {
            console.error("\n❌ API Returned an Error:", data);
        }

    } catch (err) {
        console.error("❌ Failed to connect to the parsing route:", err);
    }
}

testGeminiAPI();
