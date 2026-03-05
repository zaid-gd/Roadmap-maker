"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getUserConfig, saveUserConfig, clearUserConfig, DEFAULT_CONFIG, AIProvider } from "@/lib/userConfig";
import { 
    Settings as SettingsIcon, 
    Cpu, 
    Key, 
    Eye, 
    EyeOff, 
    Check, 
    AlertCircle, 
    Loader2, 
    Trash2, 
    Download, 
    Info, 
    Palette, 
    Shield, 
    HelpCircle,
    ExternalLink,
    Github
} from "lucide-react";

const PROVIDERS: { id: AIProvider; name: string; info: string; color: string }[] = [
    { id: "gemini", name: "Google Gemini", info: "Free tier available", color: "#4285F4" },
    { id: "openai", name: "OpenAI", info: "Pay per use", color: "#10A37F" },
    { id: "groq", name: "Groq", info: "Fast inference", color: "#8B5CF6" },
    { id: "openrouter", name: "OpenRouter", info: "Aggregates many models", color: "#F59E0B" },
];

const MODELS: Record<AIProvider, string[]> = {
    gemini: ["gemini-2.0-flash", "gemini-1.5-pro"],
    openai: ["gpt-4o-mini", "gpt-4o"],
    groq: ["llama-3.3-70b", "mixtral-8x7b"],
    openrouter: ["auto"],
    anthropic: ["claude-3-5-sonnet"],
};

const COLORS = [
    "#6366F1", // Indigo
    "#8B5CF6", // Violet
    "#06B6D4", // Cyan
    "#10B981", // Emerald
    "#F43F5E", // Rose
    "#F59E0B", // Amber
    "#0EA5E9", // Sky
    "#EC4899", // Pink
];

type Category = "ai" | "appearance" | "privacy" | "about";

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-obsidian" />}>
            <SettingsContent />
        </Suspense>
    );
}

