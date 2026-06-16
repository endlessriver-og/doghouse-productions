// Content tables for the Omni House sim: project types (events + creative work),
// the real team as crew + traits, critics, eras, trends, studio spaces, story beats,
// and a deck of Omni-flavored choice events. Balance numbers marked // TUNE.

import type {
  Creative, Critic, GameEventCard, Medium, MediumId, PlatformEra, RoleId, Stats,
  StoryBeat, SynergyTier, Trait, TraitId, Upgrade, Vibe, VibeId,
} from "./types";

// ---------------------------------------------------------------- Mediums
export const MEDIUMS: Medium[] = [
  // ----- Events (grow Members) -----
  { id: "openmic", name: "Open Mic", kind: "event", weeks: 2, budget: 1200,
    weights: { vision: 0.1, craft: 0.2, sound: 0.35, story: 0.35 }, expectedQ: 70,
    reach: 140, conv: 0.5, cashPer: 14, blurb: "Low stakes, warm room, the funnel's front door." },
  { id: "arthouse", name: "Art House", kind: "event", weeks: 4, budget: 5000,
    weights: { vision: 0.4, craft: 0.3, sound: 0.15, story: 0.15 }, expectedQ: 170,
    reach: 320, conv: 0.18, cashPer: 9, blurb: "No ticket — pure top-of-funnel (Ryan's principle)." },
  { id: "tunetown", name: "Tune Town", kind: "event", weeks: 3, budget: 4200,
    weights: { vision: 0.2, craft: 0.25, sound: 0.4, story: 0.15 }, expectedQ: 150,
    reach: 280, conv: 0.35, cashPer: 22, blurb: "Live music night. Tickets + bar." },
  { id: "lovelingo", name: "Love Lingo", kind: "event", weeks: 3, budget: 3000,
    weights: { vision: 0.2, craft: 0.2, sound: 0.2, story: 0.4 }, expectedQ: 140,
    reach: 240, conv: 0.4, cashPer: 18, blurb: "Storytelling + connection night." },
  { id: "karaoke", name: "Auto-Tune Karaoke", kind: "event", weeks: 2, budget: 2000,
    weights: { vision: 0.15, craft: 0.2, sound: 0.45, story: 0.2 }, expectedQ: 95,
    reach: 200, conv: 0.45, cashPer: 16, blurb: "Chaos and serotonin. Always packs out." },
  { id: "playback", name: "Playback", kind: "event", weeks: 3, budget: 2600,
    weights: { vision: 0.2, craft: 0.3, sound: 0.35, story: 0.15 }, expectedQ: 130,
    reach: 230, conv: 0.5, cashPer: 24, blurb: "Donation + bar model. ~$1.7k a night." },
  { id: "movienight", name: "Movie Night", kind: "event", weeks: 1, budget: 700,
    weights: { vision: 0.25, craft: 0.2, sound: 0.15, story: 0.4 }, expectedQ: 55,
    reach: 110, conv: 0.4, cashPer: 10, blurb: "Cheap, cozy, community glue." },
  { id: "creatorconnect", name: "Creator Connect", kind: "event", weeks: 3, budget: 3400,
    weights: { vision: 0.3, craft: 0.25, sound: 0.1, story: 0.35 }, expectedQ: 145,
    reach: 260, conv: 0.3, cashPer: 20, blurb: "Networking mixer. Converts pros to members." },
  // ----- Creative work (grow Buzz + cash) -----
  { id: "single", name: "Single", kind: "creative", weeks: 3, budget: 4000,
    weights: { vision: 0.15, craft: 0.2, sound: 0.45, story: 0.2 }, expectedQ: 95,
    reach: 1800, conv: 0.5, cashPer: 4, blurb: "A drop. Builds buzz fast." },
  { id: "musicvideo", name: "Music Video", kind: "creative", weeks: 4, budget: 9000,
    weights: { vision: 0.4, craft: 0.3, sound: 0.2, story: 0.1 }, expectedQ: 150,
    reach: 3200, conv: 0.35, cashPer: 6, blurb: "The calling card. Bigger Dreams territory." },
  { id: "album", name: "Album", kind: "creative", weeks: 8, budget: 22000,
    weights: { vision: 0.15, craft: 0.2, sound: 0.4, story: 0.25 }, expectedQ: 340,
    reach: 6500, conv: 0.45, cashPer: 11, blurb: "A body of work. Big swing." },
  { id: "shortfilm", name: "Short Film", kind: "creative", weeks: 7, budget: 18000,
    weights: { vision: 0.35, craft: 0.25, sound: 0.1, story: 0.3 }, expectedQ: 300,
    reach: 5200, conv: 0.3, cashPer: 12, blurb: "Festival bait. Slow burn prestige." },
  { id: "brand", name: "Brand Campaign", kind: "creative", weeks: 4, budget: 6000,
    weights: { vision: 0.25, craft: 0.35, sound: 0.1, story: 0.3 }, expectedQ: 150,
    reach: 1500, conv: 0.2, cashPer: 5, clientFee: 26000, blurb: "Client work. Pays the rent up front." },
  { id: "photoset", name: "Photo Set", kind: "creative", weeks: 2, budget: 2500,
    weights: { vision: 0.45, craft: 0.35, sound: 0.05, story: 0.15 }, expectedQ: 85,
    reach: 1400, conv: 0.45, cashPer: 7, blurb: "White-room shoot. Quick cash + portfolio." },
  { id: "fashion", name: "Fashion Drop", kind: "creative", weeks: 5, budget: 12000,
    weights: { vision: 0.45, craft: 0.35, sound: 0.05, story: 0.15 }, expectedQ: 220,
    reach: 3800, conv: 0.08, cashPer: 60, blurb: "Apparel capsule. High margin, high risk." },
  { id: "podcast", name: "Podcast", kind: "creative", weeks: 3, budget: 1800,
    weights: { vision: 0.1, craft: 0.2, sound: 0.3, story: 0.4 }, expectedQ: 80,
    reach: 1400, conv: 0.4, cashPer: 3, blurb: "Recurring reach. Compounding audience." },
];

