# Doghouse Productions — Design Doc

A creative-studio management sim. You run **Doghouse Productions**, take on creative
projects across many media, build a roster of creatives, ride platform eras, grow an
audience, and try not to go broke. Structurally a *Game Dev Story* descendant, re-themed
from "make video games" to "run a creative house" — Omni House as a game.

Status: **MVP vertical slice** (one studio, one full project loop, hire/train, save/load).
Numbers are first-pass and flagged `// TUNE`. Art is placeholder CSS (no sprites yet).

---

## Core loop (one project cycle)

1. **Pitch** — pick a **Medium** × **Vibe** combo and assign creatives. Synergy preview
   hints at how hot the combo is. Costs an upfront budget + weeks of salary.
2. **Production** — each assigned creative pumps points into 4 quality axes (Vision /
   Craft / Sound / Story) every week, biased by their role + stats. Random **Inspiration
   sparks** give burst bonuses. **Rough edges** accumulate (the "bugs" of GDS).
3. **Polish** — optionally spend weeks squashing rough edges into quality before release.
4. **Release** — ship on the current platform era. 4 critics score it /10 each → **/40**.
5. **Payoff** — score drives **new Following** and **Revenue**. Reputation ticks up on hits.
6. **Repeat** — level creatives, upgrade the studio, chase a Legendary Project.

Lose condition: cash stays negative too long → studio closes. Endless otherwise.

---

## Theme mapping (Game Dev Story → Doghouse)

| Game Dev Story        | Doghouse Productions                                   |
|-----------------------|-------------------------------------------------------|
| Game studio           | Creative studio                                       |
| Develop a game        | Produce a project                                     |
| Genre                 | **Medium** (Single, Music Video, Album, Film…)        |
| Type                  | **Vibe** (Romance, Hype, Rebellion, Luxury…)          |
| Genre×Type combo      | Medium × Vibe synergy grid                            |
| Staff                 | **Creatives** (Director, Editor, Composer, Writer…)   |
| Prog/Scenario/Gfx/Snd | **Vision / Craft / Sound / Story** (+ Hustle = mktg)  |
| Bugs phase            | Rough-edges / revisions phase                         |
| Review score /40      | 4 critics /10 each → /40                              |
| Fans                  | **Following**                                          |
| Units sold            | Reach / streams / tickets / client fee (by medium)    |
| Hardware consoles     | **Platform eras** (Scene → Tube → Loop → ForYou → …)  |
| Hall of Fame          | Legendary Projects                                    |
| Go broke = game over  | Run out of cash = studio closes                       |

---

## Quality & scoring model

Each project accumulates points in `{vision, craft, sound, story}`. At release:

```
raw      = Σ points[axis] * mediumWeight[axis]      // medium decides what matters
synergy  = synergyMultiplier(medium, vibe)          // 0.8 .. 1.5
polish   = clamp(1 - roughEdges / POLISH_SCALE, 0.5, 1)
repF     = 0.85 + reputation/100 * 0.3
Q        = raw * synergy * polish * repF

perCritic = clamp( Q / mediumExpectedQ * 7 + criticLean + rand(-1,1), 1, 10 )
score40   = Σ 4 critics
```

`mediumExpectedQ` scales with project scope so bigger swings need more points. Tuned so
early honest projects land ~22–30/40, great combos 33+, legendary 38+.

**Following gain:** `ΔF = baseFans(medium) * (score40/40)^2 * synergy * platformReach * (1 + hype/100)`

**Revenue:** `units = (following + ΔF) * conversion(medium) * (score40/40)^1.5`,
`revenue = units * price(medium)`. Client media (Brand Campaign) also pay an upfront fee;
Live Events monetize as tickets. All `// TUNE`.

---

## Content (MVP)

- **8 Mediums** — Single, Music Video, Album, Short Film, Brand Campaign, Live Event, Fashion Drop, Podcast.
- **8 Vibes** — Romance, Hype, Nostalgia, Rebellion, Luxury, Wholesome, Experimental, Dark.
- **6 Roles** — Director (vision), Editor (craft), Composer (sound), Writer (story), Marketer (hustle), Producer (balanced + speed).
- **4 Critics** — The Blog, The Plug, The Purist, The Crowd (distinct leans).
- **5 Platform eras** — Scene, Tube, Loop, ForYou, Mind (advance with in-game years).

---

## Roadmap past MVP

- Platform-choice strategy (release timing vs rising/dying platforms) — the real GDS "console" layer.
- Pixel sprite art: an office with creatives walking around (biggest art lift).
- Sound + music.
- Events/awards shows, contracts with constraints, sequels/franchises.
- Economy balance pass with playtest data.
- Steam: achievements, cloud saves, trading cards.

See [README.md](README.md) for the Steam packaging path.
