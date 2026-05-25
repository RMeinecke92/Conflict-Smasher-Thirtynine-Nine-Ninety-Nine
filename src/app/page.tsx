import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StickFighterGame } from "@/components/stick-fighter-game";

export const metadata: Metadata = {
  title: "Stick fighter",
  description: "Two-player stick figure fighting minigame in the browser.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <header className="mb-8">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Stick fighter
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Local stick-fighting minigame — play solo vs CPU or two-player on
            one keyboard. Click the game area if keys don&apos;t respond.
          </p>
        </header>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-lg font-semibold">
              Round 1
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StickFighterGame />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
