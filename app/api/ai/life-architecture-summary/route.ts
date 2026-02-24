import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { generateLifeArchitectureSummary } from "@/lib/ai/lifeArchitectureSummary.server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json(
      { error: "Unauthorized", content: "Please sign in to view your insight." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const content = await generateLifeArchitectureSummary(data.user.id);

  return NextResponse.json(
    { content },
    { headers: { "Cache-Control": "no-store" } }
  );
}