"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

function NavItem({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Button
        asChild
        variant="ghost"
        className={`h-9 rounded-xl px-3 ${
            active ? "text-foreground font-medium" : "text-muted-foreground"
        }`}
        >
        <Link href={href}>{label}</Link>
    </Button>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-background/70 backdrop-blur-sm md:border-b md:border-border/50">
        <div className="mx-auto w-full max-w-3xl px-5 py-4 flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Growth
          </div>

          <div className="hidden md:flex items-center gap-2">
            <NavItem href="/home" label="Home" />
            <NavItem href="/progress" label="Progress" />
            <Button asChild variant="ghost" className="h-9 rounded-xl px-3 text-muted-foreground hover:text-foreground">
                <Link href="/identity">Becoming</Link>
            </Button>
            </div>
        </div>
      </div>

      {/* Page content */}
      <div className="pb-24 md:pb-10">{children}</div>

      {/* Mobile bottom nav */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 backdrop-blur md:hidden">
        <div className="mx-auto w-full max-w-3xl px-4 py-2 flex items-center justify-between gap-2">
          <NavItem href="/home" label="Home" />
          <NavItem href="/progress" label="Progress" />
          <NavItem href="/identity" label="Identity" />
          <Button asChild className="h-9 rounded-xl px-3">
            <Link href="/goals/new">Create</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}