import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/utils/supabase/config";

export function createClient() {
    const { url, anonKey } = getSupabaseEnv();

    return createBrowserClient(url, anonKey);
}
