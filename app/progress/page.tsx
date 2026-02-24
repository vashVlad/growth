import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import GoalHistorySection from "@/features/goals/components/GoalHistorySection";
import { LifeArchitectureSummaryButton } from "@/components/ai/LifeArchitectureSummaryButton";

export default async function ProgressPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="mx-auto w-full max-w-3xl px-5 py-10">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Progress
          </div>
        </div>

        <div className="mt-10 max-w-[60ch]">
          <div className="font-serif text-3xl leading-snug text-foreground">
            Your goal history.
          </div>

          <div className="mt-3 text-sm text-muted-foreground">
            Completed goals, with a calm trail of what actually happened.
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <LifeArchitectureSummaryButton userId={data.user.id} />
      </div>

      <GoalHistorySection />
    </main>
  );
}