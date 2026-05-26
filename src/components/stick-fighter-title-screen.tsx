"use client";

import { useEffect } from "react";

type StickFighterTitleScreenProps = {
  onContinue: () => void;
};

export function StickFighterTitleScreen({
  onContinue,
}: StickFighterTitleScreenProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Enter" || e.code === "Space") {
        e.preventDefault();
        onContinue();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onContinue]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-4 text-center">
      <h1 className="font-heading max-w-2xl text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
        Conflict Smasher Thirtynine Nine Ninetynine
      </h1>
      <p className="animate-pulse text-sm text-muted-foreground sm:text-base">
        Press Enter or Start
      </p>
    </div>
  );
}
