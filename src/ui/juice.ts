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
