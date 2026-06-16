import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { FOCUS, careerTitle, eraForYear, mediumById, signingFee, vibeById } from "./game/data";
import { canPromote, crewCapOf, estimateScore, mrrOf, monthOf, phaseIdeal, phaseMatch, promoteCredCost, residualOf, seasonOf, trainCost, yearOf } from "./game/logic";
import { useGame } from "./game/store";
import { AwardsModal } from "./ui/AwardsModal";
import { EventModal } from "./ui/EventModal";
import { NewProjectModal } from "./ui/NewProjectModal";
import { ContractsPanel, LabelPanel, MarketingPanel } from "./ui/Panels5";
import { PrestigeModal } from "./ui/PrestigeModal";
import { ScoreReveal } from "./ui/ScoreReveal";
import { ShowcaseModal } from "./ui/ShowcaseModal";
import { StartScreen } from "./ui/StartScreen";
import { StudioScene } from "./ui/StudioScene";
import { StoryModal } from "./ui/StoryModal";
import { UpgradesPanel } from "./ui/UpgradesPanel";
import { VendorModal } from "./ui/VendorModal";
import { Bar, Button, Panel, SynergyBadge, TraitChip, compact, money, roleName } from "./ui/components";
import { Icon } from "./ui/Icon";
import { burstFromEvent, flashScreen, useCountUp, useDelta } from "./ui/juice";
import { isMuted, sfx, toggleMute } from "./ui/sound";

const AXES = [
  { key: "vision", label: "Vision", color: "#e8643c" },
  { key: "craft", label: "Craft", color: "#2a9d8f" },
  { key: "sound", label: "Sound", color: "#6b5bd2" },
  { key: "story", label: "Story", color: "#e3a008" },
] as const;

type View = "make" | "crew" | "biz" | "scene";

