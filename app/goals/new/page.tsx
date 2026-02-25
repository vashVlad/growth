import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import NewGoalForm from "@/components/goals/NewGoalForm";

type Pillar = "career" | "personal" | "internal";
const PILLARS: Pillar[] = ["career", "personal", "internal"];

export default async function NewGoalPage({
  searchParams,
}: {
  searchParams: Promise<{ pillar?: string }>;
}) {
  const sp = await searchParams;
  const requested = sp.pillar as Pillar | undefined;

  const supabase = await supabaseServer();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const { data: goals } = await supabase
    .from("goals")
    .select("pillar")
    .eq("user_id", user.id)
    .eq("status", "active");

  const active = new Set<Pillar>((goals ?? []).map((g: any) => g.pillar));
  const missing = PILLARS.filter((p) => !active.has(p));
  const defaultPillar: Pillar =
    (requested && !active.has(requested) ? requested : undefined) ??
    (missing[0] ?? "career");

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Create goal
            </div>

            <Link
                href="/home"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                ← Back
            </Link>
        </div>

        <div className="mt-10 max-w-[60ch]">
          <div className="font-serif text-3xl leading-snug text-foreground">
            Add a new goal.
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            One active goal per pillar. Keep it simple and specific.
          </div>
        </div>

        <div className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
          <NewGoalForm defaultPillar={defaultPillar} activePillars={[...active]} />
        </div>
      </div>
    </main>
  );
}