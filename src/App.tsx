import { useState } from "react";
import { CRITICS, eraForYear, mediumById, signingFee, vibeById } from "./game/data";
import { trainCost, yearOf } from "./game/logic";
import { useGame } from "./game/store";
import { NewProjectModal } from "./ui/NewProjectModal";
import {
  Bar, Button, Panel, SynergyBadge, compact, money, roleName,
} from "./ui/components";

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
  const weekInYear = (s.week % 48) + 1;

  return (
    <div className="app">
      {/* ---------- Top bar ---------- */}
      <header className="topbar">
        <div className="brand">
          <span className="logo">🐶</span>
          <div>
            <div className="brand-name">{s.studioName}</div>
            <div className="brand-sub">Y{year + 1} · Wk {weekInYear} · {era.name} era</div>
          </div>
        </div>
        <div className="stats">
          <Stat label="Cash" value={money(s.cash)} warn={s.cash < 0} />
          <Stat label="Following" value={compact(s.following)} />
          <Stat label="Reputation" value={`${s.reputation}`} />
          <Stat label="Crew" value={`${s.staff.length}`} />
        </div>
      </header>

      <main className="layout">
        {/* ---------- Left: project / studio ---------- */}
        <div className="col-main">
          {s.project ? <ProjectView /> : <IdleView onNew={() => setShowNew(true)} />}
          <StaffPanel />
        </div>

        {/* ---------- Right: recruit + log ---------- */}
        <div className="col-side">
          <RecruitPanel />
          <LogPanel />
        </div>
      </main>

      {showNew && !s.project && <NewProjectModal onClose={() => setShowNew(false)} />}
      {s.lastRelease && <ReleaseModal />}
      {s.gameOver && <GameOverModal />}
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className={`stat ${warn ? "stat-warn" : ""}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

// ---------------- Idle ----------------
function IdleView({ onNew }: { onNew: () => void }) {
  const advanceWeek = useGame((s) => s.advanceWeek);
  const legendary = useGame((s) => s.legendary);
  return (
    <Panel title="Studio Floor">
      <div className="idle">
        <p className="muted">No project in production. Greenlight something.</p>
        <div className="row">
          <Button variant="primary" onClick={onNew}>＋ New Project</Button>
          <Button variant="ghost" onClick={advanceWeek} title="Pass a week (staff rest, salaries paid)">
            Skip Week ▸
          </Button>
        </div>
        {legendary.length > 0 && (
          <div className="legend-wall">
            <div className="field-label">🏆 Legendary Projects</div>
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
    <Panel
      title={`▸ ${p.title}`}
      right={<span className="muted">{m.name} · {vibeById(p.vibe).name} <SynergyBadge medium={p.medium} vibe={p.vibe} /></span>}
    >
      <div className="proj">
        <div className="proj-phase">
          <span className={`phase-pill phase-${s.phase}`}>{s.phase === "polish" ? "POLISH" : "PRODUCTION"}</span>
          <span className="muted">Week {Math.min(p.weeksElapsed, p.weeksTotal)} / {p.weeksTotal}</span>
          <div className="grow"><Bar value={p.weeksElapsed} max={p.weeksTotal} color="#2b2118" /></div>
        </div>

        <div className="axes">
          {AXES.map((a) => (
            <div key={a.key} className="axis">
              <span className="axis-label">{a.label}</span>
              <Bar value={p.points[a.key]} max={maxPt} color={a.color} />
              <span className="axis-num">{Math.round(p.points[a.key])}</span>
            </div>
          ))}
        </div>

        <div className="proj-meta">
          <span>🔥 Hype <b>{Math.round(p.hype)}</b></span>
          <span>🩹 Rough edges <b>{Math.round(p.roughEdges)}</b></span>
          <span>👥 {crew.map((c) => c.name.split(" ")[0]).join(", ")}</span>
        </div>

        <div className="row">
          {s.phase === "production" && (
            <Button variant="primary" onClick={advanceWeek}>Work a Week ▸</Button>
          )}
          {s.phase === "polish" && (
            <>
              <Button onClick={advanceWeek} title="Spend a week reducing rough edges">Polish 1 Wk</Button>
              <Button variant="primary" onClick={release}>Release ▸</Button>
            </>
          )}
        </div>
      </div>
    </Panel>
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
              <div className="cc-stats">
                <Mini label="VIS" v={c.stats.vision} />
                <Mini label="CRF" v={c.stats.craft} />
                <Mini label="SND" v={c.stats.sound} />
                <Mini label="STY" v={c.stats.story} />
                <Mini label="HUS" v={c.stats.hustle} />
              </div>
              <div className="cc-foot">
                <span className="muted">⚡{c.energy} · {money(c.salary)}/wk</span>
                <Button variant="ghost" disabled={cash < cost} onClick={() => train(c.id)} title="Masterclass: boost stats">
                  Train {money(cost)}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function Mini({ label, v }: { label: string; v: number }) {
  return (
    <div className="mini">
      <span className="mini-l">{label}</span>
      <span className="mini-v">{v}</span>
    </div>
  );
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
        {pool.length === 0 && <p className="muted">No candidates. Refresh the casting call.</p>}
        {pool.map((c) => {
          const fee = signingFee(c);
          return (
            <div key={c.id} className="recruit-card">
              <div className="rc-top">
                <span className="cc-name">{c.name}</span>
                <span className="cc-role">{roleName(c.role)}</span>
              </div>
              <div className="cc-stats sm">
                <Mini label="VIS" v={c.stats.vision} />
                <Mini label="CRF" v={c.stats.craft} />
                <Mini label="SND" v={c.stats.sound} />
                <Mini label="STY" v={c.stats.story} />
                <Mini label="HUS" v={c.stats.hustle} />
              </div>
              <Button variant="primary" disabled={cash < fee} onClick={() => hire(c.id)}>
                Sign {money(fee)}
              </Button>
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
          <div key={i} className={`log-line log-${e.kind}`}>
            <span className="log-wk">w{e.week}</span> {e.text}
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ---------------- Release modal ----------------
function ReleaseModal() {
  const r = useGame((s) => s.lastRelease)!;
  const dismiss = useGame((s) => s.dismissRelease);
  const verdict =
    r.score40 >= 38 ? "LEGENDARY" : r.score40 >= 33 ? "ACCLAIMED" : r.score40 >= 26 ? "A HIT" : r.score40 >= 18 ? "MIXED" : "A FLOP";
  return (
    <div className="modal-backdrop" onClick={dismiss}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h2>{r.title}</h2>
          <button className="x" onClick={dismiss}>✕</button>
        </header>
        <div className={`verdict verdict-${r.score40 >= 33 ? "hi" : r.score40 >= 26 ? "mid" : "lo"}`}>{verdict}</div>
        <div className="critics">
          {r.criticScores.map((sc, i) => (
            <div key={i} className="critic">
              <div className="critic-score">{sc}<span className="of">/10</span></div>
              <div className="critic-name">{CRITICS[i].name}</div>
              <div className="critic-blurb">{CRITICS[i].blurb}</div>
            </div>
          ))}
        </div>
        <div className="score40">{r.score40}<span className="of"> / 40</span></div>
        <div className="payoff">
          <span>+{r.newFollowers.toLocaleString()} following</span>
          <span>{money(r.revenue)} earned</span>
        </div>
        <div className="row center">
          <Button variant="primary" onClick={dismiss}>Onward ▸</Button>
        </div>
      </div>
    </div>
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
        <p className="muted center">
          Doghouse Productions ran out of road in Year {yearOf(s.week) + 1}.
        </p>
        <div className="payoff">
          <span>{compact(s.following)} following</span>
          <span>{s.legendary.length} legendary</span>
        </div>
        <div className="row center">
          <Button variant="primary" onClick={reset}>New Studio ▸</Button>
        </div>
      </div>
    </div>
  );
}
