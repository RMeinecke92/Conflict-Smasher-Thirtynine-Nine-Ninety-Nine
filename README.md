# Web App Template

This is a local-first Next.js template for building small restaurant tools with Cursor.

The first example feature is an ingredient tracker. It shows the main pattern this project uses:

1. A page in `src/app/`
2. A form that posts to a server action
3. Prisma writing to SQLite
4. The page refreshing with the latest data

The goal is not to be fancy. The goal is to make the project easy to understand, change, and recover when something breaks.

## Quick Start

Use this path on a Windows computer when you want the setup script to check the tools and prepare the project:

```powershell
.\setup.ps1
```

The script checks for Node.js, Git, Cursor, and `winget`, creates `.env` from `.env.example`, installs packages, and applies the saved Prisma migrations.

If PowerShell blocks the script, open PowerShell in this folder and run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\setup.ps1
```

When it finishes, start the app:

```powershell
npm run dev
```

Then open:

```text
http://localhost:3000
```

Try the working example at:

```text
http://localhost:3000/ingredients
```

## Manual Setup

Use this path if you already have Node.js, Git, and Cursor installed, or if the script cannot use `winget` on your machine.

1. Install dependencies:

```powershell
npm install
```

2. Create a `.env` file at the project root:

```env
DATABASE_URL="file:./dev.db"
```

3. Set up the local database from the saved Prisma migrations:

```powershell
npx prisma migrate dev
```

4. Start the app:

```powershell
npm run dev
```

5. Open the app:

```text
http://localhost:3000
```

Try the working example at:

```text
http://localhost:3000/ingredients
```

## Useful Commands

```powershell
npm run dev
```

Starts the app for development.

```powershell
npm run build
```

Checks that the app can compile for production.

```powershell
npm run lint
```

Runs ESLint to catch common code problems.

```powershell
npx prisma studio
```

Opens a browser view of the local SQLite database.

## Project Map

- `src/app/page.tsx` is the welcome page.
- `src/app/ingredients/page.tsx` is the example ingredient page.
- `src/app/ingredients/actions.ts` contains the server actions for the ingredient page.
- `src/components/ui/` contains shadcn/ui components.
- `src/lib/db.ts` creates the shared Prisma client.
- `prisma/schema.prisma` describes the database tables.
- `prisma/migrations/` contains the database history.
- `Docs/Master Plan.md` explains the build plan and design choices.

## Important Rules

- Use Prisma 6 patterns: import from `@prisma/client`.
- Change the database with Prisma migrations, not raw SQL and not `prisma db push`.
- Put feature pages and server actions next to each other, like `src/app/ingredients/page.tsx` and `src/app/ingredients/actions.ts`.
- Use form actions for mutations unless there is a clear reason not to.
- Use Tailwind classes for styling.
- Keep this local-first. No Docker, cloud database, or deployment work unless Ryan changes the plan.

For a full clean-machine walkthrough, read `SETUP.md`.

For the deeper "why do we do it this way?" version, read `CONVENTIONS.md`.
