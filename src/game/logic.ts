// Pure game logic: state creation, weekly production tick, release scoring, training.
// Everything here is deterministic given its inputs except where Math.random is used
// for sparks / critic variance (intentional run-to-run variety).

import {
  CRITICS, MEDIUMS, ROLES, eraForYear, mediumById, rollCreative, synergyMult,
} from "./data";
import type {
  Axis, AxisPoints, Creative, GameState, LogEntry, Project, ReleaseResult,
} from "./types";

// --- Tunable constants (single place to balance) ----------------------------
export const WEEKS_PER_YEAR = 48;
const START_CASH = 60000;
const GLOBAL_RATE = 3.0;   // // TUNE production point rate
const HYPE_RATE = 1.4;     // // TUNE marketing -> hype rate
const POLISH_SCALE = 120;  // // TUNE rough-edge penalty scale
const REV_MULT = 2.0;      // // TUNE global revenue multiplier
const SPARK_CHANCE = 0.08; // per creative per week
const ENERGY_DRAIN = 9;
const ENERGY_REST = 15;
export const GAMEOVER_FUSE = 8; // consecutive negative-cash weeks before closure

const AXES: Axis[] = ["vision", "craft", "sound", "story"];
const zeroPoints = (): AxisPoints => ({ vision: 0, craft: 0, sound: 0, story: 0 });

export const yearOf = (week: number) => Math.floor(week / WEEKS_PER_YEAR);
export const rand = (a: number, b: number) => a + Math.random() * (b - a);

// --- Initial state ----------------------------------------------------------
export function createInitialState(): GameState {
  const starters: Creative[] = [
    { ...rollCreative(1.1), role: "producer" } as Creative,
    { ...rollCreative(1.1), role: "director" } as Creative,
    { ...rollCreative(1.1), role: "composer" } as Creative,
  ].map((c) => ({ ...c, name: c.name }));

  return {
    studioName: "Doghouse Productions",
    cash: START_CASH,
    week: 0,
    following: 0,
    reputation: 5,
    staff: starters,
    recruitPool: [rollCreative(), rollCreative(), rollCreative()],
    project: null,
    phase: "idle",
    log: [
      { week: 0, text: "Doghouse Productions opens its doors. Don't go broke.", kind: "info" },
    ],
    legendary: [],
    lastRelease: null,
    negativeWeeks: 0,
    gameOver: false,
  };
}

// --- Weekly salary ----------------------------------------------------------
export const weeklySalary = (staff: Creative[]) =>
  staff.reduce((sum, c) => sum + c.salary, 0);

// --- Production tick ---------------------------------------------------------
/** Advance one week of production. Returns updated project + staff + log lines. */
export function produceWeek(
  project: Project,
  allStaff: Creative[],
  week: number
): { project: Project; staff: Creative[]; logs: LogEntry[] } {
  const logs: LogEntry[] = [];
  const points = { ...project.points };
  let hype = project.hype;
  let rough = project.roughEdges;
  const assigned = new Set(project.staffIds);

  const staff = allStaff.map((c) => {
    if (!assigned.has(c.id)) return c;
    const role = ROLES[c.role];
    const energyF = 0.5 + 0.5 * (c.energy / 100);
    let mult = 1;
    if (Math.random() < SPARK_CHANCE) {
      mult = 2;
      logs.push({ week, text: `✨ ${c.name} had a breakthrough.`, kind: "good" });
    }
    for (const axis of AXES) {
      points[axis] += (c.stats[axis] * role.bias[axis]) / 4 * energyF * GLOBAL_RATE * mult;
    }
    hype += (c.stats.hustle * role.bias.hustle) / 4 * energyF * HYPE_RATE * mult;
    rough += rand(1.2, 3.2);

    // xp + level up
    let xp = c.xp + 12;
    let level = c.level;
    const stats = { ...c.stats };
    let salary = c.salary;
    if (xp >= level * 100) {
      xp -= level * 100;
      level += 1;
      const main = (Object.keys(role.bias) as (keyof typeof role.bias)[])
        .sort((a, b) => role.bias[b] - role.bias[a])[0];
      stats[main] += 2;
      stats.craft += 1;
      salary = Math.round(salary * 1.08);
      logs.push({ week, text: `${c.name} leveled up to Lv.${level}.`, kind: "good" });
    }
    return { ...c, energy: Math.max(0, c.energy - ENERGY_DRAIN), xp, level, stats, salary };
  });

  const updated: Project = {
    ...project,
    points,
    hype: Math.min(100, hype),
    roughEdges: rough,
    weeksElapsed: project.weeksElapsed + 1,
  };
  return { project: updated, staff, logs };
}

