// Pure game logic. Math.random drives sparks, critic variance, trends, events,
// surprises, rivals (intentional run-to-run variety).

import {
  AWARD_CATEGORIES, CRITICS, DEFAULT_PHASES, FOCUS, GOAL_TEMPLATES, LEGACY_TRAITS,
  MEDIUMS, RIVAL_NAMES, ROLES, SEASONS, TRAITS, UPGRADES, eraForYear, mediumById,
  narratorLine, rollRecruit, scenarioById, seasonForMonth, startingCrew, synergyMult,
} from "./data";
import type {
  AwardResult, Axis, AxisPoints, CatalogItem, Creative, Focus, GameState, Goal,
  LogEntry, Medium, Phases, Project, ReleaseResult, Rival, Trend,
} from "./types";

// ---- Tunable constants ----
export const WEEKS_PER_YEAR = 48;
export const WEEKS_PER_MONTH = 4;
export const BASE_BURN = 8000;
export const MEMBER_VALUE = 35;
const GLOBAL_RATE = 3.0;
const HYPE_RATE = 1.4;
const POLISH_SCALE = 120;
const REV_MULT = 2.0;
const BUZZ_DECAY = 0.85;
const BASE_VENUE_CAP = 120;
const SPARK_CHANCE = 0.08;
const ENERGY_DRAIN = 9;
const ENERGY_REST = 15;
export const GAMEOVER_FUSE = 8;
const EVENT_CHANCE = 0.5;
const SURPRISE_CHANCE = 0.28;
const RESIDUAL_MONTHS = 8;

const AXES: Axis[] = ["vision", "craft", "sound", "story"];
const zeroPoints = (): AxisPoints => ({ vision: 0, craft: 0, sound: 0, story: 0 });

export const yearOf = (week: number) => Math.floor(week / WEEKS_PER_YEAR);
export const monthOf = (week: number) => Math.floor(week / WEEKS_PER_MONTH);
export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export function clamp(x: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, x)); }
export const seasonOf = (week: number) => seasonForMonth(monthOf(week));

export const mrrOf = (s: GameState) => Math.round(s.members * MEMBER_VALUE);
export const residualOf = (s: GameState) => s.catalog.reduce((sum, c) => sum + c.residual, 0);

export function venueCapOf(s: GameState): number {
  return BASE_VENUE_CAP + UPGRADES.filter((u) => s.ownedUpgrades.includes(u.id))
    .reduce((sum, u) => sum + (u.venueCap ?? 0), 0);
}
export function axisBoostsOf(s: GameState): Partial<AxisPoints> {
  const out: Partial<AxisPoints> = {};
  for (const u of UPGRADES) {
    if (u.axis && u.axisBoost && s.ownedUpgrades.includes(u.id)) out[u.axis] = (out[u.axis] ?? 0) + u.axisBoost;
  }
  return out;
}

export function rollTrend(): Trend {
  const m = MEDIUMS[Math.floor(Math.random() * MEDIUMS.length)].id;
  const vibes = ["romance", "hype", "nostalgia", "rebellion", "luxury", "wholesome", "experimental", "dark"] as const;
  return { medium: m, vibe: vibes[Math.floor(Math.random() * vibes.length)], monthsLeft: 3 };
}
function trendBonus(s: GameState, project: Project): number {
  let b = 1;
  if (s.trend.medium === project.medium) b += 0.2;
  if (s.trend.vibe === project.vibe) b += 0.15;
  return b;
}
function seasonBonus(s: GameState, medium: Medium, vibe: string): number {
  const season = seasonOf(s.week);
  let b = 1;
  if (season.vibe === vibe) b += 0.15;
  if (season.kind === medium.kind) b += 0.1;
  return b;
}

// ---- Phases ----
export function phaseIdeal(m: Medium): Phases {
  const concept = m.weights.vision + m.weights.story;
  const build = m.weights.craft + m.weights.sound;
  const promo = 0.3;
  const sum = concept + build + promo;
  return { concept: concept / sum, build: build / sum, promo: promo / sum };
}
export function phaseMatch(p: Phases, ideal: Phases): number {
  const d = Math.abs(p.concept - ideal.concept) + Math.abs(p.build - ideal.build) + Math.abs(p.promo - ideal.promo);
  return clamp(1 - d * 0.8, 0, 1);
}

