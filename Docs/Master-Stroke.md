# Master Stroke — Design Doc v1.0

*The foundational design document. A living spec — update it when reality forces updates, otherwise treat it as the source of truth.*

## How this doc fits the repo

| Document | Role |
|----------|------|
| **`Docs/Master-Stroke.md`** (this file) | Product vision, narrative, mechanics thesis, and phased plan for *Master Stroke*. |
| **`PLAN.md`** (repo root) | Tactical roadmap for the **current stick-fighter prototype** — what to build next in code today. |
| **`Docs/Master Plan.md`** | Original Next.js template / bar-app build plan (substrate, not the game pivot). |

When tactical work and this doc disagree, **update this doc** if the pivot is intentional, or **update `PLAN.md`** if the prototype is deliberately ahead/behind the vision. Note significant reconciliations in `PLAN.md` **Verification log**.

---

## The Pivot

The repo is still called `conflict-smasher-39-9-99`. That's the artifact of where this started: a janky fighting game with one punch, a simple round system, and a physics tuning lab where the characters can't support their own weight yet. None of that is wasted work — it's the substrate the real game grows out of. But the project has found its identity, and it's a different game now.

**The new game is Master Stroke.** A 2D physics-driven weapon fighter where each character is defined by their weapon and the art-historical tradition that weapon comes from. No move lists, no special attacks, no health bars with frame data. Real mass, real reach, real timing. Hellish Quart's commitment to physical honesty, with a thesis Hellish Quart doesn't have.

---

## The Artistic Thesis

Every fighting game has a roster. Master Stroke has a **gallery**.

Each fighter is a window into how a culture pictured combat at a specific moment in history. The samurai isn't "the katana character" — he's a figure stepped out of an ukiyo-e woodblock. The European knight is rendered like an illuminated manuscript with the proportions and stiffness that implies. The Aztec warrior comes off a codex page. The Mughal swordsman is painted in the miniature tradition.

This is not skin-deep visual variety. It's the **mechanical identity of each character**. Their poses come from period source material — the samurai's chūdan-no-kamae is traced from an actual woodblock, not invented. When two characters meet, two artistic traditions collide inside one consistent physics simulation. The painted ideal vs. the ugly reality of two people trying to kill each other is the whole point.

**Master Stroke** carries the double meaning — painting term, combat term — and the genre alignment is intentional. (Worth a Steam name-collision check before committing.)

---

## The Protagonist

**Lord Wherther**. A young Victorian gentleman from a notable English family. Trained in the gentlemanly arts including la canne and bartitsu. Comfortable, educated, sketches well, fights better.

**The backstory:** He killed a boy in a duel. The boy was younger than expected, the duel was supposed to be to first blood and went wrong, the second tied off the wound poorly. The family has covered for him publicly with "he is studying art abroad." Privately, he can never come home. The cover story is also true. He *is* studying art abroad, because that's the only thing left to do with the life he has.

He travels with a sketchbook and a sword cane. The sword cane was a fashionable gentleman's weapon in 19th-century France and Britain, with real documented martial systems: la canne (still practiced competitively in France today), Pierre Vigny's method, and bartitsu (the system Sherlock Holmes was written using). Plenty of public domain source material on technique and historical use.

**In campaign mode, he only ever uses the sword cane.** The player learns one moveset across the entire journey. Other weapons exist in the world, are wielded by his opponents, and unlock for VS/multiplayer — but he never picks one up. This is critical for his identity. He's an English gentleman fighting with a walking stick against a man with a poleaxe. He wins on technique, timing, and apex reads, not on weapon class. When he wins, it *means* something.

---

## The Campaign Frame

This is a real journey, not a daydream. A world map. He travels by ship, by rail, by horse, by foot. The map is a UI element and a progression tracker.

At each destination he encounters a piece of art — a sword manual, a mosaic, a scroll, a codex page, a pot, a tapestry. He looks at it.

**Then he is transported into it.**

A flashback, a fugue, his mind dragging him into the page. From the player's perspective the world becomes the artwork. The terrain is rendered in the artwork's style. The figure depicted in the artwork is now his opponent — a manuscript knight with a pole hammer, a mosaic-tile longsword fighter, a red-figure Spartan. The protagonist himself is also redrawn in the local style. He arrives a Victorian and becomes, briefly, a figure in someone else's tradition.

He fights. He wins. The duel ends.

