# Doghouse Productions — Game Design Spine

The missing layer: a stated objective, win/lose, and a progression ladder that
**gates complexity over time** (which doubles as the tutorial). Today every system
is available at minute one → no idea where to start. This fixes that.

## The fantasy
Build a creative studio from a 2-person scrap operation into a scene-defining
institution — without going broke doing it.

## The core tension (what you optimize)
Rent eats ~$8K/month. Grow **Members** (recurring revenue) faster than rent eats you,
by throwing events and making work that travels — then climb a ladder of milestones
that unlock new powers and prove you can run the house.

## Moment-to-moment loop
- **Events** pull Members → members pay monthly (MRR) → covers rent.
- **Creative work** builds Buzz → buzz makes events convert better + earns cash.
- **Contracts** = guaranteed cash injections (bridge the gap).
- Reinvest cash/Cred → crew, training, spaces, your own label.
- Hit milestones → unlock systems + win.

## Win / Lose (explicit)
- **Lose:** cash stays negative ~8 weeks → the doors close. Telegraphed by a runway readout.
- **Act win:** reach **$18K/month recurring** → the equity earn-in triggers (10%→20%).
  "You made the house yours." (Already a story beat — now it's the stated goal.)
- **Full win — Legacy:** after equity, reach **1,000 members** (or: found a label + 3
  legendary projects) → institution status → free-play / New Game+.

## Progression ladder — gates complexity AND is the tutorial
Systems unlock as you grow. Each unlock = a story beat + a one-time "here's what this
does" nudge (just-in-time, never front-loaded). Auto-skips on New Game+.

| Act | Unlocks when | You have | New powers unlocked | Objective shown |
|-----|--------------|----------|---------------------|-----------------|
| **1 · Open the doors** | start | **2 crew**, 3 event formats only | core loop: greenlight → work → release | Cover rent — reach ~230 members |
| **2 · Make something** | MRR ≥ rent (break-even) | + creative work, casting/hire, contracts | buzz loop · grow roster to 4 | Land a contract + ship a creative piece |
| **3 · Build a name** | reputation ≥ 20 (or first hit) | + marketing, scout, training, spaces, showcase | crew careers · upgrade the room | Score a hit (33+/40) |
| **4 · Own it** | members ≥ 400 | + label, sequels, vendor, prestige | platform play · franchises | $18K month → equity (Act win) |
| **Endgame · Legacy** | post-equity | everything · sandbox | New Game+ | 1,000 members → institution |

(Thresholds are first-pass — they get tuned in the balance pass.)

## Always-on direction
One **Objective** line, always visible, replacing the vague "Getting Started":
`▸ Cover rent — 152 / 230 members`. You always know the next thing to do.

## Starting-state changes
- Crew = **2** (you + one producer), not 4. Roster grows by hiring as Act 2 opens.
- Locked systems are hidden (not greyed) until their act → the screen starts simple.
- Locked project types hidden in New Project; events-only in Act 1.

## How this is built (on approval)
1. `unlocks` flags in state, derived from milestones (members/MRR/rep) — data-driven, tunable.
2. Gate UI by flag: hide dock/overlay sections + project types until unlocked.
3. Objective system: current objective derived from act → always-on banner.
4. Act-transition story beats (reuse the existing beat system) carry the JIT nudge.
5. Start with 2 crew; everything else stays.

## Open decisions (yours)
1. **Win condition** — equity ($18K/mo) as Act-win + 1,000-members Legacy as full win? Or simpler (survive 5 years / single objective)?
2. **Gating** — 4 acts by threshold (above), hard-hidden until unlocked? Or fewer acts / softer (visible-but-locked)?
3. **Starting crew** — you + 1 generic producer (2 total)? Confirm.