// ---- Initial state ----
export function createInitialState(scenarioId = "studio", legacyTraits: string[] = [], legacyRun = 0): GameState {
  const sc = scenarioById(scenarioId);
  const has = (id: string) => legacyTraits.includes(id);
  const cash = sc.cash + (has("pockets") ? 25000 : 0);
  const rep = Math.max(sc.rep, has("taste") ? 30 : sc.rep);
  const burn = Math.round(sc.burn * (has("lean") ? 0.85 : 1));

  return {
    studioName: "Doghouse Productions",
    cash, week: 0, members: sc.members, buzz: 0, reputation: rep, burn,
    staff: startingCrew(),
    recruitPool: [rollRecruit(), rollRecruit(), rollRecruit()],
    project: null, phase: "idle",
    trend: rollTrend(), ownedUpgrades: [],
    log: [{ week: 0, text: "Doghouse Productions opens at 101 E 17th St.", kind: "info" }],
    legendary: [], lastRelease: null,
    firedBeats: [], storyQueue: ["intro"], activeEventId: null,
    negativeWeeks: 0, gameOver: false,
    catalog: [], goals: rollGoals([]), rivals: seedRivals(), narrator: null,
    trendPreviewed: false, awardsPending: null, lastAwardYear: 0,
    legacyRun, legacyTraits, scenarioId,
    totalReleases: 0, bestScore: 0, equityTriggered: false, banner: null,
  };
}

export const weeklySalary = (staff: Creative[]) => staff.reduce((sum, c) => sum + c.salary, 0);

// ---- Rivals ----
function seedRivals(): Rival[] {
  return RIVAL_NAMES.slice(0, 3).map((name) => ({
    name, members: Math.round(rand(40, 120)), rep: Math.round(rand(8, 25)),
    lastTitle: "—", lastScore: 0,
  }));
}
const RIVAL_TITLES = ["Afterglow", "Concrete Roses", "Night Shift", "Golden Hour", "Static", "Bloom", "Outsider", "Sunday Best"];
export function tickRivals(rivals: Rival[]): Rival[] {
  return rivals.map((r) => {
    const released = Math.random() < 0.5;
    return {
      ...r,
      members: Math.round(r.members * rand(1.02, 1.12) + rand(2, 10)),
      rep: clamp(r.rep + (released ? rand(0, 2) : 0), 0, 100),
      lastTitle: released ? RIVAL_TITLES[Math.floor(Math.random() * RIVAL_TITLES.length)] : r.lastTitle,
      lastScore: released ? Math.round(rand(20, 37)) : r.lastScore,
    };
  });
}

// ---- Goals (keep two active) ----
export function rollGoals(existing: Goal[]): Goal[] {
  const active = existing.filter((g) => !g.done);
  const have = new Set(existing.map((g) => g.id));
  const pool = GOAL_TEMPLATES.filter((t) => !have.has(t.id));
  while (active.length < 2 && pool.length) {
    const t = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    active.push({ id: t.id, label: t.label, reward: t.reward, done: false });
  }
  return active;
}
export function checkGoals(s: GameState): { goals: Goal[]; reward: number; logs: string[] } {
  let reward = 0; const logs: string[] = [];
  const goals = s.goals.map((g) => {
    const tmpl = GOAL_TEMPLATES.find((t) => t.id === g.id);
    if (!g.done && tmpl && tmpl.test(s)) { reward += g.reward; logs.push(`Goal hit: ${g.label} (+$${g.reward.toLocaleString()})`); return { ...g, done: true }; }
    return g;
  });
  return { goals, reward, logs };
}

