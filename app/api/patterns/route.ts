import { NextResponse } from "next/server";
import { getUserPatterns } from "@/lib/patterns/getUserPatterns.server";

export async function GET() {
  try {
    const patterns = await getUserPatterns();
    return NextResponse.json(patterns);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 401 });
  }
}