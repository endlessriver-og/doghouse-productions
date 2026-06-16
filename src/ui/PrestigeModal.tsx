import { LEGACY_TRAITS } from "../game/data";
import { useGame } from "../game/store";
import { Button } from "./components";

export function PrestigeModal({ onClose }: { onClose: () => void }) {
  const prestige = useGame((s) => s.prestige);
  const owned = useGame((s) => s.legacyTraits);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal story-big" onClick={(e) => e.stopPropagation()}>
        <div className="story-kicker">↻ LEGACY RESET</div>
        <h2 className="story-title">Hand it off, start again — stronger</h2>
        <p className="story-body">Reset the studio (cash, crew, spaces wiped) and carry one permanent edge into the next run. The scene remembers what you built.</p>
        <div className="legacy-list">
          {LEGACY_TRAITS.map((t) => {
            const have = owned.includes(t.id);
            return (
              <button key={t.id} className={`legacy-card ${have ? "legacy-have" : ""}`} disabled={have}
                onClick={() => { prestige(t.id); onClose(); }}>
                <span className="legacy-name">{t.name}{have ? " ✓" : ""}</span>
                <span className="legacy-blurb">{t.blurb}</span>
              </button>
            );
          })}
        </div>
        <div className="row center"><Button variant="ghost" onClick={onClose}>Not yet</Button></div>
      </div>
    </div>
  );
}
