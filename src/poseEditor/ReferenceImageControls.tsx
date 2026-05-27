"use client";

import { Label } from "@/components/ui/label";

import type { ReferenceImageState } from "./PoseCanvas";

type ReferenceImageControlsProps = {
  referenceImage: ReferenceImageState;
  onChange: (next: ReferenceImageState) => void;
};

export function ReferenceImageControls({
  referenceImage,
  onChange,
}: ReferenceImageControlsProps) {
  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (referenceImage.url) {
      URL.revokeObjectURL(referenceImage.url);
    }

    onChange({
      ...referenceImage,
      url: URL.createObjectURL(file),
    });
    event.target.value = "";
  };

  const clearImage = () => {
    if (referenceImage.url) {
      URL.revokeObjectURL(referenceImage.url);
    }
    onChange({
      url: null,
      opacity: referenceImage.opacity,
      scale: referenceImage.scale,
      offsetX: referenceImage.offsetX,
      offsetY: referenceImage.offsetY,
    });
  };

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-200">Reference image</h2>
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700">
          Load image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </label>
        {referenceImage.url ? (
          <button
            type="button"
            onClick={clearImage}
            className="rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
          >
            Clear
          </button>
        ) : null}
      </div>

      <SliderRow
        label="Opacity"
        value={referenceImage.opacity}
        min={0}
        max={1}
        step={0.01}
        display={`${Math.round(referenceImage.opacity * 100)}%`}
        onChange={(opacity) => onChange({ ...referenceImage, opacity })}
      />
      <SliderRow
        label="Scale"
        value={referenceImage.scale}
        min={0.1}
        max={3}
        step={0.01}
        display={`${referenceImage.scale.toFixed(2)}×`}
        onChange={(scale) => onChange({ ...referenceImage, scale })}
      />
      <SliderRow
        label="Offset X"
        value={referenceImage.offsetX}
        min={-400}
        max={400}
        step={1}
        display={`${referenceImage.offsetX}px`}
        onChange={(offsetX) => onChange({ ...referenceImage, offsetX })}
      />
      <SliderRow
        label="Offset Y"
        value={referenceImage.offsetY}
        min={-400}
        max={400}
        step={1}
        display={`${referenceImage.offsetY}px`}
        onChange={(offsetY) => onChange({ ...referenceImage, offsetY })}
      />
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <Label className="text-xs text-slate-300">{label}</Label>
        <span className="font-mono text-xs text-slate-400">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-sky-400"
      />
    </div>
  );
}
