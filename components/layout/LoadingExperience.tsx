"use client";

import { useState, useEffect } from "react";

const STEPS = [
    { text: "Reading your content…", icon: "📖" },
    { text: "Identifying sections and topics…", icon: "🔍" },
    { text: "Detecting videos and resources…", icon: "🎥" },
    { text: "Building your workspace…", icon: "🏗️" },
    { text: "Applying the finishing touches…", icon: "✨" },
];

export default function LoadingExperience() {
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
        }, 2400);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-obsidian flex items-center justify-center">
            {/* Background glow */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background:
                        "radial-gradient(circle at 50% 40%, rgba(99,102,241,0.2) 0%, transparent 60%)",
                }}
            />

            <div className="relative z-10 text-center max-w-md mx-auto px-6">
                {/* Pulsing logo */}
                <div className="mb-8 animate-pulse-glow inline-block rounded-2xl p-5 glass">
                    <span className="text-5xl">🗺️</span>
                </div>

                <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
                    Generating Your Workspace
                </h2>
                <p className="text-text-secondary text-sm mb-10">
                    The AI is analyzing your content and building something great…
                </p>

                {/* Steps */}
                <div className="space-y-3 text-left">
                    {STEPS.map((step, i) => (
                        <div
                            key={i}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${i < activeStep
                                    ? "opacity-50"
                                    : i === activeStep
                                        ? "glass border-glow animate-pulse-glow"
                                        : "opacity-20"
                                }`}
                        >
                            <span className="text-lg shrink-0">{step.icon}</span>
                            <span className={`text-sm ${i === activeStep ? "text-text-primary font-medium" : "text-text-secondary"
                                }`}>
                                {step.text}
                            </span>
                            {i < activeStep ? (
                                <span className="ml-auto text-success text-xs">✓</span>
                            ) : i === activeStep ? (
                                <div className="ml-auto w-4 h-4 rounded-full border-2 border-indigo-accent border-t-transparent animate-spin" />
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
