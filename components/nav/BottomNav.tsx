"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, User } from "lucide-react";

const items = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/progress", label: "Progress", icon: BarChart2 },
  { href: "/identity", label: "Self", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="sticky bottom-0 left-0 right-0 border-t border-border/40 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-2xl justify-around px-6 py-3">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 text-xs"
            >
              <div
                className={`transition-all duration-200 ${
                  active
                    ? "text-foreground scale-105"
                    : "text-muted-foreground"
                }`}
              >
                <Icon size={18} />
              </div>

              <span
                className={`transition ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>

              {/* subtle active indicator */}
              <div
                className={`h-[2px] w-4 rounded-full transition-all duration-200 ${
                  active ? "bg-foreground opacity-100" : "opacity-0"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}