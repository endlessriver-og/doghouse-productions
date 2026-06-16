# Doghouse Productions — Cozy Survival Roguelite (LOCKED SPEC)

A cozy management roguelite. Run a studio under rising pressure, hit the season quota
or the doors close, bust, bank **Clout**, run again stronger. Reuses ~80% of what's built.

## Decisions (locked)
1. **Structure:** hard **antes** — a rising quota each Season, hit-or-die. ✅
2. **Meta-currency:** **Clout** → persistent unlock tree (prestige traits = the seed). ✅
3. **Run length:** **8 Seasons ≈ 35 min/run** (see genre comparison below). ✅ *(easy to tune)*
4. **Tone:** cozy-boutique look + light narrator flavor over the roguelite skeleton. ✅

## Genre comparison (why 8 seasons / ~35 min)
| Game | Stages | Min/run | Note |
|---|---|---|---|
| Luck be a Landlord | 12 rent rounds | 20–40 | the exact rising-quota-or-die shape |
| Balatro | 8 antes | 45–60 | 8 = "feels complete without fatigue" ceiling |
| Hades | 4 biomes | 20–35 | tight chunks, fast restart |
| Slay the Spire | 3 acts (~50 floors) | 45–90 | top end |
| Vampire Survivors | 1 × 30-min timer | 30 | hard cap |

**8 Seasons** delivers a full arc (2 easy → 3 mid → 2 hard → 1 boss) without fatigue;
**~35 min** sits at the Hades/LBaL restart-friendly sweet spot (cozy adds ~10 min patience).
Never let a single Season exceed ~6–7 min — bounded decisions keep the "cozy dread" of the
rising quota alive.

## A Season (the core unit)
- A Season = a fixed window (~8 in-game weeks). You run the studio normally inside it —
  events, creative work, contracts, hiring, spending. Rent drains cash the whole time.
- **Season end = the boss check:** your **Members** must be ≥ the Season's **Quota**.
  - Hit it → advance + draft a boon.
  - Miss it (or cash busts mid-season) → **run ends**.
- Quota rises on a logarithmic curve (LBaL 25→777 shape). Seasons 1–2 trivial (teach),
  3–5 outpace passive income (forces synergy), 6–8 spike + a "Season event" (boss modifier:
  a drought, a viral moment, a rival's big release).

## The draft (between Seasons)
Pick **1 of 3** boons: a hire · a space · a crew trait · a run-modifier · unlock a project
type · a cash/Cred injection. This is where your **build** forms. (The vendor becomes this.)

## Death pays — Clout meta-loop
Run ends → **run summary** (seasons survived · peak members · legendary projects · score)
→ bank **Clout** = f(progress). Spend Clout in a **persistent unlock tree**:
new traits in the pool · new **decks** (scenarios) · new starting kits · new project types ·
QoL · **Ascension** tiers (harsher quotas + nastier Season events). Always forward, even on a loss.

## Per-run variety
- Pick a **Deck** at run start (the 4 scenarios → roguelite characters: a starting kit + a twist).
- Random recruits, trends, event deck (exist). Drafted modifiers (new). Optional **seeded daily run**.

## Win / score / replay
- **Clear:** survive Season 8.
- **Score:** seasons × members × legendary.
- **Replay:** Ascension difficulty + unlock new decks/traits with Clout.

## What's reused vs new
- **Reuse:** economy, crew/traits/synergy, spaces, label, vendor→draft, scenarios→decks,
  events, randomness, prestige→Clout tree, the whole art/juice/one-viewport shell.
- **New:** Season/Quota engine · between-Season draft · Clout + unlock tree · run-summary/score · Ascension.
- **Trim:** linear story beats as the spine (keep as light flavor).
- Start with **2 crew**; grow via drafts + hiring.

## Phased build
1. **Season/Quota engine** — seasons, rising quota, season-end check, run-end → summary. (the spine)
2. **Draft** — 3-boon pick between seasons.
3. **Clout + unlock tree** — bank on run end, spend on permanent unlocks.
4. **Decks** — scenario picker as run-start characters + modifiers.
5. **Season events + Ascension** — boss modifiers + difficulty tiers.
6. **Balance pass** — tune the quota curve + Clout economy with playtest data.
