import type { Metadata } from "next";

import { StickFighterShell } from "@/components/stick-fighter-shell";
import { DuelGame } from "@/components/duel-game";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Duel — Master Stroke",
  description: "Physics weapon duel — Longsword vs Pole Hammer, two players or vs CPU.",
};

export default function VsPage() {
  return (
    <StickFighterShell
      title="Duel"
      description="Physics weapon fight. Pick weapons, then move and strike — clean hits knock the opponent down. Click the arena if keys don't respond."
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-lg font-semibold">
            Arena
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DuelGame mode="vs" />
        </CardContent>
      </Card>
    </StickFighterShell>
  );
}
