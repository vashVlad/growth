"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function completeGoal(goalId: string): Promise<ActionResult> {
  try {
    const supabase = await supabaseServer();
    const { data: authData, error: authErr } = await supabase.auth.getUser();

    if (authErr || !authData.user) return { ok: false, error: "Not authenticated." };
    const userId = authData.user.id;

    if (!goalId?.trim()) return { ok: false, error: "Missing goal id." };

    const { data: updated, error: uErr } = await supabase
      .from("goals")
      .update({ status: "completed" })
      .eq("id", goalId)
      .eq("user_id", userId)
      .select("id, status")
      .maybeSingle();

    if (uErr) return { ok: false, error: `Failed to complete goal: ${uErr.message}` };
    if (!updated) {
      return {
        ok: false,
        error: "Complete affected 0 rows. Check RLS UPDATE policy and goal ownership.",
      };
    }

    revalidatePath("/home");
    revalidatePath("/progress");

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Something went wrong." };
  }
}