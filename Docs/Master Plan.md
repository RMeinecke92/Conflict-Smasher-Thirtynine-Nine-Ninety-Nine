# Web App Template: End-to-End Build Plan

---

## Why This Document Exists

This template is being built as a **launchpad for Kyle**, my brother. He's a bar manager at a big restaurant who has no software engineering background but wants to build real tools for his job — starting with a bar inventory and cocktail cost-modeling app.

The bar app itself is not the deliverable. **The deliverable is Kyle's ability to keep building things after this one.** The template is the substrate; the goal is software literacy.

This document is also the source of truth for any AI agent working on this project. **Before doing anything, read this file in full.** It encodes the audience, the constraints, the stack lock-ins, and the design philosophy. Skipping it will produce technically-correct work that misses the point.

---

## Who This Is For (Read This First If You're an Agent)

**Kyle:**

- Bar manager, currently learning software development from scratch
- Smart, capable, fast learner — but his vocabulary is still building
- Doesn't yet know what a diff is, what migrations are, what most build tools do
- Learns by doing, not by reading docs
- Will trust your suggestions, sometimes more than he should
- Has limited time — he's doing this on top of a real job

**The audience for the code itself:**

Every file Kyle reads is teaching material. Write code that:

- Reads well to someone learning, not just to a senior engineer
- Includes brief inline comments where unfamiliar concepts first appear (server actions, `revalidatePath`, `"use client"`)
- Uses bar-domain examples in placeholders and copy, not generic CRUD demos
- Picks one consistent pattern and sticks with it rather than showing off multiple approaches

**The audience for the welcome page and skill files:**

Friendly, warm, and specific to Kyle. The welcome page should feel like a letter from his brother, not a tutorial. The skills should sound like a patient mentor, not a tech doc.

---

## What We're Building

A **Next.js + Prisma + SQLite template** that Kyle can clone, run locally, and immediately start building features in with Cursor's help.

The first real use case Kyle has in mind is a **bar inventory and cocktail cost tool**:

- Track ingredients (gins, bitters, mixers, etc.) with cost per unit
- Build cocktail recipes that combine ingredients
- See live cost calculations as he designs drinks
- Eventually a menu builder with margins and suggested prices

The template ships with one working example feature (Ingredients CRUD) as a reference pattern. Everything beyond that, Kyle builds with the agent's help — guided by the rules and skills in this template.

The template will eventually be forked, deployed locally on a restaurant PC, and accessed from phones on the bar's local network. **No cloud, no Docker, no enterprise infrastructure.** A single machine running `npm start`.

---

## Design Philosophy

These principles override any technical decision. When in doubt, return here:

- **Boring tech wins.** Use the patterns every tutorial and Stack Overflow answer assumes. Prisma 6 not 7. Standard import paths. Common conventions. The bleeding edge will fight you and confuse Kyle.
- **Build the bug visible before teaching the fix.** Validation, error handling, observability — all easier to teach after Kyle has *seen* the failure mode with his own eyes. Phase 2 deliberately ships under-validated so Phase 2.5 has teeth.
- **Friction reduction where it helps learning, friction preservation where it teaches.** Automate setup. Preserve the moments where understanding actually happens.
- **Skills and rules encode judgment without lecturing.** Constraints in the file, reasoning in the welcome page.
- **The welcome page is the message; everything else is plumbing.**
- **Test the path Kyle will actually take.** After building, do a dry-run from a fresh-clone perspective.
- **The agent operates without senior oversight.** Kyle can't reliably catch your mistakes yet. Verify rather than assume. Ask rather than guess.

---

## Stack Lock-Ins (Do Not Change Without Discussion)

These choices were made deliberately after running into specific traps. Don't "upgrade" them without understanding why:

| Decision | Why |
|----------|-----|
| **Prisma 6, not 7** | Prisma 7's new defaults (different generation paths, required driver adapters, removed constructor options) don't match the tutorials, Cursor's training data, or general ecosystem expectations yet. We hit four separate Prisma 7 gotchas in the first hour before downgrading. |
| **`@prisma/client` imports, not `@/generated/prisma`** | Standard location. Every tutorial assumes this. |
| **No `datasourceUrl` in `new PrismaClient()`** | Prisma 6 reads `DATABASE_URL` from `.env` automatically. Don't pass it explicitly. |
| **Server actions, not API routes** | Simpler mental model for Kyle: forms post to server functions. One pattern across mutations. |
| **`prisma migrate dev`, never `prisma db push`** | `db push` skips migration files, which defeats the whole point of teaching migration discipline. |
| **shadcn/ui from `src/components/ui/`** | Install new components with `npx shadcn@latest add <component>`. Don't write components from scratch when a shadcn one exists. |
| **Tailwind for styling** | No inline styles, no CSS files for components. |
| **SQLite for development and initial deployment** | Single file, no server, no Docker. Prisma's abstraction means swapping to Postgres later is a one-line config change. |
| **No Docker, no Kubernetes, no cloud** | Kyle runs this on a restaurant PC. The whole infrastructure is `npm start`. |

