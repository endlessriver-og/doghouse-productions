import { useState } from "react";
import { FOCUS, MEDIUMS, VIBES, mediumById } from "../game/data";
import { estimateScore, phaseIdeal, phaseMatch } from "../game/logic";
import { useGame } from "../game/store";
import type { Focus, MediumId, Phases, ProjectKind, VibeId } from "../game/types";
import { Button, SynergyBadge, TraitChip, money, roleName } from "./components";

const FOCI: Focus[] = ["balanced", "quality", "fast", "experimental"];

export function NewProjectModal({ onClose }: { onClose: () => void }) {
  const staff = useGame((s) => s.staff);
  const cash = useGame((s) => s.cash);
  const trend = useGame((s) => s.trend);
  const reputation = useGame((s) => s.reputation);
  const catalog = useGame((s) => s.catalog);
  const startProject = useGame((s) => s.startProject);

  const [kind, setKind] = useState<ProjectKind>("event");
  const [medium, setMedium] = useState<MediumId>("openmic");
  const [vibe, setVibe] = useState<VibeId>("wholesome");
  const [title, setTitle] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [focus, setFocus] = useState<Focus>("balanced");
  const [raw, setRaw] = useState({ concept: 34, build: 33, promo: 33 });
  const [sequelOf, setSequelOf] = useState<string | undefined>(undefined);

  const m = mediumById(medium);
  const tot = raw.concept + raw.build + raw.promo || 1;
  const phases: Phases = { concept: raw.concept / tot, build: raw.build / tot, promo: raw.promo / tot };
  const fit = Math.round(phaseMatch(phases, phaseIdeal(m)) * 100);
  const canAfford = cash >= m.budget;
  const canStart = picked.length > 0 && canAfford;
  const crew = staff.filter((c) => picked.includes(c.id));
  const band = estimateScore(crew, medium, vibe, phases, focus, reputation);
  const seqItem = sequelOf ? catalog.find((c) => c.title === sequelOf) : undefined;

  const list = MEDIUMS.filter((x) => x.kind === kind);
  const switchKind = (k: ProjectKind) => { setKind(k); setMedium(MEDIUMS.find((x) => x.kind === k)!.id); setSequelOf(undefined); };
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const pickSequel = (t: string) => {
    const c = catalog.find((x) => x.title === t); if (!c) return;
    setSequelOf(t); setMedium(c.medium); setVibe(c.vibe); setKind(mediumById(c.medium).kind);
    if (!title) setTitle(`${t} II`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head"><h2>New Project</h2><button className="x" onClick={onClose}>✕</button></header>

        {catalog.length > 0 && (
          <div className="sequel-row">
            <span className="field-label" style={{ margin: "0 8px 0 0" }}>Sequel?</span>
            {catalog.slice(0, 4).map((c) => (
              <button key={c.title} className={`chip ${sequelOf === c.title ? "chip-on" : ""}`} onClick={() => pickSequel(c.title)}>
                {c.title} ({c.score40})
              </button>
            ))}
            {sequelOf && <button className="chip" onClick={() => setSequelOf(undefined)}>✕ original</button>}
          </div>
        )}

        <div className="kind-tabs">
          <button className={`kind-tab ${kind === "event" ? "kind-on" : ""}`} onClick={() => switchKind("event")} disabled={!!sequelOf}>🎪 Events <span className="kt-sub">grow members</span></button>
          <button className={`kind-tab ${kind === "creative" ? "kind-on" : ""}`} onClick={() => switchKind("creative")} disabled={!!sequelOf}>🎬 Creative <span className="kt-sub">grow buzz + cash</span></button>
        </div>

        <div className="np-grid">
          <div>
            <label className="field-label">Title</label>
            <input className="text-input" value={title} maxLength={28} placeholder="name it…" onChange={(e) => setTitle(e.target.value)} />

            <label className="field-label">{kind === "event" ? "Format" : "Medium"}</label>
            <div className="chip-row">
              {list.map((opt) => (
                <button key={opt.id} className={`chip ${medium === opt.id ? "chip-on" : ""} ${trend.medium === opt.id ? "chip-hot" : ""}`} onClick={() => setMedium(opt.id)} disabled={!!sequelOf}>
                  {opt.name}{trend.medium === opt.id ? " 🔥" : ""}
                </button>
              ))}
            </div>
            <div className="medium-blurb">{m.blurb}</div>

            <label className="field-label">Vibe</label>
            <div className="chip-row">
              {VIBES.map((opt) => (
                <button key={opt.id} className={`chip ${vibe === opt.id ? "chip-on" : ""} ${trend.vibe === opt.id ? "chip-hot" : ""}`} onClick={() => setVibe(opt.id)}>
                  {opt.name}{trend.vibe === opt.id ? " 🔥" : ""}
                </button>
              ))}
            </div>

            <label className="field-label">Focus</label>
            <div className="chip-row">
              {FOCI.map((fid) => (
                <button key={fid} className={`chip ${focus === fid ? "chip-on" : ""}`} onClick={() => setFocus(fid)} title={FOCUS[fid].blurb}>{FOCUS[fid].name}</button>
              ))}
            </div>
            <div className="medium-blurb">{FOCUS[focus].blurb}</div>
          </div>

          <div>
            <label className="field-label">Effort split · phase fit {fit}%</label>
            {(["concept", "build", "promo"] as const).map((k) => (
              <div key={k} className="slider-row">
                <span className="slider-label">{k}</span>
                <input type="range" min={0} max={100} value={raw[k]} onChange={(e) => setRaw((r) => ({ ...r, [k]: Number(e.target.value) }))} />
                <span className="slider-val">{Math.round(phases[k] * 100)}%</span>
              </div>
            ))}

            <div className="projected">
              <span className="field-label" style={{ margin: 0 }}>Projected</span>
              <span className="proj-band">{band ? `${band.low}–${band.high}` : "—"}<span className="of"> / 40</span></span>
            </div>

            <label className="field-label">Crew ({picked.length})</label>
            <div className="crew-pick">
              {staff.map((c) => (
                <button key={c.id} className={`creative-row ${picked.includes(c.id) ? "creative-on" : ""}`} onClick={() => toggle(c.id)}>
                  <span className="cr-name">{c.name}</span>
                  <span className="cr-role">{roleName(c.role)}·Lv{c.level}</span>
                  <TraitChip trait={c.trait} />
                  <span className="cr-energy">⚡{c.energy}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="modal-foot">
          <span className="muted">
            <SynergyBadge medium={medium} vibe={vibe} /> {m.weeks}→{Math.max(1, Math.round(m.weeks * FOCUS[focus].weeksMult))}wk · {money(m.budget)}
            {seqItem && <span className="hot-tag"> · sequel gen {seqItem.generation + 1}</span>}
          </span>
          {!canAfford && <span className="warn">Need {money(m.budget)}.</span>}
          <Button variant="primary" disabled={!canStart} onClick={() => {
            startProject(title, medium, vibe, picked, focus, phases, sequelOf, seqItem ? seqItem.generation + 1 : 1);
            onClose();
          }}>Greenlight ▸</Button>
        </footer>
      </div>
    </div>
  );
}
