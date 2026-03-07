"use client";

import { use } from "react";
import { useRoadmap } from "@/hooks/useRoadmap";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function EmbedPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { roadmap, updateSection } = useRoadmap(id, true);

    if (!roadmap) {
        return (
            <div className="min-h-full flex items-center justify-center bg-obsidian text-text-secondary text-sm">
                Workspace not found
            </div>
        );
    }

    return (
        <div className="h-screen w-full overflow-hidden">
            <WorkspaceShell 
                roadmap={roadmap} 
                onUpdateSection={updateSection} 
                isEmbed={true} 
                isReadOnly={true}
            />
        </div>
    );
}
