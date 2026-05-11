---
name: Phase 4 Rules Skills
overview: Implement Phase 4 by installing always-on agent rules and project skills that encode Kyle’s learning context, the template’s technical guardrails, and the on-demand workflows described in the master plan. Existing staged skills will be moved into `.cursor/skills/`, adapted where needed, and the staging folder cleaned up once the project copies are in place.
todos:
  - id: rules
    content: Create single always-apply project rule and update legacy rule references.
    status: completed
  - id: new-skills
    content: Author `get-started` and `lets-continue` project skills.
    status: completed
  - id: adapt-existing-skills
    content: Move and adapt `grill-me` and `phase-briefings` into `.cursor/skills/`.
    status: completed
  - id: cleanup-verify
    content: Clean up staging folder if empty and verify paths, metadata, and doc alignment.
    status: completed
isProject: false
---

# Phase 4 Rules And Skills

## Scope

Build the Phase 4 artifacts described in [Docs/Master Plan.md](Docs/Master%20Plan.md): always-on rules for agent posture and project constraints, plus project skills under `.cursor/skills/`.

Use a single rule location:

- `.cursor/rules/template-operating-posture.mdc` as the real always-apply Cursor project rule.

## Rules

Create `.cursor/rules/template-operating-posture.mdc` with `alwaysApply: true`. Keep it concise and split into the three Phase 4 themes:

- Who Kyle is: bar manager, new developer, learns by doing, will over-trust agents.
- Technical constraints: Prisma 6, migrations only, server actions next to pages, form actions, shadcn from `src/components/ui/`, Tailwind, Prisma types, no production database credential work.
- Agent posture: read before writing, ask when uncertain, verify changes, explain briefly, surface tradeoffs, admit uncertainty, slow down on breakage, do not recommend stack changes without Ryan.

Do not add a root legacy rules file. Update welcome/docs references that name the old rule file directly.

## Skills

Create `.cursor/skills/` and install four project skills:

- `.cursor/skills/get-started/SKILL.md`: new skill for first interaction. It introduces Cursor plainly, explains workflow/modes at Kyle’s level, asks the orienting questions, and helps write root `PLAN.md`.
- `.cursor/skills/lets-continue/SKILL.md`: new skill for context recovery. It reads `PLAN.md` if present, checks recent git history and TODOs, then asks whether to continue or update the plan.
- `.cursor/skills/grill-me/SKILL.md`: move the staged draft from `Skills I have made for the template TO BE MOVED WHEN READY/grill-me/SKILL.md` and adapt it from a generic grilling skill into this template’s version with Prisma/table/page/shadcn/smallest-useful-version/success-criteria questions.
- `.cursor/skills/phase-briefings/SKILL.md`: move the staged draft after Ryan approval and adapt it for explaining saved plan phases before changes begin.

Each `SKILL.md` will use Cursor skill frontmatter with lowercase hyphenated `name`, a specific third-person `description`, and concise instructions under 500 lines.

## Cleanup And Alignment

After the project skills are created, remove old staging copies for skills that were moved.

Review the existing welcome/resource text for obvious mismatches caused by the rule location decision. If needed, make only small wording updates so references to `.cursor/rules/` and `.cursor/skills/` remain true without rewriting Phase 3.

## Verification

Verify Phase 4 by checking:

- The final tree contains `.cursor/rules/template-operating-posture.mdc` and the approved `.cursor/skills/*/SKILL.md` files.
- No moved project skill remains only in the staging folder.
- Skill metadata follows Cursor’s required structure.
- The rules and skills match the Phase 4 intent in [Docs/Master Plan.md](Docs/Master%20Plan.md).
- If edits touch docs or markdown only, use file inspection/lints where available; no app runtime test should be needed unless code files change unexpectedly.