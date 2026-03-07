import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv, isSupabaseConfigured } from "@/utils/supabase/config";

export async function updateSession(request: NextRequest) {
    if (!isSupabaseConfigured()) {
        return NextResponse.next({
            request,
        });
    }

    const { url, anonKey } = getSupabaseEnv();
    let response = NextResponse.next({
        request,
    });

    const supabase = createServerClient(url, anonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    request.cookies.set(name, value);
                    response.cookies.set(name, value, options);
                });
            },
        },
    });

    await supabase.auth.getUser();

    return response;
}
