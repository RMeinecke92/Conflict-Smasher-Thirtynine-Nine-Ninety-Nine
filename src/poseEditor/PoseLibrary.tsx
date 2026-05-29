"use client";

import { Button } from "@/components/ui/button";

import type { PoseJSON } from "./types";

type PoseLibraryProps = {
  poses: PoseJSON[];
  activeName: string;
  onSelect: (pose: PoseJSON) => void;
  onRemove: (name: string) => void;
};

export function PoseLibrary({
  poses,
  activeName,
  onSelect,
  onRemove,
}: PoseLibraryProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-200">Session library</h2>
      <p className="text-xs text-slate-400">
        Poses saved this session. Reload clears the list.
      </p>
      {poses.length === 0 ? (
        <p className="text-xs text-slate-500 italic">No poses saved yet.</p>
      ) : (
        <ul className="space-y-2">
          {poses.map((pose) => {
            const selected = pose.name === activeName;
            return (
              <li
                key={pose.name}
                className={`flex items-center gap-2 rounded-md border px-2 py-1.5 ${
                  selected
                    ? "border-sky-400/60 bg-sky-400/10"
                    : "border-slate-700 bg-slate-900/40"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(pose)}
                  className="min-w-0 flex-1 truncate text-left text-sm text-slate-200 hover:text-white"
                >
                  {pose.name}
                  <span className="ml-2 text-xs text-slate-500">
                    {pose.character}
                  </span>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-slate-400 hover:text-red-300"
                  onClick={() => onRemove(pose.name)}
                >
                  Remove
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
