# Pose Authoring Tool

Standalone editor for **static** stick-fighter skeleton poses. Output JSON files are intended as PD controller targets for the main game — this page has **no physics, animation, or combat simulation**.

## Run the editor

From the repo root:

```bash
npm run dev
```

Open [http://localhost:3000/pose-editor](http://localhost:3000/pose-editor).

## Coordinate conventions

- **Canvas Y-axis points down** (standard HTML canvas). Screen “up” is negative Y — keep this in mind when aligning reference art.
- **Character faces +X** (screen-right) in the default bind pose.
- **Joint angles** are stored in **radians** in JSON; the UI shows **degrees**.
- Angles are measured **relative to the parent segment**, with bind-pose offsets so all zeros produce an upright T-pose.

## Workflow

1. Start from **Reset T-pose** or **Load sample** (`knight_longGuard.json`).
2. Drag joint handles on the canvas **or** use the slider panel (both stay in sync).
3. Optionally load a **reference image** behind the skeleton; adjust opacity, scale, and offset to line up anatomy.
4. Set pose **name**, **character**, and optional **notes**.
5. **Save JSON** downloads `{name}.json`. **Load JSON** imports a file via the picker.
6. **Mirror pose** swaps left/right joints and negates symmetric angles; the mirrored pose is added to the session library.
7. **Add current pose to library** keeps poses in a sidebar list for this browser session (not persisted across reload).

## JSON format

See `types.ts` for `PoseJSON`. Example checked in: `knight_longGuard.json`.

## Tests

```bash
npm test
```

Unit tests cover forward kinematics layout and the mirror transform in `kinematics.test.ts` and `mirror.test.ts`.

## File layout

| File | Purpose |
|------|---------|
| `types.ts` | `PoseJSON` and skeleton types |
| `constants.ts` | Segment lengths, bind offsets, canvas size |
| `kinematics.ts` | Forward kinematics and drag angle math |
| `mirror.ts` | Left-right mirror transform |
| `tpose.ts` | Default T-pose factory |
| `pose-io.ts` | Parse, validate, download JSON |
| `PoseEditorApp.tsx` | Main UI shell |
| `PoseCanvas.tsx` | Canvas renderer and joint dragging |
| `SliderPanel.tsx` | Per-joint sliders |
| `PoseLibrary.tsx` | Session pose list |
| `ReferenceImageControls.tsx` | Reference image overlay controls |
