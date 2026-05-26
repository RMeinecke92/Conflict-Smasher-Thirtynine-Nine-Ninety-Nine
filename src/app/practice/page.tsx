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
  title: "Practice — Conflict Smasher",
  description: "Free spar against a stand-still training dummy.",
};

export default function PracticePage() {
  return (
    <StickFighterShell
      title="Practice"
      description="Free spar — dummy stands still. Toggle P2 to Human for couch play."
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-lg font-semibold">
            Spar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StickFighterGame mode="practice" />
        </CardContent>
      </Card>
    </StickFighterShell>
  );
}
