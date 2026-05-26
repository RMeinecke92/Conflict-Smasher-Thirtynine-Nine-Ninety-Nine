import type { Metadata } from "next";

import { StickFighterShell } from "@/components/stick-fighter-shell";
import { StickFighterGame } from "@/components/stick-fighter-game";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Vs — Conflict Smasher",
  description: "Best-of-3 stick fighting vs CPU or local two-player.",
};

export default function VsPage() {
  return (
    <StickFighterShell
      title="Vs"
      description="Best-of-3 match vs CPU or a friend on the same keyboard. Click the game area if keys don't respond."
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-lg font-semibold">
            Fight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StickFighterGame mode="vs" />
        </CardContent>
      </Card>
    </StickFighterShell>
  );
}
