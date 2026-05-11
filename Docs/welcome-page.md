# Welcome

This is the landing page for your bar-inventory template. Everything below is plain text and layout in one file — you can change any of it.

---

## Things to remember

1. Things will go wrong lol
2. Things will break
3. That's okay do not give up.
4. Half of the battle is making a decision and sticking to it even if it isn't optimal.
5. Be curious. Learn. Grow. Google shit. Watch youtube videos. Not just about AI but about software in general.

Before you know it you'll be creating things people have never dreamed of.

---

## What is a web app, you ask?

A web app is just three things working together: a **frontend**, a **backend**, and a **database**. You're going to learn about each one, one layer at a time.

### The frontend

The frontend is the part you see and click. It's the page in your browser — the buttons, the forms, the text, the colors.

You're looking at one right now. This entire page is the frontend.

The frontend is built out of **components**. A button is a component. A form is a component. A whole page is a component built out of smaller components. They're written in **React**, which is a way of describing what should appear on the screen and how it should react when you interact with it.

When you click a button, the frontend's job is to figure out what just happened and ask the backend to do something about it.

### The backend

The backend is the part you *don't* see. It runs on a computer (in your case, your own laptop while you're developing, and eventually the restaurant's PC when you deploy).

When the frontend says "the user just submitted a form to add an ingredient," the backend is what receives that request, validates it, talks to the database, and sends back the result.

In this template, the backend runs on something called **Next.js**. When you type `npm run dev` in the terminal, Next.js starts up and listens for requests from your browser. When you stop it, the backend stops too.

The functions on the backend that the frontend can call are called **server actions**. Forms in this app post to server actions, server actions read or write data, and then the page updates. That's the whole pattern.

### The database

The database is where information *lives* — even when the app is closed.

If your app is a notebook, the database is the paper. The frontend writes things down, the backend reads them back later, and the paper remembers everything in between.

Databases are organized into a few simple pieces:

- **Table** — like a spreadsheet. One sheet per kind of thing. You have a table called `Ingredient`.
- **Row** — one record in that sheet. One ingredient. (Bombay Sapphire, for example.)
- **Column** — one attribute every record shares. Every ingredient has a name, a unit, a cost.
- **Field** — one cell. The intersection of one row and one column. The "name" field of the first ingredient is "Bombay Sapphire."

```
Ingredient table

| id | name             | unit | costPerUnit | createdAt   |
|----|------------------|------|-------------|-------------|
|  1 | Bombay Sapphire  | oz   | 0.45        | 2026-05-10  |  ← row
|  2 | Angostura Bitters| dash | 0.05        | 2026-05-10  |
|  3 | Lime Juice       | oz   | 0.12        | 2026-05-10  |
                       ↑
                     column
```

The database you're using is called **SQLite**. The entire database is just *one file on your computer*, called `dev.db`, sitting in the `prisma/` folder. You can delete it and start over if you mess it up. You can copy it to another machine and the data comes with it. It's that simple.

You don't talk to the database directly. You talk to a tool called **Prisma**, which is a translator between TypeScript code on the backend and rows in the database. You say "give me all ingredients," Prisma turns that into a database query, and hands the rows back to you as normal TypeScript objects.

### Putting it together

Here's the full path when you click "Add ingredient":

```
Browser (frontend)              ──→  You type "Bombay Sapphire" and click Add
        ↓
Next.js (backend)               ──→  Server action receives the form data
        ↓
Prisma (the translator)         ──→  Turns it into a database write
        ↓
SQLite (the database file)      ──→  Saves the row to dev.db
        ↓
Page refreshes                  ──→  You see the new ingredient in the list
```

That's it. That's a web app. Everything else is just doing more of this same dance for different kinds of data.

---

## Well, how do I change all of this, you ask?

You change it with **Cursor**, the editor you're reading this in right now.

Cursor looks like a normal code editor, but with an AI assistant built in. You don't need to memorize what's where — come back to this page when you forget.

### The left side: file explorer

The left panel shows every file and folder in your project. This is your map.

Some folders you'll touch often:

- **`src/app/`** — the pages of your app. Each folder with a `page.tsx` is a URL. `src/app/ingredients/page.tsx` is the page you see at `/ingredients`.
- **`src/components/ui/`** — pre-built buttons, cards, and forms. You add new ones with `npx shadcn@latest add <name>` when you need them.
- **`src/lib/`** — shared helpers (for example, the file that opens your database connection).
- **`prisma/schema.prisma`** — the shape of your database. When you want to change what columns or tables exist, you edit this file.

To open a file, click it. To change what this welcome screen says, open `src/app/page.tsx`.

### The bottom: the terminal

The bottom panel is the **terminal** — where you type commands.

The commands you'll use most often:

