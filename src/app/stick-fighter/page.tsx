import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
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

export default function StickFighterPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Stick fighter
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Local two-player minigame — canvas + a tight game loop. Click the
              game area if keys don&apos;t respond.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/">Back to welcome</Link>
          </Button>
        </div>

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
