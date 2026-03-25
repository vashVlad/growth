"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/nav/BottomNav";

function TopLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-full px-3 py-1.5 text-sm transition",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const onHome = pathname === "/home" || pathname?.startsWith("/home/");
  const onProgress = pathname === "/progress" || pathname?.startsWith("/progress/");

  return (
    <div className="min-h-screen bg-background">
      {/* Calm sticky top bar */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-5">
          <Link
            href="/home"
            className="font-serif text-lg tracking-tight text-foreground hover:opacity-80 transition"
          >
            Growth
          </Link>

          <nav className="flex items-center gap-2">
            {!onHome ? <TopLink href="/home" label="Home" /> : null}
            <TopLink href="/progress" label="Progress" active={onProgress} />
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:py-10">{children}</div>
      <BottomNav />
    </div>
  );
}