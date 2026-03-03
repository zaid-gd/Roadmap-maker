"use client";

import type { Roadmap, Section } from "@/types";
import MilestonesSection from "@/components/workspace/sections/MilestonesSection";
import TaskListSection from "@/components/workspace/sections/TaskListSection";
import ProgressSection from "@/components/workspace/sections/ProgressSection";
import ResourcesSection from "@/components/workspace/sections/ResourcesSection";
import VideosSection from "@/components/workspace/sections/VideosSection";
import CalendarSection from "@/components/workspace/sections/CalendarSection";
import NotesSection from "@/components/workspace/sections/NotesSection";
import GlossarySection from "@/components/workspace/sections/GlossarySection";
import SubmissionsSection from "@/components/workspace/sections/SubmissionsSection";
import CustomSection from "@/components/workspace/sections/CustomSection";

interface SectionRendererProps {
    section: Section;
    roadmap: Roadmap;
    onUpdate: (updater: (s: Section) => Section) => void;
}

export default function SectionRenderer({ section, roadmap, onUpdate }: SectionRendererProps) {

    const renderContent = () => {
        switch (section.type) {
            case "milestones": return <MilestonesSection section={section} onUpdate={onUpdate} />;
            case "tasks": return <TaskListSection section={section} onUpdate={onUpdate} />;
            case "progress": return <ProgressSection roadmap={roadmap} />;
            case "resources": return <ResourcesSection section={section} onUpdate={onUpdate} />;
            case "videos": return <VideosSection section={section} onUpdate={onUpdate} />;
            case "calendar": return <CalendarSection section={section} onUpdate={onUpdate} />;
            case "notes": return <NotesSection section={section} onUpdate={onUpdate} />;
            case "glossary": return <GlossarySection section={section} onUpdate={onUpdate} />;
            case "submissions": return <SubmissionsSection section={section} onUpdate={onUpdate} />;
            case "custom": return <CustomSection section={section} onUpdate={onUpdate} />;
            default: return <div className="text-center py-8 text-text-muted">Unknown section type</div>;
        }
    };

    return (
        // We use a simple CSS keyframes trigger via a unique key wrapper, ensuring smooth transition without adding heavy deps.
        <div key={section.id} className="animate-fade-in transition-all duration-300">
            {renderContent()}
        </div>
    );
}
