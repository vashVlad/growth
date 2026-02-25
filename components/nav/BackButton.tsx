"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BackButton({ fallbackHref = "/home" }: { fallbackHref?: string }) {
  const router = useRouter();

  function goBack() {
    // If there's history, go back; otherwise go to fallback
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push(fallbackHref);
  }

  return (
    <Button variant="ghost" className="h-8 rounded-xl px-2" onClick={goBack}>
      ← Back
    </Button>
  );
}