// ---- Production tick ----
export function produceWeek(
  project: Project, allStaff: Creative[], week: number, axisBoost: Partial<AxisPoints>
): { project: Project; staff: Creative[]; logs: LogEntry[] } {
  const logs: LogEntry[] = [];
  const points = { ...project.points };
  let hype = project.hype;
  let rough = project.roughEdges;
  const focus = FOCUS[project.focus];
  const ph = project.phases;
  const phaseMul: Record<Axis, number> = {
    vision: 0.6 + ph.concept * 1.2, story: 0.6 + ph.concept * 1.2,
    craft: 0.6 + ph.build * 1.2, sound: 0.6 + ph.build * 1.2,
  };
  const assigned = new Set(project.staffIds);
  const crew = allStaff.filter((c) => assigned.has(c.id));
  const teamMorale = crew.reduce((s, c) => s + (c.trait ? TRAITS[c.trait].morale ?? 0 : 0), 0);

  const staff = allStaff.map((c) => {
    if (!assigned.has(c.id)) return c;
    const trait = c.trait ? TRAITS[c.trait] : undefined;
    const energyF = 0.5 + 0.5 * (c.energy / 100);
    const outMult = (trait?.outputMult ?? 1) * focus.outMult;
    const drain = trait?.energyDrain ?? ENERGY_DRAIN;
    let spark = 1;
    if (Math.random() < SPARK_CHANCE * focus.sparkMult) {
      spark = 2;
      logs.push({ week, text: `✨ ${c.name} had a breakthrough.`, kind: "good" });
    }
    const role = ROLES[c.role];
    for (const axis of AXES) {
      const boost = 1 + (axisBoost[axis] ?? 0);
      points[axis] += ((c.stats[axis] * role.bias[axis]) / 4 * energyF * GLOBAL_RATE * outMult * spark + teamMorale) * boost * phaseMul[axis];
    }
    hype += (c.stats.hustle * role.bias.hustle) / 4 * energyF * HYPE_RATE * spark * focus.buzzMult * (0.6 + ph.promo * 1.2);
    rough += rand(1.2, 3.2) * focus.roughMult;

    let xp = c.xp + 12; let level = c.level; const stats = { ...c.stats }; let salary = c.salary;
    if (xp >= level * 100) {
      xp -= level * 100; level += 1;
      const main = (Object.keys(role.bias) as (keyof typeof role.bias)[]).sort((a, b) => role.bias[b] - role.bias[a])[0];
      stats[main] += 2; stats.craft += 1; salary = Math.round(salary * 1.08);
      logs.push({ week, text: `${c.name} leveled up to Lv.${level}.`, kind: "good" });
    }
    return { ...c, energy: Math.max(0, c.energy - drain), xp, level, stats, salary };
  });

  return {
    project: { ...project, points, hype: Math.min(100, hype), roughEdges: rough, weeksElapsed: project.weeksElapsed + 1 },
    staff, logs,
  };
}

export function restWeek(allStaff: Creative[], assignedIds: string[]): Creative[] {
  const assigned = new Set(assignedIds);
  return allStaff.map((c) => assigned.has(c.id) ? c : { ...c, energy: Math.min(100, c.energy + ENERGY_REST) });
}
export function polishWeek(project: Project, allStaff: Creative[]): Project {
  const crew = allStaff.filter((c) => project.staffIds.includes(c.id));
  const power = crew.reduce((s, c) => s + c.stats.craft, 0) / 3 + 6;
  return { ...project, roughEdges: Math.max(0, project.roughEdges - power), weeksElapsed: project.weeksElapsed + 1 };
}

// ---- Mid-project risk spike ----
export function resolveSpike(project: Project): { project: Project; success: boolean; text: string } {
  const success = Math.random() < 0.55;
  const points = { ...project.points };
  if (success) {
    for (const a of AXES) points[a] *= 1.3;
    return { project: { ...project, points, spikeUsed: true }, success: true, text: "The gamble paid off — a real breakthrough." };
  }
  return { project: { ...project, roughEdges: project.roughEdges + 28, hype: Math.max(0, project.hype - 12), spikeUsed: true }, success: false, text: "The swing missed. Rough edges piled up." };
}

// ---- Release scoring + payoff ----
const SURPRISES = [
  { t: "A label rep slid into the DMs.", cash: 4500, members: 0, buzz: 0 },
  { t: "A bigger name reposted it.", cash: 0, members: 0, buzz: 45 },
  { t: "Walk-in crowd doubled.", cash: 0, members: 40, buzz: 0 },
  { t: "A sponsor wants the next one.", cash: 6000, members: 0, buzz: 0 },
  { t: "It got added to a tastemaker playlist.", cash: 0, members: 25, buzz: 25 },
];

