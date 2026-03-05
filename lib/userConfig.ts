export type AIProvider = "gemini" | "openai" | "groq" | "openrouter" | "anthropic";

export interface UserConfig {
    apiKey: string;
    provider: AIProvider;
    model: string;
    useCustomKey: boolean;
    theme: "dark";
    accentColor: string;
    showProgressNotice: boolean;
}

const STORAGE_KEY = "zns_user_config";

export const DEFAULT_CONFIG: UserConfig = {
    apiKey: "",
    provider: "gemini",
    model: "gemini-2.0-flash",
    useCustomKey: false,
    theme: "dark",
    accentColor: "#6366F1",
    showProgressNotice: true,
};

export function getUserConfig(): UserConfig {
    if (typeof window === "undefined") return DEFAULT_CONFIG;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_CONFIG;
    try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    } catch {
        return DEFAULT_CONFIG;
    }
}

export function saveUserConfig(config: UserConfig): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearUserConfig(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
}
