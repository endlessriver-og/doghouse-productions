import { useEffect, useState } from "react";
import { eraForYear, mediumById, signingFee, vibeById } from "./game/data";
import { mrrOf, monthOf, trainCost, yearOf } from "./game/logic";
import { useGame } from "./game/store";
import { EventModal } from "./ui/EventModal";
import { NewProjectModal } from "./ui/NewProjectModal";
import { ScoreReveal } from "./ui/ScoreReveal";
import { StoryModal } from "./ui/StoryModal";
import { UpgradesPanel } from "./ui/UpgradesPanel";
import { Bar, Button, Panel, SynergyBadge, TraitChip, compact, money, roleName } from "./ui/components";
import { useCountUp } from "./ui/juice";

const AXES = [
  { key: "vision", label: "Vision", color: "#e8643c" },
  { key: "craft", label: "Craft", color: "#2a9d8f" },
  { key: "sound", label: "Sound", color: "#6b5bd2" },
  { key: "story", label: "Story", color: "#e3a008" },
] as const;

export function App() {
  const s = useGame();
  const [showNew, setShowNew] = useState(false);

  const year = yearOf(s.week);
  const era = eraForYear(year);
  const mrr = mrrOf(s);
  const cash = useCountUp(s.cash);
  const members = useCountUp(s.members);
  const buzz = useCountUp(Math.round(s.buzz));

  // auto-clear the transient banner
  useEffect(() => {
    if (!s.banner) return;
    const t = window.setTimeout(() => useGame.getState().clearBanner(), 3600);
    return () => clearTimeout(t);
  }, [s.banner]);

  // Release reveal must out-rank story beats — a release that crosses a milestone
  // should show the animated score first, then the story card on dismiss.
  const modal = s.gameOver ? "over"
    : s.lastRelease ? "release"
    : s.storyQueue.length ? "story"
    : s.activeEventId ? "event"
    : showNew && !s.project ? "new" : null;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">🐶</span>
          <div>
            <div className="brand-name">{s.studioName}</div>
            <div className="brand-sub">Y{year + 1} · Month {monthOf(s.week) + 1} · {era.name} era</div>
          </div>
        </div>
        <div className="stats">
          <Stat label="Cash" value={money(cash)} warn={s.cash < 0} />
          <Stat label="Members" value={compact(members)} accent />
          <Stat label="Buzz" value={compact(buzz)} />
          <MrrStat mrr={mrr} burn={s.burn} />
          <Stat label="Rep" value={`${s.reputation}`} />
        </div>
      </header>

      <div className={`trend-bar ${ (s.project && (s.trend.medium === s.project.medium || s.trend.vibe === s.project.vibe)) ? "trend-live" : "" }`}>
        🔥 Hot right now: <b>{mediumById(s.trend.medium).name}</b> × <b>{vibeById(s.trend.vibe).name}</b>
        <span className="muted"> · matching projects get a boost · {s.trend.monthsLeft}mo left</span>
      </div>

      <main className="layout">
        <div className="col-main">
          {s.project ? <ProjectView /> : <IdleView onNew={() => setShowNew(true)} />}
          <StaffPanel />
        </div>
        <div className="col-side">
          <UpgradesPanel />
          <RecruitPanel />
          <LogPanel />
        </div>
      </main>

      {modal === "new" && <NewProjectModal onClose={() => setShowNew(false)} />}
      {modal === "story" && <StoryModal />}
      {modal === "event" && <EventModal />}
      {modal === "release" && <ScoreReveal />}
      {modal === "over" && <GameOverModal />}

      {s.banner && <div className="banner-toast">{s.banner}</div>}
    </div>
  );
}

