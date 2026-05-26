import type { Metadata } from "next";
import Link from "next/link";

import { StickFighterShell } from "@/components/stick-fighter-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Multiplayer — Conflict Smasher",
  description: "Online multiplayer — coming soon.",
};

export default function MultiplayerPage() {
  return (
    <StickFighterShell
      title="Multiplayer"
      description="Online play is planned for a future update."
    >
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-semibold">
            Coming soon
          </CardTitle>
          <CardDescription>
            Online matchmaking with auth and HTTP polling is on the roadmap.
            Local two-player already works — use Practice or Vs and toggle
            Player 2 to Human.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/">Back to menu</Link>
          </Button>
        </CardContent>
      </Card>
    </StickFighterShell>
  );
}
