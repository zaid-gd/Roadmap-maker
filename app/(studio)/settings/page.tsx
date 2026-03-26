"use client";

import { Suspense, type ReactNode, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowUpRight,
    Check,
    Download,
    ExternalLink,
    Eye,
    EyeOff,
    HardDrive,
    Info,
    KeyRound,
    Loader2,
    LogOut,
    Trash2,
    UserRound,
} from "lucide-react";
import ManageBillingButton from "@/components/payments/ManageBillingButton";
import StorageStatusCard from "@/components/shared/StorageStatusCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { applyAccentTheme } from "@/lib/accent-theme";
import { AI_PROVIDER_OPTIONS, getAiProviderLabel, PROVIDER_KEY_LABELS, PROVIDER_KEY_PLACEHOLDERS, PROVIDER_MODEL_PRESETS } from "@/lib/ai-config";
import { getEffectivePlanId, getPlanName, isPaidPlan, type SubscriptionRecord } from "@/lib/billing";
import {
    clearUserConfig,
    DEFAULT_CONFIG,
    getActiveApiKey,
    getActiveModel,
    getUserConfig,
    saveUserConfig,
    type UserConfig,
} from "@/lib/userConfig";
import { getRoadmapsBackupJson, getStorage, getStorageStatus } from "@/lib/storage";
import type { CreditStatus, CreditTransaction, PrivacySettings, StorageStatus } from "@/types";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";
import { isSupabaseConfigured } from "@/utils/supabase/config";

const ACCENT_COLORS = ["#4F7CFF", "#C69B5A", "#2FA67D", "#D96868", "#7C67FF", "#D9A441", "#0EA5E9", "#EC4899"];

type Category = "general" | "billing" | "privacy" | "ai";
type ToastState = { tone: "success" | "neutral" | "error"; message: string } | null;

function formatDate(value: string | null | undefined) {
    if (!value) return null;
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(new Date(value));
}

function formatRelativeDate(value: string | null | undefined) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
    }).format(date);
}

function downloadJsonFile(filename: string, data: unknown) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}

function getPlanBadgeClasses(planId: string) {
    if (planId === "agency") return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (planId === "pro") return "border-blue-200 bg-blue-50 text-blue-700";
    return "border-border bg-surface text-text-secondary";
}

function getStatusBadgeClasses(status: string | null | undefined) {
    if (status === "active" || status === "trialing") {
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }
    if (status === "past_due") {
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
    if (status === "canceled") {
        return "border-red-200 bg-red-50 text-red-700";
    }
    return "border-border bg-surface text-text-secondary";
}

function getCreditTone(status: CreditStatus | null) {
    if (!status) return "border-border bg-surface";
    if (status.remaining <= 25) return "border-red-200 bg-red-50";
    if (status.remaining <= 100) return "border-amber-200 bg-amber-50";
    return "border-emerald-200 bg-emerald-50";
}

function getTransactionLabel(kind: CreditTransaction["kind"]) {
    if (kind === "workspace_generation") return "Workspace generation";
    if (kind === "module_regeneration") return "Module regeneration";
    if (kind === "quiz") return "Quiz generation";
    if (kind === "export_pdf") return "PDF export";
    if (kind === "review") return "90-day review";
    return "Credit adjustment";
}

function Toast({ toast, onClose }: { toast: NonNullable<ToastState>; onClose: () => void }) {
    const toneClass =
        toast.tone === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : toast.tone === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-border bg-surface text-text-primary";

    return (
        <div className={`fixed right-4 top-20 z-[80] max-w-md rounded-2xl border px-4 py-3 text-sm shadow-2xl ${toneClass}`}>
            <div className="flex items-start gap-3">
                <div className="mt-0.5">
                    {toast.tone === "success" ? <Check size={16} /> : <Info size={16} />}
                </div>
                <p className="flex-1 leading-6">{toast.message}</p>
                <button type="button" onClick={onClose} className="text-text-secondary transition-colors hover:text-text-primary">
                    x
                </button>
            </div>
        </div>
    );
}

function SectionCard({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="settings-section">
            <div>
                <h2 className="text-2xl font-semibold text-text-primary">{title}</h2>
                <p className="mt-2 text-sm leading-7 text-text-secondary">{description}</p>
            </div>
            <Separator />
            <div className="space-y-6">{children}</div>
        </section>
    );
}

function SettingRow({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <div className="settings-field">
            <div>
                <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">{children}</div>
        </div>
    );
}

function Toggle({
    checked,
    disabled,
    onChange,
}: {
    checked: boolean;
    disabled?: boolean;
    onChange: (next: boolean) => void;
}) {
    return (
        <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="studio-page" />}>
            <SettingsContent />
        </Suspense>
    );
}

function SettingsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [config, setConfig] = useState<UserConfig>(DEFAULT_CONFIG);
    const [activeCategory, setActiveCategory] = useState<Category>("general");
    const [storageStatus, setStorageStatus] = useState<StorageStatus>({
        mode: "local-only",
        cloudAvailable: false,
        email: null,
    });
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
    const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
    const [privacyDraft, setPrivacyDraft] = useState<PrivacySettings>({
        anonymousAnalytics: false,
        allowPublicGallery: false,
    });
    const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null);
    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showKey, setShowKey] = useState(false);
    const [savingConfig, setSavingConfig] = useState(false);
    const [testingKey, setTestingKey] = useState(false);
    const [testMessage, setTestMessage] = useState<string | null>(null);
    const [testTone, setTestTone] = useState<"success" | "error" | "neutral">("neutral");
    const [privacySaving, setPrivacySaving] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [toast, setToast] = useState<ToastState>(null);
    const [isSigningOut, startSignOutTransition] = useTransition();

    useEffect(() => {
        setConfig(getUserConfig());
    }, []);

    useEffect(() => {
        applyAccentTheme(config.accentColor);
    }, [config.accentColor]);

    useEffect(() => {
        if (privacySettings) {
            setPrivacyDraft(privacySettings);
            return;
        }

        setPrivacyDraft({
            anonymousAnalytics: false,
            allowPublicGallery: false,
        });
    }, [privacySettings]);

    useEffect(() => {
        const tab = searchParams.get("tab");
        const payment = searchParams.get("payment");

        if (tab === "billing" || tab === "privacy" || tab === "ai") {
            setActiveCategory(tab);
        } else if (tab === "account" || tab === "appearance" || tab === "general") {
            setActiveCategory("general");
        }

        if (payment === "success") {
            setToast({ tone: "success", message: "Billing updated. Your subscription is active." });
        } else if (payment === "cancelled") {
            setToast({ tone: "neutral", message: "Checkout was cancelled. Your current plan has not changed." });
        }
    }, [searchParams]);

    useEffect(() => {
        let active = true;

        const loadSettings = async () => {
            setLoading(true);

            const nextStorageStatus = await getStorageStatus();
            if (!active) return;

            setStorageStatus(nextStorageStatus);
            setUserEmail(nextStorageStatus.email ?? null);

            if (!isSupabaseConfigured()) {
                setSubscription(null);
                setPrivacySettings(null);
                setCreditStatus(null);
                setTransactions([]);
                setLoading(false);
                return;
            }

            try {
                const supabase = createSupabaseClient();
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!active) return;

                if (!user) {
                    setSubscription(null);
                    setPrivacySettings(null);
                    setCreditStatus(null);
                    setTransactions([]);
                    setLoading(false);
                    return;
                }

                setUserEmail(user.email ?? null);

                const [{ data: subscriptionRow }, privacyRes, creditsRes] = await Promise.all([
                    supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
                    fetch("/api/settings/privacy"),
                    fetch("/api/credits/status"),
                ]);

                if (!active) return;

                setSubscription((subscriptionRow as SubscriptionRecord | null) ?? null);

                if (privacyRes.ok) {
                    const privacyJson = (await privacyRes.json()) as { success: boolean; settings?: PrivacySettings };
                    setPrivacySettings(privacyJson.settings ?? null);
                }

                if (creditsRes.ok) {
                    const creditsJson = (await creditsRes.json()) as {
                        success: boolean;
                        status?: CreditStatus;
                        transactions?: CreditTransaction[];
                    };
                    setCreditStatus(creditsJson.status ?? null);
                    setTransactions(creditsJson.transactions ?? []);
                }
            } catch (error) {
                console.error("Settings load error:", error);
            } finally {
                if (active) setLoading(false);
            }
        };

        void loadSettings();

        return () => {
            active = false;
        };
    }, []);

    const effectivePlanId = getEffectivePlanId(subscription);
    const paidPlan = isPaidPlan(effectivePlanId);
    const renewalDate = formatDate(subscription?.current_period_end);
    const deleteRequiresConfirmation = storageStatus.mode === "synced-account";

    function switchCategory(next: Category) {
        setActiveCategory(next);
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", next);
        router.replace(`/settings?${params.toString()}`);
    }

    async function refreshRemoteSettings() {
        if (!isSupabaseConfigured()) return;

        try {
            const [privacyRes, creditsRes] = await Promise.all([fetch("/api/settings/privacy"), fetch("/api/credits/status")]);

            if (privacyRes.ok) {
                const privacyJson = (await privacyRes.json()) as { success: boolean; settings?: PrivacySettings };
                setPrivacySettings(privacyJson.settings ?? null);
            }

            if (creditsRes.ok) {
                const creditsJson = (await creditsRes.json()) as {
                    success: boolean;
                    status?: CreditStatus;
                    transactions?: CreditTransaction[];
                };
                setCreditStatus(creditsJson.status ?? null);
                setTransactions(creditsJson.transactions ?? []);
            }
        } catch (error) {
            console.error("Refresh settings error:", error);
        }
    }

    function handleSaveConfig() {
        saveUserConfig(config);
        setSavingConfig(true);
        setToast({ tone: "success", message: "Studio preferences saved locally in this browser." });
        window.setTimeout(() => setSavingConfig(false), 800);
    }

    function handleResetConfig() {
        setConfig(DEFAULT_CONFIG);
        clearUserConfig();
        setToast({ tone: "neutral", message: "Local studio preferences were reset to defaults." });
    }

    async function handleTestApiKey() {
        const activeApiKey = getActiveApiKey(config);
        if (!activeApiKey) {
            setTestTone("error");
            setTestMessage(`Add a ${PROVIDER_KEY_LABELS[config.provider]} before testing the connection.`);
            return;
        }

        setTestingKey(true);
        setTestMessage(null);

        try {
            const res = await fetch("/api/parse-roadmap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: "connection-test",
                    testOnly: true,
                    userApiKey: activeApiKey,
                    userModel: getActiveModel(config),
                    userProvider: config.provider,
                }),
            });

            const payload = (await res.json()) as { success?: boolean; error?: string };
            if (payload.error === "invalid_key" || !res.ok) {
                setTestTone("error");
                setTestMessage(`The ${getAiProviderLabel(config.provider)} key could not be verified. Check the key and billing status, then try again.`);
                return;
            }

            setTestTone("success");
            setTestMessage(`${getAiProviderLabel(config.provider)} connection confirmed. BYOK requests will use this provider and skip shared studio credits.`);
        } catch (error) {
            console.error("API key test error:", error);
            setTestTone("error");
            setTestMessage("Connection test failed. Check your network and try again.");
        } finally {
            setTestingKey(false);
        }
    }

    async function updatePrivacy(next: Partial<PrivacySettings>) {
        if (!userEmail) {
            setToast({ tone: "neutral", message: "Sign in first to store privacy preferences on your account." });
            return;
        }

        const merged = {
            anonymousAnalytics: next.anonymousAnalytics ?? privacySettings?.anonymousAnalytics ?? false,
            allowPublicGallery: next.allowPublicGallery ?? privacySettings?.allowPublicGallery ?? false,
        };

        setPrivacySaving(true);

        try {
            const res = await fetch("/api/settings/privacy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(merged),
            });

            const payload = (await res.json()) as { success: boolean; settings?: PrivacySettings; error?: string };
            if (!res.ok || !payload.success || !payload.settings) {
                throw new Error(payload.error || "Failed to update privacy settings");
            }

            setPrivacySettings(payload.settings);
            setToast({ tone: "success", message: "Privacy settings updated." });
        } catch (error) {
            console.error("Privacy update error:", error);
            setToast({ tone: "error", message: "Privacy settings could not be updated." });
        } finally {
            setPrivacySaving(false);
        }
    }

    async function handleSavePrivacy() {
        await updatePrivacy(privacyDraft);
    }

    async function handleExportData() {
        setExporting(true);

        try {
            if (userEmail) {
                const res = await fetch("/api/settings/export");
                const payload = (await res.json()) as { success: boolean; data?: unknown; error?: string };
                if (!res.ok || !payload.success || payload.data === undefined) {
                    throw new Error(payload.error || "Failed to export account data");
                }

                downloadJsonFile(`zns-studio-export-${new Date().toISOString().slice(0, 10)}.json`, payload.data);
                setToast({ tone: "success", message: "Account export downloaded." });
                return;
            }

            downloadJsonFile(`zns-studio-local-export-${new Date().toISOString().slice(0, 10)}.json`, {
                exportedAt: new Date().toISOString(),
                storageMode: storageStatus.mode,
                config,
                roadmaps: JSON.parse(getRoadmapsBackupJson() || "[]"),
            });
            setToast({ tone: "success", message: "Local browser export downloaded." });
        } catch (error) {
            console.error("Export error:", error);
            setToast({ tone: "error", message: "Export failed. Please try again." });
        } finally {
            setExporting(false);
        }
    }

    async function handleDeleteEverything() {
        if (deleteRequiresConfirmation && deleteConfirmation !== "DELETE") {
            setToast({ tone: "error", message: 'Type DELETE to confirm account data removal.' });
            return;
        }

        setDeleting(true);

        try {
            if (userEmail) {
                const res = await fetch("/api/settings/delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ confirmation: "DELETE" }),
                });
                const payload = (await res.json()) as { success?: boolean; error?: string };
                if (!res.ok || !payload.success) {
                    throw new Error(payload.error || "Failed to delete account data");
                }
            }

            getStorage().clearRoadmaps();
            clearUserConfig();
            setConfig(DEFAULT_CONFIG);
            setDeleteConfirmation("");
            setPrivacySettings(userEmail ? { anonymousAnalytics: false, allowPublicGallery: false } : null);
            setCreditStatus(null);
            setTransactions([]);
            setToast({
                tone: "success",
                message: userEmail
                    ? "Account-scoped data was removed. Local browser state was cleared as well."
                    : "Local browser data was cleared from this device.",
            });
            window.setTimeout(() => window.location.reload(), 350);
        } catch (error) {
            console.error("Delete error:", error);
            setToast({ tone: "error", message: "Delete failed. Please try again." });
        } finally {
            setDeleting(false);
        }
    }

    function handleSignOut() {
        startSignOutTransition(() => {
            void (async () => {
                try {
                    const supabase = createSupabaseClient();
                    await supabase.auth.signOut();
                    setToast({ tone: "neutral", message: "Signed out. Local work remains in this browser." });
                    window.setTimeout(() => window.location.reload(), 250);
                } catch (error) {
                    console.error("Sign-out error:", error);
                    setToast({ tone: "error", message: "Sign-out failed. Please try again." });
                }
            })();
        });
    }

    const categoryButtons = [
        {
            id: "general" as const,
            label: "General",
            description: "Storage, sync state, account identity, and local preferences.",
        },
        {
            id: "ai" as const,
            label: "AI / API Key",
            description: "Choose shared studio AI or your own provider key.",
        },
        {
            id: "privacy" as const,
            label: "Privacy",
            description: "Export data, control gallery visibility, and delete all data.",
        },
        {
            id: "billing" as const,
            label: "Billing",
            description: "Plan status, credit allowance, transaction history, and upgrades.",
        },
    ];

    const activeCategoryMeta = categoryButtons.find((item) => item.id === activeCategory) ?? categoryButtons[0];
    const storageModeLabel =
        storageStatus.mode === "synced-account"
            ? "Synced account"
            : storageStatus.mode === "supabase-unavailable"
                ? "Browser-only"
                : "Local-only";

    return (
        <div className="studio-page">
            {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

            <header className="app-header-block">
                <div>
                    <p className="eyebrow">Settings</p>
                    <h1 className="mt-3 text-4xl font-display leading-none text-text-primary md:text-5xl">Studio settings</h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary">{activeCategoryMeta.description}</p>
                </div>
            </header>

            <div className="settings-shell lg:grid-cols-[180px_minmax(0,1fr)]">
                <nav className="settings-nav lg:sticky lg:top-24">
                    {categoryButtons.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => switchCategory(item.id)}
                            className="settings-nav-link text-left"
                            data-active={activeCategory === item.id}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="settings-content">
                    {activeCategory === "general" && (
                        <SectionCard
                            title="General"
                            description="Manage storage behavior, account sync, and browser-scoped studio preferences."
                        >
                            <StorageStatusCard
                                status={storageStatus}
                                actionHref={userEmail ? undefined : "/auth?next=%2Fsettings%3Ftab%3Dgeneral"}
                                actionLabel="Enable account sync"
                                variant="inset"
                            />

                            <SettingRow
                                title="Current account"
                                description={
                                    userEmail
                                        ? "This email is attached to synced workspace data, billing, and account-level settings."
                                        : "You are currently using RoadMap Studio without an account. Work stays on this device unless you enable sync."
                                }
                            >
                                {loading ? (
                                    <div className="inline-flex items-center gap-2 text-sm text-text-secondary">
                                        <Loader2 size={14} className="animate-spin" />
                                        Loading account
                                    </div>
                                ) : userEmail ? (
                                    <>
                                        <div className="inline-flex items-center gap-2 text-sm text-text-primary">
                                            <UserRound size={14} />
                                            {userEmail}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleSignOut}
                                            disabled={isSigningOut}
                                            className="button-secondary disabled:opacity-60"
                                        >
                                            {isSigningOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                                            Sign out
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        href="/auth?next=%2Fsettings%3Ftab%3Dgeneral"
                                        className="button-primary"
                                    >
                                        <HardDrive size={14} />
                                        Sign in to enable sync
                                    </Link>
                                )}
                            </SettingRow>

                            <SettingRow
                                title="Storage mode"
                                description="Roadmaps always save locally first. When sync is enabled, the same work is mirrored to your account."
                            >
                                <span className="text-sm font-medium text-text-primary">{storageModeLabel}</span>
                            </SettingRow>

                            <div className="settings-field">
                                <div>
                                    <h3 className="text-sm font-semibold text-text-primary">Accent color</h3>
                                    <p className="mt-1 text-sm leading-6 text-text-secondary">
                                        Choose the highlight color used across this browser session.
                                    </p>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    {ACCENT_COLORS.map((color) => {
                                        const active = config.accentColor === color;
                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setConfig((current) => ({ ...current, accentColor: color }))}
                                                className={`h-12 w-12 rounded-full border transition-transform hover:scale-105 ${active ? "border-text-primary shadow-[0_0_0_4px_rgba(79,124,255,0.12)]" : "border-border"
                                                    }`}
                                                style={{ backgroundColor: color }}
                                                aria-label={`Use accent color ${color}`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            <SettingRow
                                title="Show progress notices"
                                description="Keep lightweight completion hints and nudges visible in the local studio interface."
                            >
                                <Toggle
                                    checked={config.showProgressNotice}
                                    onChange={(next) => setConfig((current) => ({ ...current, showProgressNotice: next }))}
                                />
                            </SettingRow>

                            <div className="settings-action-row">
                                <div className="mr-auto">
                                    <Button type="button" variant="secondary" onClick={handleResetConfig}>
                                        Reset local preferences
                                    </Button>
                                </div>
                                <Button type="button" onClick={handleSaveConfig}>
                                    {savingConfig ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                    Save changes
                                </Button>
                            </div>
                        </SectionCard>
                    )}

                    {activeCategory === "billing" && (
                        <SectionCard
                            title="Billing"
                            description="Review plan status, current allowance, and recent credit activity."
                        >
                            <div className="settings-field">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getPlanBadgeClasses(effectivePlanId)}`}>
                                        {getPlanName(effectivePlanId)}
                                    </span>
                                    {subscription?.status && (
                                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusBadgeClasses(subscription.status)}`}>
                                            {subscription.status}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-4 text-sm leading-7 text-text-secondary">
                                    {paidPlan
                                        ? renewalDate
                                            ? `Your current billing period renews on ${renewalDate}.`
                                            : "Your subscription is active and account-scoped."
                                        : "You are on the free studio tier. Upgrade when you need more monthly AI allowance or client-facing features."}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    {paidPlan ? (
                                        <ManageBillingButton />
                                    ) : (
                                        <Link href="/pricing" className="button-primary">
                                            View pricing
                                            <ArrowUpRight size={14} />
                                        </Link>
                                    )}
                                    <Link href="/pricing" className="button-secondary">
                                        Compare plans
                                        <ExternalLink size={14} />
                                    </Link>
                                </div>
                            </div>

                            <div className="settings-field">
                                <h3 className="text-sm font-semibold text-text-primary">Monthly credits</h3>
                                <p className="mt-1 text-sm leading-6 text-text-secondary">
                                    {creditStatus
                                        ? `${creditStatus.remaining} remaining. ${creditStatus.used} used out of ${creditStatus.allowance}. Resets ${formatDate(creditStatus.resetDate)}.`
                                        : userEmail
                                            ? "Loading current credit allowance."
                                            : "Sign in to track studio-managed monthly credits. BYOK can bypass credits entirely."}
                                </p>
                                {creditStatus && (
                                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-border/70">
                                        <div
                                            className="h-full rounded-full bg-[linear-gradient(90deg,#4F7CFF,#C69B5A)]"
                                            style={{ width: `${Math.max(8, Math.min(100, (creditStatus.used / Math.max(creditStatus.allowance, 1)) * 100))}%` }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="settings-field">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-text-primary">Recent transactions</h3>
                                        <p className="mt-1 text-sm leading-6 text-text-secondary">Latest credit activity for this account.</p>
                                    </div>
                                    {userEmail && (
                                        <button type="button" onClick={() => void refreshRemoteSettings()} className="button-secondary">
                                            Refresh
                                        </button>
                                    )}
                                </div>

                                <div className="mt-4 space-y-3">
                                    {transactions.length > 0 ? (
                                        transactions.map((transaction) => (
                                            <div key={transaction.id} className="rounded-[18px] border border-border bg-surface px-4 py-4">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <p className="text-sm font-semibold text-text-primary">{getTransactionLabel(transaction.kind)}</p>
                                                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-text-secondary">{formatRelativeDate(transaction.createdAt)}</p>
                                                    </div>
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-sm font-semibold text-text-primary">{transaction.amount} credits</p>
                                                        {transaction.metadata?.roadmapTitle && (
                                                            <p className="mt-1 text-sm text-text-secondary">{transaction.metadata.roadmapTitle}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-[18px] border border-dashed border-border px-4 py-6 text-sm leading-7 text-text-secondary">
                                            {userEmail
                                                ? "No credit transactions yet. Generated work, quizzes, and reviews will appear here."
                                                : "Sign in to store and view credit history on your account."}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SectionCard>
                    )}

                    {activeCategory === "privacy" && (
                        <SectionCard
                            title="Privacy"
                            description="Control analytics, gallery visibility, exports, and destructive actions."
                        >
                            <SettingRow
                                title="Anonymous analytics"
                                description="Allow product analytics that help improve the studio without exposing your work publicly."
                            >
                                <Toggle
                                    checked={privacyDraft.anonymousAnalytics}
                                    disabled={!userEmail || privacySaving}
                                    onChange={(next) => setPrivacyDraft((current) => ({ ...current, anonymousAnalytics: next }))}
                                />
                            </SettingRow>

                            <SettingRow
                                title="Allow public gallery participation"
                                description="When disabled, your account will no longer expose shareable gallery entries."
                            >
                                <Toggle
                                    checked={privacyDraft.allowPublicGallery}
                                    disabled={!userEmail || privacySaving}
                                    onChange={(next) => setPrivacyDraft((current) => ({ ...current, allowPublicGallery: next }))}
                                />
                            </SettingRow>

                            <SettingRow
                                title="Export your data"
                                description={
                                    userEmail
                                        ? "Download account-scoped roadmaps, privacy settings, analytics, and related studio records in one JSON export."
                                        : "Download the roadmaps and local studio preferences stored in this browser."
                                }
                            >
                                <button
                                    type="button"
                                    onClick={() => void handleExportData()}
                                    disabled={exporting}
                                    className="button-secondary disabled:opacity-60"
                                >
                                    {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                    Download export
                                </button>
                            </SettingRow>

                            <div className="settings-field">
                                <div>
                                    <h3 className="text-sm font-semibold text-red-700">Danger zone</h3>
                                    <p className="mt-1 text-sm leading-6 text-text-secondary">
                                    {userEmail
                                        ? "This removes account-scoped roadmaps, notes, privacy settings, analytics history, coaching sessions, credit records, and local browser copies on this device. Your auth account remains."
                                        : "This clears all roadmaps and studio preferences from this browser only."}
                                    </p>
                                </div>

                                {deleteRequiresConfirmation && (
                                    <div className="mt-5 max-w-sm">
                                        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary" htmlFor="delete-confirmation">
                                            Type DELETE to confirm
                                        </label>
                                        <Input
                                            id="delete-confirmation"
                                            value={deleteConfirmation}
                                            onChange={(event) => setDeleteConfirmation(event.target.value)}
                                            className="mt-2 border-red-200 bg-white"
                                            placeholder="DELETE"
                                        />
                                    </div>
                                )}

                                <div className="mt-6">
                                    <Button
                                        type="button"
                                        onClick={() => void handleDeleteEverything()}
                                        disabled={deleting}
                                        variant="destructive"
                                    >
                                        {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                        Delete all data
                                    </Button>
                                </div>
                            </div>

                            <div className="settings-action-row">
                                <Button type="button" onClick={() => void handleSavePrivacy()} disabled={!userEmail || privacySaving}>
                                    {privacySaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                    Save changes
                                </Button>
                            </div>
                        </SectionCard>
                    )}

                    {activeCategory === "ai" && (
                        <SectionCard
                            title="AI / API Key"
                            description="Gemini is the default provider. Add your own key to skip studio credits, or switch to any other supported provider."
                        >
                            <SettingRow
                                title="Use your own provider key"
                                description="When enabled, requests use the selected provider and skip studio credit deductions. Add your Gemini API key below to get started."
                            >
                                <Toggle
                                    checked={config.useCustomKey}
                                    onChange={(next) => setConfig((current) => ({ ...current, useCustomKey: next }))}
                                />
                            </SettingRow>

                            <div className="settings-field">
                                <div>
                                    <h3 className="text-sm font-semibold text-text-primary">Provider</h3>
                                    <p className="mt-1 text-sm leading-6 text-text-secondary">
                                        Pick the provider and model used when BYOK is enabled.
                                    </p>
                                </div>
                                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                            {AI_PROVIDER_OPTIONS.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() =>
                                                        setConfig((current) => ({
                                                            ...current,
                                                            provider: option.value,
                                                        }))
                                                    }
                                                    className={`rounded-[18px] border px-4 py-3 text-left transition-colors ${
                                                        config.provider === option.value
                                                            ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                                                            : "border-border bg-surface hover:border-border-strong"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                                                        <span>{option.label}</span>
                                                        {option.value === "gemini" ? (
                                                            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                                                                Default
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <div className="mt-1 text-sm leading-6 text-text-secondary">{option.description}</div>
                                                </button>
                                            ))}
                                </div>
                            </div>

                            <div className="settings-field">
                                <label className="text-sm font-semibold text-text-primary" htmlFor="provider-model">
                                    Model
                                </label>
                                <p className="mt-1 text-sm leading-6 text-text-secondary">
                                    Choose a preset or enter a model id manually.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {PROVIDER_MODEL_PRESETS[config.provider].map((model) => (
                                        <Button
                                            key={model}
                                            type="button"
                                            variant={getActiveModel(config) === model ? "default" : "outline"}
                                            size="sm"
                                            onClick={() =>
                                                setConfig((current) => ({
                                                    ...current,
                                                    modelByProvider: {
                                                        ...current.modelByProvider,
                                                        [current.provider]: model,
                                                    },
                                                }))
                                            }
                                        >
                                            {model}
                                        </Button>
                                    ))}
                                </div>
                                <Input
                                    id="provider-model"
                                    value={getActiveModel(config)}
                                    onChange={(event) =>
                                        setConfig((current) => ({
                                            ...current,
                                            modelByProvider: {
                                                ...current.modelByProvider,
                                                [current.provider]: event.target.value,
                                            },
                                        }))
                                    }
                                    placeholder="Enter a model id"
                                    className="mt-3"
                                />
                            </div>

                            <div className="settings-field">
                                <label className="text-sm font-semibold text-text-primary" htmlFor="provider-api-key">
                                    {PROVIDER_KEY_LABELS[config.provider]}
                                </label>
                                <p className="mt-1 text-sm leading-6 text-text-secondary">
                                    Provider keys stay in this browser and are never written to Supabase.
                                </p>
                                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                    <div className="relative flex-1">
                                        <Input
                                            id="provider-api-key"
                                            type={showKey ? "text" : "password"}
                                            value={config.apiKeys[config.provider]}
                                            onChange={(event) =>
                                                setConfig((current) => ({
                                                    ...current,
                                                    apiKeys: {
                                                        ...current.apiKeys,
                                                        [current.provider]: event.target.value,
                                                    },
                                                }))
                                            }
                                            placeholder={PROVIDER_KEY_PLACEHOLDERS[config.provider]}
                                            className="pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowKey((current) => !current)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                        >
                                            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={() => void handleTestApiKey()}
                                        disabled={testingKey}
                                        variant="secondary"
                                        className="justify-center"
                                    >
                                        {testingKey ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                                        Test connection
                                    </Button>
                                </div>

                                {testMessage && (
                                    <div
                                        className={`mt-4 rounded-[18px] border px-4 py-3 text-sm leading-7 ${testTone === "success"
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                : testTone === "error"
                                                    ? "border-red-200 bg-red-50 text-red-700"
                                                    : "border-border bg-surface text-text-primary"
                                            }`}
                                    >
                                        {testMessage}
                                    </div>
                                )}
                            </div>

                            <div className="settings-action-row">
                                <Button type="button" onClick={handleSaveConfig}>
                                    {savingConfig ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                    Save changes
                                </Button>
                            </div>
                        </SectionCard>
                    )}
                </div>
            </div>
        </div>
    );
}
