# Stick Fighter — Master Plan

**This is the work list.** Living roadmap for the stick-fighting minigame (`/`). Agents and humans use this file to track what is done, what is in progress, and what comes next. Execute here — not from the vision doc.

**Near-term goal (human stated):** two stick figures hitting each other in a way that feels fun. Physics standing, campaign art, and stylized renderers are out of scope until this plan says otherwise.

**Long-term vision (optional reading):** [`Docs/Master-Stroke.md`](Docs/Master-Stroke.md) — *Master Stroke* as an ideal on the horizon (narrative, art-history thesis, far-future mechanics). Read for “why” and to avoid losing the dream; **do not** treat it as the next sprint, a promise of what ships soon, or a second backlog. When in doubt, pick the next unchecked item below.

**Primary code areas**

| Area | Path |
|------|------|
| Simulation (combat truth) | `src/lib/stick-fighter/simulation.ts` |
| CPU opponent | `src/lib/stick-fighter/cpu.ts` |
| Canvas, input, HUD | `src/components/stick-fighter-game.tsx` |
| Home page shell | `src/app/page.tsx` |
| Character data (phase 5+) | `src/lib/stick-fighter/characters.ts` *(planned)* |
| LLM taunt route (phase 10+) | `src/app/api/stick-fighter/taunt/route.ts` *(planned)* |

**Status legend**

| Mark | Meaning |
|------|---------|
| `[ ]` | Not started |
| `[~]` | In progress — only one phase/item should be `[~]` at a time |
| `[x]` | Complete — verified in code and/or noted in git history |

**Agents:** read `.cursor/rules/stick-fighter-master-plan.mdc` before changing stick-fighter code. Update this file when you start work, finish work, or learn the plan is stale.

---

## Currently active

| Field | Value |
|-------|-------|
| **Phase** | *(none — next unchecked: phase 3 game feel)* |
| **Item** | *(none)* |
| **Agent note** | Phase 2 complete — Kyle playtested Practice mode; menu + stand-still dummy + auto-reset verified. |
| **Last updated** | 2026-05-25 |

---

## Foundation (baseline — complete)

Work that exists today and future phases build on.

- [x] **Geometric combat system** — five attacks, two blocks, hitbox/hurtbox/guard resolution (`simulation.ts`; landed in commit `fad9981`).
- [x] **Game at home page** — `/` is title screen + main menu; Vs/Practice/Multiplayer on separate routes (`page.tsx`, `/vs`, `/practice`; was direct game in `fad9981`).
- [x] **Procedural stick animations** — poses driven by sim state in `drawStick()` (`stick-fighter-game.tsx`; no sprite sheets yet).
- [x] **Single-round win state** — one fight to 0 HP, overlay, Space/Enter rematch (`roundOver` in sim + component).
- [x] **CPU opponent** — reactive AI for P2, Easy/Normal/Hard, VS CPU toggle (`cpu.ts` + component wiring; `17a0ffb`).

---

## Near term — local play (best ROI)

Polish solo and couch play before networking or deployment.

### 1. Round flow [x]

- [x] Best-of-3 (or configurable) match scoring across rounds
- [x] Clear round/match win UI (round counter, “Round 2”, “Red wins match”)
- [x] Rematch flow that resets fight state without full page reload
- [x] Optional: short between-round countdown

**Done when:** two players (or vs CPU) can play a full best-of-3 with obvious who won the match.

### 2. Training mode [x]

- [x] Main menu — title screen at `/`, routes for Vs / Practice / Multiplayer (`stick-fighter-home.tsx`, `/vs`, `/practice`, `/multiplayer`)
- [x] Practice mode — single-round auto-reset, no BO3 overlays; P2 CPU/Human toggle retained
- [x] Stand-still training dummy (`dummy.ts`)

**Done when:** player can practice without fighting a full CPU. ✓ Kyle playtested Practice — dummy, auto-reset, and P2 toggle work.

**Deferred (optional later pass):** block-neutral / block-low / whiff dummy behaviors and training HUD hints — not required to close this phase.

### 3. Game feel

- [ ] Hitstop — brief sim pause on hit/block connect (2–6 ticks)
- [ ] Screen shake on heavy hits (render-only, sim unchanged)
- [ ] Simple SFX — hit, block, whiff, round end (Web Audio or small files in `public/`)
- [ ] Optional: damage flash intensity tied to attack type

