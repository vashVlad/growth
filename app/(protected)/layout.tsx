// app/(protected)/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  // Not signed in → login
  if (userErr || !user) redirect("/login");

  // IMPORTANT: your table is "profile" (singular), not "profiles"
  const { data: profile, error: profileErr } = await supabase
    .from("profile")
    .select("onboarding_complete, identity_statement")
    .eq("user_id", user.id)
    .maybeSingle();

  // Fail closed into onboarding (calm + safe)
  if (profileErr) redirect("/onboarding");

  const hasIdentity = Boolean(profile?.identity_statement?.trim());
  const onboardingComplete = Boolean(profile?.onboarding_complete);
  const ready = hasIdentity && onboardingComplete;

  // Not complete → onboarding
  if (!ready) redirect("/onboarding");

  return <>{children}</>;
}
