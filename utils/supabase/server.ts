import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseEnv, getSupabaseServiceRoleEnv } from "@/utils/supabase/config";

export async function createServerClient() {
    const cookieStore = await cookies();
    const { url, anonKey } = getSupabaseEnv();

    return createSupabaseServerClient(
        url,
        anonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Ignore cookie writes when invoked from a Server Component.
                    }
                },
            },
        }
    );
}

export async function createClient() {
    return createServerClient();
}

export function createServiceRoleClient() {
    const { url, serviceRoleKey } = getSupabaseServiceRoleEnv();

    return createSupabaseClient(
        url,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}
