"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

const MENU_ITEMS = [
  { href: "/vs", label: "Duel", key: "1" },
  { href: "/practice", label: "Practice", key: "2" },
  { href: "/multiplayer", label: "Multiplayer", key: "3" },
] as const;

export function StickFighterMainMenu() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const item = MENU_ITEMS.find((entry) => entry.key === e.key);
      if (!item) return;
      e.preventDefault();
      window.location.assign(item.href);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-4">
      <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
        Select mode
      </h2>
      <nav className="flex w-full max-w-xs flex-col gap-3">
        {MENU_ITEMS.map((item) => (
          <Button key={item.href} asChild size="lg" className="w-full">
            <Link href={item.href}>
              {item.label}
              <span className="ml-2 text-xs text-primary-foreground/70">
                ({item.key})
              </span>
            </Link>
          </Button>
        ))}
      </nav>
    </div>
  );
}
