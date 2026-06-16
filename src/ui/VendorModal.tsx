import { VENDOR_ITEMS } from "../game/data";
import { useGame } from "../game/store";
import { Button, money } from "./components";
import { Icon } from "./Icon";

export function VendorModal() {
  const cash = useGame((s) => s.cash);
  const buy = useGame((s) => s.buyVendorItem);
  const dismiss = useGame((s) => s.dismissVendor);
  return (
    <div className="modal-backdrop">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="story-kicker"><Icon name="gift" size={12} /> THE VENDOR · annual visit</div>
        <h2 className="story-title">Pumpkin Products drops by</h2>
        <div className="choices-list">
          {VENDOR_ITEMS.map((it) => (
            <button key={it.id} className="choice" disabled={it.cost > cash} onClick={() => buy(it.id)}>
              <span className="choice-label">{it.name} — {money(it.cost)}</span>
              <span className="choice-blurb">{it.blurb}</span>
            </button>
          ))}
        </div>
        <div className="row center"><Button variant="ghost" onClick={dismiss}>Leave</Button></div>
      </div>
    </div>
  );
}
