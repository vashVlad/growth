import Link from "next/link";
import { redirect } from "next/navigation";

import { supabaseServer } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function IdentityPage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profile")
    .select("identity_statement, identity_behaviors")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error("Failed to load identity.");

  const statement = profile?.identity_statement?.trim() || "—";
  const behaviors = profile?.identity_behaviors?.trim() || "—";

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl px-5 py-10">
        {/* IDENTITY label + Adjust */}
        <div className="flex items-center justify-between mb-12">

          <Button asChild variant="ghost" className="h-8 rounded-xl px-2">
            <Link href="/identity/adjust" className="text-sm">
              Adjust
            </Link>
          </Button>
        </div>

        {/* Title */}
        <div className="max-w-[65ch]">
          <div className="font-serif text-3xl leading-snug text-foreground">
            Becoming
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Your current direction.
          </div>
        </div>

        {/* Content */}
        <section className="mt-10 space-y-10 max-w-[65ch]">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Identity statement
            </div>
            <div className="mt-3 font-serif text-2xl leading-relaxed text-foreground">
              {statement}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Behaviors
            </div>
            <div className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
              {behaviors}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