export const VIBES: Vibe[] = [
  { id: "romance", name: "Romance" }, { id: "hype", name: "Hype" },
  { id: "nostalgia", name: "Nostalgia" }, { id: "rebellion", name: "Rebellion" },
  { id: "luxury", name: "Luxury" }, { id: "wholesome", name: "Wholesome" },
  { id: "experimental", name: "Experimental" }, { id: "dark", name: "Dark" },
];

export interface RoleDef { id: RoleId; name: string; bias: Stats }
export const ROLES: Record<RoleId, RoleDef> = {
  director:  { id: "director",  name: "Director",  bias: { vision: 3, craft: 1.5, sound: 0.5, story: 1, hustle: 0.5 } },
  editor:    { id: "editor",    name: "Editor",    bias: { vision: 1, craft: 3, sound: 0.5, story: 1, hustle: 0.5 } },
  composer:  { id: "composer",  name: "Composer",  bias: { vision: 0.5, craft: 1, sound: 3, story: 0.5, hustle: 0.5 } },
  writer:    { id: "writer",    name: "Writer",    bias: { vision: 1, craft: 0.5, sound: 0.5, story: 3, hustle: 0.5 } },
  marketer:  { id: "marketer",  name: "Host",      bias: { vision: 0.5, craft: 0.5, sound: 0.5, story: 0.5, hustle: 3 } },
  producer:  { id: "producer",  name: "Producer",  bias: { vision: 1.2, craft: 1.2, sound: 1.2, story: 1.2, hustle: 1 } },
};

