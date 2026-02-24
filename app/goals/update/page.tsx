import Link from "next/link";
import { redirect } from "next/navigation";

import { supabaseServer } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function GoalUpdatePlaceholderPage({
  searchParams,
}: {
  searchParams: { pillar?: string };
}) {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const pillar = (searchParams.pillar || "").toLowerCase();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-5 py-10">
        <Button asChild variant="ghost" className="h-8 px-2 rounded-xl">
          <Link href="/home" className="text-sm">
            ← Back
          </Link>
        </Button>

        <div className="mt-8 space-y-2">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Update
          </div>
          <div className="text-xl font-medium text-foreground">
            {pillar ? `Pillar: ${pillar}` : "Pillar update"}
          </div>
          <div className="text-sm text-muted-foreground max-w-prose">
            Editing and reflection flows will be implemented next. For now, this
            confirms navigation and keeps Home clean.
          </div>
        </div>
      </div>
    </main>
  );
}
