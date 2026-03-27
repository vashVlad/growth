import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import GoalHistorySection from "@/features/goals/components/GoalHistorySection";
import { LifeArchitectureSummaryButton } from "@/components/ai/LifeArchitectureSummaryButton";
import { Button } from "@/components/ui/button";

export default async function ProgressPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

const { data: plans } = await supabase
  .from("goal_plans")
  .select("goal_id, plan_json, version")
  .eq("user_id", data.user.id)
  .order("version", { ascending: false });
  
return (
  <main className="min-h-screen bg-background">
    <div className="mx-auto w-full max-w-3xl px-5 py-10 space-y-10">
      <div className="max-w-[60ch]">
        <h1 className="font-serif text-4xl leading-snug text-foreground">
          Your goal history.
        </h1>
        <div className="mt-3 text-sm text-muted-foreground">
          Completed goals, with a calm trail of what actually happened.
        </div>
      </div>

      <div className="space-y-6">
        <LifeArchitectureSummaryButton userId={data.user.id} />
        <GoalHistorySection plans={plans ?? []} />
      </div>
    </div>
  </main>
  );
}