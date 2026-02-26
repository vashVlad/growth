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

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl px-5 py-10 space-y-10">
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="h-8 rounded-xl px-2">
              <Link href="/home" className="text-sm">Home</Link>
            </Button>
          </div>
        </div>

        <div className="max-w-[60ch]">
          <div className="font-serif text-3xl leading-snug text-foreground">
            Your goal history.
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Completed goals, with a calm trail of what actually happened.
          </div>
        </div>

        <div className="space-y-6">
          <LifeArchitectureSummaryButton userId={data.user.id} />
          <GoalHistorySection />
        </div>
      </div>
    </main>
  );
}