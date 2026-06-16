import { useEffect, useState } from "react";
import { CRITICS } from "../game/data";
import { useGame } from "../game/store";
import { Button } from "./components";
import { Icon } from "./Icon";
import { confetti, screenShake, useCountUp } from "./juice";
import { sfx } from "./sound";

export function ScoreReveal() {
  const r = useGame((s) => s.lastRelease)!;
  const dismiss = useGame((s) => s.dismissRelease);
  const [revealed, setRevealed] = useState(0);
  const [showTotal, setShowTotal] = useState(false);
  const total = useCountUp(showTotal ? r.score40 : 0, 600);

  useEffect(() => {
    const timers: number[] = [];
    r.criticScores.forEach((_, i) =>
      timers.push(window.setTimeout(() => setRevealed(i + 1), 450 + i * 520))
    );
    timers.push(
      window.setTimeout(() => {
        setShowTotal(true);
        if (r.score40 >= 26) { confetti(r.legendary ? 150 : 70); sfx.release(); } else { sfx.bad(); }
        if (r.legendary) screenShake();
      }, 450 + r.criticScores.length * 520 + 150)
    );
    return () => timers.forEach((t) => clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verdict =
    r.score40 >= 38 ? "LEGENDARY" : r.score40 >= 33 ? "ACCLAIMED" :
    r.score40 >= 26 ? "A HIT" : r.score40 >= 18 ? "MIXED" : "A FLOP";
  const vClass = r.score40 >= 33 ? "hi" : r.score40 >= 26 ? "mid" : "lo";

  return (
    <div className="modal-backdrop">
      <div className="modal reveal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h2>{r.title}</h2>
          <span className="muted">{r.kind === "event" ? "EVENT" : "RELEASE"}{r.generation > 1 ? ` · SEQUEL ${"I".repeat(r.generation)}` : ""}</span>
        </header>

        <div className="critics">
          {CRITICS.map((c, i) => (
            <div key={c.id} className={`critic ${i < revealed ? "critic-in" : "critic-hidden"}`}>
              <div className="critic-score">{i < revealed ? r.criticScores[i] : "—"}<span className="of">/10</span></div>
              <div className="critic-name">{c.name}</div>
              <div className="critic-blurb">{c.blurb}</div>
            </div>
          ))}
        </div>

        {showTotal && (
          <>
            <div className={`verdict verdict-${vClass} stamp`}>{verdict}</div>
            <div className="score40">{total}<span className="of"> / 40</span></div>
            <div className="payoff">
              {r.newMembers > 0 && <span className="pay-good">+{r.newMembers.toLocaleString()} members</span>}
              <span>+{r.buzzGain.toLocaleString()} buzz</span>
              <span className="pay-good">${r.revenue.toLocaleString()}</span>
            </div>
            {r.surprise && <div className="surprise-line"><Icon name="gift" size={13} /> {r.surprise}</div>}
            <div className="row center">
              <Button variant="primary" onClick={dismiss}>Onward ▸</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