export const TRAITS: Record<TraitId, Trait> = {
  ambient_host: { id: "ambient_host", name: "Ambient Host", blurb: "Lights up a room — then fades. Huge at events, burns out fast.", buzzMult: 1.5, memberMult: 1.25, energyDrain: 15 },
  framework_op: { id: "framework_op", name: "Framework Operator", blurb: "Give a clear brief and it ships clean.", outputMult: 1.15 },
  raises_room:  { id: "raises_room",  name: "Raises the Room", blurb: "Lifts everyone's output just by being there.", outputMult: 1.05, morale: 2 },
  closer:       { id: "closer",       name: "Closer", blurb: "Turns attention into signups.", memberMult: 1.4, buzzMult: 1.1 },
  reliable:     { id: "reliable",     name: "Reliable", blurb: "Steady. Rarely runs out of gas.", energyDrain: 6 },
  creative_dir: { id: "creative_dir", name: "Creative Director", blurb: "Vision-led. Everything looks intentional.", outputMult: 1.2 },
  grinder:      { id: "grinder",      name: "Grinder", blurb: "Always shipping. Buzz machine.", buzzMult: 1.25, outputMult: 1.05 },
  natural:      { id: "natural",      name: "Natural", blurb: "Just gets it.", outputMult: 1.2, buzzMult: 1.1 },
};

export const CRITICS: Critic[] = [
  { id: "scene",  name: "The Scene Report", blurb: "lives for the new and the strange", lean: { vision: 1.2, story: 0.4 } },
  { id: "plug",   name: "The Plug",         blurb: "only cares if it's a moment",        lean: { hype: 1.4 } },
  { id: "purist", name: "The Purist",       blurb: "craft over everything",              lean: { craft: 1.1, sound: 0.5, story: 0.5 } },
  { id: "tl",     name: "The Timeline",     blurb: "speaks for the room",                lean: { sound: 0.6, vision: 0.4, hype: 0.6 } },
];

export const PLATFORM_ERAS: PlatformEra[] = [
  { id: "scene",  name: "The Scene", startYear: 0, reach: 1.0 },
  { id: "tube",   name: "Tube",      startYear: 2, reach: 1.2 },
  { id: "loop",   name: "Loop",      startYear: 4, reach: 1.4 },
  { id: "foryou", name: "ForYou",    startYear: 6, reach: 1.65 },
  { id: "mind",   name: "Mind",      startYear: 9, reach: 1.95 },
];
export function eraForYear(year: number): PlatformEra {
  let era = PLATFORM_ERAS[0];
  for (const e of PLATFORM_ERAS) if (year >= e.startYear) era = e;
  return era;
}

// ---------------------------------------------------------------- Upgrades (spaces)
export const UPGRADES: Upgrade[] = [
  { id: "photo",     name: "Photo Studio",      blurb: "White room, good light. +Vision output.", cost: 14000, axis: "vision", axisBoost: 0.3, unlocks: ["photoset"] },
  { id: "recording", name: "Recording Studio",  blurb: "Booth + treatment. +Sound output.", cost: 16000, axis: "sound", axisBoost: 0.3 },
  { id: "sets",      name: "Content Sets",       blurb: "Six rotating themed sets. +Craft output.", cost: 10000, axis: "craft", axisBoost: 0.25 },
  { id: "venue",     name: "Event Venue Buildout", blurb: "Stage, bar, capacity. +500 event ceiling.", cost: 28000, venueCap: 500 },
  { id: "workshop",  name: "Maker Space",        blurb: "Laser, 3D print, presses. +Craft, unlocks Fashion.", cost: 12000, axis: "craft", axisBoost: 0.2, unlocks: ["fashion"] },
  { id: "lounge",    name: "The Lounge",         blurb: "Community living room. +150 event ceiling.", cost: 8000, venueCap: 150 },
];

