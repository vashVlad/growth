import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import OnboardingFlow from "@/features/onboarding/components/onboarding-flow";

export const metadata: Metadata = {
  title: "Get Started - Growth",
  description: "Set your identity and 90-day goals to begin your Growth cycle.",
};

export default async function OnboardingPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) redirect("/login");

  const { data: profile, error: profileErr } = await supabase
    .from("profile")
    .select("onboarding_complete, identity_statement")
    .eq("user_id", user.id)
    .maybeSingle();

  // If profile query fails, just stay on onboarding
  // (fail safe, don’t redirect-loop)
  if (profileErr) {
    return <OnboardingFlow />;
  }

  const ready =
    Boolean(profile?.onboarding_complete) &&
    Boolean(profile?.identity_statement?.trim());

  if (ready) redirect("/home");

  return <OnboardingFlow />;
}
