# Game Dev Story → Doghouse Productions — Parity Audit

Full diff of every major GDS mechanic (mined from kairosoft.wiki.gg + fandom, 2026-06-15)
against the current build. Goal: catch missing major functionality before art/Steam.

Legend: ✅ have · ◐ partial / re-themed · ❌ missing · *(skip)* = deliberate simplification.

---

## Dev loop
| GDS mechanic | Status | Notes |
|---|---|---|
| Genre × Type combo + S–F grades | ✅ | medium × vibe synergy S/A/B/C |
| **Combo/genre/type leveling on reuse (+base pts)** | ❌ | GDS levels genre & type independently → +2 pts at Lv2/Lv5. We have static synergy. Real optimization/grind hook missing. |
| Sequential phases (Write→Art@40→Music@80→Debug) | ◐ | We use concept/build/promo **sliders** + fit% — richer, covers it. |
| 8 dev attributes | ◐ *(skip)* | We use 4 axes (Vision/Craft/Sound/Story). GDS's scored core is also 4 (Fun/Creativity/Graphics/Sound). Fine. |
| Boost gamble (~25%, spend RD, +25-32 / fail +bugs) | ✅ | our risk spike (free gamble vs GDS's RD-priced odds) |
| Direction modes (Normal/Speed/Quality/**Research**/Budget+) | ◐ | we have Balanced/Quality/Fast/Experimental. Missing **Research** mode (needs a 2nd currency) + Budget+. |
| 4-critic /40, HoF≥32, GOTY≥36 | ✅ | /40, legendary≥38, awards |
| Bugs lower score + debug phase | ✅ | rough edges + polish |
| **Advertising ladder (12 tiers, diminishing-to-zero)** | ❌ | explicit ad SPEND to pump hype (in-dev) / sales (post-launch). We only have passive buzz + Scout. |
| **GameDex expo (annual, booth tiers)** | ❌ | annual hype/fan event with paid booth tiers. |
| Sales calc (fans+hype+score+console+combo) | ✅ | members/buzz/score → revenue |

## Staff
| GDS mechanic | Status | Notes |
|---|---|---|
| 4 stats, cap 999, raise via train/level | ✅ | 5 stats, train, level |
| **Job classes + Career Change (stack stats, unlock genres at Lv5)** | ❌ | GDS: Coder→Director→Hardware Eng→Hacker, stacking. Deep "build-a-character" system. We have fixed roles + traits only. |
| Genre/type unlocks gated by job level | ❌ | tied to careers above; ours unlock via spaces. |
| Office staff capacity (4/6/8) + tiered hiring methods | ◐ | we hire freely, no cap/tiers. |
| Training: 15 methods, diminishing, Super proc | ◐ | we have one Train action. |
| **Stat-boost consumable items** | ❌ | tied to item shop below |
| Salary ×1.2/level | ✅ | +8%/level |
| Special GOTY-unlock star recruits | ❌ | award-gated hires |
| Power/stamina + recovery | ✅ | energy + auto-rest (no Dead Bull item) |

## Economy / progression / endgame
| GDS mechanic | Status | Notes |
|---|---|---|
| **Contracts (timed commissions → cash + Research Data, fail penalty)** | ◐ | Brand Campaign = client cash, but no timed-deadline contract board w/ RD + penalty. |
| **Research Data (2nd currency)** | ❌ | GDS dual-currency: earned passively + contracts + debug; spent on leveling/boosts/research-mode. We use cash for everything. Structural gap (or a valid simplification). |
| Platform eras / console timeline | ✅ | per-era reach + trends |
| Console **licensing fees** to release | ❌ | pay-to-ship-on-platform |
| **Build your own console (late-game platform holder)** | ❌ | the big GDS ambition shift. Re-theme: launch your own **label / venue-network / platform**. |
| Hall of Fame + Sequels (inherit stats) | ✅ | legendary + sequels (gen head-start + residuals) |
| Annual awards + rival competition | ✅ | LA Scene Awards + rivals |
| **Item shop / Salesman (annual, 3/visit: boosts, manuals)** | ❌ | annual vendor of consumables |
| Office upgrade tiers (+capacity, unlock gating) | ◐ | buildable spaces, but no capacity/unlock tiers |
| Money / loans / $150K emergency buffer | ◐ | cash + game-over; no bailout (AP-floats-you bailout would fit) |
| Unlock tree over time (genres/types/consoles/training) | ◐ | partial via spaces |
| New Game+ (carry combo levels + direction bonus) | ✅ | prestige + legacy traits |
| Fan mail / demographic (gender/age) fan tracking | ❌ *(skip-ish)* | could re-theme to member segments. Low priority. |
| Rivals release consoles + overlap hurts your sales | ◐ | rivals release + compete at awards, don't yet dent our sales |
| Staff combos during dev (assign boost items) | ❌ | tied to items |

---

## The gaps that matter — ranked

**Tier 1 — genuinely major systems missing (worth building):**
1. **Career progression / role evolution** — promote crew along a tree (Editor → Art Director → Creative Director; Host → Promoter → Scene-Maker), stacking stats + unlocking project types. The deepest staff hook; research flagged "staff you build, not slots you fill" as the genre's stickiest mechanic.
2. **Contracts board** — timed client commissions for guaranteed cash + a craft resource, with deadline pressure + failure penalty. The early-game economy GDS leans on (and our $18k-runway tension wants).
3. **Build-your-own-label / platform** (late-game) — once big, launch your own label/venue-network/festival you "own," earning more on it. The ambition escalation we only lightly have (burn creep). Pairs with the equity beat.
4. **Marketing spend ladder + Showcase expo** — explicit promo campaigns (flyers → press push → out-of-home → viral stunt) with diminishing returns, plus an annual **Showcase** (SXSW-style booth tiers) for a hype spike. Turns "buzz" from passive to a lever.

**Tier 2 — strong adds, smaller:**
5. **Medium/vibe mastery leveling** — reuse a format → it levels → +base points. Cheap, big optimization/discovery hook.
6. **Item shop / annual vendor** — consumable boosts + a "career manual" equivalent (gates #1).
7. **A craft/"cred" second currency** — only if #1/#2/#6 land; otherwise keep cash-only (valid simplification).
8. **Crew capacity tied to spaces** + bailout loan (AP floats one rent) + rivals denting your sales on overlap.

**Deliberately NOT porting** (would bloat a tighter sim): GDS's full 20-genre × 79-type × 24-console unlock trees, 8-attribute layer, gender/age fan demographics. Our re-theme is leaner on purpose.

---

## Bottom line
Build covers ~**22 of 30** major GDS systems. The 8 gaps cluster into **4 real ones**: deep
**staff progression**, a **contracts** economy, a **late-game label/platform** play, and an active
**marketing/showcase** layer. None are blockers for the current loop — they're the depth that
separates "fun demo" from "100-hour tycoon."