- `npm run dev` — start the app. After this runs, open `http://localhost:3000` in your browser.
- `npx prisma studio` — open a friendly view of your database in the browser.
- `npx prisma migrate dev --name <something>` — apply a change you made to `schema.prisma`. More on this later.

If the terminal isn't showing, you can open it with the keyboard shortcut `` Ctrl+` `` (control + backtick — the key above Tab).

### The right side: the chat with the agent

The right panel is where you talk to the AI assistant.

You type in plain English. You ask questions. You describe what you want. The agent reads your code, asks clarifying questions, and (when you ask it to) makes changes.

For now, you're going to use it in **editor mode** — the agent helps you write and explains things, but you stay in the driver's seat. Ryan will set this up for you in person. Don't worry about the other modes yet.

When the agent suggests changes, *read them before you accept*. Even good agents make mistakes. Especially when you're new, you should be the second pair of eyes on every change.

### Rules — the agent's standing instructions

In your project, there's a folder called `.cursor/rules/`. These are the agent's **rules** — instructions it reads every time you start a conversation.

The rules in this template tell the agent:

- Who you are (a bar manager learning to build software)
- What kind of code to write (boring, well-commented, beginner-friendly)
- What patterns to use (server actions, Prisma migrations, shadcn components)
- How to behave (read before writing, verify changes worked, ask when uncertain)

You don't have to read the rules yourself. They run in the background. But they're the reason the agent will explain things to you instead of dumping clever code on your screen.

### Skills — the agent's playbook for specific moments

Inside `.cursor/skills/` are folders called **skills**. Each skill is a workflow the agent knows how to run when you ask for it.

The template comes with a few:

- **`get-started`** — invoke this when you're not sure what to build. It walks you through the questions that lead to a plan.
- **`lets-continue`** — invoke this when you come back after a few days and forget where you were. It catches you up.
- **`grill-me`** — invoke this before building something complex. It makes the agent ask you tough questions before writing any code.
- **`phase-briefings`** — invoke this when you're working through a saved plan and want the next phase explained before anything changes.

You invoke a skill by typing its name (or something close to it) in the chat. "Get started" works. "Help me start" works. The agent figures it out.

### The left side, again: source control (Git)

There's a second icon on the left side that shows **Git** — your project's history.

Git keeps a record of every version of your code. Every time you save a snapshot, you can come back to it later. If you break something, Git lets you go back to when it worked.

You'll see this panel light up when you change files. You'll learn to use it slowly — Ryan will walk you through the workflow in person.

---

## How do you save your work? Oh, that's easy!

Saving your work happens in two places: your computer (Git) and the internet (GitHub).

### What is GitHub?

GitHub is a website that stores Git repositories online. Think of it as cloud storage for your code, except it also tracks every change you've ever made.

When you "push" to GitHub, your code on your laptop gets copied up to the website. When you "pull" from GitHub, the latest version on the website gets copied down to your laptop. That's the whole idea.

Two reasons this matters:

1. If your laptop dies, your code is safe.
2. If you want to work on the same project from a different machine — or share it with someone — GitHub is how.

### Your three branches

A **branch** in Git is a parallel version of your project. You can have multiple branches and switch between them, and changes in one branch don't affect the others until you choose to combine them.

Your project will have three:

- **`main`** — the stable, working version of your app. Don't experiment here. This is the version that runs at the bar.
- **`updates`** — where you try new things, build features, and break stuff. When something works on `updates`, you copy it to `main`. When it breaks, no harm done — `main` is still safe.
- **`restore`** — a safety net. A clean copy of the template you can always fall back to if everything goes sideways.

This is the same pattern Ryan uses at work. Three branches, clear roles, no surprises.

### The commands

You don't need to memorize these — Cursor has buttons for all of them in the Git panel. But for reference:

- `git status` — what changed since the last save
- `git add .` — stage all changes for the next snapshot
- `git commit -m "your message"` — take a snapshot with a label
- `git push` — send snapshots up to GitHub
- `git pull` — get the latest snapshots down from GitHub
- `git checkout <branch-name>` — switch to a different branch

In practice you'll use the Git panel in Cursor's left sidebar. Click a button instead of typing. Same thing.

---

## But who is doing the work?! Well, that's easy! You and the agents!

Cursor doesn't have one AI — it has several. Each one has different strengths, different costs, and different speeds. You'll pick which one to use based on what you're doing.

You have access to these on your Pro plan:

### Composer 2 (Fast)

Cursor's own model. **Fast and cheap.** Good for mechanical work: scaffolding a new page, adding a component, renaming things, simple bug fixes. Default for low-stakes tasks.

Tradeoff: it's eager. It'll happily produce a confident wrong answer if you're not paying attention. Watch it carefully on anything complex.

### Claude Opus 4.7

