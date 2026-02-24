import { NextResponse } from "next/server";
import { validateAll } from "@/features/onboarding/schema";
import { supabaseRoute } from "@/lib/supabase/route";

export async function POST(req: Request) {
  const supabase = await supabaseRoute();
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const state = {
    identityStatement: body.identity_statement ?? "",
    identityBehaviors: body.identity_behaviors ?? "",
    goals: {
      career: {
        title: body.goals?.career?.title ?? "",
        milestone: body.goals?.career?.milestone ?? "",
        nextAction: body.goals?.career?.next_action ?? "",
      },
      personal: {
        title: body.goals?.personal?.title ?? "",
        milestone: body.goals?.personal?.milestone ?? "",
        nextAction: body.goals?.personal?.next_action ?? "",
      },
      internal: {
        title: body.goals?.internal?.title ?? "",
        milestone: body.goals?.internal?.milestone ?? "",
        nextAction: body.goals?.internal?.next_action ?? "",
      },
    },
  };

  const err = validateAll(state as any);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  // ✅ Step 8: verify current onboarding state (idempotent)
  const { data: existing, error: existingErr } = await supabase
    .from("profile")
    .select("onboarding_complete, identity_statement")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (existingErr) {
    console.error("[ONBOARDING_VERIFY_FAIL]", {
      message: existingErr.message,
      code: (existingErr as any).code,
      details: (existingErr as any).details,
      hint: (existingErr as any).hint,
      user_id: auth.user.id,
    });

    return NextResponse.json(
      { error: "Couldn’t verify onboarding state. Please try again." },
      { status: 500 }
    );
  }

  const alreadyCompleted =
    Boolean(existing?.onboarding_complete) &&
    Boolean(existing?.identity_statement?.trim());

  if (alreadyCompleted) {
    // Return OK (not an error) so client can safely redirect without showing scary messages.
    return NextResponse.json({ ok: true, already_completed: true }, { status: 200 });
  }

  // ✅ Complete onboarding via RPC
  const { error: rpcError } = await supabase.rpc("complete_onboarding", {
    p_user_id: auth.user.id,
    p_identity_statement: state.identityStatement,
    p_identity_behaviors: state.identityBehaviors,

    p_career_title: state.goals.career.title,
    p_career_milestone: state.goals.career.milestone,
    p_career_next_action: state.goals.career.nextAction,

    p_personal_title: state.goals.personal.title,
    p_personal_milestone: state.goals.personal.milestone,
    p_personal_next_action: state.goals.personal.nextAction,

    p_internal_title: state.goals.internal.title,
    p_internal_milestone: state.goals.internal.milestone,
    p_internal_next_action: state.goals.internal.nextAction,
  });

  if (rpcError) {
    console.error("[ONBOARDING_RPC_FAIL]", {
      message: rpcError.message,
      code: (rpcError as any).code,
      details: (rpcError as any).details,
      hint: (rpcError as any).hint,
      user_id: auth.user.id,
    });

    return NextResponse.json(
      { error: "Couldn’t complete onboarding right now. Please try again." },
      { status: 500 }
    );
  }

  // ✅ Step 8 hardening backup:
  // Even if the RPC forgot to set onboarding_complete, ensure the flag is true.
  const { error: flagErr } = await supabase
    .from("profile")
    .update({ onboarding_complete: true })
    .eq("user_id", auth.user.id);

  if (flagErr) {
    console.error("[ONBOARDING_FLAG_FAIL]", {
      message: flagErr.message,
      code: (flagErr as any).code,
      details: (flagErr as any).details,
      hint: (flagErr as any).hint,
      user_id: auth.user.id,
    });

    return NextResponse.json(
      { error: "Saved, but couldn’t finalize onboarding. Please refresh." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
