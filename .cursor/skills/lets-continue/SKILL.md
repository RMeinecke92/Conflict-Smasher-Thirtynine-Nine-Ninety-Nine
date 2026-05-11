---
name: lets-continue
description: Rebuilds project context after a break. Use when the user says "let's continue", "where did I leave off", "what was I doing", "pick up where we left off", "what's next", or returns after time away.
---

# Let's Continue

## Purpose

Use this skill when Kyle comes back after a break and needs the thread restored without rereading the whole project.

## Workflow

1. Re-orient yourself by reading the always-on project rule at `.cursor/rules/template-operating-posture.mdc`.

2. Look for the current plan:
   - Prefer root `PLAN.md`.
   - If it does not exist, say so and offer to create one together.

3. Check recent work:
   - Read recent git history if this is a git repo.
   - Search for TODO comments and obvious in-progress notes.
   - Inspect only the files needed to understand the current thread.

4. Summarize in plain language:
   - What Kyle was working on.
   - What appears done.
   - What the plan says should happen next.
   - Any uncertainty or stale information.

5. Ask one direct question before proceeding:
   - "Do you want to continue with that next step, or has the plan changed?"

## Style

Keep the summary short and concrete. The goal is to help Kyle regain momentum, not to produce a full project audit.