Anthropic's strongest model. **Best judgment, slowest, most expensive.** Use this for architecture decisions, debugging gnarly problems, or anything where being wrong is costly. If you're stuck and Composer keeps making the problem worse, switch to Opus 4.7 and ask the same question.

### Claude Opus 4.6

The previous version of Opus. Still excellent. Slightly cheaper than 4.7. A good fallback when 4.7 is rate-limited or busy.

### Claude Sonnet 4.5

Anthropic's middle-tier model. **Significantly cheaper than Opus, still strong reasoning.** This is the sweet spot for most feature work — when Composer isn't quite enough but Opus is overkill, use Sonnet.

### GPT-5.5 (Medium)

OpenAI's offering. Different "personality" than Claude — sometimes better at certain things, sometimes worse. Useful as a second opinion. If Claude and you are talking past each other, try GPT.

### A simple starting heuristic

| What you're doing | Try first |
|-------------------|-----------|
| "Add a button," "rename this file," small mechanical edits | Composer 2 |
| Build a new feature, write a server action, design a page | Sonnet 4.5 |
| Debug something weird, plan architecture, decide between approaches | Opus 4.7 |

You can switch models mid-conversation. There's no penalty.

### What is a token?

Agents read and write in **tokens**. A token is roughly a word, or part of a word ("ingredient" might be one token; "Bombay" might be split into two).

Every time the agent reads a file, it costs tokens. Every time it writes a reply, it costs tokens. Bigger problems cost more tokens.

### What is a context window?

A **context window** is how much the agent can hold in its head at one time. If your problem fits in the window, the agent can reason about all of it. If it doesn't, some of it has to be forgotten or summarized.

Practical implication: **don't dump the whole codebase on it.** Point it at the specific files that matter. "Look at `src/app/ingredients/page.tsx` and add a category field" is much better than "look at everything and figure out what to do."

The Pro plan gives you generous limits, but tokens cost money on Cursor's end, and you'll hit usage caps if you waste them. Be specific.

---

## Ah, you'd like to see it work? Okay, follow me!

Scroll up to the **"Add an ingredient"** button on this page. Click it.

You're now on `/ingredients` — a real working page. It has a form, a list, and delete buttons. The form posts to a server action, which uses Prisma to write to SQLite. Exactly the pipeline you just learned about.

### Try it

1. **Add an ingredient that you actually use.** Try something like:
   - Name: Bombay Sapphire Gin
   - Unit: oz
   - Cost per unit: 0.45
   - Submit.
   
   You should see it appear in the list below the form. That's the frontend reflecting what the backend just saved to the database.

2. **Add a couple more.** Angostura Bitters at $0.05 per dash. Lime juice at $0.12 per oz. Whatever you want.

3. **Look at the database directly.** Open a terminal in Cursor and run:
   ```
   npx prisma studio
   ```
   A browser tab opens at `http://localhost:5555`. Click the `Ingredient` table. You'll see your ingredients as rows.
   
   This is the database. Not a metaphor for it — *the actual database*. Every row you see here is a row in `dev.db`. You can edit them, delete them, add new ones from this view. It's a window into the truth.

### Now break it

You're going to do this on purpose:

4. **Add a chaos ingredient.** Try:
   - Name: FATFATFATFATFATFATFATFATFATFAT
   - Unit: bottle
   - Cost per unit: 99999999999999999

   Submit it. Watch what happens.

   The form will probably accept it. The list will look weird. The cost might display as something nonsensical.

   **This is the lesson.** Right now, the app trusts whatever you type. There's no rule that says "names can't be 30 characters long" or "costs can't be a trillion dollars." That's called a lack of **validation**, and it's one of the most common ways real applications break.

   The next thing you and Ryan will work on — when you're ready — is adding validation: rules about what's allowed and what isn't. But the only way to *care* about validation is to see what happens without it. So now you've seen it.

5. **Clean up.** Delete the chaos rows. Keep the real ingredients if you want.

### Make a real change

When you're ready to actually customize this app, type one of these in the Cursor chat:

- "Get started"
- "Help me figure out what to build"
- "I want to plan something"

The `get-started` skill will activate. The agent will introduce itself, ask you what problem you're trying to solve, and help you write a `PLAN.md` file at the root of the project. That file becomes the anchor — every time you come back, the agent reads it and remembers what you're working on.

That's the loop. Plan, build, break, fix, learn, repeat.

---

## Where this is headed

The picture in Ryan's head is a tool you actually use behind the bar: inventory and costs, recipes that pull from real ingredients, numbers that update when a bottle price changes — not a demo that looks corporate and empty.

This template is the floor, not the ceiling. The ingredients page proves the plumbing works. The rest is whatever you and Cursor build on top, one small piece at a time.

Have fun. Break things on purpose. Ask questions. Ryan's around.
