"use client";

import { useCallback, useState } from "react";

import { StickFighterMainMenu } from "@/components/stick-fighter-main-menu";
import { StickFighterTitleScreen } from "@/components/stick-fighter-title-screen";

type HomeStep = "title" | "menu";

export function StickFighterHome() {
  const [step, setStep] = useState<HomeStep>("title");

  const showMenu = useCallback(() => {
    setStep("menu");
  }, []);

  if (step === "title") {
    return <StickFighterTitleScreen onContinue={showMenu} />;
  }

  return <StickFighterMainMenu />;
}
