---
name: grill-me
description: Stress-tests feature ideas before code is written. Use when the user says "grill me", "before I build this", "ask me questions", "what should I think about", or proposes a feature with hidden complexity.
---

# Grill Me

## Purpose

Use this skill before agreeing to build a feature that may touch data, pages, workflow, or deployment. The goal is to expose hidden decisions while the change is still cheap.

## Workflow

1. If the answer is already in the repo, inspect the relevant files instead of asking Kyle.

2. Ask 3-7 questions, one at a time. Pick the questions that matter for the request:
   - What real-world problem is this solving at the bar?
   - What is the smallest version that would still be useful?
   - Does this need a new database table or column? If yes, it needs a Prisma migration.
   - Which existing data does it touch, such as ingredients or recipes?
   - Is this one page or several pages? Where should it live under `src/app/`?
   - Is there a shadcn/ui component that should be used instead of building UI from scratch?
   - How will Kyle know it worked?

3. For each question, include your recommended answer when you can:
   - Say what you would choose.
   - Explain the tradeoff in one plain sentence.
   - Ask Kyle to confirm or correct you.

4. After the answers, write a short implementation plan.

5. Do not edit files, run migrations, or install packages until Kyle confirms the plan.

## Style

Be direct but not adversarial. The point is to protect Kyle from accidental complexity, not to make him defend every idea.
