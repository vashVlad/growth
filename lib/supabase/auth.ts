import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Server helper: get current user or redirect to /login.
 */
export async function requireUser() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");
  return { supabase, user: data.user };
}

/**
 * Lazy profile bootstrap:
 * Ensures every logged-in user has a profile row (nullable identity fields).
 */
export async function ensureProfileRow(userId: string) {
  const supabase = await supabaseServer();

  const existing = await supabase
    .from("profile")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing.data) return;

  // Create an empty profile row (nullable fields)
  await supabase.from("profile").insert({ user_id: userId });
}
