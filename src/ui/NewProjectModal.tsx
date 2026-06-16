import { useState } from "react";
import { MEDIUMS, VIBES, mediumById } from "../game/data";
import { useGame } from "../game/store";
import type { MediumId, VibeId } from "../game/types";
import { Button, SynergyBadge, money, roleName } from "./components";

export function NewProjectModal({ onClose }: { onClose: () => void }) {
  const staff = useGame((s) => s.staff);
  const cash = useGame((s) => s.cash);
  const startProject = useGame((s) => s.startProject);

  const [medium, setMedium] = useState<MediumId>("single");
  const [vibe, setVibe] = useState<VibeId>("romance");
  const [title, setTitle] = useState("");
  const [picked, setPicked] = useState<string[]>([]);

  const m = mediumById(medium);
  const canAfford = cash >= m.budget;
  const canStart = picked.length > 0 && canAfford;

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h2>New Project</h2>
          <button className="x" onClick={onClose}>✕</button>
        </header>

        <div className="np-grid">
          <div>
            <label className="field-label">Title</label>
            <input
              className="text-input"
              value={title}
              maxLength={28}
              placeholder="name your project…"
              onChange={(e) => setTitle(e.target.value)}
            />

            <label className="field-label">Medium</label>
            <div className="chip-row">
              {MEDIUMS.map((opt) => (
                <button
                  key={opt.id}
                  className={`chip ${medium === opt.id ? "chip-on" : ""}`}
                  onClick={() => setMedium(opt.id)}
                >
                  {opt.name}
                </button>
              ))}
            </div>

            <label className="field-label">Vibe</label>
            <div className="chip-row">
              {VIBES.map((opt) => (
                <button
                  key={opt.id}
                  className={`chip ${vibe === opt.id ? "chip-on" : ""}`}
                  onClick={() => setVibe(opt.id)}
                >
                  {opt.name}
                </button>
              ))}
            </div>

            <div className="combo-line">
              <span>Synergy</span>
              <SynergyBadge medium={medium} vibe={vibe} />
              <span className="muted">· {m.weeks} wks · budget {money(m.budget)}</span>
            </div>
          </div>

          <div>
            <label className="field-label">Crew ({picked.length} assigned)</label>
            <div className="crew-pick">
              {staff.map((c) => (
                <button
                  key={c.id}
                  className={`creative-row ${picked.includes(c.id) ? "creative-on" : ""}`}
                  onClick={() => toggle(c.id)}
                >
                  <span className="cr-name">{c.name}</span>
                  <span className="cr-role">{roleName(c.role)} · Lv{c.level}</span>
                  <span className="cr-energy">⚡{c.energy}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="modal-foot">
          {!canAfford && <span className="warn">Can't afford the {money(m.budget)} budget.</span>}
          {picked.length === 0 && <span className="muted">Assign at least one creative.</span>}
          <Button
            variant="primary"
            disabled={!canStart}
            onClick={() => {
              startProject(title, medium, vibe, picked);
              onClose();
            }}
          >
            Greenlight ▸
          </Button>
        </footer>
      </div>
    </div>
  );
}
