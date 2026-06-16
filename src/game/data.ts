// Content tables: mediums, vibes, roles, critics, platform eras, synergy grid.
// All numbers are first-pass and marked // TUNE where balance matters.

import type {
  Critic,
  Medium,
  MediumId,
  PlatformEra,
  RoleId,
  Stats,
  SynergyTier,
  Vibe,
  VibeId,
} from "./types";

export const MEDIUMS: Medium[] = [
  {
    id: "single", name: "Single", weeks: 3, budget: 4000,
    weights: { vision: 0.15, craft: 0.2, sound: 0.45, story: 0.2 },
    baseFans: 1800, conversion: 0.5, price: 4, monetization: "streams", expectedQ: 90,
  },
  {
    id: "musicvideo", name: "Music Video", weeks: 4, budget: 9000,
    weights: { vision: 0.4, craft: 0.3, sound: 0.2, story: 0.1 },
    baseFans: 3200, conversion: 0.35, price: 6, monetization: "streams", expectedQ: 150,
  },
  {
    id: "album", name: "Album", weeks: 8, budget: 22000,
    weights: { vision: 0.15, craft: 0.2, sound: 0.4, story: 0.25 },
    baseFans: 6500, conversion: 0.45, price: 11, monetization: "streams", expectedQ: 340,
  },
  {
    id: "shortfilm", name: "Short Film", weeks: 7, budget: 18000,
    weights: { vision: 0.35, craft: 0.25, sound: 0.1, story: 0.3 },
    baseFans: 5200, conversion: 0.3, price: 12, monetization: "streams", expectedQ: 300,
  },
  {
    id: "brand", name: "Brand Campaign", weeks: 4, budget: 6000,
    weights: { vision: 0.25, craft: 0.35, sound: 0.1, story: 0.3 },
    baseFans: 1500, conversion: 0.2, price: 5, monetization: "client", clientFee: 26000, expectedQ: 150,
  },
  {
    id: "event", name: "Live Event", weeks: 5, budget: 14000,
    weights: { vision: 0.3, craft: 0.4, sound: 0.2, story: 0.1 },
    baseFans: 4200, conversion: 0.12, price: 38, monetization: "tickets", expectedQ: 210,
  },
  {
    id: "fashion", name: "Fashion Drop", weeks: 5, budget: 12000,
    weights: { vision: 0.45, craft: 0.35, sound: 0.05, story: 0.15 },
    baseFans: 3800, conversion: 0.08, price: 60, monetization: "merch", expectedQ: 220,
  },
  {
    id: "podcast", name: "Podcast", weeks: 3, budget: 2500,
    weights: { vision: 0.1, craft: 0.2, sound: 0.3, story: 0.4 },
    baseFans: 1400, conversion: 0.4, price: 3, monetization: "streams", expectedQ: 80,
  },
];

export const VIBES: Vibe[] = [
  { id: "romance", name: "Romance" },
  { id: "hype", name: "Hype" },
  { id: "nostalgia", name: "Nostalgia" },
  { id: "rebellion", name: "Rebellion" },
  { id: "luxury", name: "Luxury" },
  { id: "wholesome", name: "Wholesome" },
  { id: "experimental", name: "Experimental" },
  { id: "dark", name: "Dark" },
];

export interface RoleDef {
  id: RoleId;
  name: string;
  /** Relative weight this role puts into each stat when producing. */
  bias: Stats;
  speed: number; // weeks multiplier; producer is faster // TUNE
}

export const ROLES: Record<RoleId, RoleDef> = {
  director:  { id: "director",  name: "Director",  bias: { vision: 3, craft: 1.5, sound: 0.5, story: 1, hustle: 0.5 }, speed: 1 },
  editor:    { id: "editor",    name: "Editor",    bias: { vision: 1, craft: 3, sound: 0.5, story: 1, hustle: 0.5 }, speed: 1 },
  composer:  { id: "composer",  name: "Composer",  bias: { vision: 0.5, craft: 1, sound: 3, story: 0.5, hustle: 0.5 }, speed: 1 },
  writer:    { id: "writer",    name: "Writer",    bias: { vision: 1, craft: 0.5, sound: 0.5, story: 3, hustle: 0.5 }, speed: 1 },
  marketer:  { id: "marketer",  name: "Marketer",  bias: { vision: 0.5, craft: 0.5, sound: 0.5, story: 0.5, hustle: 3 }, speed: 1 },
  producer:  { id: "producer",  name: "Producer",  bias: { vision: 1.2, craft: 1.2, sound: 1.2, story: 1.2, hustle: 1 }, speed: 1.25 },
};