// ---------------------------------------------------------------- Story beats
export const STORY_BEATS: Record<string, StoryBeat> = {
  intro: { id: "intro", title: "101 E 17th St.", body:
    "Downtown LA, Fashion District. The lease is signed and AP is floating the burn out of pocket — roughly eight grand a month. Runway runs to the end of June. The plan is simple and brutal: turn this room into a scene people pay to belong to. Throw events to pull a crowd, make work that travels, convert attention into members. Don't run out of money first." },
  first_members: { id: "first_members", title: "The room starts to fill", body:
    "First real members on the books. Not a crowd yet — but the regulars are showing up, bringing friends, tagging the space. The funnel is alive." },
  break_even: { id: "break_even", title: "Rent's covered", body:
    "Membership revenue finally clears the monthly burn. AP exhales for the first time in months. The studio funds itself now — everything above this is altitude." },
  past_june: { id: "past_june", title: "Past the deadline", body:
    "End of June came and went and the doors are still open. The runway everyone watched like a clock stopped mattering. You bought yourself a future." },
  first_legendary: { id: "first_legendary", title: "The scene is talking", body:
    "Your first legendary project. People who've never set foot in the building know the name now. That's the flywheel — make something undeniable, the audience comes to you." },
  equity: { id: "equity", title: "$18K month — the clause hits", body:
    "Eighteen thousand in a single month. The earn-in clause triggers: your stake goes from 10% to 20%. Proof of leadership, in writing. The house is yours in a way it wasn't yesterday." },
  elite: { id: "elite", title: "A real institution", body:
    "Six hundred members and an Elite tier with a waitlist. This isn't a scrappy studio anymore — it's a creative institution with your name on the door." },
};

// ---------------------------------------------------------------- Random event deck
export const EVENT_DECK: GameEventCard[] = [
  { id: "latoday", title: "Mark @ LA Today wants in", body:
    "A local-media connector offers to push memberships for 20% commission on the first three months. More reach, thinner margin.",
    choices: [
      { label: "Take the deal", blurb: "Reach now, margin later", members: 70, cash: -1500, log: "Partnered with LA Today — +70 members, paid the commission float." },
      { label: "Hold the margin", blurb: "Grow it yourself", buzz: 20, log: "Passed on LA Today, leaned on organic reach. +buzz." },
    ] },
  { id: "ap_mess", title: "AP left the space wrecked", body:
    "Again. Standards slip, members notice. Crack down or keep the peace?",
    choices: [
      { label: "Set the standard", blurb: "+rep, AP sulks", rep: 6, morale: -10, log: "Enforced space standards. Rep up, AP energy down." },
      { label: "Let it slide", blurb: "Keep the vibe easy", rep: -5, log: "Let the mess go. Standards dipped." },
    ] },
  { id: "pro_upsell", title: "A photographer wants to bring clients", body:
    "A member wants to run paid client shoots out of the studio. Comp them time and they'll likely go Pro.",
    choices: [
      { label: "Comp the time", blurb: "Invest in the upsell", cash: -1200, members: 25, log: "Comped studio time — member converted to Pro. +25 members." },
      { label: "Charge full", blurb: "Protect the credits", cash: 800, log: "Held the line on credits. Small cash, no upsell." },
    ] },
  { id: "viral", title: "A clip went viral", body:
    "An Open Mic set blew up overnight. The timeline found you. Strike while it's hot?",
    choices: [
      { label: "Throw a pop-up", blurb: "Convert the spike", cash: -2000, members: 90, buzz: 30, log: "Ran a pop-up off the viral clip — +90 members." },
      { label: "Bank the buzz", blurb: "Save your energy", buzz: 45, log: "Let the moment ride. Big buzz, no spend." },
    ] },
  { id: "burnout", title: "Ryan's running on empty", body:
    "Your most reliable operator is fried. Push through the next event or give him a beat?",
    choices: [
      { label: "Give him a week", blurb: "+team energy", morale: 25, cash: -500, log: "Gave the crew a breather. Energy restored." },
      { label: "Push through", blurb: "Risk the burnout", buzz: 10, morale: -15, log: "Pushed through. Short-term output, tired crew." },
    ] },
  { id: "prepay", title: "Landlord offers a prepay discount", body:
    "Pay six months of rent up front for a permanent 8% cut to the burn.",
    choices: [
      { label: "Prepay", blurb: "Cash now, lower burn forever", cash: -14000, log: "Prepaid rent — monthly burn permanently reduced." },
      { label: "Pass", blurb: "Keep the cash liquid", log: "Kept the cash. Burn unchanged." },
    ] },
  { id: "sponsor", title: "Sponsor inbound (ArtHouse, not beverage)", body:
    "A brand wants to sponsor a night. Pitch them a full activation or keep it light?",
    choices: [
      { label: "Pitch the activation", blurb: "Big check if rep's high", cash: 9000, rep: 3, log: "Landed the activation sponsorship. +$9k." },
      { label: "Keep it light", blurb: "Low effort placement", cash: 2500, log: "Took a light placement. +$2.5k." },
    ] },
  { id: "grant", title: "A small-business grant is open", body:
    "Filing takes real time but the payout is real money. Apply?",
    choices: [
      { label: "Apply", blurb: "Time now, cash maybe", cash: 12000, log: "Grant came through — +$12k." },
      { label: "Skip it", blurb: "Stay focused on the floor", log: "Skipped the grant to keep momentum." },
    ] },
  { id: "elite_prospect", title: "An Elite-tier prospect", body:
    "A founder wants ten seats for their team — if the space feels legit.",
    choices: [
      { label: "Roll out the carpet", blurb: "Big money if rep ≥ 40", cash: 9490, members: 10, rep: 4, log: "Closed the Elite team plan — +$9.5k, +10 members." },
      { label: "Not ready yet", blurb: "Don't overpromise", log: "Passed on the Elite seat — not ready to deliver." },
    ] },
  { id: "gear_break", title: "The main rig died mid-shoot", body:
    "Camera package is down. Repair it or improvise for now?",
    choices: [
      { label: "Repair it", blurb: "Eat the cost", cash: -3000, log: "Repaired the gear. -$3k." },
      { label: "Improvise", blurb: "Next project takes a hit", buzz: -15, log: "Improvised around dead gear. Buzz took a knock." },
    ] },
];

