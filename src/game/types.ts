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

/** Strategic posture chosen per project (GDS direction modes). */
export type Focus = "balanced" | "quality" | "fast" | "experimental";
/** Effort split across the three production phases (sums to ~1). */
export interface Phases { concept: number; build: number; promo: number }

export interface Project {
  title: string;
  medium: MediumId;
  vibe: VibeId;
  focus: Focus;
  phases: Phases;
  weeksTotal: number;
  weeksElapsed: number;
  points: AxisPoints;
  hype: number;       // project buzz built during production
  roughEdges: number;
  staffIds: string[];
  spikeUsed: boolean;     // mid-project risk gamble consumed
  sequelOf?: string;      // title of the project this is a sequel to
  generation: number;     // 1 = original, 2+ = sequel depth
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
  phaseMatch: number;     // 0..1 how well phases fit the medium
  surprise?: string;      // variable-reward flavor when it fires
  generation: number;
}

/** A shipped project retained for sequels + residual income. */
export interface CatalogItem {
  title: string;
  medium: MediumId;
  vibe: VibeId;
  score40: number;
  generation: number;
  residual: number;       // $/month passive while it has legs
  monthsLeft: number;     // residual decays to 0
}

/** A short-term objective (dual-track goals). */
export interface Goal {
  id: string;
  label: string;
  reward: number;         // cash bonus on completion
  done: boolean;
}

export interface Rival {
  name: string;
  members: number;
  rep: number;
  lastTitle: string;
  lastScore: number;
}

export interface AwardCategory { name: string; winner: string; youWon: boolean; nominee: string }
export interface AwardResult { year: number; categories: AwardCategory[] }

export type Season = "spring" | "summer" | "fall" | "winter";

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
  // catalog + meta systems
  catalog: CatalogItem[];
  goals: Goal[];
  rivals: Rival[];
  narrator: string | null;     // wry in-world reaction line
  trendPreviewed: boolean;      // bought next-trend foresight this cycle
  awardsPending: AwardResult | null;
  lastAwardYear: number;
  legacyRun: number;            // New Game+ count
  legacyTraits: string[];       // permanent prestige bonuses
  scenarioId: string;
  // stats
  totalReleases: number;
  bestScore: number;
  equityTriggered: boolean;
  banner: string | null;    // transient toast (month/era)
}
