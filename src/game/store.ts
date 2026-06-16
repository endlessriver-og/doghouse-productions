import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  BOOTHS, CAMPAIGNS, EVENT_DECK, LABEL_ARCHETYPES, LABEL_FOUND_CASH, LABEL_FOUND_CRED,
  UPGRADES, VENDOR_ITEMS, labelUpgradeCost, makeBond, masteryLevel, mediumById, narratorLine,
  rollContract, rollDraft, rollRecruit, signingFee, vibeById,
} from "./data";
import {
  BUZZ_DECAY, EVENT_CHANCE, GAMEOVER_FUSE, MEMBER_VALUE, WEEKS_PER_MONTH, WEEKS_PER_YEAR,
  applyTrain, axisBoostsOf, canPromote, catalogFrom, checkBeats, checkGoals, clamp, computeRelease,
  createInitialState, crewCapOf, decayCatalog, maybeAddRegular, newProject, polishWeek, produceWeek,
  promoteCreative, promoteCredCost, resolveAwards, resolveSpike, restWeek, rollGoals, rollTrend,
  seasonOf, tickRivals, trainCost, weeklySalary, yearOf,
  SEASON_LEN, MAX_SEASON, quotaForSeason, cloutFromRun,
} from "./logic";
import type { Focus, GameState, LabelKind, LogEntry, MediumId, Phase, Phases, VibeId } from "./types";

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
  promote: (id: string) => void;
  acceptContract: (id: string) => void;
  foundLabel: (kind: LabelKind) => void;
  upgradeLabel: () => void;
  runCampaign: (id: string) => void;
  chooseShowcase: (boothId: string) => void;
  buyVendorItem: (id: string) => void;
  dismissVendor: () => void;
  takeBailout: () => void;
  pickBoon: (id: string) => void;
  prestige: (traitId: string) => void;
  newGame: (scenarioId: string) => void;
  clearBanner: () => void;
  clearNarrator: () => void;
  reset: () => void;
}
type Store = GameState & Actions;

const blocked = (s: GameState) =>
  s.gameOver || !!s.activeEventId || s.storyQueue.length > 0 || !!s.lastRelease ||
  !!s.awardsPending || s.showcasePending || s.vendorPending || !!s.draftPending;

/** Apply goal completions: returns patched fields. */
function applyGoals(s: GameState) {
  const { goals, reward, logs } = checkGoals(s);
  const refreshed = reward > 0 ? rollGoals(goals) : goals;
  return { goals: refreshed, cash: s.cash + reward, logs: logs.map((t) => mk(s.week, t, "good" as const)) };
}

