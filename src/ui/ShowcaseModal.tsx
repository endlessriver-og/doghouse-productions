import { BOOTHS } from "../game/data";
import { useGame } from "../game/store";
import { money } from "./components";

export function ShowcaseModal() {
  const cash = useGame((s) => s.cash);
  const choose = useGame((s) => s.chooseShowcase);
  return (
    <div className="modal-backdrop">
      <div className="modal story-big" onClick={(e) => e.stopPropagation()}>
        <div className="story-kicker">🎪 THE SHOWCASE · annual</div>
        <h2 className="story-title">The scene's big weekend</h2>
        <p className="story-body">Every studio in the city sets up shop. Pick a presence — bigger booth, bigger spike in buzz + members.</p>
        <div className="choices-list">
          {BOOTHS.map((b) => (
            <button key={b.id} className="choice" disabled={b.cost > cash} onClick={() => choose(b.id)}>
              <span className="choice-label">{b.name}{b.cost ? ` — ${money(b.cost)}` : ""}</span>
              {b.id !== "skip" && <span className="choice-blurb">+{b.members} members · +{b.buzz} buzz · +{b.rep} rep</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
