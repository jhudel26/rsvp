import { createClient } from "@/lib/supabase/server";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function requireUser() {
  const { supabase, user } = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return { supabase, user };
}

export async function logActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  payload: { user_id?: string | null; event_id?: string | null; action: string; detail?: string }
) {
  await supabase.from("activity_logs").insert({
    user_id: payload.user_id ?? null,
    event_id: payload.event_id ?? null,
    action: payload.action,
    detail: payload.detail ?? null,
  } as any);
}
