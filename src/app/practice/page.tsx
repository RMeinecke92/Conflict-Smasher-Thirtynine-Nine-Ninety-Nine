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
  title: "Practice — Master Stroke",
  description: "Drill weapon strikes against a stand-still dummy in long guard.",
};

export default function PracticePage() {
  return (
    <StickFighterShell
      title="Practice"
      description="The dummy just holds long guard. Drill your reach, timing, and knockdowns with either weapon."
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-lg font-semibold">
            Spar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DuelGame mode="practice" />
        </CardContent>
      </Card>
    </StickFighterShell>
  );
}