export function computeRelease(state: GameState, project: Project): ReleaseResult {
  const medium = mediumById(project.medium);
  const syn = synergyMult(project.medium, project.vibe);
  const reachEra = eraForYear(yearOf(state.week)).reach;
  const tBonus = trendBonus(state, project);
  const sBonus = seasonBonus(state, medium, project.vibe);
  const focus = FOCUS[project.focus];
  const pMatch = phaseMatch(project.phases, phaseIdeal(medium));
  const genBonus = 1 + 0.1 * (project.generation - 1);
  const cult = state.legacyTraits.includes("cult") ? 1.25 : 1;

  const raw = AXES.reduce((s, a) => s + project.points[a] * medium.weights[a], 0);
  const polish = clamp(1 - project.roughEdges / POLISH_SCALE, 0.5, 1);
  const repF = 0.85 + (state.reputation / 100) * 0.3;
  const Q = raw * syn * polish * repF * (0.85 + 0.3 * pMatch);

  const totalPts = AXES.reduce((s, a) => s + project.points[a], 0) || 1;
  const hypeShare = clamp(project.hype / 100, 0, 1);
  const criticScores = CRITICS.map((critic) => {
    let lean = 0;
    for (const a of AXES) { const l = critic.lean[a]; if (l) lean += l * (project.points[a] / totalPts); }
    if (critic.lean.hype) lean += critic.lean.hype * hypeShare;
    return Math.round(clamp((Q / medium.expectedQ) * 7 + lean + rand(-1, 1), 1, 10));
  });
  const score40 = criticScores.reduce((a, b) => a + b, 0);
  const f = score40 / 40;

  const crew = state.staff.filter((c) => project.staffIds.includes(c.id));
  const bestBuzz = Math.max(1, ...crew.map((c) => c.trait ? TRAITS[c.trait].buzzMult ?? 1 : 1)) * focus.buzzMult;
  const bestMember = Math.max(1, ...crew.map((c) => c.trait ? TRAITS[c.trait].memberMult ?? 1 : 1)) * cult;

  let newMembers: number, buzzGain: number, revenue: number;
  if (medium.kind === "event") {
    const cap = venueCapOf(state);
    newMembers = Math.min(cap, Math.round(medium.reach * f ** 2 * syn * tBonus * sBonus * (1 + state.buzz / 600) * bestMember * genBonus));
    buzzGain = Math.round(medium.reach * 0.05 * f * reachEra);
    revenue = Math.round(newMembers * medium.cashPer * medium.conv * 4);
  } else {
    buzzGain = Math.round(medium.reach * 0.08 * f ** 1.5 * syn * tBonus * sBonus * reachEra * bestBuzz * genBonus);
    newMembers = Math.round(buzzGain * 0.2 * bestMember);
    const units = (state.members + state.buzz) * medium.conv * f ** 1.5;
    revenue = Math.round(units * medium.cashPer * REV_MULT) + (medium.clientFee ?? 0);
  }

  let surprise: string | undefined;
  if (Math.random() < SURPRISE_CHANCE && score40 >= 18) {
    const sp = SURPRISES[Math.floor(Math.random() * SURPRISES.length)];
    revenue += sp.cash; newMembers += sp.members; buzzGain += sp.buzz; surprise = sp.t;
  }

  return {
    title: project.title, medium: project.medium, vibe: project.vibe, kind: medium.kind,
    criticScores, score40, newMembers, buzzGain, revenue, legendary: score40 >= 38,
    week: state.week, phaseMatch: pMatch, surprise, generation: project.generation,
  };
}

/** Catalog entry for residual income from a strong release. */
export function catalogFrom(r: ReleaseResult): CatalogItem | null {
  if (r.score40 < 28) return null;
  return {
    title: r.title, medium: r.medium, vibe: r.vibe, score40: r.score40, generation: r.generation,
    residual: Math.round((r.revenue * 0.04) + r.score40 * 6), monthsLeft: RESIDUAL_MONTHS,
  };
}
export function decayCatalog(catalog: CatalogItem[]): CatalogItem[] {
  return catalog.map((c) => ({ ...c, residual: Math.round(c.residual * 0.88), monthsLeft: c.monthsLeft - 1 })).filter((c) => c.monthsLeft > 0);
}

