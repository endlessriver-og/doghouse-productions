// Core domain types for Doghouse Productions — an Omni House creative-studio sim.

/** The four quality axes a project accumulates. Hustle is separate (drives buzz). */
export type Axis = "vision" | "craft" | "sound" | "story";
export type StatKey = Axis | "hustle";

export type Stats = Record<StatKey, number>;
export type AxisPoints = Record<Axis, number>;

export type RoleId =
  | "director" | "editor" | "composer" | "writer" | "marketer" | "producer";

export type TraitId =
  | "ambient_host" | "framework_op" | "raises_room" | "closer"
  | "reliable" | "creative_dir" | "grinder" | "natural";

export interface Creative {
  id: string;
  name: string;
  role: RoleId;
  trait?: TraitId;
  stats: Stats;
  level: number;
  xp: number;
  salary: number; // per week
  energy: number; // 0..100; low energy => weaker output
  assigned: boolean;
}

export type ProjectKind = "event" | "creative";

export type MediumId =
  // events (grow Members)
  | "openmic" | "arthouse" | "tunetown" | "lovelingo" | "karaoke" | "playback" | "movienight" | "creatorconnect"
  // creative work (grow Buzz + cash)
  | "single" | "musicvideo" | "album" | "shortfilm" | "brand" | "photoset" | "fashion" | "podcast";

export type VibeId =
  | "romance" | "hype" | "nostalgia" | "rebellion" | "luxury" | "wholesome" | "experimental" | "dark";

export interface Medium {
  id: MediumId;
  name: string;
  kind: ProjectKind;
  weeks: number;
  budget: number;
  weights: AxisPoints; // what critics weigh (sums ~1)
  expectedQ: number;   // quality for ~7/critic // TUNE
  reach: number;       // base magnitude of audience effect
  conv: number;        // fraction of audience that converts to cash
  cashPer: number;     // $ per converted unit
  clientFee?: number;  // upfront guaranteed pay (brand work)
  blurb: string;
}

export interface Vibe { id: VibeId; name: string }

export type SynergyTier = "S" | "A" | "B" | "C";

export interface Critic {
  id: string;
  name: string;
  blurb: string;
  lean: Partial<AxisPoints> & { hype?: number };
}

export interface PlatformEra {
  id: string; name: string; startYear: number; reach: number;
}

export interface Trait {
  id: TraitId;
  name: string;
  blurb: string;
  outputMult?: number;   // production point multiplier
  energyDrain?: number;  // override weekly energy drain
  buzzMult?: number;     // buzz payoff multiplier when on a project
  memberMult?: number;   // member payoff multiplier
  morale?: number;       // team-wide flat output bump (aura)
}

export interface Upgrade {
  id: string;
  name: string;
  blurb: string;
  cost: number;
  axis?: Axis;       // permanent boost to one axis' production
  axisBoost?: number;
  venueCap?: number; // raises event member ceiling
  burnDelta?: number; // changes monthly burn
  unlocks?: MediumId[];
}

export type Phase = "idle" | "production" | "polish";

export interface Project {
  title: string;
  medium: MediumId;
  vibe: VibeId;
  weeksTotal: number;
  weeksElapsed: number;
  points: AxisPoints;
  hype: number;       // project buzz built during production
  roughEdges: number;
  staffIds: string[];
}

export interface ReleaseResult {
  title: string;
  medium: MediumId;
  vibe: VibeId;
  kind: ProjectKind;
  criticScores: number[];
  score40: number;
  newMembers: number;
  buzzGain: number;
  revenue: number;
  legendary: boolean;
  week: number;
}

export interface Trend { medium: MediumId; vibe: VibeId; monthsLeft: number }

export interface Choice {
  label: string;
  blurb?: string;
  // Effects applied to state on pick. Resolved in logic (pure).
  cash?: number; members?: number; buzz?: number; rep?: number; morale?: number;
  log: string;
}
export interface GameEventCard {
  id: string;
  title: string;
  body: string;
  choices: Choice[];
}

export interface StoryBeat {
  id: string;
  title: string;
  body: string;
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
  members: number;      // durable audience -> MRR
  buzz: number;         // momentum, decays monthly
  reputation: number;   // 0..100
  burn: number;         // monthly operating burn
  staff: Creative[];
  recruitPool: Creative[];
  project: Project | null;
  phase: Phase;
  trend: Trend;
  ownedUpgrades: string[];
  log: LogEntry[];
  legendary: ReleaseResult[];
  lastRelease: ReleaseResult | null;
  firedBeats: string[];
  storyQueue: string[];     // beat ids awaiting display
  activeEventId: string | null;
  negativeWeeks: number;
  gameOver: boolean;
  // stats
  totalReleases: number;
  bestScore: number;
  equityTriggered: boolean;
  banner: string | null;    // transient toast (month/era)
}
