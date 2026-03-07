import { NextRequest, NextResponse } from "next/server";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { getSupabaseEnv, isSupabaseConfigured } from "@/utils/supabase/config";

function normalizePath(value: string | null) {
    return value && value.startsWith("/") ? value : "/";
}

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const nextPath = normalizePath(requestUrl.searchParams.get("next"));
    const code = requestUrl.searchParams.get("code");

    if (!isSupabaseConfigured()) {
        return NextResponse.redirect(new URL("/auth?error=Supabase%20is%20not%20configured", request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL("/auth?error=Missing%20auth%20code", request.url));
    }

    const { url, anonKey } = getSupabaseEnv();
    const response = NextResponse.redirect(new URL(nextPath, request.url));
    const supabase = createSupabaseServerClient(url, anonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    response.cookies.set(name, value, options);
                });
            },
        },
    });
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        return NextResponse.redirect(
            new URL(`/auth?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(nextPath)}`, request.url),
        );
    }

    return response;
}
