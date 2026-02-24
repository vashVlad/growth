import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profile")
    .select("identity_statement")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!profile?.identity_statement) redirect("/onboarding");

  // Minimal skeleton (no dashboards)
  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto max-w-lg px-4 py-10 space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Home skeleton. Protected. Identity present.
        </p>
      </div>
    </main>
  );
}
