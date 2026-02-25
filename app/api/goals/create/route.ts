import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

type Pillar = "career" | "personal" | "internal";

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const pillar = body?.pillar as Pillar | undefined;
  const title = String(body?.title ?? "").trim();
  const milestone = String(body?.milestone ?? "").trim();
  const next_action = String(body?.next_action ?? "").trim();

  if (!pillar || !["career", "personal", "internal"].includes(pillar)) {
    return NextResponse.json({ error: "Invalid pillar." }, { status: 400 });
  }
  if (!title || !milestone || !next_action) {
    return NextResponse.json({ error: "Please complete all fields." }, { status: 400 });
  }

  // Friendly check before insert (DB unique index is still the real guard)
  const { data: existing } = await supabase
    .from("goals")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .eq("pillar", pillar)
    .maybeSingle();

  if (existing?.id) {
    return NextResponse.json(
      { error: `You already have an active ${pillar} goal. Choose a different pillar.` },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    pillar,
    title,
    milestone,
    next_action,
    status: "active",
  });

  if (error) {
    // If the DB unique index triggers, Supabase will return an error here.
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}