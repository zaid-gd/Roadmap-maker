"use client";

import { use } from "react";
import { useRoadmap } from "@/hooks/useRoadmap";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Header from "@/components/layout/Header";
import Link from "next/link";

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { roadmap, updateSection, saveRoadmap } = useRoadmap(id);

    if (!roadmap) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 pt-14 flex items-center justify-center">
                    <div className="text-center animate-fade-in">
                        <span className="text-5xl mb-4 block">🔍</span>
                        <h2 className="font-display text-xl font-bold text-text-primary text-text-primary mb-2">
                            Roadmap not found
                        </h2>
                        <p className="text-text-secondary mb-6">
                            This workspace doesn&apos;t exist or was deleted.
                        </p>
                        <Link href="/" className="btn btn-primary">
                            Go Home
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <WorkspaceShell 
            roadmap={roadmap} 
            onUpdateSection={updateSection} 
            onUpdateRoadmap={(updates) => saveRoadmap({ ...roadmap, ...updates })}
        />
    );
}
