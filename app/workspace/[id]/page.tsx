"use client";

import { use } from "react";
import { useState } from "react";
import { useRoadmap } from "@/hooks/useRoadmap";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Header from "@/components/layout/Header";
import Link from "next/link";
import { AlertCircle, X, Settings } from "lucide-react";

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { roadmap, updateSection, saveRoadmap } = useRoadmap(id);
    const [apiError, setApiError] = useState<{message: string} | null>(null);

    const handleApiError = (error: {message: string}) => {
        setApiError(error);
    };

    if (!roadmap) {
        return (
            <div className="min-h-full flex flex-col">
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
        <div>
            {apiError && (
                <div className="fixed top-0 left-0 right-0 z-[100] bg-red-500/10 border-b border-red-500/30 p-3 flex items-center justify-center gap-3 animate-in slide-in-from-top">
                    <AlertCircle size={18} className="text-red-400" />
                    <span className="text-red-400 text-sm">{apiError.message}</span>
                    <Link href="/settings" className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs rounded border border-red-500/30 flex items-center gap-1">
                        <Settings size={12} /> Go to Settings
                    </Link>
                    <button onClick={() => setApiError(null)} className="text-red-400 hover:text-white ml-2">
                        <X size={16} />
                    </button>
                </div>
            )}
            <WorkspaceShell 
                roadmap={roadmap} 
                onUpdateSection={updateSection} 
                onUpdateRoadmap={(updates) => saveRoadmap({ ...roadmap, ...updates })}
                onApiError={handleApiError}
            />
        </div>
    );
}
