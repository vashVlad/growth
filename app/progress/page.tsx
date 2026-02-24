import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import GoalHistorySection from "@/features/goals/components/GoalHistorySection";

export default async function ProgressPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Progress</h1>
        <p className="text-sm text-muted-foreground">
          Your goal history.
        </p>
      </div>

      <GoalHistorySection />
    </main>
  );
}
