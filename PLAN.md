# Stick Fighter — Master Plan

Living roadmap for the stick-fighting minigame (`/`). Agents and humans use this file to track what is done, what is in progress, and what comes next.

**Primary code areas**

| Area | Path |
|------|------|
| Simulation (combat truth) | `src/lib/stick-fighter/simulation.ts` |
| CPU opponent | `src/lib/stick-fighter/cpu.ts` |
| Canvas, input, HUD | `src/components/stick-fighter-game.tsx` |
| Home page shell | `src/app/page.tsx` |

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
| **Phase** | *(none — pick the next unchecked near-term item)* |
| **Item** | *(none)* |
| **Agent note** | CPU opponent MVP implemented locally; commit when ready. |
| **Last updated** | 2026-05-25 |

---

## Foundation (baseline — complete)

Work that exists today and future phases build on.

- [x] **Geometric combat system** — five attacks, two blocks, hitbox/hurtbox/guard resolution (`simulation.ts`; landed in commit `fad9981`).
- [x] **Game at home page** — `/` is the stick fighter, not the bar-inventory welcome page (`page.tsx`; `fad9981`).
- [x] **Procedural stick animations** — poses driven by sim state in `drawStick()` (`stick-fighter-game.tsx`; no sprite sheets yet).
- [x] **Single-round win state** — one fight to 0 HP, overlay, Space/Enter rematch (`roundOver` in sim + component).
- [x] **CPU opponent** — reactive AI for P2, Easy/Normal/Hard, VS CPU toggle (`cpu.ts` + component wiring). *Verify committed to git before treating as shipped.*

---

## Near term — local play (best ROI)

Polish solo and couch play before networking or deployment.

### 1. Round flow

- [ ] Best-of-3 (or configurable) match scoring across rounds
- [ ] Clear round/match win UI (round counter, “Round 2”, “Red wins match”)
- [ ] Rematch flow that resets fight state without full page reload
- [ ] Optional: short between-round countdown

**Done when:** two players (or vs CPU) can play a full best-of-3 with obvious who won the match.

### 2. Training mode

- [ ] Mode toggle: Fight / Training (alongside or instead of CPU difficulty when training)
- [ ] Dummy opponent behaviors, e.g.:
  - [ ] Always block neutral
  - [ ] Always block low
  - [ ] Always whiff (recovery practice for punishes)
  - [ ] Stand still / no attack
- [ ] Training HUD hints (which attack beats current dummy behavior)

**Done when:** player can select a dummy behavior and practice one matchup without fighting a full CPU.

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

## Explicitly out of scope (for now)

- ML / reinforcement-learning CPU
- Rewriting stack (stay Next.js + TypeScript + canvas)
- Bar-inventory template features unless Ryan redirects the project
- Rollback before local feel and characters are solid

---

## Verification log

Notes from codebase/git checks. Update when completing phases.

| Date | Checked | Notes |
|------|---------|-------|
| 2026-05-25 | `git log`, `src/lib/stick-fighter/*`, `stick-fighter-game.tsx` | Combat refactor + home page in `fad9981`. CPU module present; confirm commit status before marking CPU foundation shipped. No best-of-3, training mode, hitstop, gamepad, characters, deploy, or asset layer yet. |