// ---------------------------------------------------------------- Synergy grid
const SYNERGY: Partial<Record<MediumId, Partial<Record<VibeId, SynergyTier>>>> = {
  openmic:        { wholesome: "S", romance: "A", nostalgia: "A", luxury: "C" },
  arthouse:       { experimental: "S", rebellion: "A", luxury: "A", wholesome: "C" },
  tunetown:       { hype: "S", rebellion: "A", nostalgia: "A", wholesome: "C" },
  lovelingo:      { romance: "S", nostalgia: "A", wholesome: "A", rebellion: "C" },
  karaoke:        { hype: "S", nostalgia: "A", wholesome: "A", dark: "C" },
  playback:       { nostalgia: "S", dark: "A", luxury: "A", hype: "C" },
  movienight:     { wholesome: "S", nostalgia: "A", dark: "A", hype: "C" },
  creatorconnect: { hype: "S", luxury: "A", experimental: "A", dark: "C" },
  single:         { romance: "S", hype: "A", nostalgia: "A", experimental: "C" },
  musicvideo:     { rebellion: "S", hype: "A", luxury: "A", wholesome: "C" },
  album:          { nostalgia: "S", dark: "A", experimental: "A", hype: "C" },
  shortfilm:      { dark: "S", experimental: "A", nostalgia: "A", hype: "C" },
  brand:          { hype: "S", luxury: "A", wholesome: "A", rebellion: "C", dark: "C" },
  photoset:       { luxury: "S", romance: "A", experimental: "A", wholesome: "C" },
  fashion:        { luxury: "S", rebellion: "A", experimental: "A", wholesome: "C" },
  podcast:        { wholesome: "S", dark: "A", nostalgia: "A", luxury: "C" },
};
const TIER_MULT: Record<SynergyTier, number> = { S: 1.4, A: 1.2, B: 1.0, C: 0.8 };
export function synergyTier(medium: MediumId, vibe: VibeId): SynergyTier {
  return SYNERGY[medium]?.[vibe] ?? "B";
}
export function synergyMult(medium: MediumId, vibe: VibeId): number {
  return TIER_MULT[synergyTier(medium, vibe)];
}

export const mediumById = (id: MediumId): Medium => MEDIUMS.find((m) => m.id === id)!;
export const vibeById = (id: VibeId): Vibe => VIBES.find((v) => v.id === id)!;

