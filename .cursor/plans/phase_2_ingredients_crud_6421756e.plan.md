---
name: Phase 2 Ingredients CRUD
overview: "Phase 2 from Master Plan.md — ingredients CRUD as Kyle’s first real feature: deliberately simple wiring (server actions + forms), minimal validation so breakage is visible, bar-flavored UI and teaching comments, then Phase 2.5 hardening after a guided chaos session."
todos:
  - id: actions
    content: Add ingredients/actions.ts — server actions with FormData parsing (no Zod), revalidatePath, lightweight teaching comments at top and above key APIs
    status: completed
  - id: ingredients-page
    content: Add ingredients/page.tsx — Kyle-facing header, two stacked Cards with breathing room, bar placeholders/select/empty state; create + delete via form action + hidden fields (no useTransition/useActionState); teaching comments for server vs client where introduced
    status: completed
  - id: home-link
    content: Add “Add an ingredient” Button+Link on src/app/page.tsx to /ingredients
    status: completed
  - id: verify
    content: Manual pass — dev server CRUD + Prisma Studio; then Kyle adds real + chaos ingredients before Phase 2.5
    status: completed
isProject: false
---

# Phase 2: Ingredients CRUD (revised for teaching)

## Audience and intent

This is the **first feature Kyle** (bar manager, new to software) will use. The code should read as **teaching material**, not senior-dev scratch notes:

- **Bar domain, not generic CRUD** — copy and controls should feel like something he’d actually use behind the bar.
- **Deliberately minimal validation in Phase 2** — see “Validation strategy” below; the goal is visible failure modes before guardrails.
- **Simplest working wiring** — optimize for readability and “Kyle can break this,” not elegance.
- **Light teaching comments** — roughly **one short comment per unfamiliar concept** (server actions, `revalidatePath`, `"use client"` when it first appears). Friendly tone; do not comment every line.

After Phase 2 ships, **you** add normal ingredients, then “chaos” rows (long names, huge costs, etc.) so Kyle *sees* why validation and data integrity matter — **Phase 2.5** adds Zod and limits once that lesson lands.

---

## Context

- **Model** ([prisma/schema.prisma](c:\Users\ryanm\dev\web-app-template\prisma\schema.prisma)): `Ingredient` has `name`, `unit`, `costPerUnit` (Float), plus `id` and timestamps. **No new migration** — already migrated.
- **DB** ([src/lib/db.ts](c:\Users\ryanm\dev\web-app-template\src\lib\db.ts)): `import { prisma } from "@/lib/db"`; Prisma 6 patterns only.
- **UI building blocks** ([src/app/ui-check/page.tsx](c:\Users\ryanm\dev\web-app-template\src\app\ui-check\page.tsx)): reuse shadcn `Button`, `Card`, `Input`, `Label`, etc. Phase 2 does **not** require mirroring the full react-hook-form + Zod stack from `ui-check` if a **native `<form action={…}>`** with `FormData` on the server is simpler — prefer whichever stays readable with **no** `useTransition` / `useActionState`.

---

## Validation strategy (important)

| Phase | Validation |
|-------|-------------|
| **Phase 2** | **No Zod**, no server-side validation rules beyond whatever falls out of naive parsing (e.g. read strings from `FormData`, coerce cost with `Number(...)`, accept what SQLite/Prisma accept). Use basic HTML hints only (`type="number"`, `step`, `required` where it helps UX). Intentionally allow silly data so Kyle can trigger weird UI/DB behavior with your guided chaos examples. |
| **Phase 2.5** | Add Zod (or similar), max length on `name`, sane bounds on `cost`, better error messages, optional delete confirmation (e.g. AlertDialog), git “commit before chaos” / rollback lesson, optional basic error surfacing — **after** Kyle has seen the breakage. |

---

## 1. Server actions — [`src/app/ingredients/actions.ts`](c:\Users\ryanm\dev\web-app-template\src\app\ingredients\actions.ts)

