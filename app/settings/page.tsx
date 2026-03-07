"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ManageBillingButton from "@/components/payments/ManageBillingButton";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";
import { isSupabaseConfigured } from "@/utils/supabase/config";
import { getEffectivePlanId, getPlanName, isPaidPlan, type SubscriptionRecord } from "@/lib/billing";
import { getRoadmapsBackupJson, getStorage } from "@/lib/storage";
import { getUserConfig, saveUserConfig, clearUserConfig, DEFAULT_CONFIG, AIProvider } from "@/lib/userConfig";
import {
    AlertCircle,
    ArrowUpRight,
    Check,
    Cpu,
    CreditCard,
    Download,
    ExternalLink,
    Eye,
    EyeOff,
    Github,
    HelpCircle,
    Info,
    Loader2,
    Palette,
    Shield,
    Trash2,
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

const COLORS = ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F43F5E", "#F59E0B", "#0EA5E9", "#EC4899"];

type Category = "ai" | "billing" | "appearance" | "privacy" | "about";
type ToastState =
    | { tone: "success"; message: string }
    | { tone: "neutral"; message: string }
    | null;

function formatDate(date: string | null | undefined) {
    if (!date) return null;
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
}

function getPlanBadgeClasses(planId: string) {
    if (planId === "agency") return "border-emerald-400/30 bg-emerald-500/10 text-emerald-300";
    if (planId === "pro") return "border-indigo-400/30 bg-indigo-500/10 text-indigo-200";
    return "border-white/10 bg-white/5 text-text-secondary";
}

function getStatusBadgeClasses(status: string | null | undefined) {
    if (status === "active" || status === "trialing") {
        return "border-emerald-400/30 bg-emerald-500/10 text-emerald-300";
    }
    if (status === "past_due") {
        return "border-amber-400/30 bg-amber-500/10 text-amber-300";
    }
    if (status === "canceled") {
        return "border-red-400/30 bg-red-500/10 text-red-300";
    }
    return "border-white/10 bg-white/5 text-text-secondary";
}

function Toast({ toast, onClose }: { toast: NonNullable<ToastState>; onClose: () => void }) {
    return (
        <div
            className={`fixed right-4 top-20 z-[80] max-w-md rounded-2xl border px-4 py-3 text-sm shadow-2xl ${
                toast.tone === "success"
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                    : "border-white/10 bg-obsidian-elevated text-text-primary"
            }`}
        >
            <div className="flex items-start gap-3">
                <div className="mt-0.5">
                    {toast.tone === "success" ? <Check size={16} /> : <Info size={16} />}
                </div>
                <p className="flex-1 leading-6">{toast.message}</p>
                <button type="button" onClick={onClose} className="text-text-secondary hover:text-white">
                    ×
                </button>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-obsidian" />}>
            <SettingsContent />
        </Suspense>
    );
}

function SettingsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [activeCategory, setActiveCategory] = useState<Category>("ai");
    const [showKey, setShowKey] = useState(false);
    const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [testMessage, setTestMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [clearConfirm, setClearConfirm] = useState(false);
    const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
    const [billingLoading, setBillingLoading] = useState(true);
    const [toast, setToast] = useState<ToastState>(null);

    useEffect(() => {
        setConfig(getUserConfig());
    }, []);

    useEffect(() => {
        document.documentElement.style.setProperty("--accent", config.accentColor);
    }, [config.accentColor]);

    useEffect(() => {
        const tab = searchParams.get("tab");
        const payment = searchParams.get("payment");

        if (tab === "billing" || payment) {
            setActiveCategory("billing");
            return;
        }

        if (tab === "appearance" || tab === "privacy" || tab === "about" || tab === "ai") {
            setActiveCategory(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        let active = true;

        const loadSubscription = async () => {
            setBillingLoading(true);

            try {
                if (!isSupabaseConfigured()) {
                    setSubscription(null);
                    setBillingLoading(false);
                    return;
                }

                const supabase = createSupabaseClient();
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!active) return;

                if (!user) {
                    setSubscription(null);
                    setBillingLoading(false);
                    return;
                }

                const { data: sub } = await supabase
                    .from("subscriptions")
                    .select("*")
                    .eq("user_id", user.id)
                    .maybeSingle();

                if (!active) return;
                setSubscription((sub as SubscriptionRecord | null) ?? null);
            } catch (error) {
                console.error("Billing fetch error:", error);
            } finally {
                if (active) setBillingLoading(false);
            }
        };

        void loadSubscription();

        return () => {
            active = false;
        };
    }, []);

    const effectivePlanId = useMemo(() => getEffectivePlanId(subscription), [subscription]);
    const isPaid = isPaidPlan(effectivePlanId);
    const renewalDate = subscription?.current_period_end ? formatDate(subscription.current_period_end) : null;

    useEffect(() => {
        const payment = searchParams.get("payment");
        if (!payment) return;

        if (payment === "cancelled") {
            setToast({
                tone: "neutral",
                message: "Payment cancelled. You're still on the Free plan.",
            });
        }

        if (payment === "success" && billingLoading) {
            return;
        }

        if (payment === "success") {
            setToast({
                tone: "success",
                message: `🎉 Welcome to ${getPlanName(effectivePlanId)}! Your subscription is now active.`,
            });
        }

        const params = new URLSearchParams(searchParams.toString());
        params.delete("payment");
        params.delete("session_id");
        const nextUrl = params.toString() ? `/settings?${params.toString()}` : "/settings";
        const timer = window.setTimeout(() => router.replace(nextUrl), 150);

        return () => window.clearTimeout(timer);
    }, [billingLoading, effectivePlanId, router, searchParams]);

    const handleProviderChange = (provider: AIProvider) => {
        setConfig({ ...config, provider, model: MODELS[provider][0] });
    };

    const handleSave = () => {
        saveUserConfig(config);
        setSaving(true);
        window.setTimeout(() => setSaving(false), 1000);
    };

    const handleTest = async () => {
        setTestStatus("loading");
        setTestMessage("");

        try {
            const res = await fetch("/api/parse-roadmap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: "connection-test",
                    testOnly: true,
                    userApiKey: config.apiKey,
                    userProvider: config.provider,
                    userModel: config.model,
                }),
            });

            const json = await res.json();
            if (json.error === "invalid_key") {
                setTestStatus("error");
                setTestMessage("Connection failed. Check your API key and try again.");
            } else if (json.success) {
                setTestStatus("success");
                setTestMessage(`Connected successfully. ${config.model} is ready.`);
            } else {
                throw new Error("Unknown error");
            }
        } catch {
            setTestStatus("error");
            setTestMessage("Connection failed. Check your API key and try again.");
        }
    };

    const handleRemoveKey = () => {
        const newConfig = { ...config, apiKey: "", useCustomKey: false };
        saveUserConfig(newConfig);
        setConfig(newConfig);
    };

    const handleExportData = () => {
        const data = getRoadmapsBackupJson();
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "zns_backup.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClearData = () => {
        getStorage().clearRoadmaps();
        clearUserConfig();
        localStorage.removeItem("zns_workspaces");
        setClearConfirm(false);
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-obsidian flex flex-col">
            <Header />

            {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

            <div className="flex-1 flex max-w-6xl mx-auto w-full p-6 gap-8 pt-24">
                <aside className="w-64 shrink-0">
                    <nav className="space-y-1 sticky top-24">
                        {[
                            { id: "ai", icon: Cpu, label: "AI Configuration" },
                            { id: "billing", icon: CreditCard, label: "Billing" },
                            { id: "appearance", icon: Palette, label: "Appearance" },
                            { id: "privacy", icon: Shield, label: "Privacy & Data" },
                            { id: "about", icon: Info, label: "About" },
                        ].map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveCategory(item.id as Category)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                                    activeCategory === item.id
                                        ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/30"
                                        : "text-text-secondary hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>

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

                            <div className="space-y-4">
                                <label className="text-xs uppercase tracking-widest text-text-secondary font-bold">Select Provider</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {PROVIDERS.map((provider) => (
                                        <button
                                            key={provider.id}
                                            type="button"
                                            onClick={() => handleProviderChange(provider.id)}
                                            className={`relative p-4 rounded-xl border text-left transition-all ${
                                                config.provider === provider.id
                                                    ? "border-indigo-500 bg-indigo-500/5"
                                                    : "border-border bg-obsidian-surface hover:border-white/20"
                                            }`}
                                        >
                                            {config.provider === provider.id && (
                                                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                                                    <Check size={12} className="text-white" />
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${provider.color}20` }}>
                                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: provider.color }} />
                                                </div>
                                                <span className="font-bold text-white">{provider.name}</span>
                                            </div>
                                            <span className="text-xs text-text-secondary">{provider.info}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-text-secondary font-bold">Model</label>
                                <select
                                    value={config.model}
                                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                                    className="w-full bg-obsidian border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-indigo-500/50"
                                >
                                    {MODELS[config.provider].map((model) => (
                                        <option key={model} value={model}>
                                            {model}
                                        </option>
                                    ))}
                                </select>
                            </div>

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

                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={handleTest}
                                    disabled={!config.apiKey || testStatus === "loading"}
                                    className="px-4 py-2 bg-obsidian-surface border border-border rounded-lg text-sm text-text-primary hover:bg-white/5 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {testStatus === "loading" && <Loader2 size={14} className="animate-spin" />}
                                    Test Connection
                                </button>
                                {testStatus === "success" && (
                                    <span className="text-emerald-400 text-sm flex items-center gap-1">
                                        <Check size={14} /> {testMessage}
                                    </span>
                                )}
                                {testStatus === "error" && (
                                    <span className="text-red-400 text-sm flex items-center gap-1">
                                        <AlertCircle size={14} /> {testMessage}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-border">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                    Save Configuration
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemoveKey}
                                    className="px-4 py-2.5 text-red-400 hover:text-red-300 text-sm"
                                >
                                    Remove Key & Use Platform Default
                                </button>
                            </div>
                        </div>
                    )}

                    {activeCategory === "billing" && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h2 className="text-2xl font-display text-white mb-2">Billing</h2>
                                <p className="text-text-secondary text-sm">
                                    Manage your current plan, payment status, and Stripe billing portal access.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_46%),linear-gradient(180deg,rgba(26,29,39,0.96),rgba(15,17,23,0.96))] p-6">
                                {billingLoading ? (
                                    <div className="flex items-center gap-3 text-text-secondary">
                                        <Loader2 size={18} className="animate-spin" />
                                        Loading subscription details...
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.24em] text-text-secondary mb-3">Current subscription</p>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getPlanBadgeClasses(effectivePlanId)}`}>
                                                        {getPlanName(effectivePlanId)}
                                                    </span>
                                                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getStatusBadgeClasses(subscription?.status || "free")}`}>
                                                        {subscription?.status ? subscription.status.replace("_", " ") : "free tier"}
                                                    </span>
                                                </div>

                                                <div className="mt-4 space-y-2 text-sm text-text-secondary">
                                                    {isPaid && renewalDate && (
                                                        <p>
                                                            {subscription?.cancel_at_period_end ? "Cancels on" : "Renews on"}{" "}
                                                            <span className="text-white">{renewalDate}</span>
                                                        </p>
                                                    )}
                                                    {!isPaid && (
                                                        <p>
                                                            You are currently on the Free plan. Upgrade for unlimited AI generations, watermark removal, and client-facing branding controls.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3">
                                                {isPaid && subscription?.stripe_customer_id && <ManageBillingButton />}
                                                <Link
                                                    href="/pricing"
                                                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-white/10"
                                                >
                                                    View Pricing
                                                    <ArrowUpRight size={15} />
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                                            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                                <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Plan</p>
                                                <p className="mt-2 text-lg font-semibold text-white">{getPlanName(effectivePlanId)}</p>
                                            </div>
                                            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                                <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Billing cadence</p>
                                                <p className="mt-2 text-lg font-semibold text-white capitalize">
                                                    {subscription?.billing_interval || "monthly"}
                                                </p>
                                            </div>
                                            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                                <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Status</p>
                                                <p className="mt-2 text-lg font-semibold text-white capitalize">
                                                    {subscription?.status ? subscription.status.replace("_", " ") : "free tier"}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-obsidian-surface/60 p-5">
                                <h3 className="text-lg font-semibold text-white mb-2">What billing unlocks</h3>
                                <p className="text-sm text-text-secondary leading-7">
                                    Pro removes creation caps, expands exports, and unlocks brand-level controls. Agency adds white-label embedding, client workspace management, and analytics meant for external delivery workflows.
                                </p>
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
                                    {COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setConfig({ ...config, accentColor: color })}
                                            className={`w-10 h-10 rounded-full border-2 transition-all ${config.accentColor === color ? "border-white scale-110" : "border-transparent"}`}
                                            style={{ backgroundColor: color }}
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
                                    type="button"
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
                                    <p className="text-sm text-text-secondary">Display &quot;Progress saved in your browser&quot; in the sidebar</p>
                                </div>
                                <button
                                    type="button"
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
                                    type="button"
                                    onClick={handleExportData}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-obsidian-surface border border-border rounded-xl text-text-primary hover:bg-white/5"
                                >
                                    <Download size={18} />
                                    Export all my data as JSON
                                </button>
                                <button
                                    type="button"
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
                                            <button type="button" onClick={() => setClearConfirm(false)} className="px-4 py-2 text-text-secondary hover:text-white">
                                                Cancel
                                            </button>
                                            <button type="button" onClick={handleClearData} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg">
                                                Delete Everything
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-obsidian-surface/50 border border-border rounded-xl">
                                <h4 className="font-bold text-white mb-2">Privacy Policy</h4>
                                <p className="text-sm text-text-secondary">
                                    Your content is processed by AI providers you choose. API keys stay on your device. Workspace data is stored locally and can sync to Supabase when configured.
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

                            <div className="flex gap-4 flex-wrap">
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
