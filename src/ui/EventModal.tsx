import { EVENT_DECK } from "../game/data";
import { useGame } from "../game/store";

export function EventModal() {
  const id = useGame((s) => s.activeEventId);
  const resolve = useGame((s) => s.resolveEvent);
  const card = EVENT_DECK.find((e) => e.id === id);
  if (!card) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal event" onClick={(e) => e.stopPropagation()}>
        <div className="story-kicker">⚡ THE WEEK BRINGS…</div>
        <h2 className="story-title">{card.title}</h2>
        <p className="story-body">{card.body}</p>
        <div className="choices-list">
          {card.choices.map((ch, i) => (
            <button key={i} className="choice" onClick={() => resolve(i)}>
              <span className="choice-label">{ch.label}</span>
              {ch.blurb && <span className="choice-blurb">{ch.blurb}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
