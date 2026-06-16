import { useEffect, useRef, useState } from "react";

/** Animate a number toward `target` whenever it changes (ease-out cubic). */
export function useCountUp(target: number, duration = 700): number {
  const [val, setVal] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

const CONFETTI_COLORS = ["#e8643c", "#2a9d8f", "#e3a008", "#6b5bd2", "#2a8f6f", "#c1422e"];

/** Spawn falling pixel confetti from the upper-center of the screen. */
export function confetti(count = 80): void {
  if (typeof document === "undefined") return;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "confetti-bit";
    const size = 6 + Math.random() * 8;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.left = `${50 + (Math.random() * 44 - 22)}vw`;
    el.style.top = "26vh";
    el.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    el.style.setProperty("--dx", `${Math.random() * 2 - 1}`);
    el.style.setProperty("--dy", `${45 + Math.random() * 45}vh`);
    el.style.setProperty("--rot", `${Math.random() * 720 - 360}deg`);
    el.style.animationDelay = `${Math.random() * 160}ms`;
    document.body.appendChild(el);
    window.setTimeout(() => el.remove(), 1700);
  }
}

/** Track the change in a number across renders. Returns last delta + a nonce
 *  that increments on every change (key it to re-fire flash/float animations). */
export function useDelta(value: number): { delta: number; nonce: number } {
  const prev = useRef(value);
  const [state, setState] = useState({ delta: 0, nonce: 0 });
  useEffect(() => {
    const diff = value - prev.current;
    if (diff !== 0) {
      prev.current = value;
      setState((s) => ({ delta: diff, nonce: s.nonce + 1 }));
    }
  }, [value]);
  return state;
}

/** Full-screen color flash (spike, greenlight). */
export function flashScreen(color = "#fff7df", ms = 200): void {
  if (typeof document === "undefined") return;
  const el = document.createElement("div");
  el.className = "screen-flash";
  el.style.background = color;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = "0"; });
  window.setTimeout(() => el.remove(), ms + 80);
}

const BURST_COLORS = ["#e8643c", "#2a9d8f", "#f0b23c", "#6b5bd2"];
/** Small particle burst at a screen point (hire, promote, goal). */
export function burst(x: number, y: number, n = 12): void {
  if (typeof document === "undefined") return;
  for (let i = 0; i < n; i++) {
    const el = document.createElement("div");
    el.className = "burst-bit";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.background = BURST_COLORS[i % BURST_COLORS.length];
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.5;
    const dist = 18 + Math.random() * 30;
    el.style.setProperty("--bx", `${Math.cos(a) * dist}px`);
    el.style.setProperty("--by", `${Math.sin(a) * dist}px`);
    document.body.appendChild(el);
    window.setTimeout(() => el.remove(), 680);
  }
}
/** Burst centered on the element that fired a React mouse event. */
export function burstFromEvent(e: { currentTarget: Element }): void {
  const r = e.currentTarget.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2);
}

/** Briefly shake the app shell. */
export function screenShake(): void {
  if (typeof document === "undefined") return;
  const app = document.querySelector(".app");
  if (!app) return;
  app.classList.remove("shake");
  void (app as HTMLElement).offsetWidth; // reflow to restart animation
  app.classList.add("shake");
  window.setTimeout(() => app.classList.remove("shake"), 650);
}