export function App() {
  const s = useGame();
  const [view, setView] = useState<View | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showPrestige, setShowPrestige] = useState(false);
  const [muted, setMuted] = useState(isMuted());
  const openView = (v: View | null) => { sfx.nav(); setView(v); };

  const year = yearOf(s.week);
  const era = eraForYear(year);
  const season = seasonOf(s.week);
  const sceneMood = ({ spring: "dusk", summer: "midday", fall: "dusk", winter: "night" } as const)[season.id];
  const mrr = mrrOf(s);
  const residual = residualOf(s);

  useEffect(() => {
    if (!s.banner) return;
    const t = window.setTimeout(() => useGame.getState().clearBanner(), 3600);
    return () => clearTimeout(t);
  }, [s.banner]);
  useEffect(() => {
    if (!s.narrator) return;
    const t = window.setTimeout(() => useGame.getState().clearNarrator(), 5000);
    return () => clearTimeout(t);
  }, [s.narrator]);

  const modal = !s.scenarioChosen ? "start"
    : s.gameOver ? "over"
    : s.lastRelease ? "release"
    : s.awardsPending ? "awards"
    : s.showcasePending ? "showcase"
    : s.vendorPending ? "vendor"
    : s.storyQueue.length ? "story"
    : s.activeEventId ? "event"
    : showPrestige ? "prestige"
    : showNew && !s.project ? "new" : null;

  const canPrestige = s.equityTriggered || s.members >= 600 || s.legacyRun > 0;
  const spikeReady = !!s.project && s.phase === "production" && !s.project.spikeUsed && s.project.weeksElapsed >= 1;
  const makeAlert = !s.project || s.phase === "polish";
  const crewAlert = s.staff.some((c) => canPromote(c) && s.cred >= promoteCredCost(c));
  const officeAlert = (!s.project && s.contracts.some((k) => s.reputation >= k.repReq && s.cash >= mediumById(k.medium).budget)) || (s.cash < 0 && !s.bailoutUsed);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case "Escape": setView(null); setShowNew(false); setShowPrestige(false); break;
        case "1": openView("make"); break;
        case "2": openView("crew"); break;
        case "3": openView("biz"); break;
        case "4": openView("scene"); break;
        case "n": case "N": if (!s.project) { sfx.click(); setShowNew(true); } break;
        case " ": case "Enter":
          if (!view && modal === null) { e.preventDefault(); sfx.click(); s.advanceWeek(); }
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, modal, s.project, s.phase]);

  return (
    <div className="game">
      <header className="hud">
        <div className="brand">
          <span className="logo"><Icon name="logo" size={24} /></span>
          <div>
            <div className="brand-name">{s.studioName}{s.legacyRun > 0 ? ` · Run ${s.legacyRun + 1}` : ""}</div>
            <div className="brand-sub">Y{year + 1} · M{monthOf(s.week) % 12 + 1} · {season.name} · {era.name} era</div>
          </div>
        </div>
        <div className="stats">
          <ResourceStat label="Cash" value={s.cash} fmt={money} warn={s.cash < 0} />
          <ResourceStat label="Members" value={s.members} fmt={compact} accent />
          <ResourceStat label="Buzz" value={Math.round(s.buzz)} fmt={compact} />
          <ResourceStat label="Cred" value={s.cred} fmt={(n) => `${n}◆`} />
          <MrrStat mrr={mrr + residual} burn={s.burn} residual={residual} />
          <ResourceStat label="Rep" value={s.reputation} fmt={(n) => `${n}`} />
          <button className="mute-btn" onClick={() => setMuted(toggleMute())} title="Sound on/off"><Icon name={muted ? "mute" : "sound"} size={16} /></button>
        </div>
      </header>

      <div className={`stage ${s.phase === "production" ? "producing" : ""}`}>
        <div className="stage-scene"><StudioScene mood={sceneMood} fill /></div>
        <Hotspot style={{ left: "3%", top: "30%", width: "23%", height: "44%" }} label={<><Icon name="booth" size={13} /> Booth</>} onClick={() => openView("make")} alert={makeAlert} />
        <Hotspot style={{ left: "30%", top: "44%", width: "40%", height: "44%" }} label={<><Icon name="make" size={13} /> Make</>} onClick={() => openView("make")} alert={makeAlert} />
        <Hotspot style={{ left: "28%", top: "15%", width: "44%", height: "25%" }} label={<><Icon name="scene" size={13} /> The Scene</>} onClick={() => openView("scene")} />
        <Hotspot style={{ left: "72%", top: "48%", width: "26%", height: "40%" }} label={<><Icon name="crew" size={13} /> Crew</>} onClick={() => openView("crew")} alert={crewAlert} />
        <Hotspot style={{ left: "7%", top: "76%", width: "27%", height: "22%" }} label={<><Icon name="office" size={13} /> Office</>} onClick={() => openView("biz")} alert={officeAlert} />

        {s.project && (
          <div className="scene-work">
            <span className={`phase-pill phase-${s.phase}`}>{s.phase === "polish" ? "POLISH" : "PRODUCTION"}</span>
            <div className="scene-work-bar"><Bar value={s.project.weeksElapsed} max={s.project.weeksTotal} color="#e8643c" /></div>
            <span className="scene-work-wk">wk {Math.min(s.project.weeksElapsed, s.project.weeksTotal)}/{s.project.weeksTotal}</span>
          </div>
        )}

        <div className="stage-hud">
          <span className="stage-chip"><Icon name="trend" size={12} /> {mediumById(s.trend.medium).name} × {vibeById(s.trend.vibe).name}</span>
          {s.project && <span className="stage-chip proj">▸ {s.project.title}</span>}
          {s.narrator && <span className="stage-chip narr">“{s.narrator}”</span>}
        </div>
      </div>

      <footer className="dock">
        <div className="dock-nav">
          <button className={`dock-btn ${view === "make" ? "on" : ""}`} onClick={() => openView("make")}><Icon name="make" size={18} /><span>Make</span></button>
          <button className={`dock-btn ${view === "crew" ? "on" : ""}`} onClick={() => openView("crew")}><Icon name="crew" size={18} /><span>Crew</span></button>
          <button className={`dock-btn ${view === "biz" ? "on" : ""}`} onClick={() => openView("biz")}><Icon name="office" size={18} /><span>Office</span></button>
          <button className={`dock-btn ${view === "scene" ? "on" : ""}`} onClick={() => openView("scene")}><Icon name="scene" size={18} /><span>Scene</span></button>
        </div>
        <div className="dock-actions">
          {s.project ? (
            s.phase === "polish" ? (
              <>
                <Button onClick={s.advanceWeek} title="Reduce rough edges">Polish</Button>
                <Button variant="primary" onClick={s.release}>Release ▸</Button>
              </>
            ) : (
              <>
                {spikeReady && <Button onClick={() => { flashScreen("#ffd86b"); s.takeSpike(); }} title="Gamble for a breakthrough"><Icon name="spike" size={13} /> Spike</Button>}
                <Button variant="primary" onClick={s.advanceWeek}>Work a Week ▸</Button>
              </>
            )
          ) : (
            <>
              <Button variant="ghost" onClick={s.advanceWeek}>Skip Week</Button>
              <Button variant="primary" onClick={() => setShowNew(true)}>＋ New Project</Button>
            </>
          )}
        </div>
      </footer>

      {view === "make" && <Overlay title="Studio Floor" onClose={() => setView(null)}>{s.project ? <ProjectView /> : <IdleView onNew={() => setShowNew(true)} canPrestige={canPrestige} onPrestige={() => setShowPrestige(true)} />}<GoalsStrip /></Overlay>}
      {view === "crew" && <Overlay title="Crew & Casting" onClose={() => setView(null)}><StaffPanel /><RecruitPanel /></Overlay>}
      {view === "biz" && <Overlay title="The Office" onClose={() => setView(null)}><ContractsPanel /><MarketingPanel /><LabelPanel /><UpgradesPanel /></Overlay>}
      {view === "scene" && <Overlay title="The Scene" onClose={() => setView(null)}><SceneControls canPrestige={canPrestige} onPrestige={() => setShowPrestige(true)} /><GoalsStrip />{s.catalog.length > 0 && <CatalogPanel />}{s.regulars.length > 0 && <RegularsPanel />}<RivalsPanel /><LogPanel /></Overlay>}

      {modal === "start" && <StartScreen />}
      {modal === "new" && <NewProjectModal onClose={() => setShowNew(false)} />}
      {modal === "story" && <StoryModal />}
      {modal === "event" && <EventModal />}
      {modal === "release" && <ScoreReveal />}
      {modal === "awards" && <AwardsModal />}
      {modal === "showcase" && <ShowcaseModal />}
      {modal === "vendor" && <VendorModal />}
      {modal === "prestige" && <PrestigeModal onClose={() => setShowPrestige(false)} />}
      {modal === "over" && <GameOverModal />}

      {s.banner && <div className="banner-toast">{s.banner}</div>}
    </div>
  );
}

