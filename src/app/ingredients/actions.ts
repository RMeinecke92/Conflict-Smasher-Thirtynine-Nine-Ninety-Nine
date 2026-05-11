"use server";

// Server actions are functions that run on the server but can be triggered from the browser
// (for example by a form's `action`). They let this page save to the database without building a separate API.

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";

export async function listIngredients() {
  return prisma.ingredient.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createIngredient(formData: FormData) {
  // FormData values arrive as loose browser data, so this action turns them into the types Prisma expects.
  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const costPerUnit = Number(formData.get("costPerUnit"));

  await prisma.ingredient.create({
    data: {
      name,
      unit,
      costPerUnit,
    },
  });

  // Tell Next.js this route's data changed so the ingredients list reloads with fresh values.
  revalidatePath("/ingredients");
}

export async function deleteIngredient(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) {
    return;
  }

  await prisma.ingredient.deleteMany({
    where: { id },
  });

  revalidatePath("/ingredients");
}