**Done when:** hits feel noticeably heavier; audio works on localhost without breaking determinism for future netplay.

### 4. Gamepad (P1)

- [ ] Poll Gamepad API each frame (`navigator.getGamepads()`)
- [ ] Map standard gamepad to P1 `PlayerInput` (stick/d-pad move, face buttons attack/block/jump)
- [ ] “Press a button to connect” prompt; focus canvas note updated
- [ ] Keyboard P1 still works when no pad connected

**Done when:** Xbox-style Bluetooth pad drives P1 on Chrome/Windows alongside existing keyboard.

### 5. Characters

- [ ] Character select before round (or simple cycle on character screen)
- [ ] Per-character stats or weapon defaults (speed, damage, reach — data-driven from a table)
- [ ] **`personalityPrompt`** per character (short voice description for phase 10 LLM taunts)
- [ ] Distinct colors/silhouette or pose accents per character
- [ ] At most one simple special each (stretch — only after select + stats work)

**Done when:** two clearly different characters are selectable and feel different in combat.

---

## Medium term — shareable build (not netplay)

### 6. Deploy playable URL

- [ ] Deploy Next.js app (Vercel or agreed host) — static/client game needs no game server
- [ ] Document deploy steps in repo (short section in README or `Docs/DEPLOY.md`)
- [ ] Optional privacy: deployment protection or simple auth gate for friends-only URL
- [ ] Smoke test: CPU mode works on production URL

**Done when:** a shareable HTTPS link loads the game and solo vs CPU is playable.

### 7. Mobile / touch (optional, low priority)

- [ ] Evaluate touch overlay vs “desktop only” message
- [ ] If pursued: minimal virtual stick + attack buttons for P1 only

**Done when:** decision documented; either basic touch or explicit desktop-only callout on small screens.

---

## Long term — online fighting (separate tier)

Do not start until sim determinism is documented and tested.

### 8. Rollback netcode

- [ ] Document fixed tick order and input application (`stepGame` contract)
- [ ] Desync detection / replay-from-inputs test harness
- [ ] Realtime transport (WebSocket or WebRTC) — **not** Vercel serverless as game server
- [ ] Input delay + rollback buffer
- [ ] Online two-player match flow (lobby, rematch, disconnect)

**Done when:** two browsers in different locations can play one full match with acceptable rollback feel.

---

## 9. Asset improvement (creative push)

Goal: see how much visual/audio polish a solo dev can offload to agents while keeping sim authoritative.

- [ ] **Animation layer** — extract poses from `drawStick` into data (`poses.ts` or similar); sim frame → pose lookup
- [ ] **Render interpolation** — smooth motion between sim ticks using existing accumulator
- [ ] **Background art pass** — richer parallax or illustrated scene (canvas layers or agent-generated assets in `public/stick-fighter/`)
- [ ] **Fighter visuals** — hats, weapons, trails, hit sparks (render-only unless sim agrees)
- [ ] **UI art pass** — round banners, health bars, character select frame
- [ ] **Audio pass** — full set of combat SFX + optional music loop
- [ ] **Asset manifest** — list files, licenses, and generation prompts in `Docs/stick-fighter-assets.md`

**Done when:** game reads less like debug stick figures and more like a intentional mini fighter, without changing combat outcomes unless sim constants change.

---

## 10. LLM fighter dialogue (AI in games)

Goal: when a fighter drops to **25% HP or below**, their **opponent** gets a short taunt line generated by Claude — personality comes from **character select** data (phase 5). Fun showcase of LLM tool calls without affecting combat fairness.

**Ship text first.** Subtitle/speech-bubble copy only for v1. Spoken audio (Claude voice, TTS, or pre-generated clips) is a later experiment — LLM + audio adds noticeable latency and can feel mushy mid-fight unless lines are prefetched or cached.

**Prerequisite:** phase **5. Characters** (each fighter needs `id`, display name, and a `personalityPrompt` snippet for the model).

### Architecture

