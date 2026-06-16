import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  EVENT_DECK, UPGRADES, mediumById, rollRecruit, signingFee, vibeById,
} from "./data";
import {
  BUZZ_DECAY, EVENT_CHANCE, GAMEOVER_FUSE, MEMBER_VALUE, WEEKS_PER_MONTH,
  applyTrain, axisBoostsOf, checkBeats, clamp, computeRelease, createInitialState,
  monthOf, newProject, polishWeek, produceWeek, restWeek, rollTrend, trainCost,
  weeklySalary, yearOf,
} from "./logic";
import type { GameState, LogEntry, MediumId, Phase, VibeId } from "./types";

const mk = (week: number, text: string, kind: LogEntry["kind"]): LogEntry => ({ week, text, kind });
const trim = (arr: LogEntry[]) => arr.slice(-80);

interface Actions {
  startProject: (title: string, medium: MediumId, vibe: VibeId, staffIds: string[]) => void;
  advanceWeek: () => void;
  release: () => void;
  dismissRelease: () => void;
  dismissStory: () => void;
  resolveEvent: (choiceIndex: number) => void;
  buyUpgrade: (id: string) => void;
  hire: (id: string) => void;
  refreshPool: () => void;
  train: (id: string) => void;
  clearBanner: () => void;
  reset: () => void;
}
type Store = GameState & Actions;

const blocked = (s: GameState) =>
  s.gameOver || !!s.activeEventId || s.storyQueue.length > 0 || !!s.lastRelease;