export const useGame = create<Store>()(
  persist(
    (set, get) => ({
      ...createInitialState("studio", [], 0, false),

      startProject: (title, medium, vibe, staffIds, focus, phases, sequelOf, generation) => {
        const s = get();
        if (s.project || s.gameOver || staffIds.length === 0) return;
        const m = mediumById(medium);
        const project = newProject(title, medium, vibe, staffIds, focus, phases, sequelOf, generation, masteryLevel(s.mediumXp[medium]), masteryLevel(s.vibeXp[vibe]));
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
        let cash = s.cash - weeklySalary(s.staff, new Set(s.project?.staffIds ?? []));
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
        let cred = s.cred;
        let contracts = s.contracts;

        if (project && phase === "production") {
          cred += 2;
          const res = produceWeek(project, staff, s.week + 1, axisBoostsOf(s), s.bonds);
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
          const labelIncome = s.label ? s.label.monthlyIncome : 0;
          cash += mrr + residual + labelIncome - s.burn;
          buzz = Math.round(buzz * BUZZ_DECAY);
          catalog = decayCatalog(catalog);
          rivals = tickRivals(rivals);
          contracts = [rollContract(s.reputation, week), rollContract(s.reputation, week), rollContract(s.reputation, week)];
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
        if (negativeWeeks >= GAMEOVER_FUSE) { gameOver = true; logs = trim([...logs, mk(week, "Out of money too long. The doors close.", "bad")]); }

        // ---- roguelite season check (hit-or-die quota) ----
        let season = s.season, quota = s.quota, seasonStartWeek = s.seasonStartWeek;
        const peakMembers = Math.max(s.peakMembers, s.members);
        let runResult: GameState["runResult"] = gameOver ? "busted" : null;
        let draftPending: GameState["draftPending"] = s.draftPending;
        if (!gameOver && week >= s.seasonStartWeek + SEASON_LEN) {
          if (s.members >= quota) {
            if (season >= MAX_SEASON) {
              gameOver = true; runResult = "cleared";
              logs = trim([...logs, mk(week, `Season ${season} cleared — you survived the whole run!`, "good")]);
            } else {
              season += 1; quota = quotaForSeason(season); seasonStartWeek = week;
              draftPending = rollDraft(staff, s.ownedUpgrades);
              banner = `★ Season ${season - 1} cleared! Draft a boon — next quota ${quota.toLocaleString()}.`;
              logs = trim([...logs, mk(week, `Season ${season - 1} cleared. Season ${season}: reach ${quota.toLocaleString()} members.`, "good")]);
            }
          } else {
            gameOver = true; runResult = "missed";
            logs = trim([...logs, mk(week, `Missed the Season ${season} quota — ${s.members}/${quota} members. The doors close.`, "bad")]);
          }
        }
        const cloutBanked = runResult ? cloutFromRun(season, peakMembers, s.legendary.length, s.bestScore) : s.cloutBanked;

        let interim: GameState = { ...s, cash, staff, project, phase, buzz, trend, week, negativeWeeks, gameOver, banner, log: logs, catalog, rivals, trendPreviewed, narrator, season, quota, seasonStartWeek, peakMembers, runResult, cloutBanked, draftPending };

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
        if (!gameOver && week % WEEKS_PER_MONTH === 0 && storyQueue.length === 0 && !awardsPending && !draftPending && Math.random() < EVENT_CHANCE) {
          activeEventId = EVENT_DECK[Math.floor(Math.random() * EVENT_DECK.length)].id;
        }

        const escalatedBurn = (week % WEEKS_PER_MONTH === 0 && equityTriggered) ? Math.round(s.burn * 1.03) : s.burn;
        const showcasePending = s.showcasePending || (!gameOver && week % WEEKS_PER_YEAR === 24);
        const vendorPending = s.vendorPending || (!gameOver && week % WEEKS_PER_YEAR === 12);
        set({ ...interim, cred, contracts, storyQueue, equityTriggered, activeEventId, awardsPending, lastAwardYear, burn: escalatedBurn, showcasePending, vendorPending });
      },

      release: () => {
        const s = get();
        if (!s.project || s.phase !== "polish" || s.gameOver) return;
        const r = computeRelease(s, s.project);
        const repGain = r.score40 >= 30 ? Math.round((r.score40 - 28) / 2) : 0;
        let logs = trim([...s.log, mk(s.week, `Released "${r.title}" — ${r.score40}/40 · +${r.newMembers} members · +${r.buzzGain} buzz · $${r.revenue.toLocaleString()}`, "release")]);
        if (r.surprise) logs = trim([...logs, mk(s.week, r.surprise, "good")]);
        if (r.legendary) logs = trim([...logs, mk(s.week, `"${r.title}" is legendary!`, "good")]);
        const cat = catalogFrom(r);
        const credGain = Math.round(r.score40 / 2) + 4;
        let cash2 = s.cash + r.revenue;
        let cred2 = s.cred + credGain;
        let rep2 = Math.min(100, s.reputation + repGain);
        let activeContract = s.activeContract;
        if (activeContract) {
          const onTime = s.project.deadlineWeek === undefined || s.week <= s.project.deadlineWeek;
          if (r.score40 >= activeContract.minScore && onTime) {
            cash2 += activeContract.rewardCash; cred2 += activeContract.rewardCred; rep2 = Math.min(100, rep2 + 3);
            logs = trim([...logs, mk(s.week, `Contract delivered for ${activeContract.client}: +$${activeContract.rewardCash.toLocaleString()}, +${activeContract.rewardCred} cred.`, "good")]);
          } else {
            cash2 -= activeContract.penaltyCash; rep2 = Math.max(0, rep2 - 4);
            logs = trim([...logs, mk(s.week, `Missed the brief for ${activeContract.client}: −$${activeContract.penaltyCash.toLocaleString()}.`, "bad")]);
          }
          activeContract = null;
        }
        const mediumXp = { ...s.mediumXp, [r.medium]: (s.mediumXp[r.medium] ?? 0) + 1 };
        const vibeXp = { ...s.vibeXp, [r.vibe]: (s.vibeXp[r.vibe] ?? 0) + 1 };

        let interim: GameState = {
          ...s, project: null, phase: "idle",
          cash: cash2, cred: cred2, reputation: rep2, activeContract, mediumXp, vibeXp,
          members: s.members + r.newMembers,
          buzz: s.buzz + r.buzzGain,
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
        set({ ...interim, regulars: maybeAddRegular(interim), storyQueue: [...s.storyQueue, ...newBeats], equityTriggered: s.equityTriggered || newBeats.includes("equity") });
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
        set({ ...interim, regulars: maybeAddRegular(interim), storyQueue: [...s.storyQueue, ...newBeats], equityTriggered: s.equityTriggered || newBeats.includes("equity") });
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
        if (s.cash < fee || s.staff.length >= crewCapOf(s)) return;
        const newStaff = [...s.staff, { ...c, assigned: false }];
        const nb = Math.random() < 0.5 ? makeBond(newStaff.map((x) => x.id)) : null;
        set({ cash: s.cash - fee, staff: newStaff, bonds: nb ? [...s.bonds, nb] : s.bonds, recruitPool: s.recruitPool.filter((x) => x.id !== id), narrator: narratorLine("hire"), log: trim([...s.log, mk(s.week, `Signed ${c.name} for $${fee.toLocaleString()}.`, "info")]) });
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

      promote: (id) => {
        const s = get();
        const c = s.staff.find((x) => x.id === id);
        if (!c || !canPromote(c)) return;
        const cost = promoteCredCost(c);
        if (s.cred < cost) return;
        const promoted = promoteCreative(c);
        set({ cred: s.cred - cost, staff: s.staff.map((x) => (x.id === id ? promoted : x)), banner: `${c.name} promoted`, log: trim([...s.log, mk(s.week, `${c.name} promoted — ${promoted.tier === 2 ? "senior" : "lead"} role.`, "good")]) });
      },

      acceptContract: (id) => {
        const s = get();
        if (s.project || s.gameOver) return;
        const k = s.contracts.find((x) => x.id === id);
        if (!k || s.reputation < k.repReq) return;
        const m = mediumById(k.medium);
        if (s.cash < m.budget) return;
        const staffIds = s.staff.map((c) => c.id);
        const ids = new Set(staffIds);
        const project = { ...newProject(`${k.client} gig`, k.medium, k.vibe, staffIds, "balanced" as Focus, undefined, undefined, 1, masteryLevel(s.mediumXp[k.medium]), masteryLevel(s.vibeXp[k.vibe])), contractId: k.id, deadlineWeek: s.week + k.weeks };
        set({ project, phase: "production", cash: s.cash - m.budget, activeContract: k, contracts: s.contracts.filter((x) => x.id !== id), staff: s.staff.map((c) => ({ ...c, assigned: ids.has(c.id) })), log: trim([...s.log, mk(s.week, `Took the ${k.client} contract — ${m.name}, due in ${k.weeks}wk.`, "info")]) });
      },

      foundLabel: (kind) => {
        const s = get();
        if (s.label || s.cash < LABEL_FOUND_CASH || s.cred < LABEL_FOUND_CRED) return;
        const label = { ...LABEL_ARCHETYPES[kind], tier: 1 };
        set({ cash: s.cash - LABEL_FOUND_CASH, cred: s.cred - LABEL_FOUND_CRED, label, reputation: Math.min(100, s.reputation + 5), banner: `Founded ${label.name}`, log: trim([...s.log, mk(s.week, `Founded ${label.name}. You're a platform now.`, "good")]) });
      },

      upgradeLabel: () => {
        const s = get();
        if (!s.label) return;
        const cost = labelUpgradeCost(s.label.tier);
        if (s.cash < cost.cash || s.cred < cost.cred) return;
        const label = { ...s.label, tier: s.label.tier + 1, revBonus: s.label.revBonus + 0.08, memberBonus: s.label.memberBonus + 0.06, monthlyIncome: Math.round(s.label.monthlyIncome * 1.4) };
        set({ cash: s.cash - cost.cash, cred: s.cred - cost.cred, label, banner: `${label.name} leveled up`, log: trim([...s.log, mk(s.week, `${label.name} upgraded to tier ${label.tier}.`, "good")]) });
      },

      runCampaign: (id) => {
        const s = get();
        const c = CAMPAIGNS.find((x) => x.id === id);
        if (!c || s.reputation < c.repReq || s.cash < c.cost || s.cred < c.cred) return;
        const used = s.campaignUse[id] ?? 0;
        const dim = Math.pow(0.6, used);
        const buzz = Math.round(c.buzz * dim);
        const members = Math.round(c.members * dim);
        set({ cash: s.cash - c.cost, cred: s.cred - c.cred, buzz: s.buzz + buzz, members: s.members + members, campaignUse: { ...s.campaignUse, [id]: used + 1 }, log: trim([...s.log, mk(s.week, `${c.name}: +${buzz} buzz, +${members} members${used ? " (diminishing)" : ""}.`, "good")]) });
      },

      chooseShowcase: (boothId) => {
        const s = get();
        const b = BOOTHS.find((x) => x.id === boothId);
        if (!b || s.cash < b.cost) return;
        set({ showcasePending: false, cash: s.cash - b.cost, buzz: s.buzz + b.buzz, members: s.members + b.members, reputation: Math.min(100, s.reputation + b.rep), banner: b.id === "skip" ? "Skipped the Showcase" : `Showcase: +${b.members} members, +${b.buzz} buzz`, log: trim([...s.log, mk(s.week, b.id === "skip" ? "Skipped the Showcase." : `Showcase ${b.name}: +${b.members} members, +${b.buzz} buzz.`, "good")]) });
      },

      buyVendorItem: (id) => {
        const s = get();
        const item = VENDOR_ITEMS.find((x) => x.id === id);
        if (!item || s.cash < item.cost) return;
        const patch: Partial<GameState> = { cash: s.cash - item.cost, vendorPending: false };
        if (id === "inspiration") patch.cred = s.cred + 50;
        else if (id === "energy") patch.staff = s.staff.map((c) => ({ ...c, energy: 100 }));
        else if (id === "headhunt") patch.recruitPool = [rollRecruit(), rollRecruit(), rollRecruit()];
        else if (id === "manual") patch.cred = s.cred + 40;
        set({ ...patch, log: trim([...s.log, mk(s.week, `Vendor: bought ${item.name}.`, "info")]) });
      },

      dismissVendor: () => set({ vendorPending: false }),

      takeBailout: () => {
        const s = get();
        if (s.bailoutUsed) return;
        set({ cash: s.cash + s.burn, bailoutUsed: true, negativeWeeks: 0, banner: "AP floated you one month's rent", log: trim([...s.log, mk(s.week, "AP floated you one month's rent. Last time.", "info")]) });
      },

      pickBoon: (id) => {
        const s = get();
        const b = s.draftPending?.find((x) => x.id === id);
        if (!b) return;
        const patch: Partial<GameState> = { draftPending: null };
        if (b.kind === "cash") patch.cash = s.cash + (b.amount ?? 0);
        else if (b.kind === "cred") patch.cred = s.cred + (b.amount ?? 0);
        else if (b.kind === "members") patch.members = s.members + (b.amount ?? 0);
        else if (b.kind === "buzz") patch.buzz = s.buzz + (b.amount ?? 0);
        else if (b.kind === "rent") patch.burn = Math.max(2000, s.burn - (b.amount ?? 0));
        else if (b.kind === "hire" && b.recruit) patch.staff = [...s.staff, { ...b.recruit, assigned: false }];
        else if (b.kind === "space" && b.spaceId) { const u = UPGRADES.find((x) => x.id === b.spaceId); patch.ownedUpgrades = [...s.ownedUpgrades, b.spaceId]; if (u?.burnDelta) patch.burn = s.burn + u.burnDelta; }
        else if (b.kind === "trait" && b.crewId && b.traitId) patch.staff = s.staff.map((c) => (c.id === b.crewId ? { ...c, trait: b.traitId } : c));
        set({ ...patch, banner: `Drafted: ${b.name}`, log: trim([...s.log, mk(s.week, `Drafted boon — ${b.name}.`, "good")]) });
      },

      prestige: (traitId) => {
        const s = get();
        set({ ...createInitialState(s.scenarioId, [...s.legacyTraits, traitId], s.legacyRun + 1, true, s.clout + s.cloutBanked) });
      },
      newGame: (scenarioId) => set({ ...createInitialState(scenarioId, get().legacyTraits, get().legacyRun, true, get().clout + get().cloutBanked) }),
      clearBanner: () => set({ banner: null }),
      clearNarrator: () => set({ narrator: null }),
      reset: () => set({ ...createInitialState(get().scenarioId, get().legacyTraits, get().legacyRun, true, get().clout + get().cloutBanked) }),
    }),
    {
      name: "doghouse-save-v6",
      partialize: (s) => {
        const {
          startProject, advanceWeek, takeSpike, release, dismissRelease, dismissStory, dismissAwards,
          resolveEvent, previewTrend, buyUpgrade, hire, refreshPool, train, promote, acceptContract,
          foundLabel, upgradeLabel, runCampaign, chooseShowcase, buyVendorItem, dismissVendor,
          takeBailout, pickBoon, prestige, newGame, clearBanner, clearNarrator, reset, ...data
        } = s;
        void startProject; void advanceWeek; void takeSpike; void release; void dismissRelease;
        void dismissStory; void dismissAwards; void resolveEvent; void previewTrend; void buyUpgrade;
        void hire; void refreshPool; void train; void promote; void acceptContract; void foundLabel;
        void upgradeLabel; void runCampaign; void chooseShowcase; void buyVendorItem; void dismissVendor;
        void takeBailout; void pickBoon; void prestige; void newGame; void clearBanner; void clearNarrator; void reset;
        return data;
      },
    }
  )
);

if (typeof localStorage !== "undefined" && !localStorage.getItem("doghouse-save-v6")) {
  useGame.setState((s) => s);
}

export { yearOf };
