import { CAMPAIGNS, LABEL_ARCHETYPES, LABEL_FOUND_CASH, LABEL_FOUND_CRED, labelUpgradeCost } from "../game/data";
import { labelUnlocked } from "../game/logic";
import { useGame } from "../game/store";
import type { LabelKind } from "../game/types";
import { Button, Panel, money } from "./components";

export function ContractsPanel() {
  const s = useGame();
  const accept = useGame((a) => a.acceptContract);
  return (
    <Panel title="Contracts">
      <div className="contracts">
        {s.contracts.map((k) => {
          const canTake = !s.project && s.reputation >= k.repReq && s.cash >= 0;
          const locked = s.reputation < k.repReq;
          return (
            <div key={k.id} className={`contract ${locked ? "contract-locked" : ""}`}>
              <div className="ct-top"><span className="ct-client">{k.client}</span><span className="ct-reward">{money(k.rewardCash)} · {k.rewardCred}◆</span></div>
              <div className="ct-brief">{k.brief} · due {k.weeks}wk · need {k.minScore}/40{locked ? ` · rep ${k.repReq}` : ""}</div>
              <Button variant="ghost" burst disabled={!canTake} onClick={() => accept(k.id)}>{locked ? `Rep ${k.repReq}` : s.project ? "Busy" : "Take ▸"}</Button>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export function LabelPanel() {
  const s = useGame();
  const found = useGame((a) => a.foundLabel);
  const upgrade = useGame((a) => a.upgradeLabel);
  if (s.label) {
    const up = labelUpgradeCost(s.label.tier);
    return (
      <Panel title="Your Label">
        <div className="label-own">
          <div className="lbl-name">{s.label.name} <span className="muted">· tier {s.label.tier}</span></div>
          <div className="muted">+{Math.round(s.label.revBonus * 100)}% revenue · +{Math.round(s.label.memberBonus * 100)}% members · {money(s.label.monthlyIncome)}/mo</div>
          <Button variant="ghost" burst disabled={s.cash < up.cash || s.cred < up.cred} onClick={upgrade}>Upgrade {money(up.cash)} + {up.cred}◆</Button>
        </div>
      </Panel>
    );
  }
  if (!labelUnlocked(s)) {
    return (
      <Panel title="Your Label">
        <p className="muted">Reach reputation 45 — or promote a creative to a senior role — to found your own label.</p>
      </Panel>
    );
  }
  return (
    <Panel title="Found a Label">
      <p className="muted">Become a platform. {money(LABEL_FOUND_CASH)} + {LABEL_FOUND_CRED}◆.</p>
      <div className="label-pick">
        {(Object.keys(LABEL_ARCHETYPES) as LabelKind[]).map((k) => {
          const a = LABEL_ARCHETYPES[k];
          const afford = s.cash >= LABEL_FOUND_CASH && s.cred >= LABEL_FOUND_CRED;
          return (
            <button key={k} className="label-card" disabled={!afford} onClick={() => found(k)}>
              <span className="lbl-name">{a.name}</span>
              <span className="muted">+{Math.round(a.revBonus * 100)}% rev · +{Math.round(a.memberBonus * 100)}% mbrs · {money(a.monthlyIncome)}/mo</span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

export function MarketingPanel() {
  const s = useGame();
  const run = useGame((a) => a.runCampaign);
  return (
    <Panel title="Marketing">
      <div className="campaigns">
        {CAMPAIGNS.map((c) => {
          const used = s.campaignUse[c.id] ?? 0;
          const locked = s.reputation < c.repReq;
          const afford = s.cash >= c.cost && s.cred >= c.cred;
          return (
            <div key={c.id} className="campaign">
              <div className="cp-top"><span className="cp-name">{c.name}</span><span className="muted">{money(c.cost)}{c.cred ? ` + ${c.cred}◆` : ""}</span></div>
              <div className="muted">+{c.buzz} buzz · +{c.members} mbrs{used ? ` · used ${used}×` : ""}{locked ? ` · rep ${c.repReq}` : ""}</div>
              <Button variant="ghost" burst disabled={locked || !afford} onClick={() => run(c.id)}>Run ▸</Button>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