---

## Current State (✅ Done)

- Project scaffolded at `C:\Users\ryanm\dev\web-app-template`
- Next.js 16 + TypeScript + Tailwind + App Router + src dir + import alias
- Prisma 6 + SQLite, with Ingredient model migrated
- `src/lib/db.ts` with shared Prisma client
- shadcn/ui (radix-nova) installed with starter components under `src/components/ui` including a `/ui-check` smoke page

## Stack

- Next.js 16 (App Router) + TypeScript
- Prisma 6 + SQLite
- Tailwind CSS
- shadcn/ui (radix-nova style)
- Cursor as the editor
- Git + GitHub for distribution

---

## Phase 1: Foundation Verification ✅

**Goal:** Confirm everything works end-to-end before building features.

- Dev server runs (`npm run dev`)
- shadcn components render correctly at `/ui-check`
- Tailwind classes apply
- Prisma client imports cleanly with no TypeScript errors
- `npx prisma studio` opens and shows the Ingredient table

**Done when:** All of the above pass without manual intervention.

**Status:** Complete.

---

## Phase 2: Example Feature (Ingredients CRUD)

**Goal:** Build one complete end-to-end feature so the rest of the template has a working pattern to reference. This is Kyle's first interaction with a real form-to-database flow.

- Create server actions in `src/app/ingredients/actions.ts`:
  - `createIngredient` — accepts `FormData`, parses, creates, revalidates
  - `listIngredients` — returns all ingredients ordered by creation date
  - `deleteIngredient` — accepts `FormData` with hidden id, deletes, revalidates
- Build `/ingredients` page:
  - Server component by default
  - Form (`<form action={createIngredient}>`) with bar-flavored placeholders ("Bombay Sapphire Gin," unit select with oz/ml/bottle/each/dash)
  - List of ingredients with delete buttons (`<form action={deleteIngredient}>` with hidden id)
  - Empty state copy: "No ingredients yet. Add one above — try something you actually use."
  - "What you're looking at" header explaining the page in Kyle's terms
- Add prominent "Add an ingredient" button on the welcome page linking to `/ingredients`
- Light teaching comments at first appearances of: server actions, `revalidatePath`, `"use client"`

**Validation strategy:**

Phase 2 ships **deliberately minimal validation** — basic HTML hints only (`type="number"`, `required`). No Zod, no server-side bounds checks. The goal is to let Kyle break things on purpose (long names, absurd costs) so Phase 2.5 has teeth.

**Done when:** Kyle can add ingredients through the form, see them in the list, delete them, and confirm everything matches in Prisma Studio.

---

## Phase 2.5: Hardening (After Kyle's Chaos Session)

**Goal:** Use the broken state from Phase 2 to teach validation, error handling, and basic discipline. Not implemented until Kyle has *seen* the breakage.

- Add Zod schemas for server-side validation
- Add max length on `name`, sane bounds on `costPerUnit`
- Surface validation errors to the user clearly
- Add a delete confirmation (shadcn `AlertDialog` or simple `confirm()`)
- Teach git workflow as part of this phase: commit before experimenting, see the diff, learn rollback
- Optional: basic error logging/observability

**Why this matters:** Validation taught after a visible failure lands harder than validation taught as a "best practice."

---

## Phase 3: Welcome Page

**Goal:** Build the onboarding experience as the landing page. This is the *message* of the template.

Sections to include (`src/app/page.tsx`):

1. **"Hi Kyle"** — warm intro from Ryan, not a generic welcome
2. **"What you're looking at right now"** — meta-explanation that this page is a Next.js file Kyle can edit, with the exact file path he should open to change it
3. **Block diagram of the stack** — Browser → Next.js → Prisma → SQLite, with brief annotations
4. **"What's in this template"** — annotated tour of folders and what lives in each
5. **"How to use Cursor with this project"** — meta-skill of agent collaboration: the three modes, the conversation flow, what to expect
6. **"Your constraints"** — friendly framing of the rules, with the *reasoning* (not just the rules themselves)
7. **"Git workflow"** — basic commands and what they do, framed as "what to do when you're confused: ask Cursor"
8. **"What to build first"** — suggested first task: invoke the `get-started` skill, talk through what he wants to build, write his `PLAN.md`
9. **"Where to go from here"** — Ryan's framing of the bar app vision