- [ ] **Never call Claude from the browser** — API key stays in `.env` as `ANTHROPIC_API_KEY`; game client calls a Next.js Route Handler
- [ ] **`POST /api/stick-fighter/taunt`** — accepts `{ speakerId, targetId, roundContext }`; returns `{ line: string }`
- [ ] **System prompt** — shared rules (PG tone, max length, in-universe, no slurs, no meta/AI mentions, one sentence); stored in `src/lib/stick-fighter/llm/system-prompt.ts`
- [ ] **Character prompts** — per-fighter voice appended from character table (e.g. “cocky arena showman”, “ stoic monk”)
- [ ] **User message** — structured context only: speaker name, target name, target HP band (“critical”), optional round/match score if phase 1 exists
- [ ] **Fallback lines** — cached generic taunts per character if API fails, times out, or key missing (game never hard-blocks)

### Game integration

- [ ] Detect **one-time threshold cross** per fighter per round: HP was `> 25%` and is now `≤ 25%` (use `MAX_HP`, not magic numbers in UI only)
- [ ] **Speaker** = the fighter who is *not* in critical health (the opponent delivers the line)
- [ ] Fire request **async** — do not pause sim; show “…” then line when response arrives
- [ ] **UI** — speech bubble or subtitle bar above the speaking fighter (canvas overlay or HUD); fade after a few seconds
- [ ] **VS CPU** — taunts work for human and/or CPU speaker; CPU lines can use same API or fallback-only to save cost
- [ ] **Debounce** — at most one LLM call per threshold event; reset flag on round rematch

### Safety, cost, and ops

- [ ] Server-side **timeout** (e.g. 3s) and **max tokens** cap on responses
- [ ] Optional **rate limit** per session/IP if deployed publicly (phase 6)
- [ ] Document local setup in `Docs/stick-fighter-llm.md` — env var, example curl, cost note
- [ ] Add `.env.example` entry for `ANTHROPIC_API_KEY` (no real key in repo)

### Prompt sketch (implement in code, refine in docs)

**System (shared):** You write one short in-game taunt for a stick-fighter arcade game. Stay in character. One sentence, under 120 characters. No profanity, slurs, or real-world politics. Do not mention AI, APIs, or the player’s keyboard.

**User (templated):** `{speakerName}` is winning. `{targetName}` is badly hurt (25% health or less). `{speakerPersonality}`. Write `{speakerName}`’s taunt.

**Done when:** with two characters selected and a valid API key, crossing 25% HP triggers a visible opponent taunt; without a key, a fallback line still appears; combat timing is unchanged.

---

## Explicitly out of scope (for now)

- ML / reinforcement-learning CPU
- Rewriting stack (stay Next.js + TypeScript + canvas)
- Bar-inventory template features unless Ryan redirects the project
- Rollback before local feel and characters are solid
- Streaming LLM into combat logic or hit resolution (taunts are cosmetic only)
- LLM-generated **spoken** taunts in v1 of phase 10 (text-only first; see phase 10 note)

---

## Verification log

Notes from codebase/git checks. Update when completing phases.

| Date | Checked | Notes |
|------|---------|-------|
| 2026-05-25 | `git log`, `src/lib/stick-fighter/*`, `stick-fighter-game.tsx` | Combat refactor + home page in `fad9981`. CPU + `PLAN.md` + plan rules in `17a0ffb`. No best-of-3, training mode, hitstop, gamepad, characters, deploy, assets, or LLM taunts yet. |
| 2026-05-25 | `PLAN.md` | Added phase 10 (LLM taunt on 25% HP); depends on phase 5 character prompts. |
| 2026-05-25 | `simulation.ts`, `stick-fighter-game.tsx`, `npm run lint`, `npm run build` | Phase 1: fixed BO3 match scoring (component state), round/match overlays, 3-2-1 between-round countdown, weapon carry-over via `createNextRoundState`, Space/Enter rematch on match end only. |
| 2026-05-25 | Manual playtest (Kyle) | Phase 1 confirmed working — rounds, countdown, and match flow behave as expected. |
| 2026-05-25 | `dummy.ts`, route pages, `stick-fighter-game.tsx`, `npm run lint`, `npm run build` | Phase 2 v1: title + menu at `/`, `/vs` BO3 unchanged, `/practice` stand-still dummy + auto-reset, `/multiplayer` placeholder. |
| 2026-05-25 | Manual playtest (Kyle) | Phase 2 complete — Practice mode verified; phase marked done at v1 scope (stand-still dummy). Extra dummy behaviors + HUD hints deferred. |
| 2026-05-27 | `Docs/Master-Stroke.md` | Added Master Stroke design doc v1.0; linked from `PLAN.md`, README, stick-fighter agent rule. |
