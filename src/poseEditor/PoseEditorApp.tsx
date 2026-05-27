"use client";

import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import samplePose from "./knight_longGuard.json";
import { mirrorPose } from "./mirror";
import { downloadPoseJson, parsePoseJson } from "./pose-io";
import { clampJointAngle, PoseCanvas, type ReferenceImageState } from "./PoseCanvas";
import { PoseLibrary } from "./PoseLibrary";
import { ReferenceImageControls } from "./ReferenceImageControls";
import { SliderPanel } from "./SliderPanel";
import { createTPose } from "./tpose";
import type { JointKey, PoseJSON } from "./types";

const DEFAULT_REFERENCE: ReferenceImageState = {
  url: null,
  opacity: 0.45,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
};

function clonePose(pose: PoseJSON): PoseJSON {
  return {
    ...pose,
    rootPosition: { ...pose.rootPosition },
    joints: { ...pose.joints },
  };
}

export function PoseEditorApp() {
  const [pose, setPose] = useState<PoseJSON>(() => createTPose());
  const [library, setLibrary] = useState<PoseJSON[]>([]);
  const [activeJoint, setActiveJoint] = useState<JointKey | null>(null);
  const [referenceImage, setReferenceImage] =
    useState<ReferenceImageState>(DEFAULT_REFERENCE);
  const [loadError, setLoadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updatePose = useCallback((next: PoseJSON) => {
    setPose(clonePose(next));
    setLoadError(null);
  }, []);

  const handleJointAngleChange = useCallback(
    (joint: JointKey, angle: number) => {
      setPose((current) => ({
        ...current,
        joints: {
          ...current.joints,
          [joint]: clampJointAngle(joint, angle),
        },
      }));
    },
    [],
  );

  const saveToLibrary = () => {
    setLibrary((current) => {
      const without = current.filter((p) => p.name !== pose.name);
      return [...without, clonePose(pose)];
    });
  };

  const loadFromLibrary = (entry: PoseJSON) => {
    updatePose(entry);
  };

  const removeFromLibrary = (name: string) => {
    setLibrary((current) => current.filter((p) => p.name !== name));
  };

  const resetTPose = () => {
    updatePose(createTPose(pose.name, pose.character));
    setActiveJoint(null);
  };

  const handleMirror = () => {
    const mirrored = mirrorPose(pose);
    updatePose(mirrored);
    setLibrary((current) => {
      const without = current.filter((p) => p.name !== mirrored.name);
      return [...without, clonePose(mirrored)];
    });
  };

  const handleDownload = () => {
    downloadPoseJson(pose);
    saveToLibrary();
  };

  const handleLoadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const loaded = parsePoseJson(text);
      updatePose(loaded);
      setLibrary((current) => {
        const without = current.filter((p) => p.name !== loaded.name);
        return [...without, clonePose(loaded)];
      });
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to parse pose JSON",
      );
    } finally {
      event.target.value = "";
    }
  };

  const loadSample = () => {
    updatePose(samplePose as PoseJSON);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">Pose Authoring Tool</h1>
            <p className="text-xs text-slate-400">
              Static skeleton poses for PD controller targets — no physics on
              this page.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={resetTPose}>
              Reset T-pose
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={handleMirror}>
              Mirror pose
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={loadSample}>
              Load sample
            </Button>
            <Button type="button" size="sm" onClick={handleDownload}>
              Save JSON
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Load JSON
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleLoadFile}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-4">
          <PoseCanvas
            pose={pose}
            referenceImage={referenceImage}
            activeJoint={activeJoint}
            onJointAngleChange={handleJointAngleChange}
            onActiveJointChange={setActiveJoint}
          />

          <div className="grid gap-3 rounded-md border border-slate-800 bg-slate-900/50 p-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pose-name">Pose name</Label>
              <Input
                id="pose-name"
                value={pose.name}
                onChange={(event) =>
                  setPose((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pose-character">Character</Label>
              <Input
                id="pose-character"
                value={pose.character}
                onChange={(event) =>
                  setPose((current) => ({
                    ...current,
                    character: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="pose-notes">Notes</Label>
              <Input
                id="pose-notes"
                value={pose.notes ?? ""}
                placeholder="Optional authoring notes"
                onChange={(event) =>
                  setPose((current) => ({
                    ...current,
                    notes: event.target.value || undefined,
                  }))
                }
              />
            </div>
          </div>

          {loadError ? (
            <p className="text-sm text-red-400" role="alert">
              {loadError}
            </p>
          ) : null}
        </section>

        <aside className="space-y-4">
          <div className="rounded-md border border-slate-800 bg-slate-900/50 p-3">
            <PoseLibrary
              poses={library}
              activeName={pose.name}
              onSelect={loadFromLibrary}
              onRemove={removeFromLibrary}
            />
          </div>
          <div className="rounded-md border border-slate-800 bg-slate-900/50 p-3">
            <ReferenceImageControls
              referenceImage={referenceImage}
              onChange={setReferenceImage}
            />
          </div>
          <div className="rounded-md border border-slate-800 bg-slate-900/50 p-3">
            <SliderPanel
              pose={pose}
              activeJoint={activeJoint}
              onJointAngleChange={handleJointAngleChange}
              onActiveJointChange={setActiveJoint}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={saveToLibrary}
          >
            Add current pose to library
          </Button>
        </aside>
      </main>
    </div>
  );
}
