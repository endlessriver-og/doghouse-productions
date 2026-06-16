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
  tier: number;     // career-ladder tier (0 = base role, up to 2)
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
  contractId?: string;    // fulfilling a client contract
  deadlineWeek?: number;  // contract deadline (absolute week)
}

/** A timed client commission: cash + cred for hitting a brief on time. */
export interface Contract {
  id: string;
  client: string;
  brief: string;
  medium: MediumId;
  vibe: VibeId;
  weeks: number;          // deadline length from acceptance
  minScore: number;       // quality bar to get full reward
  rewardCash: number;
  rewardCred: number;
  penaltyCash: number;
  repReq: number;         // reputation needed to take it
}

export type LabelKind = "record" | "production" | "festival";
/** Your own label/platform — late-game ownership play. */
export interface OwnedLabel {
  kind: LabelKind;
  name: string;
  tier: number;           // upgradeable
  revBonus: number;       // % bump to creative revenue
  memberBonus: number;    // % bump to event members
  monthlyIncome: number;
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

/** Roguelite run outcome (drives the run-summary modal). */
export type RunResult = "busted" | "missed" | "cleared" | null;

/** A between-season draft boon (Slay-the-Spire-style reward pick). */
export interface Boon {
  id: string;
  kind: "cash" | "cred" | "members" | "buzz" | "rent" | "hire" | "space" | "trait";
  name: string;
  blurb: string;
  icon: string;        // IconName
  amount?: number;
  recruit?: Creative;  // hire
  spaceId?: string;    // space
  crewId?: string;     // trait target
  traitId?: TraitId;   // trait granted
}

/** Chemistry/clash between two crew — applies when both are on a project. */
export interface Bond { a: string; b: string; kind: "chemistry" | "clash" }

/** A named recurring member with a favorite vibe. */
export interface Regular { name: string; favVibe: VibeId; since: number }

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
  bonds: Bond[];
  regulars: Regular[];
  scenarioChosen: boolean;     // start-screen scenario picked
  cred: number;                // creative capital (2nd currency)
  contracts: Contract[];        // available client commissions
  activeContract: Contract | null; // the one in progress
  label: OwnedLabel | null;     // your own label/platform
  campaignUse: Record<string, number>; // marketing diminishing-returns tracker
  showcasePending: boolean;     // annual Showcase awaiting a choice
  vendorPending: boolean;       // annual vendor visit awaiting
  mediumXp: Partial<Record<MediumId, number>>; // mastery
  vibeXp: Partial<Record<VibeId, number>>;
  bailoutUsed: boolean;
  narrator: string | null;     // wry in-world reaction line
  trendPreviewed: boolean;      // bought next-trend foresight this cycle
  awardsPending: AwardResult | null;
  lastAwardYear: number;
  legacyRun: number;            // New Game+ count
  legacyTraits: string[];       // permanent prestige bonuses
  scenarioId: string;
  // roguelite run
  season: number;            // 1..MAX_SEASON
  quota: number;             // member target to clear this season
  seasonStartWeek: number;   // week the current season began
  peakMembers: number;       // high-water mark this run
  runResult: RunResult;      // set when the run ends -> summary modal
  cloutBanked: number;       // Clout earned this run (shown on summary)
  clout: number;             // meta-currency, carries across runs
  draftPending: Boon[] | null; // between-season boon draft (pick one)
  // stats
  totalReleases: number;
  bestScore: number;
  equityTriggered: boolean;
  banner: string | null;    // transient toast (month/era)
}
