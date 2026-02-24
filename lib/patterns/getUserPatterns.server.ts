import { supabaseServer } from "@/lib/supabase/server";
import { analyzeUserPatterns } from "./analyzeUserPatterns";

export async function getUserPatterns() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Unauthorized");
  return analyzeUserPatterns(supabase as any, data.user.id);
}