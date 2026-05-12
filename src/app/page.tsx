import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Welcome",
  description:
    "Landing page for your bar-inventory template — frontend, backend, database, Cursor, Git, and agents.",
};

function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
      {children}
    </code>
  );
}

const NAV_SECTIONS = [
  { href: "#things-to-remember", label: "Things to remember" },
  { href: "#what-is-a-web-app-you-ask", label: "What is a web app, you ask?" },
  {
    href: "#well-how-do-i-change-all-of-this-you-ask",
    label: "Well, how do I change all of this, you ask?",
  },
  {
    href: "#how-do-you-save-your-work",
    label: "How do you save your work? Oh, that's easy!",
  },
  {
    href: "#but-who-is-doing-the-work",
    label:
      "But who is doing the work?! Well, that's easy! You and the agents!",
  },
  {
    href: "#ah-youd-like-to-see-it-work",
    label: "Ah, you'd like to see it work? Okay, follow me!",
  },
  { href: "#where-this-is-headed", label: "Where this is headed" },
  { href: "#quick-npm-commands", label: "Quick npm commands" },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <nav
        aria-label="On this page"
        className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 md:px-8">
          <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NAV_SECTIONS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground ring-foreground/10 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {label}
              </a>
            ))}
          </div>
          <Button asChild variant="secondary" size="sm" className="shrink-0">
            <Link href="/stick-fighter">Stick fighter</Link>
          </Button>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        <header className="mb-12 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              Welcome
            </h1>
            <Button asChild variant="outline" size="sm">
              <Link href="/stick-fighter">Stick fighter minigame</Link>
            </Button>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            This is the landing page for your bar-inventory template. Everything
            below is plain text and layout in one file — you can change any of
            it.
          </p>
        </header>

        <div className="flex flex-col gap-12">
          <Card id="things-to-remember" className="scroll-mt-32">
            <CardHeader>
              <CardTitle className="font-heading text-xl font-semibold tracking-tight">
                Things to remember
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <ol className="list-decimal space-y-2 pl-5">
                <li>Things will go wrong lol</li>
                <li>Things will break</li>
                <li>That&apos;s okay do not give up.</li>
                <li>
                  Half of the battle is making a decision and sticking to it even
                  if it isn&apos;t optimal.
                </li>
                <li>
                  Be curious. Learn. Grow. Google shit. Watch youtube videos.
                  Not just about AI but about software in general.
                </li>
              </ol>
              <p>
                Before you know it you&apos;ll be creating things people have
                never dreamed of.
              </p>
            </CardContent>
          </Card>

          <Card id="what-is-a-web-app-you-ask" className="scroll-mt-32">
            <CardHeader>
              <CardTitle className="font-heading text-xl font-semibold tracking-tight">
                What is a web app, you ask?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
              <p>
                A web app is just three things working together: a{" "}
                <strong className="font-medium text-foreground">
                  frontend
                </strong>
                , a{" "}
                <strong className="font-medium text-foreground">
                  backend
                </strong>
                , and a{" "}
                <strong className="font-medium text-foreground">
                  database
                </strong>
                . You&apos;re going to learn about each one, one layer at a time.
              </p>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  The frontend
                </h3>
                <p>
                  The frontend is the part you see and click. It&apos;s the page
                  in your browser — the buttons, the forms, the text, the
                  colors.
                </p>
                <p>
                  You&apos;re looking at one right now. This entire page is the
                  frontend.
                </p>
                <p>
                  The frontend is built out of{" "}
                  <strong className="font-medium text-foreground">
                    components
                  </strong>
                  . A button is a component. A form is a component. A whole page
                  is a component built out of smaller components. They&apos;re
                  written in{" "}
                  <strong className="font-medium text-foreground">React</strong>,
                  which is a way of describing what should appear on the screen
                  and how it should react when you interact with it.
                </p>
                <p>
                  When you click a button, the frontend&apos;s job is to figure
                  out what just happened and ask the backend to do something
                  about it.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  The backend
                </h3>
                <p>
                  The backend is the part you <em>don&apos;t</em> see. It runs
                  on a computer (in your case, your own laptop while you&apos;re
                  developing, and eventually the restaurant&apos;s PC when you
                  deploy).
                </p>
                <p>
                  When the frontend says &quot;the user just submitted a form to
                  add an ingredient,&quot; the backend is what receives that
                  request, validates it, talks to the database, and sends back
                  the result.
                </p>
                <p>
                  In this template, the backend runs on something called{" "}
                  <strong className="font-medium text-foreground">
                    Next.js
                  </strong>
                  . When you type <InlineCode>npm run dev</InlineCode> in the
                  terminal, Next.js starts up and listens for requests from your
                  browser. When you stop it, the backend stops too.
                </p>
                <p>
                  The functions on the backend that the frontend can call are
                  called{" "}
                  <strong className="font-medium text-foreground">
                    server actions
                  </strong>
                  . Forms in this app post to server actions, server actions read
                  or write data, and then the page updates. That&apos;s the whole
                  pattern.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  The database
                </h3>
                <p>
                  The database is where information <em>lives</em> — even when
                  the app is closed.
                </p>
                <p>
                  If your app is a notebook, the database is the paper. The
                  frontend writes things down, the backend reads them back
                  later, and the paper remembers everything in between.
                </p>
                <p>Databases are organized into a few simple pieces:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <strong className="font-medium text-foreground">
                      Table
                    </strong>{" "}
                    — like a spreadsheet. One sheet per kind of thing. You have
                    a table called <InlineCode>Ingredient</InlineCode>.
                  </li>
                  <li>
                    <strong className="font-medium text-foreground">Row</strong>{" "}
                    — one record in that sheet. One ingredient. (Bombay
                    Sapphire, for example.)
                  </li>
                  <li>
                    <strong className="font-medium text-foreground">
                      Column
                    </strong>{" "}
                    — one attribute every record shares. Every ingredient has a
                    name, a unit, a cost.
                  </li>
                  <li>
                    <strong className="font-medium text-foreground">
                      Field
                    </strong>{" "}
                    — one cell. The intersection of one row and one column. The
                    &quot;name&quot; field of the first ingredient is
                    &quot;Bombay Sapphire.&quot;
                  </li>
                </ul>

                <div className="space-y-3">
                  <p className="font-medium text-foreground">Ingredient table</p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th
                            scope="col"
                            className="border border-border px-3 py-2 text-left font-medium text-foreground"
                          >
                            id
                          </th>
                          <th
                            scope="col"
                            className="border border-border px-3 py-2 text-left font-medium text-foreground"
                          >
                            name
                          </th>
                          <th
                            scope="col"
                            className="border border-border px-3 py-2 text-left font-medium text-foreground"
                          >
                            unit
                          </th>
                          <th
                            scope="col"
                            className="border border-border px-3 py-2 text-left font-medium text-foreground"
                          >
                            costPerUnit
                          </th>
                          <th
                            scope="col"
                            className="border border-border px-3 py-2 text-left font-medium text-foreground"
                          >
                            createdAt
                          </th>
                          <th
                            scope="col"
                            className="border border-border px-3 py-2 text-left font-medium text-foreground"
                          >
                            <span className="sr-only">Row annotation</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-border px-3 py-2 font-mono tabular-nums">
                            1
                          </td>
                          <td className="border border-border px-3 py-2">
                            <div className="flex flex-col items-center gap-1">
                              <span>Bombay Sapphire</span>
                              <span className="text-xs text-muted-foreground">
                                ↑
                              </span>
                              <span className="text-xs text-muted-foreground">
                                column
                              </span>
                            </div>
                          </td>
                          <td className="border border-border px-3 py-2">oz</td>
                          <td className="border border-border px-3 py-2 font-mono tabular-nums">
                            0.45
                          </td>
                          <td className="border border-border px-3 py-2 font-mono text-xs">
                            2026-05-10
                          </td>
                          <td className="border border-border px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                            ← row
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-border px-3 py-2 font-mono tabular-nums">
                            2
                          </td>
                          <td className="border border-border px-3 py-2">
                            Angostura Bitters
                          </td>
                          <td className="border border-border px-3 py-2">
                            dash
                          </td>
                          <td className="border border-border px-3 py-2 font-mono tabular-nums">
                            0.05
                          </td>
                          <td className="border border-border px-3 py-2 font-mono text-xs">
                            2026-05-10
                          </td>
                          <td className="border border-border px-3 py-2" />
                        </tr>
                        <tr>
                          <td className="border border-border px-3 py-2 font-mono tabular-nums">
                            3
                          </td>
                          <td className="border border-border px-3 py-2">
                            Lime Juice
                          </td>
                          <td className="border border-border px-3 py-2">oz</td>
                          <td className="border border-border px-3 py-2 font-mono tabular-nums">
                            0.12
                          </td>
                          <td className="border border-border px-3 py-2 font-mono text-xs">
                            2026-05-10
                          </td>
                          <td className="border border-border px-3 py-2" />
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <p>
                  The database you&apos;re using is called{" "}
                  <strong className="font-medium text-foreground">SQLite</strong>
                  . The entire database is just{" "}
                  <em>one file on your computer</em>, called{" "}
                  <InlineCode>dev.db</InlineCode>, sitting in the{" "}
                  <InlineCode>prisma/</InlineCode> folder. You can delete it and
                  start over if you mess it up. You can copy it to another
                  machine and the data comes with it. It&apos;s that simple.
                </p>
                <p>
                  You don&apos;t talk to the database directly. You talk to a
                  tool called{" "}
                  <strong className="font-medium text-foreground">Prisma</strong>
                  , which is a translator between TypeScript code on the backend
                  and rows in the database. You say &quot;give me all
                  ingredients,&quot; Prisma turns that into a database query, and
                  hands the rows back to you as normal TypeScript objects.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  Putting it together
                </h3>
                <p>
                  Here&apos;s the full path when you click &quot;Add
                  ingredient&quot;:
                </p>
                <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-6 text-muted-foreground">
                  <div className="w-full max-w-xl space-y-1 text-center text-sm">
                    <p className="font-medium text-foreground">
                      Browser (frontend)
                    </p>
                    <p>
                      You type &quot;Bombay Sapphire&quot; and click Add
                    </p>
                  </div>
                  <span className="text-lg text-muted-foreground" aria-hidden>
                    ↓
                  </span>
                  <div className="w-full max-w-xl space-y-1 text-center text-sm">
                    <p className="font-medium text-foreground">
                      Next.js (backend)
                    </p>
                    <p>Server action receives the form data</p>
                  </div>
                  <span className="text-lg text-muted-foreground" aria-hidden>
                    ↓
                  </span>
                  <div className="w-full max-w-xl space-y-1 text-center text-sm">
                    <p className="font-medium text-foreground">
                      Prisma (the translator)
                    </p>
                    <p>Turns it into a database write</p>
                  </div>
                  <span className="text-lg text-muted-foreground" aria-hidden>
                    ↓
                  </span>
                  <div className="w-full max-w-xl space-y-1 text-center text-sm">
                    <p className="font-medium text-foreground">
                      SQLite (the database file)
                    </p>
                    <p>Saves the row to dev.db</p>
                  </div>
                  <span className="text-lg text-muted-foreground" aria-hidden>
                    ↓
                  </span>
                  <div className="w-full max-w-xl space-y-1 text-center text-sm">
                    <p className="font-medium text-foreground">
                      Page refreshes
                    </p>
                    <p>You see the new ingredient in the list</p>
                  </div>
                </div>
                <p>
                  That&apos;s it. That&apos;s a web app. Everything else is just
                  doing more of this same dance for different kinds of data.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            id="well-how-do-i-change-all-of-this-you-ask"
            className="scroll-mt-32"
          >
            <CardHeader>
              <CardTitle className="font-heading text-xl font-semibold tracking-tight">
                Well, how do I change all of this, you ask?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
              <p>
                You change it with{" "}
                <strong className="font-medium text-foreground">Cursor</strong>,
                the editor you&apos;re reading this in right now.
              </p>
              <p>
                Cursor looks like a normal code editor, but with an AI assistant
                built in. You don&apos;t need to memorize what&apos;s where —
                come back to this page when you forget.
              </p>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  The left side: file explorer
                </h3>
                <p>
                  The left panel shows every file and folder in your project.
                  This is your map.
                </p>
                <p>Some folders you&apos;ll touch often:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <InlineCode>src/app/</InlineCode> — the pages of your app.
                    Each folder with a <InlineCode>page.tsx</InlineCode> is a
                    URL. <InlineCode>src/app/ingredients/page.tsx</InlineCode> is
                    the page you see at <InlineCode>/ingredients</InlineCode>.
                  </li>
                  <li>
                    <InlineCode>src/components/ui/</InlineCode> — pre-built
                    buttons, cards, and forms. You add new ones with{" "}
                    <InlineCode>npx shadcn@latest add &lt;name&gt;</InlineCode>{" "}
                    when you need them.
                  </li>
                  <li>
                    <InlineCode>src/lib/</InlineCode> — shared helpers (for
                    example, the file that opens your database connection).
                  </li>
                  <li>
                    <InlineCode>prisma/schema.prisma</InlineCode> — the shape of
                    your database. When you want to change what columns or
                    tables exist, you edit this file.
                  </li>
                </ul>
                <p>
                  To open a file, click it. To change what this welcome screen
                  says, open <InlineCode>src/app/page.tsx</InlineCode>.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  The bottom: the terminal
                </h3>
                <p>
                  The bottom panel is the{" "}
                  <strong className="font-medium text-foreground">
                    terminal
                  </strong>{" "}
                  — where you type commands.
                </p>
                <p>The commands you&apos;ll use most often:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <InlineCode>npm run dev</InlineCode> — start the app. After
                    this runs, open{" "}
                    <InlineCode>http://localhost:3000</InlineCode> in your
                    browser.
                  </li>
                  <li>
                    <InlineCode>npx prisma studio</InlineCode> — open a friendly
                    view of your database in the browser.
                  </li>
                  <li>
                    <InlineCode>
                      npx prisma migrate dev --name &lt;something&gt;
                    </InlineCode>{" "}
                    — apply a change you made to{" "}
                    <InlineCode>schema.prisma</InlineCode>. More on this later.
                  </li>
                </ul>
                <p>
                  If the terminal isn&apos;t showing, you can open it with the
                  keyboard shortcut{" "}
                  <InlineCode>Ctrl+`</InlineCode> (control + backtick — the
                  key above Tab).
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  The right side: the chat with the agent
                </h3>
                <p>The right panel is where you talk to the AI assistant.</p>
                <p>
                  You type in plain English. You ask questions. You describe
                  what you want. The agent reads your code, asks clarifying
                  questions, and (when you ask it to) makes changes.
                </p>
                <p>
                  For now, you&apos;re going to use it in{" "}
                  <strong className="font-medium text-foreground">
                    editor mode
                  </strong>{" "}
                  — the agent helps you write and explains things, but you stay
                  in the driver&apos;s seat. Ryan will set this up for you in
                  person. Don&apos;t worry about the other modes yet.
                </p>
                <p>
                  When the agent suggests changes,{" "}
                  <em>read them before you accept</em>. Even good agents make
                  mistakes. Especially when you&apos;re new, you should be the
                  second pair of eyes on every change.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  Rules — the agent&apos;s standing instructions
                </h3>
                <p>
                  In your project, there&apos;s a folder called{" "}
                  <InlineCode>.cursor/rules/</InlineCode>. These are the agent&apos;s{" "}
                  <strong className="font-medium text-foreground">rules</strong> —
                  instructions it reads every time you start a conversation.
                </p>
                <p>The rules in this template tell the agent:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Who you are (a bar manager learning to build software)</li>
                  <li>
                    What kind of code to write (boring, well-commented,
                    beginner-friendly)
                  </li>
                  <li>
                    What patterns to use (server actions, Prisma migrations,
                    shadcn components)
                  </li>
                  <li>
                    How to behave (read before writing, verify changes worked,
                    ask when uncertain)
                  </li>
                </ul>
                <p>
                  You don&apos;t have to read the rules yourself. They run in the
                  background. But they&apos;re the reason the agent will explain
                  things to you instead of dumping clever code on your screen.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  Skills — the agent&apos;s playbook for specific moments
                </h3>
                <p>
                  Inside <InlineCode>.cursor/skills/</InlineCode> are folders
                  called{" "}
                  <strong className="font-medium text-foreground">skills</strong>
                  . Each skill is a workflow the agent knows how to run when you
                  ask for it.
                </p>
                <p>The template comes with a few:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <InlineCode>get-started</InlineCode> — invoke this when
                    you&apos;re not sure what to build. It walks you through the
                    questions that lead to a plan.
                  </li>
                  <li>
                    <InlineCode>lets-continue</InlineCode> — invoke this when you
                    come back after a few days and forget where you were. It
                    catches you up.
                  </li>
                  <li>
                    <InlineCode>grill-me</InlineCode> — invoke this before
                    building something complex. It makes the agent ask you tough
                    questions before writing any code.
                  </li>
                  <li>
                    <InlineCode>phase-briefings</InlineCode> — invoke this when
                    you&apos;re working through a saved plan and want the next
                    phase explained before anything changes.
                  </li>
                </ul>
                <p>
                  You invoke a skill by typing its name (or something close to
                  it) in the chat. &quot;Get started&quot; works. &quot;Help me
                  start&quot; works. The agent figures it out.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  The left side, again: source control (Git)
                </h3>
                <p>
                  There&apos;s a second icon on the left side that shows{" "}
                  <strong className="font-medium text-foreground">Git</strong> —
                  your project&apos;s history.
                </p>
                <p>
                  Git keeps a record of every version of your code. Every time
                  you save a snapshot, you can come back to it later. If you
                  break something, Git lets you go back to when it worked.
                </p>
                <p>
                  You&apos;ll see this panel light up when you change files.
                  You&apos;ll learn to use it slowly — Ryan will walk you through
                  the workflow in person.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card id="how-do-you-save-your-work" className="scroll-mt-32">
            <CardHeader>
              <CardTitle className="font-heading text-xl font-semibold tracking-tight">
                How do you save your work? Oh, that&apos;s easy!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
              <p>
                Saving your work happens in two places: your computer (Git) and
                the internet (GitHub).
              </p>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  What is GitHub?
                </h3>
                <p>
                  GitHub is a website that stores Git repositories online. Think
                  of it as cloud storage for your code, except it also tracks
                  every change you&apos;ve ever made.
                </p>
                <p>
                  When you &quot;push&quot; to GitHub, your code on your laptop
                  gets copied up to the website. When you &quot;pull&quot; from
                  GitHub, the latest version on the website gets copied down to
                  your laptop. That&apos;s the whole idea.
                </p>
                <p>Two reasons this matters:</p>
                <ol className="list-decimal space-y-2 pl-5">
                  <li>If your laptop dies, your code is safe.</li>
                  <li>
                    If you want to work on the same project from a different
                    machine — or share it with someone — GitHub is how.
                  </li>
                </ol>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  Your three branches
                </h3>
                <p>
                  A <strong className="font-medium text-foreground">branch</strong>{" "}
                  in Git is a parallel version of your project. You can have
                  multiple branches and switch between them, and changes in one
                  branch don&apos;t affect the others until you choose to
                  combine them.
                </p>
                <p>Your project will have three:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <InlineCode>main</InlineCode> — the stable, working version of
                    your app. Don&apos;t experiment here. This is the version that
                    runs at the bar.
                  </li>
                  <li>
                    <InlineCode>updates</InlineCode> — where you try new things,
                    build features, and break stuff. When something works on{" "}
                    <InlineCode>updates</InlineCode>, you copy it to{" "}
                    <InlineCode>main</InlineCode>. When it breaks, no harm done —{" "}
                    <InlineCode>main</InlineCode> is still safe.
                  </li>
                  <li>
                    <InlineCode>restore</InlineCode> — a safety net. A clean copy
                    of the template you can always fall back to if everything
                    goes sideways.
                  </li>
                </ul>
                <p>
                  This is the same pattern Ryan uses at work. Three branches,
                  clear roles, no surprises.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  The commands
                </h3>
                <p>
                  You don&apos;t need to memorize these — Cursor has buttons for
                  all of them in the Git panel. But for reference:
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <InlineCode>git status</InlineCode> — what changed since the
                    last save
                  </li>
                  <li>
                    <InlineCode>git add .</InlineCode> — stage all changes for
                    the next snapshot
                  </li>
                  <li>
                    <InlineCode>git commit -m &quot;your message&quot;</InlineCode>{" "}
                    — take a snapshot with a label
                  </li>
                  <li>
                    <InlineCode>git push</InlineCode> — send snapshots up to
                    GitHub
                  </li>
                  <li>
                    <InlineCode>git pull</InlineCode> — get the latest snapshots
                    down from GitHub
                  </li>
                  <li>
                    <InlineCode>git checkout &lt;branch-name&gt;</InlineCode> —
                    switch to a different branch
                  </li>
                </ul>
                <p>
                  In practice you&apos;ll use the Git panel in Cursor&apos;s left
                  sidebar. Click a button instead of typing. Same thing.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card id="but-who-is-doing-the-work" className="scroll-mt-32">
            <CardHeader>
              <CardTitle className="font-heading text-xl font-semibold tracking-tight">
                But who is doing the work?! Well, that&apos;s easy! You and the
                agents!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
              <p>
                Cursor doesn&apos;t have one AI — it has several. Each one has
                different strengths, different costs, and different speeds.
                You&apos;ll pick which one to use based on what you&apos;re doing.
              </p>
              <p>You have access to these on your Pro plan:</p>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  Composer 2 (Fast)
                </h3>
                <p>
                  Cursor&apos;s own model.{" "}
                  <strong className="font-medium text-foreground">
                    Fast and cheap.
                  </strong>{" "}
                  Good for mechanical work: scaffolding a new page, adding a
                  component, renaming things, simple bug fixes. Default for
                  low-stakes tasks.
                </p>
                <p>
                  Tradeoff: it&apos;s eager. It&apos;ll happily produce a
                  confident wrong answer if you&apos;re not paying attention.
                  Watch it carefully on anything complex.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  Claude Opus 4.7
                </h3>
                <p>
                  Anthropic&apos;s strongest model.{" "}
                  <strong className="font-medium text-foreground">
                    Best judgment, slowest, most expensive.
                  </strong>{" "}
                  Use this for architecture decisions, debugging gnarly problems,
                  or anything where being wrong is costly. If you&apos;re stuck
                  and Composer keeps making the problem worse, switch to Opus
                  4.7 and ask the same question.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  Claude Opus 4.6
                </h3>
                <p>
                  The previous version of Opus. Still excellent. Slightly cheaper
                  than 4.7. A good fallback when 4.7 is rate-limited or busy.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  Claude Sonnet 4.5
                </h3>
                <p>
                  Anthropic&apos;s middle-tier model.{" "}
                  <strong className="font-medium text-foreground">
                    Significantly cheaper than Opus, still strong reasoning.
                  </strong>{" "}
                  This is the sweet spot for most feature work — when Composer
                  isn&apos;t quite enough but Opus is overkill, use Sonnet.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  GPT-5.5 (Medium)
                </h3>
                <p>
                  OpenAI&apos;s offering. Different &quot;personality&quot; than
                  Claude — sometimes better at certain things, sometimes worse.
                  Useful as a second opinion. If Claude and you are talking past
                  each other, try GPT.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  A simple starting heuristic
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th
                          scope="col"
                          className="border border-border px-3 py-2 text-left font-medium text-foreground"
                        >
                          What you&apos;re doing
                        </th>
                        <th
                          scope="col"
                          className="border border-border px-3 py-2 text-left font-medium text-foreground"
                        >
                          Try first
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border px-3 py-2">
                          &quot;Add a button,&quot; &quot;rename this file,&quot;
                          small mechanical edits
                        </td>
                        <td className="border border-border px-3 py-2">
                          Composer 2
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-border px-3 py-2">
                          Build a new feature, write a server action, design a
                          page
                        </td>
                        <td className="border border-border px-3 py-2">
                          Sonnet 4.5
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-border px-3 py-2">
                          Debug something weird, plan architecture, decide between
                          approaches
                        </td>
                        <td className="border border-border px-3 py-2">
                          Opus 4.7
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  You can switch models mid-conversation. There&apos;s no penalty.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  What is a token?
                </h3>
                <p>
                  Agents read and write in{" "}
                  <strong className="font-medium text-foreground">tokens</strong>.
                  A token is roughly a word, or part of a word
                  (&quot;ingredient&quot; might be one token;
                  &quot;Bombay&quot; might be split into two).
                </p>
                <p>
                  Every time the agent reads a file, it costs tokens. Every time
                  it writes a reply, it costs tokens. Bigger problems cost more
                  tokens.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  What is a context window?
                </h3>
                <p>
                  A{" "}
                  <strong className="font-medium text-foreground">
                    context window
                  </strong>{" "}
                  is how much the agent can hold in its head at one time. If your
                  problem fits in the window, the agent can reason about all of
                  it. If it doesn&apos;t, some of it has to be forgotten or
                  summarized.
                </p>
                <p>
                  Practical implication:{" "}
                  <strong className="font-medium text-foreground">
                    don&apos;t dump the whole codebase on it.
                  </strong>{" "}
                  Point it at the specific files that matter. &quot;Look at{" "}
                  <InlineCode>src/app/ingredients/page.tsx</InlineCode> and add a
                  category field&quot; is much better than &quot;look at
                  everything and figure out what to do.&quot;
                </p>
                <p>
                  The Pro plan gives you generous limits, but tokens cost money on
                  Cursor&apos;s end, and you&apos;ll hit usage caps if you waste
                  them. Be specific.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card id="ah-youd-like-to-see-it-work" className="scroll-mt-32">
            <CardHeader>
              <CardTitle className="font-heading text-xl font-semibold tracking-tight">
                Ah, you&apos;d like to see it work? Okay, follow me!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/stick-fighter">Play stick fighter</Link>
                </Button>
              </div>
              <p>
                Scroll up to the{" "}
                <strong className="font-medium text-foreground">
                  &quot;Add an ingredient&quot;
                </strong>{" "}
                button on this page. Click it.
              </p>
              <p>
                You&apos;re now on <InlineCode>/ingredients</InlineCode> — a real
                working page. It has a form, a list, and delete buttons. The form
                posts to a server action, which uses Prisma to write to SQLite.
                Exactly the pipeline you just learned about.
              </p>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  Try it
                </h3>
                <ol className="list-decimal space-y-4 pl-5">
                  <li>
                    <div className="space-y-2">
                      <p>
                        <strong className="font-medium text-foreground">
                          Add an ingredient that you actually use.
                        </strong>{" "}
                        Try something like:
                      </p>
                      <ul className="list-disc space-y-1 pl-5">
                        <li>Name: Bombay Sapphire Gin</li>
                        <li>Unit: oz</li>
                        <li>Cost per unit: 0.45</li>
                        <li>Submit.</li>
                      </ul>
                      <p>
                        You should see it appear in the list below the form.
                        That&apos;s the frontend reflecting what the backend just
                        saved to the database.
                      </p>
                    </div>
                  </li>
                  <li>
                    <p>
                      <strong className="font-medium text-foreground">
                        Add a couple more.
                      </strong>{" "}
                      Angostura Bitters at $0.05 per dash. Lime juice at $0.12
                      per oz. Whatever you want.
                    </p>
                  </li>
                  <li>
                    <div className="space-y-2">
                      <p>
                        <strong className="font-medium text-foreground">
                          Look at the database directly.
                        </strong>{" "}
                        Open a terminal in Cursor and run:
                      </p>
                      <pre className="overflow-x-auto rounded-lg border border-border bg-muted p-4 font-mono text-sm text-foreground">
                        <code>npx prisma studio</code>
                      </pre>
                      <p>
                        A browser tab opens at{" "}
                        <InlineCode>http://localhost:5555</InlineCode>. Click the{" "}
                        <InlineCode>Ingredient</InlineCode> table. You&apos;ll
                        see your ingredients as rows.
                      </p>
                      <p>
                        This is the database. Not a metaphor for it —{" "}
                        <em>the actual database</em>. Every row you see here is a
                        row in <InlineCode>dev.db</InlineCode>. You can edit them,
                        delete them, add new ones from this view. It&apos;s a
                        window into the truth.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  Now break it
                </h3>
                <p>You&apos;re going to do this on purpose:</p>
                <ol className="list-decimal space-y-4 pl-5" start={4}>
                  <li>
                    <div className="space-y-2">
                      <p>
                        <strong className="font-medium text-foreground">
                          Add a chaos ingredient.
                        </strong>{" "}
                        Try:
                      </p>
                      <ul className="list-disc space-y-1 pl-5">
                        <li>Name: FATFATFATFATFATFATFATFATFATFAT</li>
                        <li>Unit: bottle</li>
                        <li>Cost per unit: 99999999999999999</li>
                      </ul>
                      <p>Submit it. Watch what happens.</p>
                      <p>
                        The form will probably accept it. The list will look
                        weird. The cost might display as something nonsensical.
                      </p>
                      <p>
                        <strong className="font-medium text-foreground">
                          This is the lesson.
                        </strong>{" "}
                        Right now, the app trusts whatever you type. There&apos;s
                        no rule that says &quot;names can&apos;t be 30 characters
                        long&quot; or &quot;costs can&apos;t be a trillion
                        dollars.&quot; That&apos;s called a lack of{" "}
                        <strong className="font-medium text-foreground">
                          validation
                        </strong>
                        , and it&apos;s one of the most common ways real
                        applications break.
                      </p>
                      <p>
                        The next thing you and Ryan will work on — when
                        you&apos;re ready — is adding validation: rules about
                        what&apos;s allowed and what isn&apos;t. But the only way
                        to <em>care</em> about validation is to see what happens
                        without it. So now you&apos;ve seen it.
                      </p>
                    </div>
                  </li>
                  <li>
                    <p>
                      <strong className="font-medium text-foreground">
                        Clean up.
                      </strong>{" "}
                      Delete the chaos rows. Keep the real ingredients if you
                      want.
                    </p>
                  </li>
                </ol>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  Make a real change
                </h3>
                <p>
                  When you&apos;re ready to actually customize this app, type one
                  of these in the Cursor chat:
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>&quot;Get started&quot;</li>
                  <li>&quot;Help me figure out what to build&quot;</li>
                  <li>&quot;I want to plan something&quot;</li>
                </ul>
                <p>
                  The <InlineCode>get-started</InlineCode> skill will activate.
                  The agent will introduce itself, ask you what problem you&apos;re
                  trying to solve, and help you write a{" "}
                  <InlineCode>PLAN.md</InlineCode> file at the root of the
                  project. That file becomes the anchor — every time you come
                  back, the agent reads it and remembers what you&apos;re working
                  on.
                </p>
                <p>
                  That&apos;s the loop. Plan, build, break, fix, learn, repeat.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card id="where-this-is-headed" className="scroll-mt-32">
            <CardHeader>
              <CardTitle className="font-heading text-xl font-semibold tracking-tight">
                Where this is headed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                The picture in Ryan&apos;s head is a tool you actually use behind
                the bar: inventory and costs, recipes that pull from real
                ingredients, numbers that update when a bottle price changes —
                not a demo that looks corporate and empty.
              </p>
              <p>
                This template is the floor, not the ceiling. The ingredients page
                proves the plumbing works. The rest is whatever you and Cursor
                build on top, one small piece at a time.
              </p>
              <p>
                Have fun. Break things on purpose. Ask questions. Ryan&apos;s
                around.
              </p>
            </CardContent>
          </Card>

          <Card id="quick-npm-commands" className="scroll-mt-32">
            <CardHeader>
              <CardTitle className="font-heading text-xl font-semibold tracking-tight">
                Quick npm commands
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Run these from the project folder in the terminal (same place as{" "}
                <InlineCode>package.json</InlineCode>).
              </p>
              <ul className="space-y-3">
                <li>
                  <InlineCode>npm install</InlineCode> — install dependencies
                  (run once after cloning, or when packages change).
                </li>
                <li>
                  <InlineCode>npm run dev</InlineCode> — start the app in
                  development mode; open{" "}
                  <InlineCode>http://localhost:3000</InlineCode>.
                </li>
                <li>
                  <InlineCode>npm run build</InlineCode> — create a production
                  build (checks that everything compiles).
                </li>
                <li>
                  <InlineCode>npm run start</InlineCode> — serve the production
                  build locally (run <InlineCode>npm run build</InlineCode>{" "}
                  first).
                </li>
                <li>
                  <InlineCode>npm run lint</InlineCode> — run ESLint on the
                  codebase.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