**The final frame of the duel becomes the painting.** Captured, signed, dated. This is the cutscene. The player's own gameplay produces the trophy — clean apex riposte or desperate ground-stab, whatever it was, it's the painting now. (Stretch goal: let the player scrub the last few seconds of the duel and pick the exact frame that becomes their painting. 30 minutes of UI work, enormous personality return.)

He sells the painting. That's his travel money. The next destination unlocks.

**If he loses:** restart the duel. No side content for v1. Clean and simple.

**Between destinations:** a loading screen of the tiny protagonist crossing the world map by his chosen conveyance. *This* is where the real Victorian lives. Letters from home arrive here, the tone shifting from sympathetic to impatient to cold. Glimpses of a pursuer closing distance. Sketches the protagonist makes of fellow travelers, ports, landscapes. The duels are the symbolic register; the map screens are the emotional one. Two modes, cleanly separated.

**The dead boy.** Once per opponent, well-chosen, sparing. The medieval knight removes his helmet for a single frame and it's the boy's face, then resolves to the manuscript knight. The samurai's death animation in ukiyo-e style briefly shows the boy collapsing instead. The Aztec warrior's height matches the boy's. One unique moment per fight that players will talk about. **At least one late-game fight where the boy doesn't appear** — that absence will land harder than another appearance.

**The protagonist's arc has three sketched endings:** return and face what he did, disappear into a chosen tradition forever, or a third option to be discovered. To be written.

---

## The Route

Twelve to thirteen stops. Some become campaign chapters, some become DLC, some get cut as scope clarifies.

1. **London** — opening. Tutorial duel against another Victorian (training partner, the dueling backstory, departure).
2. **France** — sword manual. The duel is against the figure in the manual.
3. **Germany** — manuscript or fechtbuch. Knight with longsword or pole hammer.
4. **Greece** — red-figure pot. Spartan hoplite. **The pivot point** — where the European story ends and the wider world begins.
5. **Egypt** — Mamluk miniature. Saber tradition.
6. **India** — Mughal court painting. Kalaripayattu, talwar.
7. **China** — Song dynasty landscape painting. Jian swordsmanship.
8. **Japan** — ukiyo-e woodblock. Samurai with katana.
9. **Pacific crossing.**
10. **Mexico** — Codex Mendoza (public domain). Aztec warrior with macuahuitl.
11. **American Southwest** — Apache fighter. Specific nation and weapon TBD with care.
12. **Africa** — Benin Bronzes, Dahomey traditions, or Zulu iklwa-and-shield depending on research.
13. **Return — or not.**

Standard fighter rosters are 8–12. You will not ship all of these in v1. Likely cuts will reveal themselves as the project progresses. DLC route is wide open: Ottoman Janissary, Polynesian, Mongolian, Persian, additional periods within already-covered regions.

---

## Multiplayer

The campaign rule is "the protagonist becomes the local style when he enters the artwork." Multiplayer applies this rule to *everyone*.

**The stage belongs to one fighter. Both fighters render in that stage's style.**

When you pick the samurai stage, both fighters are ukiyo-e. The samurai *and* the European knight are rendered as woodblock prints. When you pick the manuscript stage, both are illuminated-manuscript figures. The Aztec stage paints everyone as a codex figure. The mosaic stage tiles everyone.

This is not a compromise. It is a *stronger* artistic statement than "each character in their own style." Multiplayer becomes a thought experiment: *what if a Spartan was painted by a Mughal court artist? What does a Victorian gentleman look like as a Yokohama-e woodblock figure?* There's historical precedent — Meiji-era Japanese printmakers actually depicted Europeans in ukiyo-e style. This is a real thing artists did.

**Character identity is in the poses, the silhouette, the weapon, the movement vocabulary — not the rendering.** A samurai is a samurai because of how he stands and what his weapon does in space. Re-rendered in manuscript style, he's still a samurai — now a samurai *as a medieval European illustrator would have drawn him*, which is fascinating and screenshot-worthy.

**Important:** both fighters are equally stylized. Don't render the "home" fighter correctly and the "visitor" in the stage's style. That asymmetry would suggest one fighter is real and the other is a tourist. The stage transforms everyone. The stage is the protagonist of multiplayer.

**Implementation reality:** you don't need every character pre-rendered in every style by hand. You have pose data (JSON), silhouettes, and motion data — all style-independent. The *renderer* is style-specific. Build *N renderers*, not *N²* character art sets. The work scales linearly with the number of styles, not with the number of characters.

This is the same agentic-design philosophy as the pose canvas, one layer up: separate the data from the presentation, and the presentation becomes pluggable.

---

## A Note on Representation