**Voice:** Friendly, brotherly, specific to Kyle. Not a tech tutorial. Read it back to yourself and ask: would Ryan actually say this to Kyle?

**Done when:** The welcome page is the first thing he sees and it explains itself without external context.

---

## Phase 4: Skills, Rules, and Resources

**Goal:** Encode the team-of-one's hard-won knowledge into agent-readable artifacts that work together.

### Design Philosophy

**Rules and skills serve different jobs:**

- **Rules** (`.cursor/rules/template-operating-posture.mdc`) are always loaded. They establish *who the agent is working with and how to operate carefully*. They're the agent's posture, not its tasks.
- **Skills** (`.cursor/skills/`) load on demand based on what Kyle asks for. They're specific workflows the agent can invoke.

Think of rules as the agent's personality and constraints; skills as its playbook for specific situations.

---

### `.cursor/rules/template-operating-posture.mdc` — The Agent's Operating Posture

The rules file should establish three things clearly:

#### 1. Who Kyle Is

The agent needs to understand Kyle's skill level so it can calibrate its explanations, decisions, and double-checks appropriately.

- Kyle is new to software development
- He's a bar manager building a real tool for his work, not a CS student
- He doesn't yet know what a diff is, what migrations are, what most build tools do
- He learns by doing, not by reading docs
- He's smart and capable — pattern-recognition is strong, vocabulary is still building
- He will trust the agent's suggestions, sometimes more than he should

#### 2. The Constraints

The hard rules about how to work in this codebase (these mirror the Stack Lock-Ins section above but in agent-readable form):

- **Database changes go through Prisma migrations only.** Never run raw SQL. Never modify the database directly. Always: edit `schema.prisma` → `npx prisma migrate dev --name <descriptive>` → verify in Prisma Studio.
- **Use Prisma 6 import patterns.** `import { PrismaClient } from "@prisma/client"`. Do not suggest `@/generated/prisma` paths. Do not pass `datasourceUrl` to the constructor.
- **Server actions live next to their pages.** `src/app/<feature>/page.tsx` is paired with `src/app/<feature>/actions.ts`.
- **Use form actions for mutations.** `<form action={serverAction}>` with hidden inputs as needed. Avoid `useTransition` and `useActionState` unless there's a specific reason.
- **shadcn components live in `src/components/ui/`.** Install new ones with `npx shadcn@latest add <component>`. Don't write components from scratch when a shadcn one exists.
- **Tailwind for styling.** No inline styles, no CSS files for components.
- **TypeScript types come from Prisma where possible.** Don't redefine types that already exist in `@prisma/client`.
- **Never touch production database credentials.** This is a local-only project; if production deployment comes up, stop and ask.

#### 3. The Agent's Posture (The Important Part)

This is what makes Kyle's experience meaningfully different from "just use Cursor." The agent should operate as if it has no senior oversight, because Kyle isn't yet able to catch its mistakes.

- **You are working without senior review.** Kyle cannot reliably catch your mistakes yet. Treat that as a reason to verify, not as license to move fast.
- **When uncertain, ask Kyle rather than guess.** "I'm not sure whether you want X or Y — can you tell me more?" is better than picking one and being wrong.
- **Read before you write.** Before modifying a file, view its current contents. Before adding a feature, check what already exists. Before changing the schema, look at what's there.
- **Verify changes actually worked.** After running a migration, check Prisma Studio. After editing a component, check that the page still renders. After installing a package, check that it imports correctly. Don't assume success — confirm it.
- **Explain your reasoning briefly.** Kyle is learning. A one-sentence "I'm doing X because Y" helps him build mental models. Don't lecture, but don't be silent either.
- **Surface tradeoffs you make.** If you choose Approach A over Approach B, mention that B existed. Kyle should know there are choices being made, even when he's not making them.
- **If you don't know something, say so.** "I'm not sure about this — let's check the docs" is the right move. Confident wrong answers are worse than admitted uncertainty.
- **When something breaks, slow down.** Read the error message carefully. Don't immediately try a fix. Explain what the error means before suggesting a solution. Many "fixes" make things worse because the agent guessed.

---

### Skills at `.cursor/skills/`

