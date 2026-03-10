import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import GoalAdjustForm from "@/components/adjust/GoalAdjustForm";
import { BackButton } from "@/components/nav/BackButton";

export default async function GoalAdjustPage({
  params,
}: {
  params: Promise<{ goalId?: string }>;
}) {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  // ✅ IMPORTANT: unwrap params (Next requires this in your version)
  const { goalId } = await params;

  if (!goalId) {
    return (
      <main className="min-h-screen bg-background">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
        <div className="mb-6">
          <BackButton fallbackHref="/home" />
        </div>
            Adjust goal
        </div>
      </main>
    );
  }

  const { data: goal, error } = await supabase
    .from("goals")
    .select("id, title, milestone, next_action, user_id")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-3xl px-5 py-10 space-y-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Adjust goal
          </div>
          <div className="text-sm text-red-600">DB error: {error.message}</div>
          <div className="text-xs text-muted-foreground">goalId: {goalId}</div>
          <Link className="text-sm underline" href="/home">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  if (!goal) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-3xl px-5 py-10 space-y-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Adjust goal
          </div>
          <div className="text-sm text-red-600">Goal not found (or not owned).</div>
          <div className="text-xs text-muted-foreground">goalId: {goalId}</div>
          <div className="text-xs text-muted-foreground">userId: {user.id}</div>
          <Link className="text-sm underline" href="/home">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl px-5 py-10 space-y-8">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Adjust goal
            </div>
        <GoalAdjustForm goal={goal} />
      </div>
    </main>
  );
}
