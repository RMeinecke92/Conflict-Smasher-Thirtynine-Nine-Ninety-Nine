import Link from "next/link";
import type { ReactNode } from "react";

type LabShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function LabShell({ title, description, children }: LabShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <header className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to menu
          </Link>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}
