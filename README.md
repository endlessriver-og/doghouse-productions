# Doghouse Productions 🐶

A creative-studio management sim — run a studio, ship projects across media, ride
platform eras, build an audience, don't go broke. *Game Dev Story* re-themed as a
creative house (Omni House as a game).

See [DESIGN.md](DESIGN.md) for mechanics. This is an MVP vertical slice.

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

## Status

- [x] Core loop: pitch → produce → polish → release → score → payoff
- [x] 8 mediums × 8 vibes + synergy grid
- [x] Crew: hire / train / energy / leveling
- [x] 4-critic /40 scoring, following + revenue, reputation
- [x] Platform eras (passive), save/load, game-over
- [ ] Platform-choice strategy, sprite art, sound, events/awards, balance pass, Steam wrapper