export const CRITICS: Critic[] = [
  { id: "blog",   name: "The Blog",   blurb: "lives for the new and the strange", lean: { vision: 1.2, story: 0.4 } },
  { id: "plug",   name: "The Plug",   blurb: "only cares if it's a moment",        lean: { hype: 1.4 } },
  { id: "purist", name: "The Purist", blurb: "craft over everything",              lean: { craft: 1.1, sound: 0.5, story: 0.5 } },
  { id: "crowd",  name: "The Crowd",  blurb: "speaks for the timeline",            lean: { sound: 0.6, vision: 0.4, hype: 0.6 } },
];

export const PLATFORM_ERAS: PlatformEra[] = [
  { id: "scene",  name: "The Scene", startYear: 0, reach: 1.0 },
  { id: "tube",   name: "Tube",      startYear: 2, reach: 1.25 },
  { id: "loop",   name: "Loop",      startYear: 4, reach: 1.45 },
  { id: "foryou", name: "ForYou",    startYear: 6, reach: 1.7 },
  { id: "mind",   name: "Mind",      startYear: 9, reach: 2.0 },
];

export function eraForYear(year: number): PlatformEra {
  let era = PLATFORM_ERAS[0];
  for (const e of PLATFORM_ERAS) if (year >= e.startYear) era = e;
  return era;
}

// --- Synergy grid -----------------------------------------------------------
// Only the "notable" combos are listed; everything else defaults to "B".
const SYNERGY: Partial<Record<MediumId, Partial<Record<VibeId, SynergyTier>>>> = {
  single:     { romance: "S", hype: "A", nostalgia: "A", experimental: "C" },
  musicvideo: { rebellion: "S", hype: "A", luxury: "A", wholesome: "C" },
  album:      { nostalgia: "S", dark: "A", experimental: "A", hype: "C" },
  shortfilm:  { dark: "S", experimental: "A", nostalgia: "A", hype: "C" },
  brand:      { hype: "S", luxury: "A", wholesome: "A", rebellion: "C", dark: "C" },
  event:      { hype: "S", rebellion: "A", luxury: "A", wholesome: "C" },
  fashion:    { luxury: "S", rebellion: "A", experimental: "A", wholesome: "C" },
  podcast:    { wholesome: "S", dark: "A", nostalgia: "A", luxury: "C" },
};

const TIER_MULT: Record<SynergyTier, number> = { S: 1.5, A: 1.25, B: 1.0, C: 0.8 };

export function synergyTier(medium: MediumId, vibe: VibeId): SynergyTier {
  return SYNERGY[medium]?.[vibe] ?? "B";
}
export function synergyMult(medium: MediumId, vibe: VibeId): number {
  return TIER_MULT[synergyTier(medium, vibe)];
}

export const mediumById = (id: MediumId): Medium => MEDIUMS.find((m) => m.id === id)!;
export const vibeById = (id: VibeId): Vibe => VIBES.find((v) => v.id === id)!;

// --- Creative generation ----------------------------------------------------
const FIRST = ["Remy", "Jules", "Kai", "Nova", "Sol", "Ash", "Wren", "Dex", "Cleo", "Idris", "Mara", "Tovi", "Zane", "Lux", "Bex", "Oji"];
const LAST = ["V.", "K.", "Okafor", "Sato", "Reyes", "Lin", "Mensah", "Cruz", "Bauer", "Adeyemi", "Park", "Voss", "Dré", "Quill"];

let idCounter = 0;
export function nextId(): string {
  idCounter += 1;
  return `c${idCounter}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}

const ROLE_IDS: RoleId[] = ["director", "editor", "composer", "writer", "marketer", "producer"];

/** Roll a fresh recruit. `power` nudges average stat level (recruits get cheaper/weaker). */
export function rollCreative(power = 1): import("./types").Creative {
  const role = ROLE_IDS[Math.floor(Math.random() * ROLE_IDS.length)];
  const bias = ROLES[role].bias;
  const base = 8 + Math.random() * 10 * power;
  const stat = (k: keyof Stats) =>
    Math.max(1, Math.round(base * (0.4 + bias[k] / 3) + (Math.random() * 6 - 3)));
  const stats: Stats = {
    vision: stat("vision"), craft: stat("craft"), sound: stat("sound"),
    story: stat("story"), hustle: stat("hustle"),
  };
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  return {
    id: nextId(),
    name: `${FIRST[Math.floor(Math.random() * FIRST.length)]} ${LAST[Math.floor(Math.random() * LAST.length)]}`,
    role,
    stats,
    level: 1,
    xp: 0,
    salary: Math.round(total * 7 + 120), // // TUNE
    energy: 100,
    assigned: false,
  };
}

export function signingFee(c: import("./types").Creative): number {
  return c.salary * 6; // // TUNE
}