function Stat({ label, value, warn, accent }: { label: string; value: string; warn?: boolean; accent?: boolean }) {
  return (
    <div className={`stat ${warn ? "stat-warn" : ""} ${accent ? "stat-accent" : ""}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

function MrrStat({ mrr, burn }: { mrr: number; burn: number }) {
  const ok = mrr >= burn;
  return (
    <div className={`stat stat-mrr ${ok ? "stat-ok" : "stat-bad"}`} title="Monthly membership revenue vs operating burn">
      <div className="stat-label">MRR / Burn</div>
      <div className="stat-value sm">{money(mrr)}<span className="slash">/</span>{money(burn)}</div>
    </div>
  );
}

// ---------------- Idle ----------------
function IdleView({ onNew }: { onNew: () => void }) {
  const advanceWeek = useGame((s) => s.advanceWeek);
  const legendary = useGame((s) => s.legendary);
  const totalReleases = useGame((s) => s.totalReleases);
  return (
    <Panel title="Studio Floor">
      <div className="idle">
        <p className="muted">No project running. Throw an event to pull members, or make something to build buzz.</p>
        <div className="row">
          <Button variant="primary" onClick={onNew}>＋ New Project</Button>
          <Button variant="ghost" onClick={advanceWeek} title="Pass a week (salaries paid, members recur monthly)">Skip Week ▸</Button>
        </div>
        <div className="idle-stats">
          <span className="muted">{totalReleases} shipped · {legendary.length} legendary</span>
        </div>
        {legendary.length > 0 && (
          <div className="legend-wall">
            <div className="field-label">🏆 Legendary</div>
            {legendary.map((r, i) => (
              <div key={i} className="legend-row">
                <span>{r.title}</span>
                <span className="muted">{mediumById(r.medium).name} · {r.score40}/40</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}

// ---------------- Project ----------------
function ProjectView() {
  const s = useGame();
  const p = s.project!;
  const advanceWeek = useGame((a) => a.advanceWeek);
  const release = useGame((a) => a.release);
  const m = mediumById(p.medium);
  const maxPt = m.expectedQ * 1.4;
  const crew = s.staff.filter((c) => p.staffIds.includes(c.id));

  return (
    <Panel title={`▸ ${p.title}`}
      right={<span className="muted">{m.name} · {vibeById(p.vibe).name} <SynergyBadge medium={p.medium} vibe={p.vibe} /></span>}>
      <div className="proj">
        <div className="proj-phase">
          <span className={`kind-pill kind-${m.kind}`}>{m.kind === "event" ? "EVENT" : "CREATIVE"}</span>
          <span className={`phase-pill phase-${s.phase}`}>{s.phase === "polish" ? "POLISH" : "PRODUCTION"}</span>
          <span className="muted">Wk {Math.min(p.weeksElapsed, p.weeksTotal)}/{p.weeksTotal}</span>
          <div className="grow"><Bar value={p.weeksElapsed} max={p.weeksTotal} color="#2b2118" /></div>
        </div>

        <div className="axes">
          {AXES.map((a) => (
            <AxisRow key={a.key} label={a.label} value={p.points[a.key]} max={maxPt} color={a.color} />
          ))}
        </div>

        <div className="proj-meta">
          <span>🔥 Buzz building <b>{Math.round(p.hype)}</b></span>
          <span>🩹 Rough edges <b>{Math.round(p.roughEdges)}</b></span>
          <span>👥 {crew.map((c) => c.name.split(" ")[0]).join(", ")}</span>
        </div>

        <div className="row">
          {s.phase === "production" && <Button variant="primary" onClick={advanceWeek}>Work a Week ▸</Button>}
          {s.phase === "polish" && (
            <>
              <Button onClick={advanceWeek} title="Reduce rough edges">Polish 1 Wk</Button>
              <Button variant="primary" onClick={release}>Release ▸</Button>
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}

function AxisRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const v = useCountUp(Math.round(value), 400);
  return (
    <div className="axis">
      <span className="axis-label">{label}</span>
      <Bar value={value} max={max} color={color} />
      <span className="axis-num">{v}</span>
    </div>
  );
}

// ---------------- Staff ----------------
function StaffPanel() {
  const staff = useGame((s) => s.staff);
  const cash = useGame((s) => s.cash);
  const train = useGame((s) => s.train);
  return (
    <Panel title="Crew">
      <div className="crew-grid">
        {staff.map((c) => {
          const cost = trainCost(c);
          return (
            <div key={c.id} className={`creative-card ${c.assigned ? "card-busy" : ""}`}>
              <div className="cc-head">
                <span className="cc-name">{c.name}</span>
                <span className="cc-role">{roleName(c.role)} · Lv{c.level}</span>
              </div>
              <TraitChip trait={c.trait} />
              <div className="cc-stats">
                <Mini label="VIS" v={c.stats.vision} /><Mini label="CRF" v={c.stats.craft} />
                <Mini label="SND" v={c.stats.sound} /><Mini label="STY" v={c.stats.story} />
                <Mini label="HUS" v={c.stats.hustle} />
              </div>
              <div className="cc-foot">
                <span className="muted">⚡{c.energy} · {money(c.salary)}/wk</span>
                <Button variant="ghost" disabled={cash < cost} onClick={() => train(c.id)} title="Boost stats">Train {money(cost)}</Button>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
function Mini({ label, v }: { label: string; v: number }) {
  return <div className="mini"><span className="mini-l">{label}</span><span className="mini-v">{v}</span></div>;
}

// ---------------- Recruit ----------------
function RecruitPanel() {
  const pool = useGame((s) => s.recruitPool);
  const cash = useGame((s) => s.cash);
  const hire = useGame((s) => s.hire);
  const refreshPool = useGame((s) => s.refreshPool);
  return (
    <Panel title="Casting" right={<Button variant="ghost" disabled={cash < 800} onClick={refreshPool}>↻ $800</Button>}>
      <div className="recruit-list">
        {pool.map((c) => {
          const fee = signingFee(c);
          return (
            <div key={c.id} className="recruit-card">
              <div className="rc-top">
                <span className="cc-name">{c.name}</span>
                <span className="cc-role">{roleName(c.role)}</span>
              </div>
              <TraitChip trait={c.trait} />
              <div className="cc-stats sm">
                <Mini label="VIS" v={c.stats.vision} /><Mini label="CRF" v={c.stats.craft} />
                <Mini label="SND" v={c.stats.sound} /><Mini label="STY" v={c.stats.story} />
                <Mini label="HUS" v={c.stats.hustle} />
              </div>
              <Button variant="primary" disabled={cash < fee} onClick={() => hire(c.id)}>Sign {money(fee)}</Button>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// ---------------- Log ----------------
function LogPanel() {
  const logEntries = useGame((s) => s.log);
  return (
    <Panel title="Studio Log">
      <div className="log">
        {[...logEntries].reverse().map((e, i) => (
          <div key={i} className={`log-line log-${e.kind}`}><span className="log-wk">w{e.week}</span> {e.text}</div>
        ))}
      </div>
    </Panel>
  );
}

// ---------------- Game over ----------------
function GameOverModal() {
  const s = useGame();
  const reset = useGame((a) => a.reset);
  return (
    <div className="modal-backdrop">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head"><h2>Studio Closed 🐶</h2></header>
        <p className="muted center">Doghouse Productions ran out of road in Year {yearOf(s.week) + 1}.</p>
        <div className="payoff">
          <span>{compact(s.members)} members</span>
          <span>{s.legendary.length} legendary</span>
          <span>best {s.bestScore}/40</span>
        </div>
        <div className="row center"><Button variant="primary" onClick={reset}>New Studio ▸</Button></div>
      </div>
    </div>
  );
}