Breaking out of Eurocentrism is one of this project's best instincts. It also raises the research bar. Depicting non-European martial traditions and art styles carries weight that depicting European ones does not, for a primarily Western audience.

This is not a reason to retreat to a safer roster. It is a reason to do the work. Specificity is the antidote to stereotype. *Which* Apache nation. *Which* Zulu era. *Which* Mughal court. *Which* Aztec period. The more specific the source, the more authentic the result.

This is exactly where the agentic design philosophy pays off: a tagged reference library of primary sources and academic citations per tradition gives the AI a corpus to reason from. The Aztec warrior should feel like he stepped out of the Codex Mendoza, not out of a video game's idea of Aztecs. Same standard, every culture.

---

## Game Mechanics

The combat loop is built on a small set of load-bearing ideas:

**Weapons are characters.** Each weapon has mass, size, friction, and speed. These four numbers determine matchup logic. There are no special moves — there's only what a poleaxe physically does vs. what a rapier physically does. Character identity rides on top of weapon physics through pose vocabulary and animation flavor.

**Long guard is neutral.** Unlike Hellish Quart, the resting position is weapons held high. When two fighters approach in long guard, their weapons automatically jockey for the dominant high line. This kills the turtling problem and creates a visible, legible neutral game without HUD clutter.

**Chop input.** From long guard, players can press chop to force the opponent's weapon down. The advantage gained depends on the matchup — heavy weapons win chambering contests against light weapons. The rapier doesn't beat the poleaxe in raw force; it has to win elsewhere.

**Automatic guard.** Hold guard and the character automatically parries any attack landing in their zone of control. But you can get drawn out — feints bait early parries, and the punishment is on the player who committed.

**Apex input.** The continuous-time skill ceiling. When your weapon is doing anything — being batted away, completing a strike, recovering from a parry — the player can input guard or the next attack at the apex of the weapon's motion. Recovery isn't a fixed frame count. It's physics-determined. Skill expression is "how early can I commit to the next thing without overshooting." Apex needs to be felt without UI assistance — probably audio cue at apex.

**Grappling.** If neutral breaks and weapons fail, characters lock wrists or drop weapons. Whoever exploits the physics engine better wins the clinch, lands on top, draws a dagger. Not a QTE — a continuation of the same physics conversation, at zero range. Chaotic by design.

**Trip button.** Each character has access to their region's grappling tradition — samurai uses judo throws, Spartan uses pankration, German knight uses *Ringen*, Aztec uses macuahuitl-aware close-quarter techniques. Directional input biases which throw the character tries. Animation is regionally flavored. Decision is the player's.

---

## Gaps in the Thinking

Honest open problems. Naming them helps prioritize.

1. **Standing.** Characters can't support their own weight yet. The load-bearing technical problem.
2. **Weapon balance.** Each weapon needs an asymmetric answer to every matchup. Sketched, not designed.
3. **Roster scope.** 13 destinations is too many. Cuts coming.
4. **Apex input legibility.** Audio cue is the leading candidate. Untested.
5. **Grappling resolution.** The chaos clinch is a direction, not a design.
6. **Bipedal balance approach.** Pinned-feet vs. free-feet still open.
7. **Library choice.** Matter.js for now, Rapier later if forced. PhysicsWorld adapter keeps the door open.
8. **The protagonist's arc.** Three sketched endings. Needs writing.
9. **Pursuit subplot.** Who follows him? Family member, hired agent, ghost? Affects whole campaign tone.
10. **Sketchbook / gallery UI.** Unlock system and painting trophy display. Needs design.
11. **Multiplayer renderer pipeline.** How style transfer actually works at runtime. Big technical unknown.
12. **The protagonist's name.** "Lord Ashford" is filler. (Working name in this doc: **Lord Wherther**.)

---

## Phased Plan

Each phase has a target, a definition of done, and an agentic design move — a tool to build *before* asking the AI to help with that phase's work.

*Note: phase numbers here are the **Master Stroke** roadmap. They are not the same as numbered phases in root `PLAN.md` (round flow, deploy, netcode, etc.). Reconcile both when closing a Master Stroke phase that subsumes prototype work.*

### Phase 1 — Foundations (in progress)

**Target:** One stick figure stands under physics. Pose authoring works.
**Done when:** A knight long-guard pose loads as a PD target and holds for 10 seconds without exploding.
**Agentic move:** The pose canvas. Poses become **data**, not prompts.

### Phase 2 — The Victorian

