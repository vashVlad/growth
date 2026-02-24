import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}
