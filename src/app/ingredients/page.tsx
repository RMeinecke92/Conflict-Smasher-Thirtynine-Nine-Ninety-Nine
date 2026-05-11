import type { Ingredient } from "@prisma/client";
import Link from "next/link";

import { createIngredient, deleteIngredient, listIngredients } from "./actions";

// This route reads from the database on each visit — tell Next.js not to bake it into a static snapshot at build time.
export const dynamic = "force-dynamic";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const selectClassName = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "md:text-sm dark:bg-input/30"
);

function formatCost(costPerUnit: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 4,
  }).format(costPerUnit);
}

function IngredientRow({ ingredient }: { ingredient: Ingredient }) {
  return (
    <li className="flex flex-col gap-3 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="truncate font-medium">{ingredient.name}</p>
        <p className="text-sm text-muted-foreground">
          {ingredient.unit} · {formatCost(ingredient.costPerUnit)} per unit
        </p>
      </div>
      <form action={deleteIngredient} className="shrink-0">
        <input type="hidden" name="id" value={ingredient.id} />
        <Button type="submit" variant="destructive" size="sm">
          Delete
        </Button>
      </form>
    </li>
  );
}

export default async function IngredientsPage() {
  const ingredients = await listIngredients();

  return (
    <div className="min-h-screen bg-background px-4 py-12 md:px-8">
      <div className="mx-auto flex max-w-lg flex-col gap-10">
        <header className="space-y-4">
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="font-medium text-foreground underline-offset-4 hover:underline">
              Home
            </Link>
          </p>
          <div className="space-y-2">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Ingredients
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This is your ingredient list for the template app. Anything you add here is saved in your{" "}
              <span className="text-foreground">local database</span> on this computer—it sticks around
              even if you close the browser or restart the dev server.
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Add an ingredient</CardTitle>
              <CardDescription>
                Tracking cost per unit helps you compare bottles and price drinks—start with what you
                actually pour.
              </CardDescription>
            </CardHeader>
            <form action={createIngredient}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="ingredient-name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="ingredient-name"
                    name="name"
                    placeholder="e.g., Bombay Sapphire Gin"
                    required
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="ingredient-unit" className="text-sm font-medium">
                    Unit
                  </label>
                  <select
                    id="ingredient-unit"
                    name="unit"
                    className={selectClassName}
                    defaultValue="oz"
                  >
                    <option value="oz">oz</option>
                    <option value="ml">ml</option>
                    <option value="bottle">bottle</option>
                    <option value="each">each</option>
                    <option value="dash">dash</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="ingredient-cost" className="text-sm font-medium">
                    Cost per unit (USD)
                  </label>
                  <Input
                    id="ingredient-cost"
                    name="costPerUnit"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    placeholder="0.45"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-start">
                <Button type="submit">Save ingredient</Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your list</CardTitle>
              <CardDescription>
                Everything below is loaded from the database when this page opens.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ingredients.length === 0 ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  No ingredients yet. Add one above — try something you actually use, like a gin or a
                  bitter.
                </p>
              ) : (
                <ul className="list-none p-0">
                  {ingredients.map((ingredient) => (
                    <IngredientRow key={ingredient.id} ingredient={ingredient} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