- File-level `"use server"`.
- **Teaching comment at top** — e.g. these functions run on the server but can be invoked from the browser via forms; that’s how the page talks to the database without a separate API route.
- **`listIngredients`** — `findMany`, `orderBy: { createdAt: "desc" } }`; called from the server `page.tsx`.
- **`createIngredient`** — signature should accept **`FormData`** (form `action={createIngredient}`). Parse `name`, `unit`, `costPerUnit` plainly; `create`; then **`revalidatePath("/ingredients")`**.
- **`deleteIngredient`** — same story: **`FormData`** with a **hidden `id`** field, delete by id, `revalidatePath("/ingredients")`.

**Teaching comment above `revalidatePath`** — one line: after a mutation, Next needs to know this route’s data changed so the list refreshes.

**Delete pattern (fixed):** always **`<form action={deleteIngredient}>`** + **`<input type="hidden" name="id" value={…} />`** + submit button — **no** `useTransition`, **no** `useActionState` for Phase 2.

Same preferred pattern for **create** (`action={createIngredient}`) so Kyle sees one consistent model: **forms post to server functions**.

---

## 2. `/ingredients` page — [`src/app/ingredients/page.tsx`](c:\Users\ryanm\dev\web-app-template\src\app\ingredients\page.tsx)

- **Server Component by default** — `await listIngredients()` for the list.
- **“What you’re looking at” header** (Kyle-sized copy) — e.g. this is his ingredient list; anything he adds is stored in the **local** database and persists across refresh (plain language, one short paragraph max).
- **Layout** — **two cards stacked vertically** (form card, then list card) with **generous spacing** (`gap`, padding). Not a cramped side-by-side layout.
- **Form card (bar-flavored)**  
  - **Name** — placeholder: `e.g., Bombay Sapphire Gin`  
  - **Unit** — `<select>` with options at least: **oz**, **ml**, **bottle**, **each**, **dash**  
  - **Cost per unit** — placeholder like **`0.45`**; optional one-line helper text: why tracking cost per unit matters for pricing (one sentence, bar-framed).  
  - Submit via **`action={createIngredient}`** as above.
- **List card**  
  - Each row: show name, unit, formatted cost; **delete** = nested **`form` + hidden id + submit** (or `button formaction` if you prefer one form — either stays beginner-readable).  
  - **Empty state** when there are no rows: e.g. **“No ingredients yet. Add one above — try something you actually use, like a gin or a bitter.”**  
  - **Phase 2:** skip fancy delete confirmation (optional **`window.confirm`** only if you introduce a tiny client boundary — not required; Phase 2.5 can add a proper dialog).

Use **`Ingredient`** from `@prisma/client` for typing list rows where helpful.

**`"use client"`** — avoid pulling it in unless a component truly needs browser-only behavior; if you add it once, **one comment**: this file runs in the browser because … (e.g. interactive-only piece). Prefer staying server-first.

---

## 3. Welcome page — [`src/app/page.tsx`](c:\Users\ryanm\dev\web-app-template\src\app\page.tsx)

- Prominent **“Add an ingredient”** — `Button` + Next `Link` (`asChild`) → `/ingredients`.
- Minimal other edits (Phase 3 replaces this page).

---

## 4. Teaching comments (where to put them)

Aim for **short, friendly, one per concept** — examples:

| Location | Example gist |
|----------|----------------|
| Top of `actions.ts` | What server actions are and why this file exists. |
| Above `revalidatePath` | Tell Next the ingredients page data changed. |
| First `"use client"` file (if any) | Browser-only vs server components in one sentence. |

Do **not** annotate every line.

---

## 5. Done criteria (manual)

- Dev server: add ingredient → appears in list; delete → row gone.
- **`npx prisma studio`** — rows match UI.
- **Your follow-up (not automated):** add realistic ingredients, then chaos rows (long names, absurd costs) **before** Phase 2.5 so the validation lesson has teeth.

**Defer:** stack/data-flow diagram — optional artifact **after** Phase 2 CRUD feels solid (e.g. for Kyle’s notes); not required to ship Phase 2.

---

## Phase 2.5 (follow-on — not implemented in this pass)

After the guided chaos session:

- Server-side validation (Zod), **max length** on `name`, **reasonable bounds** on `cost`.
- Clear user-visible errors for rejected input.
- Stronger delete UX (confirm / AlertDialog).
- Tie-in: **git** — commit before experimenting, read diff, rollback.
- Optional: log/surface errors for observability.

This phase turns the same CRUD feature into the substrate for validation, edge cases, and discipline — without building new screens.
