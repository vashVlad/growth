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
      <div className="mx-auto w-full max-w-2xl px-5 pt-10 pb-28 space-y-12">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Identity
            </p>

            <h1 className="mt-3 font-serif text-4xl leading-tight text-foreground">
              Becoming
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Your current direction.
            </p>
          </div>

          <Link
            href="/identity/adjust"
            className="text-xs text-muted-foreground hover:text-foreground transition"
          >
            Edit
          </Link>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-8">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground/80">
              Identity statement
            </div>

            <p className="mt-3 max-w-prose text-[1.05rem] leading-relaxed text-foreground">              
              {statement}
            </p>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground/80">
              Behaviors
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              {behaviors}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