Skills are invoked on demand. Each one is a folder containing a `SKILL.md` file with a description (so the agent knows when to load it) and instructions.

#### `get-started/SKILL.md`

The first skill Kyle invokes. Sets the tone for the relationship between him and the agent.

**Triggers on:** "get started", "help me start", "I'm new", "first time", "introduce yourself", "what is this"

**What it does:**

1. The agent introduces itself in plain language: "Hi Kyle. I'm Cursor, an AI assistant that helps you write code. I can do things for you, but I'm not perfect — I'll explain what I'm doing and ask questions when I'm not sure."

2. Explains the three Cursor modes:
   - **Ask mode**: For questions and explanations. Good for "what does this do?" or "how does X work?" Doesn't change your code.
   - **Agent mode**: For making changes. The agent reads files, writes code, runs commands. Good for "add a feature" or "fix this bug." Always shows you the diff before applying.
   - **Manual mode**: You write the code yourself, the agent just autocompletes. Good when you know exactly what you want.

3. Explains the conversation flow:
   - Ask in plain English
   - The agent will often ask clarifying questions — answer them honestly
   - The agent will propose changes; review them before accepting
   - If something breaks, tell the agent what happened and it'll help debug

4. Then asks Kyle the orienting questions:
   - "What problem are you trying to solve at work?"
   - "If this template became a real tool for you, what would it do?"
   - "What's the smallest first version of that?"

5. Based on his answers, the agent helps him write a `PLAN.md` at the root of the project capturing what he wants to build and the first few steps. This file becomes the anchor for the `lets-continue` skill later.

**Why this skill matters:** Kyle's first interaction with the agent shouldn't be "ask it to do something and hope." It should be a structured intro that gives him the mental model for what working with an AI agent feels like.

---

#### `lets-continue/SKILL.md`

For when Kyle comes back after a break and doesn't remember where he left off.

**Triggers on:** "let's continue", "where did I leave off", "what was I doing", "pick up where we left off", "what's next"

**What it does:**

1. Look for `PLAN.md` at the project root. If it exists, read it.
2. Check Git history for recent commits — what was last worked on?
3. Look for any TODO comments or in-progress files.
4. Summarize for Kyle: "Last time you were working on X. The plan called for doing Y next. Do you want to continue with Y, or has the plan changed?"
5. If `PLAN.md` doesn't exist or feels stale, offer to update it together.
6. Remind Kyle of the template's rules and constraints briefly so the agent isn't starting from a blank slate.

**Why this skill matters:** The biggest enemy of a side project is losing the thread. This skill makes context recovery a one-prompt operation.

---

#### `grill-me/SKILL.md`

Kyle's adaptation of Ryan's existing grill-me skill. The agent asks clarifying questions before making decisions on big changes.

**Triggers on:** "grill me", "what should I think about", "before I build this", "ask me questions"

**What it does:**

1. Before agreeing to build whatever Kyle asked for, the agent asks 3-7 questions specifically tuned to this project's infrastructure:
   - "Does this change require a new database table or column? If yes, we'll need a migration."
   - "Will this feature need to talk to existing data? Which tables?"
   - "Is this a single page or multiple? Where should it live in the file structure?"
   - "Are there any shadcn components that could speed this up?"
   - "What's the smallest version of this that would still be useful?"
   - "How will you know it's working — what does success look like?"

2. Uses Kyle's answers to write a brief plan before touching any code.

3. Shows the plan, confirms with Kyle, then proceeds.

**Why this skill matters:** Kyle will sometimes ask for things that have hidden complexity. Grilling surfaces that complexity before code is written, which is way cheaper than discovering it mid-implementation.

---

#### `phase-briefings/SKILL.md`

Ryan's existing phase-briefing skill, tuned for this template. The agent explains a saved plan phase in plain English before making any changes.

**Triggers on:** "execute phase 4", "run phase 2", "start the next phase", "continue the plan", attaching or referencing a saved plan document

**What it does:**

1. Reads the requested phase from `Docs/Master Plan.md`, `PLAN.md`, or `.cursor/plans/*.plan.md`.
2. Summarizes the practical goal in plain English.
3. Names the likely files, areas, and commands before touching anything.
4. Calls out risky steps like migrations or installs.
5. Asks for approval before edits, commands, scripts, migrations, or tests.

**Why this skill matters:** Kyle may work from saved plans without remembering the details. This skill turns each phase into a small, understandable next step before the agent starts changing files.

---

### How They Work Together

Imagine Kyle's first session:

