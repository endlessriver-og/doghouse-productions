// Pure game logic. Math.random is used for sparks, critic variance, trends and the
// random-event roll (intentional run-to-run variety).

import {
  CRITICS, MEDIUMS, ROLES, TRAITS, UPGRADES, eraForYear, mediumById, rollRecruit,
  startingCrew, synergyMult,
} from "./data";
import type {
  Axis, AxisPoints, Creative, GameState, LogEntry, Medium, Project, ReleaseResult, Trend,
} from "./types";

// ---- Tunable constants ----
export const WEEKS_PER_YEAR = 48;
export const WEEKS_PER_MONTH = 4;
export const BASE_BURN = 8000;       // monthly rent + ops floor (real Omni number)
export const MEMBER_VALUE = 35;      // blended $/member/month // TUNE
const START_CASH = 60000;
const GLOBAL_RATE = 3.0;             // production point rate // TUNE
const HYPE_RATE = 1.4;
const POLISH_SCALE = 120;
const REV_MULT = 2.0;
const BUZZ_DECAY = 0.85;            // monthly buzz retention
const BASE_VENUE_CAP = 120;
const SPARK_CHANCE = 0.08;
const ENERGY_DRAIN = 9;
const ENERGY_REST = 15;
export const GAMEOVER_FUSE = 8;
const EVENT_CHANCE = 0.5;           // chance of a choice-event each month

const AXES: Axis[] = ["vision", "craft", "sound", "story"];
const zeroPoints = (): AxisPoints => ({ vision: 0, craft: 0, sound: 0, story: 0 });

export const yearOf = (week: number) => Math.floor(week / WEEKS_PER_YEAR);
export const monthOf = (week: number) => Math.floor(week / WEEKS_PER_MONTH);
export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export function clamp(x: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, x)); }

export const mrrOf = (s: GameState) => Math.round(s.members * MEMBER_VALUE);

export function venueCapOf(s: GameState): number {
  return BASE_VENUE_CAP + UPGRADES.filter((u) => s.ownedUpgrades.includes(u.id))
    .reduce((sum, u) => sum + (u.venueCap ?? 0), 0);
}
export function axisBoostsOf(s: GameState): Partial<AxisPoints> {
  const out: Partial<AxisPoints> = {};
  for (const u of UPGRADES) {
    if (u.axis && u.axisBoost && s.ownedUpgrades.includes(u.id)) {
      out[u.axis] = (out[u.axis] ?? 0) + u.axisBoost;
    }
  }
  return out;
}

export function rollTrend(): Trend {
  const m = MEDIUMS[Math.floor(Math.random() * MEDIUMS.length)].id;
  const vibes = ["romance", "hype", "nostalgia", "rebellion", "luxury", "wholesome", "experimental", "dark"] as const;
  const v = vibes[Math.floor(Math.random() * vibes.length)];
  return { medium: m, vibe: v, monthsLeft: 3 };
}

function trendBonus(s: GameState, project: Project): number {
  let b = 1;
  if (s.trend.medium === project.medium) b += 0.2;
  if (s.trend.vibe === project.vibe) b += 0.15;
  return b;
}

// ---- Initial state ----
export function createInitialState(): GameState {
  return {
    studioName: "Doghouse Productions",
    cash: START_CASH,
    week: 0,
    members: 0,
    buzz: 0,
    reputation: 5,
    burn: BASE_BURN,
    staff: startingCrew(),
    recruitPool: [rollRecruit(), rollRecruit(), rollRecruit()],
    project: null,
    phase: "idle",
    trend: rollTrend(),
    ownedUpgrades: [],
    log: [{ week: 0, text: "Doghouse Productions opens at 101 E 17th St.", kind: "info" }],
    legendary: [],
    lastRelease: null,
    firedBeats: [],
    storyQueue: ["intro"],
    activeEventId: null,
    negativeWeeks: 0,
    gameOver: false,
    totalReleases: 0,
    bestScore: 0,
    equityTriggered: false,
    banner: null,
  };
}

export const weeklySalary = (staff: Creative[]) => staff.reduce((sum, c) => sum + c.salary, 0);