function Hotspot({ style, label, onClick, alert }: { style: CSSProperties; label: ReactNode; onClick: () => void; alert?: boolean }) {
  return (
    <button className={`hotspot ${alert ? "alert" : ""}`} style={style} onClick={onClick}>
      <span className="hs-label">{label}{alert && <span className="hs-dot" />}</span>
    </button>
  );
}

function Overlay({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="overlay-wrap" onClick={onClose}>
      <div className="overlay" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-head"><h2>{title}</h2><button className="x" onClick={onClose}>✕</button></div>
        <div className="overlay-body">{children}</div>
      </div>
    </div>
  );
}

function SceneControls({ canPrestige, onPrestige }: { canPrestige: boolean; onPrestige: () => void }) {
  const s = useGame();
  return (
    <Panel title="The Scene">
      <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
        <span className="muted"><Icon name="trend" size={12} /> Trend: {mediumById(s.trend.medium).name} × {vibeById(s.trend.vibe).name} · {s.trend.monthsLeft}mo</span>
        <Button variant="ghost" disabled={s.trendPreviewed || s.cash < 1200} onClick={() => useGame.getState().previewTrend()}>{s.trendPreviewed ? "scouted ✓" : "Scout $1.2k"}</Button>
        {canPrestige && <Button variant="ghost" onClick={onPrestige}>↻ Legacy Reset</Button>}
        {s.cash < 0 && !s.bailoutUsed && <Button variant="ghost" onClick={() => useGame.getState().takeBailout()}><Icon name="bailout" size={13} /> AP Bailout</Button>}
      </div>
    </Panel>
  );
}

