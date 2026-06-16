import type { MouseEvent, ReactNode } from "react";
import { ROLES, TRAITS, mediumById, synergyTier, vibeById } from "../game/data";
import type { MediumId, RoleId, SynergyTier, TraitId, VibeId } from "../game/types";
import { burstFromEvent } from "./juice";
import { sfx } from "./sound";

export const money = (n: number) => `$${Math.round(n).toLocaleString()}`;
export const compact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1e6).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

export const roleName = (r: RoleId) => ROLES[r].name;
export const mediumName = (m: MediumId) => mediumById(m).name;
export const vibeName = (v: VibeId) => vibeById(v).name;

export function Panel({ title, children, right }: { title?: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="panel">
      {title && (
        <header className="panel-head">
          <h2>{title}</h2>
          {right}
        </header>
      )}
      <div className="panel-body">{children}</div>
    </section>
  );
}

export function Button({
  children, onClick, variant = "default", disabled, title, burst,
}: {
  children: ReactNode;
  onClick?: (e: MouseEvent) => void;
  variant?: "default" | "primary" | "ghost";
  disabled?: boolean;
  title?: string;
  burst?: boolean; // fire a particle burst on click (economy confirms)
}) {
  const handler = onClick || burst
    ? (e: MouseEvent) => { sfx.click(); if (burst) burstFromEvent(e); onClick?.(e); }
    : undefined;
  return (
    <button className={`btn btn-${variant}`} onClick={handler} disabled={disabled} title={title}>
      {children}
    </button>
  );
}

export function Bar({ value, max, color }: { value: number; max: number; color?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="bar">
      <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

const TIER_CLASS: Record<SynergyTier, string> = { S: "tier-s", A: "tier-a", B: "tier-b", C: "tier-c" };
export function SynergyBadge({ medium, vibe }: { medium: MediumId; vibe: VibeId }) {
  const t = synergyTier(medium, vibe);
  return <span className={`tier ${TIER_CLASS[t]}`} title="Medium × Vibe synergy">{t}</span>;
}

export const traitName = (t?: TraitId) => (t ? TRAITS[t].name : null);
export function TraitChip({ trait }: { trait?: TraitId }) {
  if (!trait) return null;
  const tr = TRAITS[trait];
  return <span className="trait-chip" title={tr.blurb}>{tr.name}</span>;
}