// ---------------------------------------------------------------- Creative generation
const FIRST = ["Remy", "Jules", "Kai", "Nova", "Sol", "Ash", "Wren", "Dex", "Cleo", "Idris", "Mara", "Tovi", "Zane", "Lux", "Bex", "Oji", "Sade", "Niko"];
const LAST = ["V.", "K.", "Okafor", "Sato", "Reyes", "Lin", "Mensah", "Cruz", "Bauer", "Adeyemi", "Park", "Voss", "Dré", "Quill", "Hale"];
const COMMON_TRAITS: TraitId[] = ["reliable", "grinder", "natural", "creative_dir"];

let idCounter = 0;
export function nextId(): string {
  idCounter += 1;
  return `c${idCounter}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}
const ROLE_IDS: RoleId[] = ["director", "editor", "composer", "writer", "marketer", "producer"];

export function rollCreative(power = 1): Creative {
  const role = ROLE_IDS[Math.floor(Math.random() * ROLE_IDS.length)];
  const bias = ROLES[role].bias;
  const base = 8 + Math.random() * 10 * power;
  const stat = (k: keyof Stats) =>
    Math.max(1, Math.round(base * (0.4 + bias[k] / 3) + (Math.random() * 6 - 3)));
  const stats: Stats = { vision: stat("vision"), craft: stat("craft"), sound: stat("sound"), story: stat("story"), hustle: stat("hustle") };
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  const trait = Math.random() < 0.28 ? COMMON_TRAITS[Math.floor(Math.random() * COMMON_TRAITS.length)] : undefined;
  return {
    id: nextId(),
    name: `${FIRST[Math.floor(Math.random() * FIRST.length)]} ${LAST[Math.floor(Math.random() * LAST.length)]}`,
    role, trait, stats, level: 1, xp: 0,
    salary: Math.round(total * 7 + 120), energy: 100, assigned: false,
  };
}

/** Build a named real-team member with fixed role + trait, stats biased to role. */
export function makeNamed(name: string, role: RoleId, trait: TraitId, power = 1.2): Creative {
  const c = rollCreative(power);
  return { ...c, name, role, trait };
}

/** The Wave-1 founders you start with. */
export function startingCrew(): Creative[] {
  return [
    makeNamed("Slowsie", "producer", "natural", 1.4),
    makeNamed("Ryan Alberto", "producer", "framework_op", 1.2),
    makeNamed("AP", "marketer", "ambient_host", 1.15),
    makeNamed("Jovan", "editor", "reliable", 1.1),
  ];
}

/** Recruit pool seeded with real-team names first, then randoms. */
const NAMED_RECRUITS = [
  () => makeNamed("Jake Douglas", "director", "raises_room", 1.3),
  () => makeNamed("Red (Lysander)", "marketer", "closer", 1.2),
  () => makeNamed("Kai Shae", "director", "creative_dir", 1.2),
  () => makeNamed("Sujoy", "marketer", "grinder", 1.1),
  () => makeNamed("Gavin", "editor", "reliable", 1.1),
];
let namedDrawn = 0;
export function rollRecruit(): Creative {
  if (namedDrawn < NAMED_RECRUITS.length && Math.random() < 0.6) {
    return NAMED_RECRUITS[namedDrawn++]();
  }
  return rollCreative();
}

export function signingFee(c: Creative): number { return c.salary * 6 }

// ---------------------------------------------------------------- Workshop data layer
// Community content packs: set localStorage "doghouse-mods" to JSON of the shape
// { mediums?: Medium[], vibes?: Vibe[] }. Merged at startup so packs need no code.
try {
  if (typeof localStorage !== "undefined") {
    const raw = localStorage.getItem("doghouse-mods");
    if (raw) {
      const mods = JSON.parse(raw) as { mediums?: Medium[]; vibes?: Vibe[] };
      if (Array.isArray(mods.mediums)) for (const m of mods.mediums) if (!MEDIUMS.some((x) => x.id === m.id)) MEDIUMS.push(m);
      if (Array.isArray(mods.vibes)) for (const v of mods.vibes) if (!VIBES.some((x) => x.id === v.id)) VIBES.push(v);
    }
  }
} catch { /* ignore malformed mod pack */ }

// ---------------------------------------------------------------- Focus modes
import type { Focus, Phases, Season } from "./types";
export interface FocusDef {
  id: Focus; name: string; blurb: string;
  weeksMult: number; outMult: number; roughMult: number; sparkMult: number; buzzMult: number;
}
export const FOCUS: Record<Focus, FocusDef> = {
  balanced:     { id: "balanced",     name: "Balanced",     blurb: "No bonus, no penalty.",                 weeksMult: 1.0,  outMult: 1.0,  roughMult: 1.0, sparkMult: 1.0, buzzMult: 1.0 },
  quality:      { id: "quality",      name: "Quality",      blurb: "Slower, sharper, fewer rough edges.",   weeksMult: 1.3,  outMult: 1.18, roughMult: 0.7, sparkMult: 1.0, buzzMult: 1.0 },
  fast:         { id: "fast",         name: "Fast",         blurb: "Ship quick. Rougher, a little louder.",  weeksMult: 0.7,  outMult: 0.85, roughMult: 1.5, sparkMult: 1.0, buzzMult: 1.05 },
  experimental: { id: "experimental", name: "Experimental", blurb: "Swing big. More breakthroughs, more mess + buzz.", weeksMult: 1.05, outMult: 1.0, roughMult: 1.2, sparkMult: 2.2, buzzMult: 1.15 },
};

export const DEFAULT_PHASES: Phases = { concept: 0.34, build: 0.33, promo: 0.33 };

// ---------------------------------------------------------------- Seasons
export interface SeasonDef { id: Season; name: string; emoji: string; blurb: string; vibe: VibeId; kind: "event" | "creative" }
export const SEASONS: SeasonDef[] = [
  { id: "spring", name: "Spring", emoji: "🌱", blurb: "fresh starts — Romance + events pop",     vibe: "romance",   kind: "event" },
  { id: "summer", name: "Summer", emoji: "🌞", blurb: "rooftop season — Hype + events surge",     vibe: "hype",      kind: "event" },
  { id: "fall",   name: "Fall",   emoji: "🍂", blurb: "festival season — Nostalgia + releases land", vibe: "nostalgia", kind: "creative" },
  { id: "winter", name: "Winter", emoji: "❄️", blurb: "intimate season — Wholesome + cozy events", vibe: "wholesome", kind: "event" },
];
export const seasonForMonth = (month: number): SeasonDef => SEASONS[month % 4];

// ---------------------------------------------------------------- Scenarios
export interface Scenario { id: string; name: string; blurb: string; cash: number; members: number; burn: number; rep: number }
export const SCENARIOS: Scenario[] = [
  { id: "studio",    name: "The Studio",   blurb: "The honest start. AP floats ~$8k/mo. Build the house.",         cash: 60000, members: 0,  burn: 8000, rep: 5 },
  { id: "shoestring",name: "Shoestring",   blurb: "Hard. Half the runway, same rent. Move fast or fold.",          cash: 35000, members: 0,  burn: 8000, rep: 5 },
  { id: "buzzy",     name: "Already Buzzing", blurb: "A small following exists. Convert it before it cools.",       cash: 55000, members: 90, burn: 8000, rep: 10 },
  { id: "comeback",  name: "The Comeback", blurb: "Known name, empty bank. Reputation high, cash low.",            cash: 42000, members: 0,  burn: 8500, rep: 28 },
];
export const scenarioById = (id: string) => SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];

// ---------------------------------------------------------------- Legacy traits (prestige)
export interface LegacyTrait { id: string; name: string; blurb: string }
export const LEGACY_TRAITS: LegacyTrait[] = [
  { id: "cult",     name: "Cult Following", blurb: "+25% members from every release, forever." },
  { id: "pockets",  name: "Deep Pockets",   blurb: "Start each run with +$25k." },
  { id: "taste",    name: "Tastemaker",     blurb: "Start with reputation 30." },
  { id: "lean",     name: "Lean Operation", blurb: "−15% monthly burn, forever." },
];

// ---------------------------------------------------------------- Awards
export const AWARD_CATEGORIES = ["Event of the Year", "Release of the Year", "Best Newcomer", "Scene Favorite"];

// ---------------------------------------------------------------- Rivals
export const RIVAL_NAMES = ["Warehouse 9", "Sunset Collective", "Goldline Studio", "Basement Tapes", "Neon District"];

// ---------------------------------------------------------------- Narrator (The Scene Report)
const NARRATOR: Record<string, string[]> = {
  legendary: ["The whole city is posting about it.", "They'll be talking about this one for years.", "An undeniable moment."],
  hit: ["The timeline approves.", "Solid. The regulars are bragging they were there.", "That one traveled."],
  flop: ["The group chat went quiet.", "Swing and a miss. Onto the next.", "Not your moment. It happens."],
  hire: ["Fresh blood in the building.", "The room just got deeper.", "New energy on the roster."],
  broke: ["Books are looking thin. Land a paying gig.", "AP keeps glancing at the bank balance.", "Tighten up — runway's short."],
  month: ["Another month survives.", "Rent paid, lights on.", "The clock keeps ticking."],
};
export function narratorLine(kind: string): string {
  const arr = NARRATOR[kind] ?? NARRATOR.month;
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------------------------------------------- Goals (dual-track)
// ---------------------------------------------------------------- Crew bonds + regulars
import type { Bond, Regular } from "./types";
export function makeBond(ids: string[]): Bond | null {
  if (ids.length < 2) return null;
  const i = Math.floor(Math.random() * ids.length);
  let j = Math.floor(Math.random() * ids.length);
  if (i === j) j = (j + 1) % ids.length;
  return { a: ids[i], b: ids[j], kind: Math.random() < 0.62 ? "chemistry" : "clash" };
}

const REGULAR_NAMES = ["DJ Marisol", "Tariq", "Priya K.", "Old Man Cisco", "Quincy", "Lala", "the Hwang twins", "Bex", "Auntie Rose", "Tre", "Sunny", "Marcus V."];
const VIBE_IDS: VibeId[] = ["romance", "hype", "nostalgia", "rebellion", "luxury", "wholesome", "experimental", "dark"];
let regularIdx = 0;
export function makeRegular(week: number): Regular {
  const name = REGULAR_NAMES[regularIdx % REGULAR_NAMES.length] + (regularIdx >= REGULAR_NAMES.length ? ` ${Math.floor(regularIdx / REGULAR_NAMES.length) + 1}` : "");
  regularIdx += 1;
  return { name, favVibe: VIBE_IDS[Math.floor(Math.random() * VIBE_IDS.length)], since: week };
}

export interface GoalTemplate { id: string; label: string; reward: number; test: (s: import("./types").GameState) => boolean }
export const GOAL_TEMPLATES: GoalTemplate[] = [
  { id: "members150", label: "Reach 150 members", reward: 2000, test: (s) => s.members >= 150 },
  { id: "members300", label: "Reach 300 members", reward: 4000, test: (s) => s.members >= 300 },
  { id: "ship3",      label: "Ship 3 projects",   reward: 1500, test: (s) => s.totalReleases >= 3 },
  { id: "ship8",      label: "Ship 8 projects",   reward: 3000, test: (s) => s.totalReleases >= 8 },
  { id: "hit33",      label: "Score 33+ on a project", reward: 2500, test: (s) => s.bestScore >= 33 },
  { id: "space2",     label: "Build 2 studio spaces", reward: 2000, test: (s) => s.ownedUpgrades.length >= 2 },
  { id: "breakeven",  label: "Cover rent with memberships", reward: 3000, test: (s) => s.members * 35 >= s.burn },
  { id: "crew6",      label: "Grow the crew to 6", reward: 2000, test: (s) => s.staff.length >= 6 },
];