// ---- Awards (annual) ----
export function resolveAwards(s: GameState): AwardResult {
  const rivalBestScore = Math.max(0, ...s.rivals.map((r) => r.lastScore));
  const rivalTopMembers = Math.max(0, ...s.rivals.map((r) => r.members));
  const topRival = [...s.rivals].sort((a, b) => b.members - a.members)[0]?.name ?? "a rival";
  const categories = AWARD_CATEGORIES.map((name) => {
    let youWon = false;
    if (name === "Scene Favorite") youWon = s.members >= rivalTopMembers;
    else if (name === "Best Newcomer") youWon = s.legacyRun === 0 && s.reputation >= 20;
    else youWon = s.bestScore >= rivalBestScore && s.bestScore >= 30;
    return { name, winner: youWon ? s.studioName : topRival, youWon, nominee: youWon ? topRival : s.studioName };
  });
  return { year: yearOf(s.week) + 1, categories };
}

// ---- Story beats ----
export function checkBeats(s: GameState): string[] {
  const out: string[] = [];
  const fired = new Set([...s.firedBeats, ...s.storyQueue]);
  const mrr = mrrOf(s);
  const add = (id: string, cond: boolean) => { if (cond && !fired.has(id)) out.push(id); };
  add("first_members", s.members >= 60);
  add("break_even", mrr >= s.burn && s.members > 0);
  add("past_june", s.week >= 12);
  add("first_legendary", s.legendary.length >= 1);
  add("equity", mrr >= 18000);
  add("elite", s.members >= 600);
  return out;
}

// ---- Training ----
export const trainCost = (c: Creative) => 1500 + c.level * 900;
export function applyTrain(c: Creative): Creative {
  const role = ROLES[c.role];
  const main = (Object.keys(role.bias) as (keyof typeof role.bias)[]).sort((a, b) => role.bias[b] - role.bias[a])[0];
  return { ...c, stats: { ...c.stats, [main]: c.stats[main] + 3, craft: c.stats.craft + 1 }, energy: Math.min(100, c.energy + 20) };
}

// ---- New project ----
export function newProject(
  title: string, medium: Project["medium"], vibe: Project["vibe"], staffIds: string[],
  focus: Focus = "balanced", phases: Phases = DEFAULT_PHASES, sequelOf?: string, generation = 1
): Project {
  const m = MEDIUMS.find((x) => x.id === medium) as Medium;
  const points = zeroPoints();
  if (generation > 1) {
    const head = (generation - 1) * 0.12 * m.expectedQ;
    for (const a of AXES) points[a] = head * m.weights[a];
  }
  return {
    title: title.trim() || "Untitled", medium, vibe, focus, phases,
    weeksTotal: Math.max(1, Math.round(m.weeks * FOCUS[focus].weeksMult)),
    weeksElapsed: 0, points, hype: 0, roughEdges: 0, staffIds, spikeUsed: false, sequelOf, generation,
  };
}

// ---- Transparency: projected score band ----
export function estimateScore(
  crew: Creative[], mediumId: Project["medium"], vibe: Project["vibe"], phases: Phases, focus: Focus, reputation: number
): { low: number; high: number } | null {
  if (crew.length === 0) return null;
  const m = mediumById(mediumId);
  const f = FOCUS[focus];
  const weeks = Math.max(1, Math.round(m.weeks * f.weeksMult));
  const pts = zeroPoints();
  for (const c of crew) {
    const role = ROLES[c.role];
    const out = (c.trait ? TRAITS[c.trait].outputMult ?? 1 : 1) * f.outMult;
    for (const a of AXES) pts[a] += (c.stats[a] * role.bias[a]) / 4 * GLOBAL_RATE * out * weeks * 0.78;
  }
  const ph = { vision: 0.6 + phases.concept * 1.2, story: 0.6 + phases.concept * 1.2, craft: 0.6 + phases.build * 1.2, sound: 0.6 + phases.build * 1.2 };
  const raw = AXES.reduce((s, a) => s + pts[a] * ph[a] * m.weights[a], 0);
  const syn = synergyMult(mediumId, vibe);
  const pMatch = phaseMatch(phases, phaseIdeal(m));
  const repF = 0.85 + (reputation / 100) * 0.3;
  const Q = raw * syn * 0.9 * repF * (0.85 + 0.3 * pMatch);
  const per = clamp((Q / m.expectedQ) * 7, 1, 10);
  const mid = Math.round(per * 4);
  return { low: clamp(mid - 5, 4, 40), high: clamp(mid + 4, 4, 40) };
}

export { EVENT_CHANCE, BUZZ_DECAY, narratorLine, SEASONS, LEGACY_TRAITS };
