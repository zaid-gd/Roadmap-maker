"use client";

import { use } from "react";
import { useRoadmap } from "@/hooks/useRoadmap";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Header from "@/components/layout/Header";
import Link from "next/link";

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    // In share mode, we want to load the roadmap but track progress in a session
    const { roadmap, updateSection } = useRoadmap(id, true);

    if (!roadmap) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 pt-14 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="font-display text-xl font-bold text-text-primary text-text-primary mb-2">Workspace not found</h2>
                        <Link href="/" className="text-indigo-400 hover:underline">Go Home</Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <WorkspaceShell 
            roadmap={roadmap} 
            onUpdateSection={updateSection} 
            isEmbed={false} 
            isReadOnly={true}
        />
    );
}
