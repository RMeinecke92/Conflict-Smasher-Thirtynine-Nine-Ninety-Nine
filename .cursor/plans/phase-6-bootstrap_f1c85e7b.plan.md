---
name: phase-6-bootstrap
overview: Implement Phase 6 by adding a Windows `setup.ps1` bootstrap script for a fresh machine, while keeping Prisma migration behavior conservative and aligned with the existing manual setup guide.
todos:
  - id: add-script
    content: Create root `setup.ps1` with tool checks/installers, project setup, Prisma migration, and next-step output.
    status: completed
  - id: update-docs
    content: Update `README.md` and `SETUP.md` to explain the bootstrap script and manual fallback.
    status: completed
  - id: verify-script
    content: Run the smallest safe checks for the script plus lint/build if appropriate.
    status: completed
isProject: false
---

# Phase 6: Windows Bootstrap Script

Goal: create a project-root PowerShell script that gets a fresh Windows machine from “I have the repo” to “the app can run locally.”

I am going to:
- Add [`setup.ps1`](setup.ps1) at the project root.
- Have it print a clear banner when opened in PowerShell, explaining what is about to happen.
- Have it check `CurrentUser` execution policy. If it is `RemoteSigned` or less restrictive, continue. If it is stricter, prompt the user before running `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
- Have it require `winget`. If `winget` is missing, print the Windows/App Installer message and exit.
- Have it check or install each tool:
  - Node.js: `winget install -e --id OpenJS.NodeJS.LTS`
  - Git: `winget install -e --id Git.Git`
  - Cursor: `winget install -e --id Anysphere.Cursor`
- Have it skip tools already found with `Get-Command`, print a check-mark message for each installed tool, run `winget` only for missing tools, and refresh `PATH` after installs.
- Have it verify Node.js, Git, and Cursor are accessible after installation; if any are still missing, print which one failed and exit.
- Have it create [`.env`](.env) from [`.env.example`](.env.example) if `.env` is missing.
- Have it run `npm install`.
- Have it run `npx prisma migrate dev` to apply the saved migration in [`prisma/migrations/`](prisma/migrations/) without naming or creating a new migration unless Prisma itself reports one is needed.
- Have it print success and next steps exactly in this shape: setup complete, run `npm run dev`, open `http://localhost:3000`, and try `/ingredients`.

Likely files/areas:
- [`setup.ps1`](setup.ps1), new script.
- [`.env.example`](.env.example), add if missing so the script has a safe source for `.env`.
- [`README.md`](README.md), likely a small note pointing users to the script.
- [`SETUP.md`](SETUP.md), likely a short section explaining the script and when to fall back to manual setup.

Possible commands during implementation/verification:
- `powershell -NoProfile -ExecutionPolicy Bypass -File .\setup.ps1`
- `npm run lint`
- `npm run build`

Important choices:
- The script should only change `CurrentUser` execution policy after the user types `Y`; anything else exits.
- The script should be idempotent: rerunning it should skip tools already installed, preserve an existing `.env`, and re-run project setup safely.
- Because this repo already has an `init` migration, the script should use `npx prisma migrate dev`, not `npx prisma migrate dev --name init`.
- `winget` installs are the riskiest part because they change the user’s machine, so each install should be visible and followed by a fresh command check.

Please confirm before I start Phase 6.