# Setup From A Clean Machine

This guide is for setting up the project on a Windows computer.

The fastest path is `setup.ps1`. It checks the main tools, installs missing ones with `winget`, installs project dependencies, creates `.env`, creates the local database, and then tells you how to start the app.

## Automatic Setup

Open PowerShell in the project folder and run:

```powershell
.\setup.ps1
```

If PowerShell blocks the script, run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\setup.ps1
```

### Windows: “Access denied”, “Unauthorized access”, or winget errors

Those messages usually mean Windows blocked an install or write because the session does not have permission, or because something on the machine (policy or antivirus) interfered. Try these in order:

1. **Run PowerShell as Administrator once.** Right-click PowerShell → **Run as administrator**, `cd` into this project folder, then run `.\setup.ps1` again. Some `winget` installs touch locations that only succeed when elevated.

2. **If you extracted a ZIP or cloned from the internet**, Windows may mark files as untrusted. Right‑click the project folder → **Properties** → if you see **Unblock**, enable it and apply. Or from the project root in PowerShell:

   ```powershell
   Unblock-File -Path .\setup.ps1
   ```

3. **If `winget` keeps failing** (common on locked-down work PCs), install **Node.js (LTS)**, **Git**, and **Cursor** yourself from the official installers or Microsoft Store, then follow **[Manual Setup](#manual-setup)** below so you skip `winget` entirely.

4. **Office or school PCs** sometimes enforce policies that block script policy changes or package managers. Use the bypass command above for scripts; if installs still fail, Manual Setup plus IT-approved installers is the reliable path.

The script may ask before changing the script policy for your user account. Type `Y` only if you want it to set `CurrentUser` to `RemoteSigned`.

If the script says `winget` is missing, update Windows or install App Installer from the Microsoft Store, then re-run the script.

When setup finishes, run:

```powershell
npm run dev
```

Then open:

```text
http://localhost:3000
```

Try the example feature at:

```text
http://localhost:3000/ingredients
```

## Manual Setup

Use this path if the script cannot run on your machine, or if you want to do each step yourself.

## 1. Install The Tools

Install these first:

- Node.js, which runs the app and gives you `npm`
- Git, which downloads and tracks the code
- Cursor, which is the editor and AI assistant

After installing Node.js and Git, open PowerShell and check them:

```powershell
node --version
npm --version
git --version
```

If one of those commands fails, that tool is not installed correctly yet.

## 2. Get The Project

Clone the repo or open the project folder Ryan gave you.

In PowerShell, move into the project folder:

```powershell
cd C:\path\to\web-app-template
```

You are in the right place when this command lists `package.json`:

```powershell
dir
```

## 3. Install Dependencies

Run:

```powershell
npm install
```

This downloads Next.js, React, Prisma, shadcn/ui, and the other packages listed in `package.json`.

If this fails, read the error carefully. Most first-time failures are from Node.js not being installed or PowerShell being in the wrong folder.

## 4. Create The Environment File

Create a file named `.env` at the project root.

Put this in it:

```env
DATABASE_URL="file:./dev.db"
```

This tells Prisma to use a SQLite database file named `dev.db` inside the `prisma/` folder.

Do not commit `.env`. It is ignored on purpose because environment files can contain secrets in real projects.

## 5. Create The Local Database

Run:

```powershell
npx prisma migrate dev
```

This applies the saved migrations in `prisma/migrations/` and creates the local SQLite database.

If Prisma asks for a new migration name, stop and ask Cursor or Ryan. That usually means the schema changed and needs a real migration name.

## 6. Start The App

Run:

```powershell
npm run dev
```

Then open:

```text
http://localhost:3000
```

You should see the welcome page.

Try the example feature at:

```text
http://localhost:3000/ingredients
```

Add an ingredient, then delete it. That proves the browser, Next.js, Prisma, and SQLite are all talking to each other.

## 7. Look At The Database

In a second terminal, run:

```powershell
npx prisma studio
```

Open the browser tab Prisma gives you and click the `Ingredient` table.

This is a friendly view of the actual local database.

## 8. Common Problems

If `setup.ps1` fails with **Access denied** or **Unauthorized access**, read the Windows troubleshooting bullet list under **Automatic Setup** above.

If `npm` is not recognized, Node.js is not installed or PowerShell needs to be reopened.

If `npx prisma migrate dev` cannot find `DATABASE_URL`, check that `.env` exists at the project root and contains `DATABASE_URL="file:./dev.db"`.

If the browser cannot open `localhost:3000`, make sure `npm run dev` is still running and did not print an error.

If the page opens but the ingredient form fails, run `npx prisma migrate dev` again and check the error.

## 9. What To Read Next

- `README.md` for the short version
- `CONVENTIONS.md` for the project patterns
- `Docs/Master Plan.md` for the full plan and reasoning