**Target:** The protagonist is realized. Sword cane mechanics. Poses authored from la canne / bartitsu source material. Standing, walking, strike-parry-recover loop.
**Done when:** The Victorian moves, holds guard, strikes, and parries against a stationary target convincingly.
**Agentic move:** A **reference library** for the Victorian — la canne manuals, bartitsu illustrations, Victorian portraiture. Tagged by pose, motion, source. This is the template for every subsequent character's research dossier.

### Phase 3 — Combat Primitive

**Target:** Two Victorians can fight each other.
**Done when:** Automatic guard, chop input, and basic apex continuation work in a real bout between two players.
**Agentic move:** A **combat state inspector** — real-time visualization of each character's state, weapon position, PD target, and guard zone.

### Phase 4 — Apex + Feinting

**Target:** The continuous-time skill ceiling is real.
**Done when:** Skilled and unskilled play look visibly different. Apex is felt, not displayed.
**Agentic move:** A **replay system** for tuning the apex window without endless live playtesting.

### Phase 5 — Second Character + First Campaign Duel

**Target:** Add the manuscript knight with pole hammer or longsword. Build the *entering-the-artwork* mechanic for the first duel. Implement the painting-trophy cutscene.
**Done when:** The Victorian can travel from London to Germany (the second region), encounter the manuscript art, enter the duel, win, generate the painting, sell it, and unlock the next destination.
**Agentic move:** A **weapon data schema** (JSON-defined weapons) and a **stage-style renderer** — even if hand-crafted for one style first, the architecture should separate pose data from rendering.

### Phase 6 — Multiplayer Foundation

**Target:** VS mode with two characters and two stages. Cross-style rendering working.
**Done when:** Victorian vs. Knight in the manuscript stage *and* in a non-existent-yet "neutral" Victorian stage, both fighters correctly stylized.
**Agentic move:** The **renderer pipeline** as a real architectural layer. N renderers, not N² character art sets. Pose data + silhouette + style → output.

### Phase 7 — Roster Expansion

**Target:** Four playable characters covering different weapon classes. Four stages with four renderers. Pipeline proven.
**Done when:** Complete VS mode with four characters and four stylized stages.
**Agentic move:** A **balance simulation harness** — automated AI vs. AI matches, win-rate matrix, imbalance detection.

### Phase 8 — Grappling + Trips

**Target:** Clinch system, regional throws, ground game.
**Done when:** Failed neutral collapses gracefully into a meaningful grappling layer.
**Agentic move:** **Pose library expansion** with grappling-specific tags. Same schema, more entries.

### Phase 9 — Campaign Build-Out

**Target:** Full journey playable end-to-end. World map, sketchbook UI, painting gallery, letters from home, pursuit subplot, narrative beats.
**Done when:** A complete campaign run from London to a chosen ending is possible.
**Agentic move:** A **narrative consistency tool** — voice doc, character relationships, established lore, style rules. Dialogue gets written against it.

### Phase 10 — Polish + Ship

**Target:** It's a game people can buy.

### DLC / Post-Launch

Cut characters return. Route extensions. Possibly an inverse-protagonist campaign — a Japanese painter traveling west would be a wonderful structural inversion.

---

## The Through-Line: Agentic Design

The pose canvas isn't just a tool. It's an example of a principle.

**Old workflow:** Human prompts AI in natural language. AI guesses at intent. Human iterates by reprompting. The bottleneck is the ambiguity of language.

**Agentic design:** Human builds a tool that turns intent into structured data. AI reads data and produces precise outputs. Human reviews and adjusts. The bottleneck moves from language to design.

For Master Stroke:

- Poses are JSON, not prompts.
- Combat state is inspectable, not described.
- Weapons are data, not descriptions.
- Replays are files, not anecdotes.
- References are a tagged corpus, not a vibe.
- Narrative is a structured doc, not a conversation.
- Character traditions are research dossiers, not stereotypes.
- **Renderers are pluggable layers, not hand-crafted per-character art.**

The last point is the biggest leverage move in the whole project. Once pose data and silhouette data are separated from rendering, every character can appear in every style at linear cost. The art-history thesis scales. Multiplayer works. Cross-style screenshots become the marketing.

Every phase asks the same question first: **what shared language do I need to build before I ask the AI to help?** That tool is the leverage point. Once it exists, every subsequent ask is concrete, verifiable, and cheap.

This is also the protection against AI-as-yak-shaver. An AI given vague prompts will generate beautiful unfinished work forever. An AI given a pose JSON has a discrete job. The tool boundaries the work.

---

*Document version: 1.0. Last imported to repo: 2026-05-27.*
