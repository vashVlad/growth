// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

async function signOutAndRedirect(request: Request) {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();

  // Redirect relative to the current request origin
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}

// Link-friendly
export async function GET(request: Request) {
  return signOutAndRedirect(request);
}

// Fetch/action-friendly
export async function POST(request: Request) {
  return signOutAndRedirect(request);
}