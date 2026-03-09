import { createServerClient } from "@/utils/supabase/server";

export async function getServerAuthContext() {
    const supabase = await createServerClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    return {
        supabase,
        user: error ? null : user,
    };
}

export async function requireServerUser() {
    const { supabase, user } = await getServerAuthContext();

    if (!user) {
        throw new Error("Authentication required");
    }

    return {
        supabase,
        user,
    };
}