function SettingsContent() {
    const router = useRouter();
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [activeCategory, setActiveCategory] = useState<Category>("ai");
    const [showKey, setShowKey] = useState(false);
    const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [testMessage, setTestMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [clearConfirm, setClearConfirm] = useState(false);

    useEffect(() => {
        setConfig(getUserConfig());
    }, []);

    useEffect(() => {
        // Apply accent color
        document.documentElement.style.setProperty("--accent", config.accentColor);
    }, [config.accentColor]);

    const handleProviderChange = (provider: AIProvider) => {
        setConfig({ ...config, provider, model: MODELS[provider][0] });
    };

    const handleSave = () => {
        saveUserConfig(config);
        setSaving(true);
        setTimeout(() => setSaving(false), 1000);
    };

    const handleTest = async () => {
        setTestStatus("loading");
        setTestMessage("");
        try {
            const res = await fetch("/api/parse-roadmap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: "test",
                    userApiKey: config.apiKey,
                    userProvider: config.provider,
                    userModel: config.model,
                }),
            });
            const json = await res.json();
            if (json.error === "invalid_key") {
                setTestStatus("error");
                setTestMessage("Connection failed · Check your API key and try again");
            } else if (json.success || json.error?.includes("Content is required")) {
                // Success if it returns anything valid JSON (even error about content required means it connected)
                setTestStatus("success");
                setTestMessage(`Connected successfully · ${config.model} is ready`);
            } else {
                throw new Error("Unknown error");
            }
        } catch (e) {
            setTestStatus("error");
            setTestMessage("Connection failed · Check your API key and try again");
        }
    };

    const handleRemoveKey = () => {
        const newConfig = { ...config, apiKey: "", useCustomKey: false };
        saveUserConfig(newConfig);
        setConfig(newConfig);
    };

    const handleExportData = () => {
        const data = localStorage.getItem("zns:v1:roadmaps") || "[]";
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "zns_backup.json";
        a.click();
    };

    const handleClearData = () => {
        localStorage.clear();
        setClearConfirm(false);
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-obsidian flex flex-col">
            <Header />
            
            <div className="flex-1 flex max-w-6xl mx-auto w-full p-6 gap-8">
                {/* Sidebar */}
                <aside className="w-64 shrink-0">
                    <nav className="space-y-1 sticky top-24">
                        {[
                            { id: "ai", icon: Cpu, label: "AI Configuration" },
                            { id: "appearance", icon: Palette, label: "Appearance" },
                            { id: "privacy", icon: Shield, label: "Privacy & Data" },
                            { id: "about", icon: Info, label: "About" },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveCategory(item.id as Category)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                                    activeCategory === item.id 
                                        ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30" 
                                        : "text-text-secondary hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content */}
                <main className="flex-1 min-w-0">
                    {activeCategory === "ai" && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h2 className="text-2xl font-display text-white mb-2">AI Configuration</h2>
                                <p className="text-text-secondary text-sm flex items-center gap-2">
                                    <Info size={14} />
                                    Your API key is stored only on your device and passed directly to the AI provider. We never log or store it.
                                </p>
                            </div>

                            {/* Provider Selection */}
                            <div className="space-y-4">
                                <label className="text-xs uppercase tracking-widest text-text-secondary font-bold">Select Provider</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {PROVIDERS.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleProviderChange(p.id)}
                                            className={`relative p-4 rounded-xl border text-left transition-all ${
                                                config.provider === p.id
                                                    ? "border-indigo-500 bg-indigo-500/5"
                                                    : "border-border bg-obsidian-surface hover:border-white/20"
                                            }`}
                                        >
                                            {config.provider === p.id && (
                                                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                                                    <Check size={12} className="text-white" />
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: p.color + "20" }}>
                                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }} />
                                                </div>
                                                <span className="font-bold text-white">{p.name}</span>
                                            </div>
                                            <span className="text-xs text-text-secondary">{p.info}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Model Selection */}
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-text-secondary font-bold">Model</label>
                                <select
                                    value={config.model}
                                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                                    className="w-full bg-obsidian border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-indigo-500/50"
                                >
                                    {MODELS[config.provider].map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            {/* API Key */}
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-text-secondary font-bold">API Key</label>
                                <div className="relative">
                                    <input
                                        type={showKey ? "text" : "password"}
                                        value={config.apiKey}
                                        onChange={(e) => setConfig({ ...config, apiKey: e.target.value, useCustomKey: !!e.target.value })}
                                        placeholder="Paste your API key here"
                                        className="w-full bg-obsidian border border-border rounded-lg px-4 py-2.5 pr-12 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-indigo-500/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white"
                                    >
                                        {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Test Connection */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleTest}
                                    disabled={!config.apiKey || testStatus === "loading"}
                                    className="px-4 py-2 bg-obsidian-surface border border-border rounded-lg text-sm text-text-primary hover:bg-white/5 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {testStatus === "loading" && <Loader2 size={14} className="animate-spin" />}
                                    Test Connection
                                </button>
                                {testStatus === "success" && <span className="text-emerald-400 text-sm flex items-center gap-1"><Check size={14} /> {testMessage}</span>}
                                {testStatus === "error" && <span className="text-red-400 text-sm flex items-center gap-1"><AlertCircle size={14} /> {testMessage}</span>}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 pt-4 border-t border-border">
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                    Save Configuration
                                </button>
                                <button
                                    onClick={handleRemoveKey}
                                    className="px-4 py-2.5 text-red-400 hover:text-red-300 text-sm"
                                >
                                    Remove Key & Use Platform Default
                                </button>
                            </div>
                        </div>
                    )}

                    {activeCategory === "appearance" && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h2 className="text-2xl font-display text-white mb-2">Appearance</h2>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs uppercase tracking-widest text-text-secondary font-bold">Accent Color</label>
                                <div className="flex flex-wrap gap-3">
                                    {COLORS.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setConfig({ ...config, accentColor: c })}
                                            className={`w-10 h-10 rounded-full border-2 transition-all ${config.accentColor === c ? "border-white scale-110" : "border-transparent"}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                    <input
                                        type="color"
                                        value={config.accentColor}
                                        onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                                        className="w-10 h-10 rounded-full bg-transparent border border-border cursor-pointer"
                                    />
                                </div>
                                <button
                                    onClick={() => setConfig({ ...config, accentColor: DEFAULT_CONFIG.accentColor })}
                                    className="text-xs text-text-secondary hover:text-white underline"
                                >
                                    Reset to default
                                </button>
                            </div>
                        </div>
                    )}

                    {activeCategory === "privacy" && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h2 className="text-2xl font-display text-white mb-2">Privacy & Data</h2>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-obsidian-surface border border-border rounded-xl">
                                <div>
                                    <h4 className="font-bold text-white mb-1">Show Progress Notice</h4>
                                    <p className="text-sm text-text-secondary">Display "Progress saved in your browser" in the sidebar</p>
                                </div>
                                <button
                                    onClick={() => {
                                        const newConfig = { ...config, showProgressNotice: !config.showProgressNotice };
                                        saveUserConfig(newConfig);
                                        setConfig(newConfig);
                                    }}
                                    className={`w-12 h-6 rounded-full transition-colors ${config.showProgressNotice ? "bg-indigo-500" : "bg-white/10"}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${config.showProgressNotice ? "translate-x-6" : "translate-x-0.5"}`} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleExportData}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-obsidian-surface border border-border rounded-xl text-text-primary hover:bg-white/5"
                                >
                                    <Download size={18} />
                                    Export all my data as JSON
                                </button>
                                <button
                                    onClick={() => setClearConfirm(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10"
                                >
                                    <Trash2 size={18} />
                                    Clear all workspace data
                                </button>
                            </div>

                            {clearConfirm && (
                                <div className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm flex items-center justify-center z-50">
                                    <div className="bg-obsidian border border-border p-6 rounded-2xl max-w-md w-full">
                                        <h3 className="text-xl font-bold text-white mb-4">Confirm Clear Data</h3>
                                        <p className="text-text-secondary mb-6">This will delete all your workspaces, progress, and settings. This action cannot be undone.</p>
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => setClearConfirm(false)} className="px-4 py-2 text-text-secondary hover:text-white">Cancel</button>
                                            <button onClick={handleClearData} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg">Delete Everything</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-obsidian-surface/50 border border-border rounded-xl">
                                <h4 className="font-bold text-white mb-2">Privacy Policy</h4>
                                <p className="text-sm text-text-secondary">
                                    Your content is processed by AI providers you choose. We do not store your inputs or outputs on our servers. API keys stay on your device. Progress is stored in your browser's local storage.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeCategory === "about" && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h2 className="text-2xl font-display text-white mb-2">About</h2>
                            </div>

                            <div className="space-y-2 text-text-secondary">
                                <p>Version 1.0.0</p>
                                <p>Build: 2026.03.06</p>
                            </div>

                            <div className="flex gap-4">
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-text-secondary hover:text-white">
                                    <Github size={18} /> GitHub
                                </a>
                                <a href="https://znsnexus.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-text-secondary hover:text-white">
                                    <ExternalLink size={18} /> ZNS Nexus
                                </a>
                                <a href="mailto:support@znsnexus.com" className="flex items-center gap-2 text-text-secondary hover:text-white">
                                    <HelpCircle size={18} /> Report a bug
                                </a>
                            </div>

                            <div className="pt-8 border-t border-border">
                                <p className="text-text-secondary text-sm">Powered by ZNS Nexus · ZNS Enterprises © 2026</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            
            <Footer />
        </div>
    );
}