export const useGame = create<Store>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      startProject: (title, medium, vibe, staffIds) => {
        const s = get();
        if (s.project || s.gameOver || staffIds.length === 0) return;
        const m = mediumById(medium);
        const project = newProject(title, medium, vibe, staffIds);
        const ids = new Set(staffIds);
        set({
          project, phase: "production", cash: s.cash - m.budget,
          staff: s.staff.map((c) => ({ ...c, assigned: ids.has(c.id) })),
          log: trim([...s.log, mk(s.week, `Greenlit "${project.title}" — ${m.name}. Budget $${m.budget.toLocaleString()}.`, "info")]),
        });
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

        // ---- month boundary: rent, MRR, buzz decay, trend ----
        if (week % WEEKS_PER_MONTH === 0) {
          const mrr = Math.round(s.members * MEMBER_VALUE);
          cash += mrr - s.burn;
          buzz = Math.round(buzz * BUZZ_DECAY);
          trend = { ...trend, monthsLeft: trend.monthsLeft - 1 };
          let trendMsg = "";
          if (trend.monthsLeft <= 0) {
            trend = rollTrend();
            trendMsg = ` · new trend ${mediumById(trend.medium).name} × ${vibeById(trend.vibe).name}`;
          }
          banner = `Month ${monthOf(week)} · rent −$${s.burn.toLocaleString()} · +$${mrr.toLocaleString()} from ${s.members} members${trendMsg}`;
          logs = trim([...logs, mk(week, `Month close: +$${mrr.toLocaleString()} memberships, −$${s.burn.toLocaleString()} burn.`, mrr >= s.burn ? "good" : "bad")]);
        }

        let negativeWeeks = cash < 0 ? s.negativeWeeks + 1 : 0;
        let gameOver = false;
        if (negativeWeeks >= GAMEOVER_FUSE) {
          gameOver = true;
          logs = trim([...logs, mk(week, "Out of money too long. The doors close. 🐶", "bad")]);
        }

        const interim: GameState = { ...s, cash, staff, project, phase, buzz, trend, week, negativeWeeks, gameOver, banner, log: logs };
        const newBeats = gameOver ? [] : checkBeats(interim);
        const storyQueue = [...s.storyQueue, ...newBeats];
        const equityTriggered = s.equityTriggered || newBeats.includes("equity");

        // random choice-event at month close, only if no modal is queued
        let activeEventId: string | null = null;
        if (!gameOver && week % WEEKS_PER_MONTH === 0 && storyQueue.length === 0 && Math.random() < EVENT_CHANCE) {
          activeEventId = EVENT_DECK[Math.floor(Math.random() * EVENT_DECK.length)].id;
        }

        set({ cash, staff, project, phase, buzz, trend, week, negativeWeeks, gameOver, banner, log: logs, storyQueue, equityTriggered, activeEventId });
      },

      release: () => {
        const s = get();
        if (!s.project || s.phase !== "polish" || s.gameOver) return;
        const r = computeRelease(s, s.project);
        const repGain = r.score40 >= 30 ? Math.round((r.score40 - 28) / 2) : 0;
        let logs = trim([...s.log, mk(s.week, `Released "${r.title}" — ${r.score40}/40 · +${r.newMembers} members · +${r.buzzGain} buzz · $${r.revenue.toLocaleString()}`, "release")]);
        if (r.legendary) logs = trim([...logs, mk(s.week, `🏆 "${r.title}" is legendary!`, "good")]);

        const interim: GameState = {
          ...s, project: null, phase: "idle",
          cash: s.cash + r.revenue,
          members: s.members + r.newMembers,
          buzz: s.buzz + r.buzzGain,
          reputation: Math.min(100, s.reputation + repGain),
          staff: s.staff.map((c) => ({ ...c, assigned: false })),
          lastRelease: r,
          legendary: r.legendary ? [...s.legendary, r] : s.legendary,
          totalReleases: s.totalReleases + 1,
          bestScore: Math.max(s.bestScore, r.score40),
          log: logs,
        };
        const newBeats = checkBeats(interim);
        set({ ...interim, storyQueue: [...s.storyQueue, ...newBeats], equityTriggered: s.equityTriggered || newBeats.includes("equity") });
      },

      dismissRelease: () => set({ lastRelease: null }),

      dismissStory: () => set((s) => ({
        storyQueue: s.storyQueue.slice(1),
        firedBeats: s.storyQueue[0] ? [...s.firedBeats, s.storyQueue[0]] : s.firedBeats,
      })),

      resolveEvent: (i) => {
        const s = get();
        const card = EVENT_DECK.find((e) => e.id === s.activeEventId);
        if (!card) return;
        const ch = card.choices[i];
        if (!ch) return;
        let burn = s.burn;
        if (card.id === "prepay" && i === 0) burn = Math.round(burn * 0.92);
        const staff = ch.morale ? s.staff.map((c) => ({ ...c, energy: clamp(c.energy + (ch.morale ?? 0), 0, 100) })) : s.staff;
        const interim: GameState = {
          ...s, activeEventId: null, burn, staff,
          cash: s.cash + (ch.cash ?? 0),
          members: Math.max(0, s.members + (ch.members ?? 0)),
          buzz: Math.max(0, s.buzz + (ch.buzz ?? 0)),
          reputation: clamp(s.reputation + (ch.rep ?? 0), 0, 100),
          log: trim([...s.log, mk(s.week, ch.log, (ch.cash ?? 0) >= 0 ? "good" : "info")]),
        };
        const newBeats = checkBeats(interim);
        set({ ...interim, storyQueue: [...s.storyQueue, ...newBeats], equityTriggered: s.equityTriggered || newBeats.includes("equity") });
      },

      buyUpgrade: (id) => {
        const s = get();
        const u = UPGRADES.find((x) => x.id === id);
        if (!u || s.ownedUpgrades.includes(id) || s.cash < u.cost) return;
        set({
          cash: s.cash - u.cost,
          ownedUpgrades: [...s.ownedUpgrades, id],
          burn: s.burn + (u.burnDelta ?? 0),
          banner: `Built: ${u.name}`,
          log: trim([...s.log, mk(s.week, `Built ${u.name}.`, "good")]),
        });
      },

      hire: (id) => {
        const s = get();
        const c = s.recruitPool.find((x) => x.id === id);
        if (!c) return;
        const fee = signingFee(c);
        if (s.cash < fee) return;
        set({
          cash: s.cash - fee,
          staff: [...s.staff, { ...c, assigned: false }],
          recruitPool: s.recruitPool.filter((x) => x.id !== id),
          log: trim([...s.log, mk(s.week, `Signed ${c.name} for $${fee.toLocaleString()}.`, "info")]),
        });
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

      clearBanner: () => set({ banner: null }),
      reset: () => set({ ...createInitialState() }),
    }),
    {
      name: "doghouse-save-v2",
      partialize: (s) => {
        const {
          startProject, advanceWeek, release, dismissRelease, dismissStory, resolveEvent,
          buyUpgrade, hire, refreshPool, train, clearBanner, reset, ...data
        } = s;
        void startProject; void advanceWeek; void release; void dismissRelease; void dismissStory;
        void resolveEvent; void buyUpgrade; void hire; void refreshPool; void train; void clearBanner; void reset;
        return data;
      },
    }
  )
);

if (typeof localStorage !== "undefined" && !localStorage.getItem("doghouse-save-v2")) {
  useGame.setState((s) => s);
}

export { yearOf };
