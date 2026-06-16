import { SCENARIOS } from "../game/data";
import { useGame } from "../game/store";
import { money } from "./components";
import { Icon } from "./Icon";

export function StartScreen() {
  const newGame = useGame((s) => s.newGame);
  const legacyTraits = useGame((s) => s.legacyTraits);
  return (
    <div className="modal-backdrop">
      <div className="modal modal-wide start" onClick={(e) => e.stopPropagation()}>
        <div className="start-hero">
          <span className="logo big"><Icon name="logo" size={40} /></span>
          <h1 className="start-title">DOGHOUSE PRODUCTIONS</h1>
          <p className="start-sub">Run a creative studio in Downtown LA. Throw events, make work that travels, turn a room into a scene people pay to belong to. Don't go broke first.</p>
        </div>
        <div className="field-label" style={{ margin: "0 18px" }}>Choose your start</div>
        <div className="scenario-list">
          {SCENARIOS.map((sc) => (
            <button key={sc.id} className="scenario-card" onClick={() => newGame(sc.id)}>
              <div className="sc-top"><span className="sc-name">{sc.name}</span><span className="sc-cash">{money(sc.cash)}</span></div>
              <div className="sc-blurb">{sc.blurb}</div>
              <div className="sc-meta">{sc.members} members · {money(sc.burn)}/mo burn · rep {sc.rep}</div>
            </button>
          ))}
        </div>
        {legacyTraits.length > 0 && (
          <p className="muted center" style={{ margin: "0 18px 16px" }}>Carrying {legacyTraits.length} legacy trait{legacyTraits.length > 1 ? "s" : ""} into this run.</p>
        )}
      </div>
    </div>
  );
}
