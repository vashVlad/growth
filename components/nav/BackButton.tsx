"use client";

import { useRouter } from "next/navigation";

export function BackButton({ fallbackHref = "/home" }: { fallbackHref?: string }) {
  const router = useRouter();

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition"
      aria-label="Go back"
    >
      <span className="text-base leading-none">‹</span>
      <span>Back</span>
    </button>
  );
}