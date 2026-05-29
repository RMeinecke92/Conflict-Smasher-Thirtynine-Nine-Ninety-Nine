import type { Metadata } from "next";

import { LabShell } from "@/components/lab/lab-shell";
import { PhysicsTestbed } from "@/components/lab/physics-testbed";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Lab — Conflict Smasher",
  description: "Physics ragdoll testbed for the spacing-and-timing fighter experiment.",
};

export default function LabPage() {
  return (
    <LabShell
      title="Physics Lab"
      description="Shot 1 — single stick figure ragdoll. Matter.js testbed; the combo fighter at / is unchanged."
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-lg font-semibold">
            Ragdoll testbed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PhysicsTestbed />
        </CardContent>
      </Card>
    </LabShell>
  );
}
