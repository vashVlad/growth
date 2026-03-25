"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/home", label: "Home" },
  { href: "/progress", label: "Progress" },
  { href: "/identity", label: "Self" }
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border/40 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-2xl justify-around px-6 py-4 text-base">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-xl transition ${
                active
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}