import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  EVENT_DECK, UPGRADES, mediumById, narratorLine, rollRecruit, signingFee, vibeById,
} from "./data";
import {
  BUZZ_DECAY, EVENT_CHANCE, GAMEOVER_FUSE, MEMBER_VALUE, WEEKS_PER_MONTH, WEEKS_PER_YEAR,
  applyTrain, axisBoostsOf, catalogFrom, checkBeats, checkGoals, clamp, computeRelease,
  createInitialState, decayCatalog, newProject, polishWeek, produceWeek,
  resolveAwards, resolveSpike, restWeek, rollGoals, rollTrend, seasonOf, tickRivals,
  trainCost, weeklySalary, yearOf,
} from "./logic";
import type { Focus, GameState, LogEntry, MediumId, Phase, Phases, VibeId } from "./types";

const mk = (week: number, text: string, kind: LogEntry["kind"]): LogEntry => ({ week, text, kind });
const trim = (arr: LogEntry[]) => arr.slice(-80);

interface Actions {
  startProject: (title: string, medium: MediumId, vibe: VibeId, staffIds: string[], focus: Focus, phases: Phases, sequelOf?: string, generation?: number) => void;
  advanceWeek: () => void;
  takeSpike: () => void;
  release: () => void;
  dismissRelease: () => void;
  dismissStory: () => void;
  dismissAwards: () => void;
  resolveEvent: (choiceIndex: number) => void;
  previewTrend: () => void;
  buyUpgrade: (id: string) => void;
  hire: (id: string) => void;
  refreshPool: () => void;
  train: (id: string) => void;
  prestige: (traitId: string) => void;
  newGame: (scenarioId: string) => void;
  clearBanner: () => void;
  clearNarrator: () => void;
  reset: () => void;
}
type Store = GameState & Actions;

const blocked = (s: GameState) =>
  s.gameOver || !!s.activeEventId || s.storyQueue.length > 0 || !!s.lastRelease || !!s.awardsPending;

/** Apply goal completions: returns patched fields. */
function applyGoals(s: GameState) {
  const { goals, reward, logs } = checkGoals(s);
  const refreshed = reward > 0 ? rollGoals(goals) : goals;
  return { goals: refreshed, cash: s.cash + reward, logs: logs.map((t) => mk(s.week, t, "good" as const)) };
}

