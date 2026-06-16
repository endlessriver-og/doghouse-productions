import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mediumById, rollCreative, signingFee } from "./data";
import {
  GAMEOVER_FUSE, applyTrain, computeRelease, createInitialState, newProject,
  polishWeek, produceWeek, restWeek, trainCost, weeklySalary, yearOf,
} from "./logic";
import type { GameState, MediumId, VibeId } from "./types";

interface Actions {
  startProject: (title: string, medium: MediumId, vibe: VibeId, staffIds: string[]) => void;
  advanceWeek: () => void;
  polish: () => void;
  release: () => void;
  dismissRelease: () => void;
  hire: (id: string) => void;
  refreshPool: () => void;
  train: (id: string) => void;
  reset: () => void;
}

type Store = GameState & Actions;

const log = (s: GameState, text: string, kind: GameState["log"][number]["kind"]) =>
  [...s.log, { week: s.week, text, kind }].slice(-60);

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
          project,
          phase: "production",
          cash: s.cash - m.budget,
          staff: s.staff.map((c) => ({ ...c, assigned: ids.has(c.id) })),
          log: log({ ...s }, `Greenlit "${project.title}" — ${m.name}. Budget $${m.budget.toLocaleString()}.`, "info"),
        });
      },

      advanceWeek: () => {
        const s = get();
        if (s.gameOver) return;
        let cash = s.cash - weeklySalary(s.staff);
        let { staff, project, phase } = s;
        let logs = s.log;

        if (project && phase === "production") {
          const res = produceWeek(project, staff, s.week + 1);
          project = res.project;
          staff = restWeek(res.staff, project.staffIds);
          logs = [...logs, ...res.logs].slice(-60);
          if (project.weeksElapsed >= project.weeksTotal) {
            phase = "polish";
            logs = [...logs, { week: s.week + 1, text: `"${project.title}" wrapped. Polish or release.`, kind: "info" as const }].slice(-60);
          }
        } else if (project && phase === "polish") {
          project = polishWeek(project, staff);
          staff = restWeek(staff, project.staffIds);
        } else {
          staff = restWeek(staff, []);
        }

        const week = s.week + 1;
        let negativeWeeks = cash < 0 ? s.negativeWeeks + 1 : 0;
        let gameOver = false;
        if (negativeWeeks >= GAMEOVER_FUSE) {
          gameOver = true;
          logs = [...logs, { week, text: "Out of money too long. Doghouse Productions closes. 🐶", kind: "bad" as const }].slice(-60);
        }
        set({ cash, staff, project, phase, week, negativeWeeks, gameOver, log: logs });
      },

      polish: () => {
        const s = get();
        if (!s.project || s.phase !== "polish" || s.gameOver) return;
        get().advanceWeek();
      },

      release: () => {
        const s = get();
        if (!s.project || s.phase !== "polish" || s.gameOver) return;
        const result = computeRelease(s, s.project);
        const repGain = result.score40 >= 30 ? Math.round((result.score40 - 28) / 2) : 0;
        let logs = log({ ...s }, `Released "${result.title}" — ${result.score40}/40, +${result.newFollowers.toLocaleString()} following, $${result.revenue.toLocaleString()}.`, "release");
        if (result.legendary) {
          logs = [...logs, { week: s.week, text: `🏆 "${result.title}" is a Legendary Project!`, kind: "good" as const }].slice(-60);
        }
        set({
          project: null,
          phase: "idle",
          cash: s.cash + result.revenue,
          following: s.following + result.newFollowers,
          reputation: Math.min(100, s.reputation + repGain),
          staff: s.staff.map((c) => ({ ...c, assigned: false })),
          lastRelease: result,
          legendary: result.legendary ? [...s.legendary, result] : s.legendary,
          log: logs,
        });
      },

      dismissRelease: () => set({ lastRelease: null }),

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
          log: log({ ...s }, `Signed ${c.name} (${c.role}) for $${fee.toLocaleString()}.`, "info"),
        });
      },

      refreshPool: () => {
        const s = get();
        const cost = 800;
        if (s.cash < cost) return;
        set({
          cash: s.cash - cost,
          recruitPool: [rollCreative(), rollCreative(), rollCreative()],
          log: log({ ...s }, "Put out a new casting call.", "info"),
        });
      },

      train: (id) => {
        const s = get();
        const c = s.staff.find((x) => x.id === id);
        if (!c) return;
        const cost = trainCost(c);
        if (s.cash < cost) return;
        set({
          cash: s.cash - cost,
          staff: s.staff.map((x) => (x.id === id ? applyTrain(x) : x)),
          log: log({ ...s }, `${c.name} did a masterclass (+stats).`, "good"),
        });
      },

      reset: () => set({ ...createInitialState() }),
    }),
    {
      name: "doghouse-save-v1",
      partialize: (s) => {
        // Persist data only; actions are re-created by the store factory.
        const { startProject, advanceWeek, polish, release, dismissRelease, hire, refreshPool, train, reset, ...data } = s;
        void startProject; void advanceWeek; void polish; void release; void dismissRelease;
        void hire; void refreshPool; void train; void reset;
        return data;
      },
    }
  )
);

// Persist the freshly generated studio on first ever load, so a returning player
// keeps the same starting roster even if they reload before their first action.
if (typeof localStorage !== "undefined" && !localStorage.getItem("doghouse-save-v1")) {
  useGame.setState((s) => s);
}

export { yearOf };
