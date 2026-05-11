---
name: phase-briefings
description: Gives short plain-English briefings before working through a saved plan phase. Use when the user references a plan document, asks to start or continue a phase, says "execute phase n", "run phase n", "start the next phase", or needs help understanding what a phase will involve.
---

# Phase Briefings

## Purpose

Use this skill when Kyle or Ryan asks to work through a numbered phase from a saved plan, such as `Docs/Master Plan.md` or `.cursor/plans/*.plan.md`.

The goal is to explain the next slice of work before touching files, so Kyle understands what is about to happen and can stop or redirect early.

## Workflow

Before starting a phase:

1. Read the requested phase in the plan document.
2. Identify the practical goal in plain English.
3. Mention the main files or areas likely to change.
4. Mention any commands that may be needed, but do not run them yet.
5. Call out decisions, migrations, installs, or risky steps that need explicit approval.
6. Ask for approval before editing files, running commands, scripts, migrations, or tests.

## Briefing Format

Keep the briefing short:

```markdown
Phase [number]: [plain-English goal]

I am going to:
- [simple action]
- [simple action]
- [simple action]

Likely files/areas:
- `[path or area]`

Possible commands:
- `[command]`

Please confirm before I start this phase.
```

## During Execution

Work only on the approved phase. If another phase or prerequisite needs attention first, stop and explain the blocker.

Before moving to a different phase, give a new briefing and ask for approval again.

If the user asks for status, answer with what is done, what is in progress, and what remains.
