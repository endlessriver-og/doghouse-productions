import { UPGRADES } from "../game/data";
import { useGame } from "../game/store";
import { Button, Panel, money } from "./components";

export function UpgradesPanel() {
  const owned = useGame((s) => s.ownedUpgrades);
  const cash = useGame((s) => s.cash);
  const buy = useGame((s) => s.buyUpgrade);
  return (
    <Panel title="The Space">
      <div className="upgrades">
        {UPGRADES.map((u) => {
          const have = owned.includes(u.id);
          return (
            <div key={u.id} className={`upgrade ${have ? "upgrade-own" : ""}`}>
              <div className="up-top">
                <span className="up-name">{u.name}</span>
                {have ? <span className="up-built">BUILT</span> : <span className="up-cost">{money(u.cost)}</span>}
              </div>
              <div className="up-blurb">{u.blurb}</div>
              {!have && (
                <Button variant="ghost" disabled={cash < u.cost} onClick={() => buy(u.id)}>Build ▸</Button>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