1. Opens project in Cursor for the first time
2. Asks "what is this?" → `get-started` skill activates → agent introduces itself, explains modes, asks what he wants to build, helps write `PLAN.md`
3. Kyle says "let's build the first thing" → agent proposes a change, follows the rules from `.cursor/rules/template-operating-posture.mdc` (uses Prisma migrations, puts server actions next to pages, etc.)
4. Kyle asks for something complex → `grill-me` skill activates → questions surface hidden complexity
5. Kyle goes to bed, comes back three days later
6. Asks "where did I leave off?" → `lets-continue` skill activates → agent finds `PLAN.md`, reads recent commits, summarizes state

The rules are always shaping how the agent operates. The skills are tools for specific moments. Together, they replicate the kind of guidance Kyle would get from a patient senior developer sitting next to him.

**Done when:**

- Opening the project in Cursor shows the rules loaded (the agent references Kyle by name, mentions Prisma 6 conventions naturally, etc.)
- The three skills (`get-started`, `lets-continue`, `grill-me`) trigger correctly when invoked
- A dry-run conversation with Cursor about a fake feature shows the rules + skills working together (agent asks questions, surfaces tradeoffs, follows conventions)

---

## Phase 5: Documentation

**Goal:** Make the template self-explanatory in code form, not just in the welcome page.

- `README.md` at the root — quickstart for someone who already has Node/Git/Cursor
- `SETUP.md` — full setup from a clean machine (manual, no script yet)
- `CONVENTIONS.md` (optional) — for engineers who want to understand the patterns deeply
- Inline comments in key files (`db.ts`, `schema.prisma`, the example actions file) explaining *why* the patterns exist

**Done when:** Someone could pick up the repo with no context and get going.

---

## Phase 6: Bootstrap Script (Stretch Goal)

**Goal:** One-command setup for a fresh Windows machine.

`setup.ps1` at the project root:

- Set execution policy for current user
- Install Node via winget if missing
- Install Git via winget if missing
- Install Cursor via winget if missing
- Run `npm install`
- Run `npx prisma migrate dev --name init`
- Print success message with next steps

**Done when:** A fresh Windows machine can run the script and end up with a working dev environment.

**Note:** Build this *after* the template itself is solid. The script bootstraps the template, so the template has to exist first.

---

## Phase 7: Git & GitHub

**Goal:** Make the template forkable.

- Initialize Git, commit clean initial state
- Verify `.gitignore` excludes `node_modules`, `.env`, `dev.db`, `.next`, etc.
- Create a `.env.example` showing what variables Kyle needs (without real values)
- Push to Ryan's GitHub as a public repo
- Add a meaningful README at the GitHub level (the same one as Phase 5)
- Test the flow end-to-end: fork → clone → run setup → see welcome page

**Done when:** Ryan can hand Kyle the GitHub URL and he can go from "I have nothing" to "I see my app running" with minimal hand-holding.

---

## Phase 8: Handoff to Kyle

**Goal:** Actually onboard him.

- Walk him through forking the repo
- Pair on running the bootstrap script (or manual setup)
- Watch him hit `localhost:3000` for the first time
- Suggest first task: invoke the `get-started` skill, talk through what he wants to build, write his `PLAN.md`
- Be available for first-hour debugging

**Done when:** Kyle has made his first real change to the template and saved a `PLAN.md` reflecting his goals.

---

## Suggested Order of Operations

**Current session:** Phase 2 (ingredients CRUD). Stop after Kyle could theoretically interact with it.

**Next session:** Phase 3 → Phase 4. Welcome page, then skills and rules. This is where the template becomes *teaching* rather than just *working*.

**Later:** Phase 5 → Phase 7. Documentation, bootstrap script, GitHub publishing.

**Whenever Kyle's around:** Phase 8 (the actual handoff).

---

## For the Agent: How to Use This Document

If you're an AI agent reading this for the first time in a session:

1. **Read the full document before touching code.** The phases are not optional context — they encode the why behind every technical choice.
2. **The audience section is not flavor text.** Every decision about voice, comments, and complexity flows from "Kyle is the reader." When you find yourself about to do something clever, ask: would this help or confuse Kyle?
3. **The stack lock-ins are not suggestions.** Each one came from a specific failure mode. Don't propose changing them without first explaining why the current choice is wrong.
4. **The phases are ordered for a reason.** Don't skip ahead. Phase 2 ships deliberately under-validated because Phase 2.5 teaches validation more effectively after Kyle has seen the breakage.
5. **When in doubt, ask Ryan.** This document captures the plan, but Ryan is the human who can answer questions the plan doesn't address.

---