// auto-animating resource: count-up + bump + floating ±delta on every change
function ResourceStat({ label, value, fmt, warn, accent }: { label: string; value: number; fmt: (n: number) => string; warn?: boolean; accent?: boolean }) {
  const disp = useCountUp(value);
  const { delta, nonce } = useDelta(value);
  return (
    <div className={`stat ${warn ? "stat-warn" : ""} ${accent ? "stat-accent" : ""}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value live" key={`v${nonce}`}>{fmt(disp)}</div>
      {nonce > 0 && <span key={`f${nonce}`} className={`floater ${delta > 0 ? "up" : "down"}`}>{delta > 0 ? "+" : "−"}{fmt(Math.abs(delta))}</span>}
    </div>
  );
}
function MrrStat({ mrr, burn, residual }: { mrr: number; burn: number; residual: number }) {
  const ok = mrr >= burn;
  return (
    <div className={`stat stat-mrr ${ok ? "stat-ok" : "stat-bad"}`} title={`Monthly revenue (incl. $${residual.toLocaleString()} residuals) vs $${burn.toLocaleString()} burn`}>
      <div className="stat-label">Rev / Burn</div>
      <div className="stat-value sm">{money(mrr)}<span className="slash">/</span>{money(burn)}</div>
    </div>
  );
}

// ---------------- Idle ----------------
function IdleView({ onNew, canPrestige, onPrestige }: { onNew: () => void; canPrestige: boolean; onPrestige: () => void }) {
  const advanceWeek = useGame((s) => s.advanceWeek);
  const legendary = useGame((s) => s.legendary);
  const totalReleases = useGame((s) => s.totalReleases);
  const cash = useGame((s) => s.cash);
  const bailoutUsed = useGame((s) => s.bailoutUsed);
  const takeBailout = useGame((s) => s.takeBailout);
  return (
    <Panel title="Studio Floor">
      <div className="idle">
        <p className="muted">No project running. Throw an event to pull members, or make something to build buzz.</p>
        <div className="row">
          <Button variant="primary" onClick={onNew}>＋ New Project</Button>
          <Button variant="ghost" onClick={advanceWeek} title="Pass a week">Skip Week ▸</Button>
          {canPrestige && <Button variant="ghost" onClick={onPrestige} title="Reset for a permanent bonus">↻ Legacy Reset</Button>}
          {cash < 0 && !bailoutUsed && <Button variant="ghost" onClick={takeBailout} title="AP floats one month's rent (once per run)"><Icon name="bailout" size={13} /> AP Bailout</Button>}
        </div>
        <OnboardingHint />
        <div className="idle-stats"><span className="muted">{totalReleases} shipped · {legendary.length} legendary</span></div>
        {legendary.length > 0 && (
          <div className="legend-wall">
            <div className="field-label"><Icon name="trophy" size={13} /> Legendary</div>
            {legendary.map((r, i) => <div key={i} className="legend-row"><span>{r.title}</span><span className="muted">{mediumById(r.medium).name} · {r.score40}/40</span></div>)}
          </div>
        )}
      </div>
    </Panel>
  );
}

// ---------------- Onboarding ----------------
function OnboardingHint() {
  const s = useGame();
  if (s.legacyRun > 0) return null;
  const steps = [
    { label: "Throw your first event (members fund rent)", done: s.totalReleases >= 1 },
    { label: "Build a studio space", done: s.ownedUpgrades.length >= 1 },
    { label: "Cover rent with memberships", done: s.members * 35 >= s.burn },
  ];
  if (steps.every((x) => x.done)) return null;
  return (
    <div className="onboard">
      <div className="field-label" style={{ margin: 0 }}>Getting started</div>
      {steps.map((x, i) => <div key={i} className={`onboard-step ${x.done ? "step-done" : ""}`}>{x.done ? "✓" : "○"} {x.label}</div>)}
    </div>
  );
}

// ---------------- Project ----------------
function ProjectView() {
  const s = useGame();
  const p = s.project!;
  const advanceWeek = useGame((a) => a.advanceWeek);
  const release = useGame((a) => a.release);
  const takeSpike = useGame((a) => a.takeSpike);
  const m = mediumById(p.medium);
  const maxPt = m.expectedQ * 1.4;
  const crew = s.staff.filter((c) => p.staffIds.includes(c.id));
  const fit = Math.round(phaseMatch(p.phases, phaseIdeal(m)) * 100);
  const band = estimateScore(crew, p.medium, p.vibe, p.phases, p.focus, s.reputation);
  const spikeReady = s.phase === "production" && !p.spikeUsed && p.weeksElapsed >= 1;

  return (
    <Panel title={`▸ ${p.title}${p.generation > 1 ? ` ${"I".repeat(p.generation)}` : ""}`}
      right={<span className="muted">{m.name} · {vibeById(p.vibe).name} <SynergyBadge medium={p.medium} vibe={p.vibe} /></span>}>
      <div className="proj">
        <div className="proj-phase">
          <span className={`kind-pill kind-${m.kind}`}>{m.kind === "event" ? "EVENT" : "CREATIVE"}</span>
          <span className={`phase-pill phase-${s.phase}`}>{s.phase === "polish" ? "POLISH" : "PRODUCTION"}</span>
          <span className="muted">{FOCUS[p.focus].name} · fit {fit}% · proj {band ? `${band.low}–${band.high}` : "—"}</span>
          <div className="grow"><Bar value={p.weeksElapsed} max={p.weeksTotal} color="#2b2118" /></div>
          <span className="muted">{Math.min(p.weeksElapsed, p.weeksTotal)}/{p.weeksTotal}</span>
        </div>

        <div className="axes">
          {AXES.map((a) => <AxisRow key={a.key} label={a.label} value={p.points[a.key]} max={maxPt} color={a.color} />)}
        </div>

        <div className="proj-meta">
          <span><Icon name="trend" size={12} /> Buzz <b>{Math.round(p.hype)}</b></span>
          <span>Rough <b>{Math.round(p.roughEdges)}</b></span>
          <span><Icon name="crew" size={12} /> {crew.map((c) => c.name.split(" ")[0]).join(", ")}</span>
          {s.activeContract && <span className="ct-flag"><Icon name="contract" size={12} /> {s.activeContract.client} · need {s.activeContract.minScore}/40 by wk {p.deadlineWeek}</span>}
        </div>

        <div className="row">
          {s.phase === "production" && <Button variant="primary" onClick={advanceWeek}>Work a Week ▸</Button>}
          {spikeReady && <Button onClick={() => { flashScreen("#ffd86b"); takeSpike(); }} title="Gamble: ~55% big breakthrough, else rough edges + buzz hit"><Icon name="spike" size={13} /> Risk Spike</Button>}
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
  const rounded = Math.round(value);
  const v = useCountUp(rounded, 400);
  const { delta, nonce } = useDelta(rounded);
  return (
    <div className="axis">
      <span className="axis-label">{label}</span>
      <Bar value={value} max={max} color={color} />
      <span className="axis-num">{v}</span>
      {delta > 0 && <span key={nonce} className="floater up axis-float">+{delta}</span>}
    </div>
  );
}

// ---------------- Goals ----------------
function GoalsStrip() {
  const goals = useGame((s) => s.goals);
  if (goals.length === 0) return null;
  return (
    <div className="goals-strip">
      <span className="field-label" style={{ margin: 0 }}><Icon name="goal" size={13} /> Goals</span>
      {goals.map((g) => (
        <span key={g.id} className={`goal-chip ${g.done ? "goal-done" : ""}`}>{g.done ? "✓ " : ""}{g.label} <b>+{money(g.reward)}</b></span>
      ))}
    </div>
  );
}

// ---------------- Catalog ----------------
function CatalogPanel() {
  const catalog = useGame((s) => s.catalog);
  return (
    <Panel title="Catalog · residuals">
      <div className="catalog">
        {catalog.map((c) => (
          <div key={c.title} className="cat-row">
            <span className="cat-title">{c.title}{c.generation > 1 ? ` ${"I".repeat(c.generation)}` : ""}</span>
            <span className="muted">{c.score40}/40 · {money(c.residual)}/mo</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ---------------- Regulars ----------------
function RegularsPanel() {
  const regulars = useGame((s) => s.regulars);
  return (
    <Panel title="Regulars">
      <div className="rivals">
        {regulars.map((r, i) => (
          <div key={i} className="cat-row" style={{ borderLeftColor: "var(--accent)" }}>
            <span className="cat-title">{r.name}</span>
            <span className="muted">loves {vibeById(r.favVibe).name}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ---------------- Rivals ----------------
function RivalsPanel() {
  const rivals = useGame((s) => s.rivals);
  return (
    <Panel title="Rival Studios">
      <div className="rivals">
        {rivals.map((r) => (
          <div key={r.name} className="rival-row">
            <span className="rival-name">{r.name}</span>
            <span className="muted">{compact(r.members)} mbrs{r.lastScore ? ` · "${r.lastTitle}" ${r.lastScore}/40` : ""}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ---------------- Staff ----------------
function StaffPanel() {
  const staff = useGame((s) => s.staff);
  const cash = useGame((s) => s.cash);
  const cred = useGame((s) => s.cred);
  const bonds = useGame((s) => s.bonds);
  const train = useGame((s) => s.train);
  const promote = useGame((s) => s.promote);
  return (
    <Panel title="Crew">
      <div className="crew-grid">
        {staff.map((c) => {
          const cost = trainCost(c);
          const bond = bonds.find((b) => b.a === c.id || b.b === c.id);
          const partner = bond ? staff.find((x) => x.id === (bond.a === c.id ? bond.b : bond.a)) : null;
          const promoteReady = canPromote(c);
          const promoteCost = promoteCredCost(c);
          return (
            <div key={c.id} className={`creative-card ${c.assigned ? "card-busy" : ""}`}>
              <div className="cc-head"><span className="cc-name">{c.name}</span><span className="cc-role">{careerTitle(c.role, c.tier)} · Lv{c.level}</span></div>
              <TraitChip trait={c.trait} />
              {c.tier > 0 && <span className="tier-chip">★{c.tier}</span>}
              {bond && partner && <span className={`bond-chip bond-${bond.kind}`}><Icon name={bond.kind === "chemistry" ? "heart" : "clash"} size={11} /> {partner.name.split(" ")[0]}</span>}
              <div className="cc-stats">
                <Mini label="VIS" v={c.stats.vision} /><Mini label="CRF" v={c.stats.craft} /><Mini label="SND" v={c.stats.sound} /><Mini label="STY" v={c.stats.story} /><Mini label="HUS" v={c.stats.hustle} />
              </div>
              <div className="cc-foot">
                <span className="muted">energy {c.energy} · {money(c.salary)}/wk</span>
                <div className="row" style={{ gap: 4 }}>
                  {promoteReady && <Button variant="ghost" disabled={cred < promoteCost} onClick={(e) => { promote(c.id); burstFromEvent(e); }} title="Career promotion (Cred)">↑{promoteCost}◆</Button>}
                  <Button variant="ghost" disabled={cash < cost} onClick={() => train(c.id)} title="Boost stats">Train {money(cost)}</Button>
                </div>
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
  const cap = useGame(crewCapOf);
  const count = useGame((s) => s.staff.length);
  const full = count >= cap;
  return (
    <Panel title={`Casting · ${count}/${cap}`} right={<Button variant="ghost" disabled={cash < 800} onClick={refreshPool}>↻ $800</Button>}>
      <div className="recruit-list">
        {pool.map((c) => {
          const fee = signingFee(c);
          return (
            <div key={c.id} className="recruit-card">
              <div className="rc-top"><span className="cc-name">{c.name}</span><span className="cc-role">{roleName(c.role)}</span></div>
              <TraitChip trait={c.trait} />
              <div className="cc-stats sm"><Mini label="VIS" v={c.stats.vision} /><Mini label="CRF" v={c.stats.craft} /><Mini label="SND" v={c.stats.sound} /><Mini label="STY" v={c.stats.story} /><Mini label="HUS" v={c.stats.hustle} /></div>
              <Button variant="primary" disabled={cash < fee || full} onClick={(e) => { hire(c.id); burstFromEvent(e); }}>{full ? "Full" : `Sign ${money(fee)}`}</Button>
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
        {[...logEntries].reverse().map((e, i) => <div key={i} className={`log-line log-${e.kind}`}><span className="log-wk">w{e.week}</span> {e.text}</div>)}
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
        <header className="modal-head"><h2>Studio Closed</h2></header>
        <p className="muted center">Doghouse Productions ran out of road in Year {yearOf(s.week) + 1}.</p>
        <div className="payoff"><span>{compact(s.members)} members</span><span>{s.legendary.length} legendary</span><span>best {s.bestScore}/40</span></div>
        <div className="row center"><Button variant="primary" onClick={reset}>New Studio ▸</Button></div>
      </div>
    </div>
  );
}
