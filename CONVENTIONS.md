# Project Conventions

This file explains the patterns this template uses and why they exist.

The short version: keep the stack boring, keep related files close together, and make every new feature easy for Kyle to read.

## App Structure

Routes live in `src/app/`.

For a feature page, use this shape:

```text
src/app/<feature>/page.tsx
src/app/<feature>/actions.ts
```

Example:

```text
src/app/ingredients/page.tsx
src/app/ingredients/actions.ts
```

The page owns what the user sees. The actions file owns the server-side work for that page, like creating, listing, and deleting records.

Keeping them next to each other makes the feature easier to inspect. Kyle should be able to open one folder and see the whole flow.

## Server Actions

Use server actions for mutations.

That means a form usually looks like this:

```tsx
<form action={createIngredient}>
  {/* inputs */}
</form>
```

The matching action lives in `actions.ts` and starts with `"use server"`.

This template prefers server actions over API routes because the mental model is simpler: the form submits, the server function runs, the database changes, and the page refreshes.

## Prisma And The Database

Use Prisma 6 with the standard import path:

```ts
import { PrismaClient } from "@prisma/client";
```

Do not import Prisma client code from `@/generated/prisma`.

Do not pass `datasourceUrl` to `new PrismaClient()`. Prisma reads `DATABASE_URL` from `.env`.

The database is SQLite for now. The connection string is:

```env
DATABASE_URL="file:./dev.db"
```

That creates a local database file at `prisma/dev.db`.

## Database Changes

Change the database in this order:

1. Edit `prisma/schema.prisma`.
2. Run a named migration:

```powershell
npx prisma migrate dev --name describe_the_change
```

3. Verify the app still works.
4. Optionally inspect the data with:

```powershell
npx prisma studio
```

Do not use raw SQL for schema changes.

Do not use `prisma db push`.

Migrations are part of the teaching material. They show how the database changed over time and make the project safer to move between machines.

## Styling

Use Tailwind classes.

Do not add component CSS files or inline styles for normal UI work.

Use shadcn/ui components from `src/components/ui/`. If a missing shadcn component is needed, add it with:

```powershell
npx shadcn@latest add <component>
```

## Types

Prefer generated Prisma types when they already describe the data.

Example:

```ts
import type { Ingredient } from "@prisma/client";
```

Do not redefine model shapes by hand unless the code truly needs a different view of the data.

## Comments

Use comments as teaching notes, not decoration.

A good comment explains why an unfamiliar pattern exists:

```ts
// Tell Next.js this route's data changed so the list reloads with fresh values.
revalidatePath("/ingredients");
```

A weak comment repeats the code:

```ts
// Create an ingredient.
await prisma.ingredient.create(...)
```

## Local-First Assumptions

This project is meant to run on a local machine first.

Do not add Docker, cloud database setup, Kubernetes, deployment platforms, or production credential work unless Ryan explicitly changes the plan.

The boring target is:

```powershell
npm install
npx prisma migrate dev
npm run dev
```

Then open `http://localhost:3000`.
