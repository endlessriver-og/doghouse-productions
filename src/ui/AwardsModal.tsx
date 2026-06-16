import { useEffect } from "react";
import { useGame } from "../game/store";
import { Button } from "./components";
import { Icon } from "./Icon";
import { confetti } from "./juice";

export function AwardsModal() {
  const a = useGame((s) => s.awardsPending)!;
  const dismiss = useGame((s) => s.dismissAwards);
  const wins = a.categories.filter((c) => c.youWon).length;

  useEffect(() => { if (wins > 0) confetti(90); }, [wins]);

  return (
    <div className="modal-backdrop">
      <div className="modal story-big" onClick={(e) => e.stopPropagation()}>
        <div className="story-kicker">★ LA SCENE AWARDS · Y{a.year}</div>
        <h2 className="story-title">The night the scene grades itself</h2>
        <div className="awards-list">
          {a.categories.map((c) => (
            <div key={c.name} className={`award-row ${c.youWon ? "award-win" : ""}`}>
              <span className="award-cat">{c.name}</span>
              <span className="award-winner">{c.youWon ? <><Icon name="trophy" size={13} /> YOU</> : c.winner}</span>
            </div>
          ))}
        </div>
        <p className="muted center">{wins > 0 ? `${wins} win${wins > 1 ? "s" : ""} — +${wins * 3} reputation.` : "Shut out this year. Next year's yours."}</p>
        <div className="row center"><Button variant="primary" onClick={dismiss}>Continue ▸</Button></div>
      </div>
    </div>
  );
}
