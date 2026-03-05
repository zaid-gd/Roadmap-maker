"use client";

import { useState } from "react";
import { Copy, Code, Download, ExternalLink, X, Settings2 } from "lucide-react";
import type { Roadmap } from "@/types";

interface ShareEmbedModalProps {
    roadmap: Roadmap;
    isOpen: boolean;
    onClose: () => void;
}

export default function ShareEmbedModal({ roadmap, isOpen, onClose }: ShareEmbedModalProps) {
    const [activeTab, setActiveTab] = useState<"share" | "embed" | "export">("share");
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedEmbed, setCopiedEmbed] = useState(false);

    if (!isOpen) return null;

    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/share/${roadmap.id}` : "";
    const embedCode = `<iframe src="${typeof window !== "undefined" ? window.location.origin : ""}/embed/${roadmap.id}" width="100%" height="800px" frameborder="0"></iframe>`;

    const handleCopy = (text: string, type: "link" | "embed") => {
        navigator.clipboard.writeText(text);
        if (type === "link") {
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        } else {
            setCopiedEmbed(true);
            setTimeout(() => setCopiedEmbed(false), 2000);
        }
    };

    const handleExportJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(roadmap, null, 2));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${roadmap.title.replace(/\s+/g, '_').toLowerCase()}_workspace.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleExportMD = () => {
        const mdContent = `# ${roadmap.title}\n\n${roadmap.summary || ""}\n\n${roadmap.sections.map(s => `## ${s.title}\n${JSON.stringify(s.data, null, 2)}`).join('\n\n')}`;
        const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(mdContent);
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${roadmap.title.replace(/\s+/g, '_').toLowerCase()}_workspace.md`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative bg-obsidian-elevated border border-border-subtle rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-display text-xl text-white">Share & Embed</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border">
                    {[
                        { id: "share", label: "Shareable Link" },
                        { id: "embed", label: "Embed Code" },
                        { id: "export", label: "Export" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${
                                activeTab === tab.id 
                                    ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" 
                                    : "border-transparent text-text-secondary hover:text-text-primary hover:bg-white/5"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === "share" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h3 className="font-sans-display text-xs uppercase tracking-[0.2em] text-text-secondary mb-2">Read-only link</h3>
                                <p className="text-sm text-text-secondary mb-4">
                                    Share this unique URL. Visitors will see the full workspace, track their own progress locally, but cannot edit your original content.
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-obsidian-surface border border-border-subtle rounded-lg px-4 py-3 font-mono text-sm text-white truncate overflow-x-auto">
                                        {shareUrl}
                                    </div>
                                    <button
                                        onClick={() => handleCopy(shareUrl, "link")}
                                        className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2 font-bold flex-shrink-0"
                                    >
                                        <Copy size={16} />
                                        {copiedLink ? "Copied!" : "Copy Link"}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-400/90 text-sm">
                                <ExternalLink size={20} className="shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block text-amber-400 font-bold mb-1">Testing the link</strong>
                                    Try opening the link in an Incognito window to see exactly what your users will experience.
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "embed" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h3 className="font-sans-display text-xs uppercase tracking-[0.2em] text-text-secondary mb-2">iframe HTML</h3>
                                <p className="text-sm text-text-secondary mb-4">
                                    Embed this workspace on your own website, Notion, or LMS (like Kajabi or Teachable).
                                </p>
                                <div className="flex items-start gap-2">
                                    <div className="flex-1 bg-obsidian-surface border border-border-subtle rounded-lg p-4 font-mono text-xs text-indigo-200 overflow-x-auto whitespace-pre-wrap break-all">
                                        {embedCode}
                                    </div>
                                    <button
                                        onClick={() => handleCopy(embedCode, "embed")}
                                        className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2 font-bold flex-shrink-0"
                                    >
                                        <Code size={16} />
                                        {copiedEmbed ? "Copied!" : "Copy Code"}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-sans-display text-xs uppercase tracking-[0.2em] text-text-secondary mb-3 flex justify-between items-center">
                                    Live Preview
                                    <span className="text-indigo-400 flex items-center gap-1 cursor-pointer hover:underline">
                                        <Settings2 size={12} /> Branding Settings
                                    </span>
                                </h3>
                                <div className="border border-border-subtle rounded-xl overflow-hidden h-64 bg-obsidian relative">
                                    <iframe src={shareUrl.replace('/share/', '/embed/')} className="w-full h-full border-0 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "export" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <p className="text-sm text-text-secondary mb-6">
                                Download your workspace content to use elsewhere or backup.
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={handleExportMD}
                                    className="group relative flex flex-col items-center justify-center p-8 bg-obsidian-surface/30 border border-border-subtle hover:border-indigo-500/50 rounded-xl transition-all hover:bg-indigo-500/5 text-center overflow-hidden"
                                >
                                    <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Download size={24} />
                                    </div>
                                    <span className="font-display text-lg text-white mb-1">Markdown (.md)</span>
                                    <span className="text-[12px] text-text-secondary">Clean text format for Notion, Obsidian, or GitHub</span>
                                </button>

                                <button
                                    onClick={handleExportJSON}
                                    className="group relative flex flex-col items-center justify-center p-8 bg-obsidian-surface/30 border border-border-subtle hover:border-emerald-500/50 rounded-xl transition-all hover:bg-emerald-500/5 text-center overflow-hidden"
                                >
                                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Code size={24} />
                                    </div>
                                    <span className="font-display text-lg text-white mb-1">Raw Data (.json)</span>
                                    <span className="text-[12px] text-text-secondary">Structured data for developers or backup</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
