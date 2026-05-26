import type { Metadata } from "next";

import { StickFighterHome } from "@/components/stick-fighter-home";

export const metadata: Metadata = {
  title: "Conflict Smasher Thirtynine Nine Ninetynine",
  description:
    "Stick-fighting arcade game — Vs CPU, practice mode, and multiplayer.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <StickFighterHome />
    </div>
  );
}