// ---- Production tick ----
export function produceWeek(
  project: Project, allStaff: Creative[], week: number, axisBoost: Partial<AxisPoints>
): { project: Project; staff: Creative[]; logs: LogEntry[]; gains: AxisPoints } {
  const logs: LogEntry[] = [];
  const points = { ...project.points };
  const gains = zeroPoints();
  let hype = project.hype;
  let rough = project.roughEdges;
  const assigned = new Set(project.staffIds);
  const crew = allStaff.filter((c) => assigned.has(c.id));
  const teamMorale = crew.reduce((s, c) => s + (c.trait ? TRAITS[c.trait].morale ?? 0 : 0), 0);

  const staff = allStaff.map((c) => {
    if (!assigned.has(c.id)) return c;
    const trait = c.trait ? TRAITS[c.trait] : undefined;
    const energyF = 0.5 + 0.5 * (c.energy / 100);
    const outMult = trait?.outputMult ?? 1;
    const drain = trait?.energyDrain ?? ENERGY_DRAIN;
    let spark = 1;
    if (Math.random() < SPARK_CHANCE) {
      spark = 2;
      logs.push({ week, text: `✨ ${c.name} had a breakthrough.`, kind: "good" });
    }
    const role = ROLES[c.role];
    for (const axis of AXES) {
      const boost = 1 + (axisBoost[axis] ?? 0);
      const add = ((c.stats[axis] * role.bias[axis]) / 4 * energyF * GLOBAL_RATE * outMult * spark + teamMorale) * boost;
      points[axis] += add;
      gains[axis] += add;
    }
    hype += (c.stats.hustle * role.bias.hustle) / 4 * energyF * HYPE_RATE * spark;
    rough += rand(1.2, 3.2);

    let xp = c.xp + 12; let level = c.level; const stats = { ...c.stats }; let salary = c.salary;
    if (xp >= level * 100) {
      xp -= level * 100; level += 1;
      const main = (Object.keys(role.bias) as (keyof typeof role.bias)[]).sort((a, b) => role.bias[b] - role.bias[a])[0];
      stats[main] += 2; stats.craft += 1; salary = Math.round(salary * 1.08);
      logs.push({ week, text: `${c.name} leveled up to Lv.${level}.`, kind: "good" });
    }
    return { ...c, energy: Math.max(0, c.energy - drain), xp, level, stats, salary };
  });

  const updated: Project = {
    ...project, points, hype: Math.min(100, hype), roughEdges: rough,
    weeksElapsed: project.weeksElapsed + 1,
  };
  return { project: updated, staff, logs, gains };
}

export function restWeek(allStaff: Creative[], assignedIds: string[]): Creative[] {
  const assigned = new Set(assignedIds);
  return allStaff.map((c) => assigned.has(c.id) ? c : { ...c, energy: Math.min(100, c.energy + ENERGY_REST) });
}

export function polishWeek(project: Project, allStaff: Creative[]): Project {
  const assigned = new Set(project.staffIds);
  const crew = allStaff.filter((c) => assigned.has(c.id));
  const power = crew.reduce((s, c) => s + c.stats.craft, 0) / 3 + 6;
  return { ...project, roughEdges: Math.max(0, project.roughEdges - power), weeksElapsed: project.weeksElapsed + 1 };
}

// ---- Release scoring + payoff ----
export function computeRelease(state: GameState, project: Project): ReleaseResult {
  const medium = mediumById(project.medium);
  const syn = synergyMult(project.medium, project.vibe);
  const reachEra = eraForYear(yearOf(state.week)).reach;
  const tBonus = trendBonus(state, project);

  const raw = AXES.reduce((s, a) => s + project.points[a] * medium.weights[a], 0);
  const polish = clamp(1 - project.roughEdges / POLISH_SCALE, 0.5, 1);
  const repF = 0.85 + (state.reputation / 100) * 0.3;
  const Q = raw * syn * polish * repF;

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

  // crew trait payoff multipliers (best-of among assigned)
  const crew = state.staff.filter((c) => project.staffIds.includes(c.id));
  const bestBuzz = Math.max(1, ...crew.map((c) => c.trait ? TRAITS[c.trait].buzzMult ?? 1 : 1));
  const bestMember = Math.max(1, ...crew.map((c) => c.trait ? TRAITS[c.trait].memberMult ?? 1 : 1));

  let newMembers: number, buzzGain: number, revenue: number;
  if (medium.kind === "event") {
    const cap = venueCapOf(state);
    newMembers = Math.min(cap, Math.round(medium.reach * f ** 2 * syn * (1 + state.buzz / 600) * tBonus * bestMember));
    buzzGain = Math.round(medium.reach * 0.05 * f * reachEra);
    revenue = Math.round(newMembers * medium.cashPer * medium.conv * 4);
  } else {
    buzzGain = Math.round(medium.reach * 0.08 * f ** 1.5 * syn * tBonus * reachEra * bestBuzz);
    newMembers = Math.round(buzzGain * 0.2 * bestMember);
    const units = (state.members + state.buzz) * medium.conv * f ** 1.5;
    revenue = Math.round(units * medium.cashPer * REV_MULT) + (medium.clientFee ?? 0);
  }

  return {
    title: project.title, medium: project.medium, vibe: project.vibe, kind: medium.kind,
    criticScores, score40, newMembers, buzzGain, revenue, legendary: score40 >= 38, week: state.week,
  };
}

// ---- Story beats ----
export function checkBeats(s: GameState): string[] {
  const out: string[] = [];
  const fired = new Set([...s.firedBeats, ...s.storyQueue]);
  const add = (id: string, cond: boolean) => { if (cond && !fired.has(id)) out.push(id); };
  const mrr = mrrOf(s);
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

export function newProject(title: string, medium: Project["medium"], vibe: Project["vibe"], staffIds: string[]): Project {
  const m = MEDIUMS.find((x) => x.id === medium) as Medium;
  return {
    title: title.trim() || "Untitled", medium, vibe, weeksTotal: m.weeks, weeksElapsed: 0,
    points: zeroPoints(), hype: 0, roughEdges: 0, staffIds,
  };
}

export { EVENT_CHANCE, BUZZ_DECAY };
