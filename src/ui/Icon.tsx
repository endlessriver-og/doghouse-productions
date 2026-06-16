// One cohesive icon language replacing all emoji.
// 24×24 grid, 2px stroke, round cap/join, currentColor (inherits UI color),
// 45°/90° angles, ≤3 elements each. Outlined by default. Blur-test uniform.

import type { ReactNode } from "react";

export type IconName =
  | "logo" | "make" | "crew" | "office" | "scene" | "booth"
  | "cred" | "spike" | "bailout" | "goal" | "trophy" | "gift"
  | "sparkle" | "heart" | "clash" | "trend" | "scout" | "week"
  | "label" | "upgrade" | "contract" | "rival" | "release" | "sound" | "mute";

const P: Record<IconName, ReactNode> = {
  logo: <><path d="M3.5 11 L12 4 L20.5 11" /><path d="M5.5 10 V20 H18.5 V10" /><path d="M10 20 V14.5 H14 V20" /></>,
  make: <><rect x="3" y="7.5" width="18" height="12.5" rx="1.5" /><path d="M3 11.5 H21" /><path d="M7 7.5 L9 11.5 M12 7.5 L14 11.5 M17 7.5 L19 11.5" /></>,
  crew: <><circle cx="8.5" cy="8.5" r="3" /><circle cx="16" cy="9.5" r="2.3" /><path d="M3.5 19 q5 -6 10 0" /><path d="M14.5 19 q3 -4.5 6 -1.5" /></>,
  office: <><rect x="5" y="4.5" width="14" height="16.5" rx="1.5" /><rect x="9" y="3" width="6" height="3" rx="1" /><path d="M8.5 11 H15.5 M8.5 14.5 H15.5 M8.5 18 H13" /></>,
  scene: <path d="M12 3.5 c2.5 3.5 5 5.5 5 9 a5 5 0 0 1 -10 0 c0 -2 1 -3.5 2.5 -4.5 c0 1.5 1 2.5 2 2.5 c-1.5 -3 0.5 -5 0.5 -7z" />,
  booth: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11 a6 6 0 0 0 12 0" /><path d="M12 17 V20.5 M8.5 20.5 H15.5" /></>,
  cred: <><path d="M12 3 L20.5 12 L12 21 L3.5 12 Z" /><path d="M7.5 12 L12 7.5 L16.5 12" /></>,
  spike: <path d="M13 3 L5.5 13 H10.5 L9.5 21 L18.5 10 H13 L14.5 3 Z" />,
  bailout: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3.4" /><path d="M12 3.5 V8.6 M12 15.4 V20.5 M3.5 12 H8.6 M15.4 12 H20.5" /></>,
  goal: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4.3" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /></>,
  trophy: <><path d="M7.5 4 H16.5 V8.5 a4.5 4.5 0 0 1 -9 0 Z" /><path d="M7.5 5.5 H4.5 a2.8 2.8 0 0 0 3 3 M16.5 5.5 H19.5 a2.8 2.8 0 0 1 -3 3" /><path d="M12 13 V16.5 M9 20 H15 M10.5 20 V16.5 H13.5 V20" /></>,
  gift: <><rect x="4.5" y="10" width="15" height="10.5" rx="1" /><path d="M3.5 7.5 H20.5 V10 H3.5 Z M12 7.5 V20.5" /><path d="M12 7.5 C9 7.5 8 3.5 10.5 4 C12.5 4.5 12 7.5 12 7.5 C12 7.5 11.5 4.5 13.5 4 C16 3.5 15 7.5 12 7.5z" /></>,
  sparkle: <path d="M12 3.5 c0.8 4.5 3 6.7 7.5 7.5 c-4.5 0.8 -6.7 3 -7.5 7.5 c-0.8 -4.5 -3 -6.7 -7.5 -7.5 c4.5 -0.8 6.7 -3 7.5 -7.5z" />,
  heart: <path d="M12 20 C4.5 14 4 9.2 7.6 7.3 C10 6 12 8.2 12 8.2 C12 8.2 14 6 16.4 7.3 C20 9.2 19.5 14 12 20z" />,
  clash: <path d="M10.5 3 L5.5 11 H9.5 L7.5 16 L12 12.5 L11 16.5 L18.5 9 H13.5 L15 3 L11.5 7 Z" />,
  trend: <path d="M12 3.5 c2.5 3.5 5 5.5 5 9 a5 5 0 0 1 -10 0 c0 -2 1 -3.5 2.5 -4.5 c0 1.5 1 2.5 2 2.5 c-1.5 -3 0.5 -5 0.5 -7z" />,
  scout: <><path d="M2.5 12 c4 -5.5 15 -5.5 19 0 c-4 5.5 -15 5.5 -19 0z" /><circle cx="12" cy="12" r="3" /></>,
  week: <path d="M7 4.5 L19 12 L7 19.5 Z" />,
  label: <><path d="M3.5 5 H12 L20.5 12 L13 19.5 L3.5 11 Z" /><circle cx="8" cy="9.5" r="1.4" /></>,
  upgrade: <><path d="M4 20 H20" /><rect x="6" y="11" width="5" height="9" /><rect x="13" y="6" width="5" height="14" /></>,
  contract: <><rect x="5" y="3.5" width="14" height="17" rx="1.5" /><path d="M8.5 8 H15.5 M8.5 11.5 H15.5 M8.5 15 H12.5" /></>,
  rival: <><path d="M4 20 V8 L9 4 L9 20" /><path d="M9 20 V11 L20 8 V20 Z" /><path d="M13 12.5 V15.5 M16.5 11.5 V14.5" /></>,
  release: <><circle cx="12" cy="12" r="8.5" /><path d="M10 8 L16 12 L10 16 Z" /></>,
  sound: <><path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" /><path d="M16 9.5 a3.5 3.5 0 0 1 0 5 M18.5 7 a7 7 0 0 1 0 10" /></>,
  mute: <><path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" /><path d="M16.5 9.5 L21.5 14.5 M21.5 9.5 L16.5 14.5" /></>,
};

export function Icon({ name, size = 16, className = "" }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {P[name]}
    </svg>
  );
}
