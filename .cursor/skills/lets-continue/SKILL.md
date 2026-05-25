---
name: lets-continue
description: Rebuilds project context after a break. Use when the user says "let's continue", "where did I leave off", "what was I doing", "pick up where we left off", "what's next", or returns after time away.
---

# Let's Continue

## Purpose

Use this skill when Kyle comes back after a break and needs the thread restored without rereading the whole project.

## Workflow

1. Re-orient yourself by reading the always-on project rule at `.cursor/rules/template-operating-posture.mdc`.

2. Read the master plan:
   - Open **`PLAN.md`** at the repo root (Stick Fighter roadmap).
   - Follow **`.cursor/rules/stick-fighter-master-plan.mdc`** for how plan status is tracked.
   - Note **Currently active** (what is `[~]` in progress) and the first unchecked near-term item.

3. Check recent work:
   - Read recent git history (`git log -10 --oneline`, `git status`).
   - Compare git changes to `PLAN.md` checkboxes and the **Verification log** — flag anything marked `[x]` that is not in git, or code that exists but the plan still shows `[ ]`.
   - Search for TODO comments only if the plan does not explain the current thread.
   - Inspect only the files needed to understand the current thread.

4. Summarize in plain language:
   - What Kyle was working on.
   - What the plan marks complete vs in progress.
   - What the plan says should happen next.
   - Any mismatch between plan, git, and code.

5. Ask one direct question before proceeding:
   - "Do you want to continue with that next step, or has the plan changed?"

## Style

Keep the summary short and concrete. The goal is to help Kyle regain momentum, not to produce a full project audit.