export const useGame = create<Store>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      startProject: (title, medium, vibe, staffIds, focus, phases, sequelOf, generation) => {
        const s = get();
        if (s.project || s.gameOver || staffIds.length === 0) return;
        const m = mediumById(medium);
        const project = newProject(title, medium, vibe, staffIds, focus, phases, sequelOf, generation);
        const ids = new Set(staffIds);
        const tag = sequelOf ? ` (sequel to "${sequelOf}")` : "";
        set({
          project, phase: "production", cash: s.cash - m.budget,
          staff: s.staff.map((c) => ({ ...c, assigned: ids.has(c.id) })),
          log: trim([...s.log, mk(s.week, `Greenlit "${project.title}"${tag} — ${m.name}. Budget $${m.budget.toLocaleString()}.`, "info")]),
        });
      },

      takeSpike: () => {
        const s = get();
        if (!s.project || s.phase !== "production" || s.project.spikeUsed) return;
        const res = resolveSpike(s.project);
        set({ project: res.project, log: trim([...s.log, mk(s.week, res.text, res.success ? "good" : "bad")]) });
      },

      advanceWeek: () => {
        const s = get();
        if (blocked(s)) return;
        let cash = s.cash - weeklySalary(s.staff);
        let staff = s.staff;
        let project = s.project;
        let phase: Phase = s.phase;
        let buzz = s.buzz;
        let trend = s.trend;
        let logs = s.log;
        let banner = s.banner;
        let catalog = s.catalog;
        let rivals = s.rivals;
        let trendPreviewed = s.trendPreviewed;
        let narrator = s.narrator;

        if (project && phase === "production") {
          const res = produceWeek(project, staff, s.week + 1, axisBoostsOf(s));
          project = res.project;
          staff = restWeek(res.staff, project.staffIds);
          logs = trim([...logs, ...res.logs]);
          if (project.weeksElapsed >= project.weeksTotal) {
            phase = "polish";
            logs = trim([...logs, mk(s.week + 1, `"${project.title}" wrapped. Polish or release.`, "info")]);
          }
        } else if (project && phase === "polish") {
          project = polishWeek(project, staff);
          staff = restWeek(staff, project.staffIds);
        } else {
          staff = restWeek(staff, []);
        }

        const week = s.week + 1;

        // ---- month boundary ----
        if (week % WEEKS_PER_MONTH === 0) {
          const mrr = Math.round(s.members * MEMBER_VALUE);
          const residual = catalog.reduce((sum, c) => sum + c.residual, 0);
          cash += mrr + residual - s.burn;
          buzz = Math.round(buzz * BUZZ_DECAY);
          catalog = decayCatalog(catalog);
          rivals = tickRivals(rivals);
          trend = { ...trend, monthsLeft: trend.monthsLeft - 1 };
          let trendMsg = "";
          if (trend.monthsLeft <= 0) { trend = rollTrend(); trendPreviewed = false; trendMsg = ` · new trend ${mediumById(trend.medium).name} × ${vibeById(trend.vibe).name}`; }
          const season = seasonOf(week);
          banner = `${season.emoji} ${season.name} · +$${(mrr + residual).toLocaleString()} in${residual ? " (incl. residuals)" : ""} · −$${s.burn.toLocaleString()} rent${trendMsg}`;
          logs = trim([...logs, mk(week, `Month close: +$${(mrr + residual).toLocaleString()} revenue, −$${s.burn.toLocaleString()} burn.`, mrr + residual >= s.burn ? "good" : "bad")]);
          narrator = narratorLine(cash < 0 ? "broke" : "month");
        }

        let negativeWeeks = cash < 0 ? s.negativeWeeks + 1 : 0;
        let gameOver = false;
        if (negativeWeeks >= GAMEOVER_FUSE) { gameOver = true; logs = trim([...logs, mk(week, "Out of money too long. The doors close. 🐶", "bad")]); }

        let interim: GameState = { ...s, cash, staff, project, phase, buzz, trend, week, negativeWeeks, gameOver, banner, log: logs, catalog, rivals, trendPreviewed, narrator };

        // goals
        const g = applyGoals(interim);
        interim = { ...interim, goals: g.goals, cash: g.cash, log: trim([...interim.log, ...g.logs]) };

        // annual awards
        let awardsPending = s.awardsPending;
        let lastAwardYear = s.lastAwardYear;
        if (!gameOver && week % WEEKS_PER_YEAR === 0 && yearOf(week) > s.lastAwardYear) {
          awardsPending = resolveAwards(interim);
          lastAwardYear = yearOf(week);
        }

        const newBeats = gameOver ? [] : checkBeats(interim);
        const storyQueue = [...s.storyQueue, ...newBeats];
        const equityTriggered = s.equityTriggered || newBeats.includes("equity");

        let activeEventId: string | null = null;
        if (!gameOver && week % WEEKS_PER_MONTH === 0 && storyQueue.length === 0 && !awardsPending && Math.random() < EVENT_CHANCE) {
          activeEventId = EVENT_DECK[Math.floor(Math.random() * EVENT_DECK.length)].id;
        }

        set({ ...interim, storyQueue, equityTriggered, activeEventId, awardsPending, lastAwardYear });
      },

      release: () => {
        const s = get();
        if (!s.project || s.phase !== "polish" || s.gameOver) return;
        const r = computeRelease(s, s.project);
        const repGain = r.score40 >= 30 ? Math.round((r.score40 - 28) / 2) : 0;
        let logs = trim([...s.log, mk(s.week, `Released "${r.title}" — ${r.score40}/40 · +${r.newMembers} members · +${r.buzzGain} buzz · $${r.revenue.toLocaleString()}`, "release")]);
        if (r.surprise) logs = trim([...logs, mk(s.week, `🎁 ${r.surprise}`, "good")]);
        if (r.legendary) logs = trim([...logs, mk(s.week, `🏆 "${r.title}" is legendary!`, "good")]);
        const cat = catalogFrom(r);

        let interim: GameState = {
          ...s, project: null, phase: "idle",
          cash: s.cash + r.revenue,
          members: s.members + r.newMembers,
          buzz: s.buzz + r.buzzGain,
          reputation: Math.min(100, s.reputation + repGain),
          staff: s.staff.map((c) => ({ ...c, assigned: false })),
          lastRelease: r,
          legendary: r.legendary ? [...s.legendary, r] : s.legendary,
          catalog: cat ? [...s.catalog, cat] : s.catalog,
          totalReleases: s.totalReleases + 1,
          bestScore: Math.max(s.bestScore, r.score40),
          narrator: narratorLine(r.legendary ? "legendary" : r.score40 >= 26 ? "hit" : "flop"),
          log: logs,
        };
        const g = applyGoals(interim);
        interim = { ...interim, goals: g.goals, cash: g.cash, log: trim([...interim.log, ...g.logs]) };
        const newBeats = checkBeats(interim);
        set({ ...interim, storyQueue: [...s.storyQueue, ...newBeats], equityTriggered: s.equityTriggered || newBeats.includes("equity") });
      },

      dismissRelease: () => set({ lastRelease: null }),
      dismissStory: () => set((s) => ({ storyQueue: s.storyQueue.slice(1), firedBeats: s.storyQueue[0] ? [...s.firedBeats, s.storyQueue[0]] : s.firedBeats })),

      dismissAwards: () => {
        const s = get();
        if (!s.awardsPending) return;
        const wins = s.awardsPending.categories.filter((c) => c.youWon).length;
        set({
          awardsPending: null,
          reputation: Math.min(100, s.reputation + wins * 3),
          log: trim([...s.log, mk(s.week, `LA Scene Awards: won ${wins}/${s.awardsPending.categories.length}. (+${wins * 3} rep)`, wins > 0 ? "good" : "info")]),
        });
      },

      resolveEvent: (i) => {
        const s = get();
        const card = EVENT_DECK.find((e) => e.id === s.activeEventId);
        if (!card) return;
        const ch = card.choices[i];
        if (!ch) return;
        let burn = s.burn;
        if (card.id === "prepay" && i === 0) burn = Math.round(burn * 0.92);
        const staff = ch.morale ? s.staff.map((c) => ({ ...c, energy: clamp(c.energy + (ch.morale ?? 0), 0, 100) })) : s.staff;
        let interim: GameState = {
          ...s, activeEventId: null, burn, staff,
          cash: s.cash + (ch.cash ?? 0),
          members: Math.max(0, s.members + (ch.members ?? 0)),
          buzz: Math.max(0, s.buzz + (ch.buzz ?? 0)),
          reputation: clamp(s.reputation + (ch.rep ?? 0), 0, 100),
          log: trim([...s.log, mk(s.week, ch.log, (ch.cash ?? 0) >= 0 ? "good" : "info")]),
        };
        const g = applyGoals(interim);
        interim = { ...interim, goals: g.goals, cash: g.cash, log: trim([...interim.log, ...g.logs]) };
        const newBeats = checkBeats(interim);
        set({ ...interim, storyQueue: [...s.storyQueue, ...newBeats], equityTriggered: s.equityTriggered || newBeats.includes("equity") });
      },

      previewTrend: () => {
        const s = get();
        if (s.trendPreviewed || s.cash < 1200) return;
        set({
          cash: s.cash - 1200, trendPreviewed: true,
          trend: { ...s.trend, monthsLeft: s.trend.monthsLeft + 2 },
          banner: "Scouted the scene — trend window extended +2 mo.",
          log: trim([...s.log, mk(s.week, "Scouted the scene. Trend window extended.", "info")]),
        });
      },

      buyUpgrade: (id) => {
        const s = get();
        const u = UPGRADES.find((x) => x.id === id);
        if (!u || s.ownedUpgrades.includes(id) || s.cash < u.cost) return;
        set({ cash: s.cash - u.cost, ownedUpgrades: [...s.ownedUpgrades, id], burn: s.burn + (u.burnDelta ?? 0), banner: `Built: ${u.name}`, log: trim([...s.log, mk(s.week, `Built ${u.name}.`, "good")]) });
      },

      hire: (id) => {
        const s = get();
        const c = s.recruitPool.find((x) => x.id === id);
        if (!c) return;
        const fee = signingFee(c);
        if (s.cash < fee) return;
        set({ cash: s.cash - fee, staff: [...s.staff, { ...c, assigned: false }], recruitPool: s.recruitPool.filter((x) => x.id !== id), narrator: narratorLine("hire"), log: trim([...s.log, mk(s.week, `Signed ${c.name} for $${fee.toLocaleString()}.`, "info")]) });
      },

      refreshPool: () => {
        const s = get();
        if (s.cash < 800) return;
        set({ cash: s.cash - 800, recruitPool: [rollRecruit(), rollRecruit(), rollRecruit()], log: trim([...s.log, mk(s.week, "Put out a new casting call.", "info")]) });
      },

      train: (id) => {
        const s = get();
        const c = s.staff.find((x) => x.id === id);
        if (!c) return;
        const cost = trainCost(c);
        if (s.cash < cost) return;
        set({ cash: s.cash - cost, staff: s.staff.map((x) => (x.id === id ? applyTrain(x) : x)), log: trim([...s.log, mk(s.week, `${c.name} did a masterclass.`, "good")]) });
      },

      prestige: (traitId) => {
        const s = get();
        set({ ...createInitialState(s.scenarioId, [...s.legacyTraits, traitId], s.legacyRun + 1) });
      },
      newGame: (scenarioId) => set({ ...createInitialState(scenarioId, get().legacyTraits, get().legacyRun) }),
      clearBanner: () => set({ banner: null }),
      clearNarrator: () => set({ narrator: null }),
      reset: () => set({ ...createInitialState(get().scenarioId, get().legacyTraits, get().legacyRun) }),
    }),
    {
      name: "doghouse-save-v3",
      partialize: (s) => {
        const {
          startProject, advanceWeek, takeSpike, release, dismissRelease, dismissStory, dismissAwards,
          resolveEvent, previewTrend, buyUpgrade, hire, refreshPool, train, prestige, newGame,
          clearBanner, clearNarrator, reset, ...data
        } = s;
        void startProject; void advanceWeek; void takeSpike; void release; void dismissRelease;
        void dismissStory; void dismissAwards; void resolveEvent; void previewTrend; void buyUpgrade;
        void hire; void refreshPool; void train; void prestige; void newGame; void clearBanner;
        void clearNarrator; void reset;
        return data;
      },
    }
  )
);

if (typeof localStorage !== "undefined" && !localStorage.getItem("doghouse-save-v3")) {
  useGame.setState((s) => s);
}

export { yearOf };
