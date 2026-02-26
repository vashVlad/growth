import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profile")
    .select("identity_statement, onboarding_complete")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  const ready =
    Boolean(profile?.onboarding_complete) &&
    Boolean(profile?.identity_statement?.trim());

  if (!ready) redirect("/onboarding");

  redirect("/home");
}