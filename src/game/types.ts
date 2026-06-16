// Core domain types for Doghouse Productions.

/** The four quality axes a project accumulates. Hustle is separate (drives marketing/hype). */
export type Axis = "vision" | "craft" | "sound" | "story";
export type StatKey = Axis | "hustle";

export type Stats = Record<StatKey, number>;
export type AxisPoints = Record<Axis, number>;

export type RoleId =
  | "director"
  | "editor"
  | "composer"
  | "writer"
  | "marketer"
  | "producer";

export interface Creative {
  id: string;
  name: string;
  role: RoleId;
  stats: Stats;
  level: number;
  xp: number;
  salary: number; // per week
  energy: number; // 0..100; low energy => weaker output
  assigned: boolean;
}

export type MediumId =
  | "single"
  | "musicvideo"
  | "album"
  | "shortfilm"
  | "brand"
  | "event"
  | "fashion"
  | "podcast";

export type VibeId =
  | "romance"
  | "hype"
  | "nostalgia"
  | "rebellion"
  | "luxury"
  | "wholesome"
  | "experimental"
  | "dark";

/** How a medium turns success into money. */
export type Monetization = "streams" | "tickets" | "client" | "merch";

export interface Medium {
  id: MediumId;
  name: string;
  weeks: number; // base production length
  budget: number; // upfront cost to start
  weights: AxisPoints; // what the critics care about for this medium (sums ~1)
  baseFans: number; // scale of following a perfect score can mint
  conversion: number; // fraction of following that "buys" per release
  price: number; // revenue per converted unit
  monetization: Monetization;
  clientFee?: number; // upfront guaranteed pay for client work (brand)
  expectedQ: number; // quality needed to score ~7/critic // TUNE
}

export interface Vibe {
  id: VibeId;
  name: string;
}

export type SynergyTier = "S" | "A" | "B" | "C";

export interface Critic {
  id: string;
  name: string;
  blurb: string;
  /** Per-axis lean: critic adds (lean·normalizedAxisShare) to its raw /10. */
  lean: Partial<AxisPoints> & { hype?: number };
}

export interface PlatformEra {
  id: string;
  name: string;
  startYear: number; // in-game year this platform becomes current
  reach: number; // reach multiplier while current // TUNE
}

export type Phase = "idle" | "production" | "polish";

export interface Project {
  title: string;
  medium: MediumId;
  vibe: VibeId;
  weeksTotal: number;
  weeksElapsed: number;
  points: AxisPoints;
  hype: number;
  roughEdges: number;
  staffIds: string[];
}

export interface ReleaseResult {
  title: string;
  medium: MediumId;
  vibe: VibeId;
  criticScores: number[]; // four /10
  score40: number;
  newFollowers: number;
  revenue: number;
  legendary: boolean;
  week: number;
}

export interface LogEntry {
  week: number;
  text: string;
  kind: "info" | "good" | "bad" | "release";
}

export interface GameState {
  studioName: string;
  cash: number;
  week: number;
  following: number;
  reputation: number; // 0..100
  staff: Creative[];
  recruitPool: Creative[];
  project: Project | null;
  phase: Phase;
  log: LogEntry[];
  legendary: ReleaseResult[];
  lastRelease: ReleaseResult | null;
  negativeWeeks: number; // consecutive weeks in the red -> game over fuse
  gameOver: boolean;
}