/** Idle creatives recover energy. */
export function restWeek(allStaff: Creative[], assignedIds: string[]): Creative[] {
  const assigned = new Set(assignedIds);
  return allStaff.map((c) =>
    assigned.has(c.id) ? c : { ...c, energy: Math.min(100, c.energy + ENERGY_REST) }
  );
}

/** Spend a week polishing: convert rough edges to quality. */
export function polishWeek(project: Project, allStaff: Creative[]): Project {
  const assigned = new Set(project.staffIds);
  const crew = allStaff.filter((c) => assigned.has(c.id));
  const power = crew.reduce((s, c) => s + c.stats.craft, 0) / 3 + 6;
  return {
    ...project,
    roughEdges: Math.max(0, project.roughEdges - power),
    weeksElapsed: project.weeksElapsed + 1,
  };
}

// --- Release scoring --------------------------------------------------------
export function computeRelease(state: GameState, project: Project): ReleaseResult {
  const medium = mediumById(project.medium);
  const syn = synergyMult(project.medium, project.vibe);
  const reach = eraForYear(yearOf(state.week)).reach;

  const raw = AXES.reduce((s, a) => s + project.points[a] * medium.weights[a], 0);
  const polish = clamp(1 - project.roughEdges / POLISH_SCALE, 0.5, 1);
  const repF = 0.85 + (state.reputation / 100) * 0.3;
  const Q = raw * syn * polish * repF;

  const totalPts = AXES.reduce((s, a) => s + project.points[a], 0) || 1;
  const hypeShare = clamp(project.hype / 100, 0, 1);

  const criticScores = CRITICS.map((critic) => {
    let lean = 0;
    for (const a of AXES) {
      const l = critic.lean[a];
      if (l) lean += l * (project.points[a] / totalPts);
    }
    if (critic.lean.hype) lean += critic.lean.hype * hypeShare;
    const base = (Q / medium.expectedQ) * 7;
    return Math.round(clamp(base + lean + rand(-1, 1), 1, 10));
  });

  const score40 = criticScores.reduce((a, b) => a + b, 0);
  const scoreFrac = score40 / 40;

  const newFollowers = Math.round(
    medium.baseFans * scoreFrac ** 2 * syn * reach * (1 + project.hype / 100)
  );
  const units = (state.following + newFollowers) * medium.conversion * scoreFrac ** 1.5;
  const revenue = Math.round(units * medium.price * REV_MULT) + (medium.clientFee ?? 0);

  return {
    title: project.title,
    medium: project.medium,
    vibe: project.vibe,
    criticScores,
    score40,
    newFollowers,
    revenue,
    legendary: score40 >= 38,
    week: state.week,
  };
}

// --- Training ---------------------------------------------------------------
export const trainCost = (c: Creative) => 1500 + c.level * 900; // // TUNE
export function applyTrain(c: Creative): Creative {
  const role = ROLES[c.role];
  const main = (Object.keys(role.bias) as (keyof typeof role.bias)[])
    .sort((a, b) => role.bias[b] - role.bias[a])[0];
  return {
    ...c,
    stats: { ...c.stats, [main]: c.stats[main] + 3, craft: c.stats.craft + 1 },
    energy: Math.min(100, c.energy + 20),
  };
}

// --- helpers ----------------------------------------------------------------
export function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

export function newProject(
  title: string,
  medium: Project["medium"],
  vibe: Project["vibe"],
  staffIds: string[]
): Project {
  const m = MEDIUMS.find((x) => x.id === medium)!;
  return {
    title: title.trim() || "Untitled",
    medium,
    vibe,
    weeksTotal: m.weeks,
    weeksElapsed: 0,
    points: zeroPoints(),
    hype: 0,
    roughEdges: 0,
    staffIds,
  };
}
