# Doghouse Productions 🐶

A creative-studio management sim — run a studio, ship projects across media, ride
platform eras, build an audience, don't go broke. *Game Dev Story* re-themed as a
creative house (Omni House as a game).

See [DESIGN.md](DESIGN.md) for mechanics, [DESIGN-RESEARCH.md](DESIGN-RESEARCH.md) for the genre research.

## ▶ Play it live

**https://endlessriver-og.github.io/doghouse-productions/** (GitHub Pages, auto-served from the `gh-pages` branch). Deploy a new build with `pnpm deploy`.

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # typecheck + production build to dist/
```

Stack: React 18 + Vite + TypeScript + Zustand. No backend. Save state lives in
`localStorage` (`doghouse-save-v1`). Built with relative asset paths (`base: "./"`)
so the same `dist/` runs from a web server *or* a `file://` desktop wrapper.

## Path to Steam

The game is a pure web app. Shipping to Steam = wrap `dist/` in a desktop shell.
Two viable routes — the game code is identical for both, so this choice is deferred
and reversible:

| Route | Binary | Steam integration | Notes |
|-------|--------|-------------------|-------|
| **Tauri** (recommended) | ~5–10 MB | `steamworks` Rust crate | Lean, modern, Rust shell. Best size/perf. |
| **Electron** | ~120 MB | `steamworks.js` | Heaviest precedent on Steam; drop-in JS. |

Steam ship checklist (post-MVP):
1. Wrap `dist/` (Tauri `tauri init` → point to built assets, or Electron `BrowserWindow.loadFile`).
2. Integrate Steamworks SDK → achievements, cloud saves (mirror `localStorage` to Steam Cloud), overlay.
3. Steamworks partner account ($100 Steam Direct fee per title — **billing gate, needs sign-off**).
4. Store page: capsule art, trailer, screenshots, 4–6 wishlisting assets.
5. Build pipeline: `steamcmd` content upload, depots, branches.

Art is the other lift: current UI is placeholder CSS. A pixel-art office + creatives
is the visual upgrade that makes it feel like a Kairosoft title.

## Modding (Workshop data layer)

Custom content needs no code. In the browser console set a localStorage pack and reload:

```js
localStorage.setItem("doghouse-mods", JSON.stringify({
  mediums: [{ id:"mural", name:"Mural", kind:"event", weeks:3, budget:3000,
    weights:{vision:.5,craft:.3,sound:.05,story:.15}, expectedQ:150,
    reach:260, conv:.3, cashPer:15, blurb:"Paint the block." }],
  vibes: [{ id:"sacred", name:"Sacred" }]
}));
```

## Status

- [x] Core loop: pitch → Focus + phases → produce → risk spike → polish → release → 4-critic /40
- [x] Two-loop economy: creative → buzz → events → members → MRR vs rent burn
- [x] 16 project types (events + creative), synergy grid, per-era trends + Scout
- [x] Crew: traits, bonds (chemistry/clash), hire / train / energy / leveling
- [x] Sequels + franchise residuals, named regulars, rival studios, annual awards
- [x] Seasons, dual goals, prestige / New Game+, scenarios, onboarding
- [x] Transparency (projected score), juice (animated reveal, confetti, narrator)
- [x] Save/load, game-over, live deploy (GitHub Pages), Workshop data layer
- [ ] Pixel sprite art, sound/music, deeper balance pass, Steam desktop wrapper
