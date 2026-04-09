import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import AppShell from "@/components/nav/AppShell";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await supabaseServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user ?? null;

  if (!user) redirect("/login");

  const { data: profile, error: profileErr } = await supabase
    .from("profile")
    .select("onboarding_complete, identity_statement")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileErr) redirect("/onboarding");

  const hasIdentity = Boolean(profile?.identity_statement?.trim());
  const onboardingComplete = Boolean(profile?.onboarding_complete);
  const ready = hasIdentity && onboardingComplete;

  if (!ready) redirect("/onboarding");

  return <AppShell>{children}</AppShell>;
}