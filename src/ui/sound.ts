// Tiny WebAudio SFX — synthesized, zero assets. Context is created lazily on the
// first (gesture-triggered) sound, satisfying autoplay policy.

let ctx: AudioContext | null = null;
let muted = typeof localStorage !== "undefined" && localStorage.getItem("dh-mute") === "1";

function ac(): AudioContext | null {
  if (muted) return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function blip(freq: number, dur = 0.08, type: OscillatorType = "square", vol = 0.05, delay = 0) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sfx = {
  nav: () => blip(540, 0.07, "square", 0.045),
  click: () => blip(400, 0.05, "square", 0.035),
  confirm: () => { blip(523, 0.08, "square", 0.05); blip(784, 0.12, "square", 0.05, 0.06); },
  release: () => { blip(659, 0.1, "triangle", 0.06); blip(880, 0.1, "triangle", 0.06, 0.09); blip(1047, 0.2, "triangle", 0.06, 0.18); },
  coin: () => blip(988, 0.09, "triangle", 0.05),
  bad: () => blip(160, 0.2, "sawtooth", 0.05),
};

export function toggleMute(): boolean {
  muted = !muted;
  if (typeof localStorage !== "undefined") localStorage.setItem("dh-mute", muted ? "1" : "0");
  return muted;
}
export const isMuted = () => muted;
