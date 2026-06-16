// The studio interior, hand-authored as parametric SVG. One geometry, mood-driven
// palette so time-of-day (dusk/night/midday) is a free reskin. Static markup →
// dangerouslySetInnerHTML is safe (no user input).

type Mood = "dusk" | "night" | "midday";
interface Pal {
  sky: [string, string, string, string]; sunC: string; sunO: number; sunX: number;
  amb: string; ambO: number; poolC: string; poolO: number; neonO: number;
  skyC: string; skyO: number; dots: number; wall: string; vig: number; string: number;
}

const PAL: Record<Mood, Pal> = {
  dusk:   { sky: ["#f6c98a", "#e6a98e", "#c8a6c8", "#e7d3a8"], sunC: "#fff1cf", sunO: .9, sunX: .28, amb: "#ff9a4d", ambO: .05, poolC: "#ffdf9e", poolO: .6, neonO: 1, skyC: "#9a86ac", skyO: .6, dots: 0, wall: "#efd9b0", vig: .42, string: .35 },
  night:  { sky: ["#241f4a", "#2c2658", "#3a2c56", "#251d30"], sunC: "#9a86d8", sunO: .4, sunX: .74, amb: "#241a55", ambO: .16, poolC: "#ffcf7e", poolO: .78, neonO: 1.15, skyC: "#15122a", skyO: .95, dots: 1, wall: "#e0c293", vig: .58, string: .7 },
  midday: { sky: ["#bfe2f2", "#9ccaec", "#cfe6f5", "#e9ecdf"], sunC: "#ffffff", sunO: .85, sunX: .3, amb: "#dff0ff", ambO: .06, poolC: "#ffe7b0", poolO: .32, neonO: .4, skyC: "#aab9cf", skyO: .5, dots: 0, wall: "#f3e4c0", vig: .22, string: .18 },
};

function defs(m: string, p: Pal) {
  return `<defs>
    <linearGradient id="sky_${m}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="0.45" stop-color="${p.sky[1]}"/><stop offset="0.8" stop-color="${p.sky[2]}"/><stop offset="1" stop-color="${p.sky[3]}"/></linearGradient>
    <radialGradient id="sun_${m}" cx="${p.sunX}" cy="0.42" r="0.5"><stop offset="0" stop-color="${p.sunC}" stop-opacity="${p.sunO}"/><stop offset="0.4" stop-color="${p.sunC}" stop-opacity="${p.sunO * 0.5}"/><stop offset="1" stop-color="${p.sunC}" stop-opacity="0"/></radialGradient>
    <radialGradient id="pool_${m}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${p.poolC}" stop-opacity="${p.poolO}"/><stop offset="1" stop-color="${p.poolC}" stop-opacity="0"/></radialGradient>
    <radialGradient id="soft_${m}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff7df" stop-opacity="0.98"/><stop offset="1" stop-color="#fff7df" stop-opacity="0"/></radialGradient>
    <radialGradient id="hero_${m}" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="#ffb86b" stop-opacity="${0.35 * p.neonO}"/><stop offset="1" stop-color="#ffb86b" stop-opacity="0"/></radialGradient>
    <linearGradient id="floor_${m}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#caa05e"/><stop offset="1" stop-color="#b07f42"/></linearGradient>
    <linearGradient id="cyc_${m}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdf6e6"/><stop offset="1" stop-color="#e6d6b6"/></linearGradient>
    <pattern id="brick_${m}" width="64" height="36" patternUnits="userSpaceOnUse"><rect width="64" height="36" fill="#b15c3c"/><rect width="64" height="2" y="34" fill="#8c4628"/><rect width="2" height="36" x="62" fill="#8c4628"/><rect width="64" height="2" y="16" fill="#8c4628"/><rect width="2" height="18" x="30" y="18" fill="#8c4628"/><rect width="30" height="14" x="2" y="2" fill="#bb6645"/><rect width="30" height="14" x="34" y="2" fill="#a85535"/></pattern>
    <pattern id="plank_${m}" width="120" height="22" patternUnits="userSpaceOnUse"><rect width="120" height="22" fill="url(#floor_${m})"/><rect width="120" height="2" y="20" fill="#90672f" opacity="0.6"/><rect width="2" height="22" x="40" fill="#9c6f34" opacity="0.5"/><rect width="2" height="22" x="92" fill="#9c6f34" opacity="0.5"/></pattern>
    <pattern id="foam_${m}" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="26" height="26" fill="#3a3550"/><rect width="13" height="13" fill="#46415e"/><rect width="13" height="13" x="13" y="13" fill="#46415e"/></pattern>
    <filter id="neon_${m}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="soft2_${m}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
    <radialGradient id="vig_${m}" cx="0.5" cy="0.46" r="0.75"><stop offset="0.58" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#120c06" stop-opacity="${p.vig}"/></radialGradient>
    <linearGradient id="floorshade_${m}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c0f06" stop-opacity="0.28"/><stop offset="1" stop-color="#1c0f06" stop-opacity="0"/></linearGradient>
    <filter id="cshadow_${m}" x="-20%" y="-60%" width="140%" height="240%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="grain_${m}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0"/></filter>
  </defs>`;
}

const dots = (p: Pal) => p.dots
  ? '<g fill="#ffd86b">' + ([[135, 250], [150, 270], [225, 210], [240, 240], [320, 270], [340, 300], [920, 230], [935, 260], [1000, 270], [1095, 220], [1110, 250]] as const).map(([x, y]) => `<rect x="${x}" y="${y}" width="4" height="5"/>`).join("") + "</g>"
  : "";

function geo(m: string, p: Pal) {
  return `
  <rect width="1280" height="560" fill="${p.wall}"/>
  <g>
    <rect x="70" y="46" width="1140" height="300" fill="url(#sky_${m})"/><rect x="70" y="46" width="1140" height="300" fill="url(#sun_${m})"/>
    <g fill="${p.skyC}" opacity="${p.skyO}"><rect x="120" y="230" width="70" height="116"/><rect x="210" y="190" width="54" height="156"/><rect x="300" y="250" width="90" height="96"/><rect x="900" y="210" width="60" height="136"/><rect x="980" y="250" width="80" height="96"/><rect x="1080" y="200" width="46" height="146"/></g>
    ${dots(p)}
    <g stroke="#6f5a52" stroke-width="6" fill="none" opacity="0.85"><path d="M770 346 q3 -64 0 -120"/></g>
    <g fill="#5f8a5a" opacity="0.9" stroke="#3f6a40" stroke-width="2"><path d="M770 226 q-58 -10 -86 14 q54 -6 86 6z"/><path d="M770 226 q56 -12 84 10 q-52 -8 -84 6z"/><path d="M770 226 q-30 -52 -16 -96 q26 44 16 96z"/><path d="M770 226 q34 -48 22 -92 q-30 44 -22 92z"/><path d="M770 226 q-4 -56 4 -104 q14 52 -4 104z"/></g>
    <g fill="#2a2018"><rect x="70" y="46" width="1140" height="10"/><rect x="70" y="336" width="1140" height="10"/><rect x="70" y="46" width="10" height="300"/><rect x="1200" y="46" width="10" height="300"/><rect x="372" y="46" width="8" height="300"/><rect x="672" y="46" width="8" height="300"/><rect x="972" y="46" width="8" height="300"/><rect x="70" y="190" width="1140" height="6"/></g>
  </g>
  <rect x="0" y="346" width="1280" height="214" fill="url(#brick_${m})"/><rect x="0" y="346" width="1280" height="8" fill="#7d3e22"/>
  <path d="M40 70 Q360 150 700 96 T1240 84" fill="none" stroke="#3a2c20" stroke-width="3"/>
  ${[[180, 118], [360, 132], [560, 118], [760, 98], [980, 92], [1160, 86]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16" fill="#ffdf9e" opacity="${p.string}" filter="url(#soft2_${m})"/><circle cx="${x}" cy="${y}" r="6" fill="#ffd86b"/>`).join("")}
  <g stroke="#4f7a47" stroke-width="4" fill="none"><path d="M120 354 q-8 60 6 110"/><path d="M120 354 q14 50 -2 96"/></g>
  <g fill="#6aa05c"><rect x="108" y="400" width="12" height="10" rx="3"/><rect x="124" y="430" width="12" height="10" rx="3"/><rect x="110" y="456" width="12" height="10" rx="3"/></g>
  <rect x="0" y="560" width="1280" height="160" fill="url(#plank_${m})"/><rect x="0" y="560" width="1280" height="6" fill="#caa05e"/>
  <rect x="0" y="560" width="1280" height="30" fill="url(#floorshade_${m})"/>
  <g filter="url(#cshadow_${m})" fill="#1f0f05" opacity="0.24"><ellipse cx="195" cy="575" rx="128" ry="13"/><ellipse cx="645" cy="578" rx="186" ry="15"/><ellipse cx="1088" cy="575" rx="112" ry="13"/><ellipse cx="265" cy="696" rx="118" ry="12"/><ellipse cx="1216" cy="513" rx="32" ry="7"/><ellipse cx="732" cy="569" rx="26" ry="6"/></g>
  <ellipse cx="640" cy="600" rx="270" ry="64" fill="url(#pool_${m})"/><ellipse cx="1095" cy="612" rx="120" ry="34" fill="url(#pool_${m})"/><ellipse cx="345" cy="600" rx="70" ry="30" fill="url(#pool_${m})"/>
  <g>
    <rect x="70" y="372" width="250" height="200" rx="10" fill="#241f30" stroke="#1a1622" stroke-width="3"/><rect x="82" y="384" width="226" height="120" rx="6" fill="url(#foam_${m})"/><rect x="82" y="384" width="226" height="120" rx="6" fill="#1f1b2c" opacity="0.18"/><path d="M96 392 l60 0 -90 110 -16 0z" fill="#ffffff" opacity="0.06"/>
    <line x1="300" y1="380" x2="220" y2="430" stroke="#1a1622" stroke-width="6"/><rect x="206" y="424" width="20" height="40" rx="9" fill="#cdb8a0" stroke="#1a1622" stroke-width="3"/><rect x="210" y="430" width="12" height="28" fill="#8f7d68"/>
    <rect x="250" y="392" width="54" height="18" rx="3" fill="#1a1622"/><text x="277" y="405" font-size="11" fill="#ff6a4d" text-anchor="middle" font-family="Courier New">ON AIR</text><circle class="onair" cx="262" cy="401" r="3" fill="#ff5a3c"/><rect x="70" y="566" width="250" height="8" fill="#1a1622"/><rect x="73" y="376" width="3" height="192" rx="1.5" fill="#6a6090" opacity="0.5"/><rect x="84" y="386" width="222" height="4" rx="2" fill="#544e72" opacity="0.45"/>
  </g>
  <g>
    <path d="M470 572 L470 392 Q470 372 490 372 L800 372 Q820 372 820 392 L820 572 Q640 540 470 572 Z" fill="url(#cyc_${m})" stroke="#cbb588" stroke-width="3"/><path d="M470 540 Q640 512 820 540 L820 572 Q640 540 470 572 Z" fill="#d3c09a" opacity="0.6"/>
    <g transform="translate(452 398) rotate(18)"><circle cx="0" cy="0" r="74" fill="url(#soft_${m})"/><rect x="-26" y="-26" width="52" height="52" rx="6" fill="#f7eccf" stroke="#2a2018" stroke-width="3"/><rect class="softcore" x="-18" y="-18" width="36" height="36" fill="#fff7df"/></g><line x1="452" y1="420" x2="452" y2="566" stroke="#2a2018" stroke-width="4"/>
    <g transform="translate(838 404) rotate(-18)"><circle cx="0" cy="0" r="74" fill="url(#soft_${m})"/><rect x="-26" y="-26" width="52" height="52" rx="6" fill="#f7eccf" stroke="#2a2018" stroke-width="3"/><rect class="softcore" x="-18" y="-18" width="36" height="36" fill="#fff7df"/></g><line x1="838" y1="426" x2="838" y2="566" stroke="#2a2018" stroke-width="4"/>
    <g stroke="#2a2018" stroke-width="4" fill="none"><path d="M645 470 l-16 96 M645 470 l16 96 M645 470 l0 96"/></g><rect x="628" y="452" width="38" height="22" rx="4" fill="#3a3550" stroke="#2a2018" stroke-width="3"/><circle cx="647" cy="463" r="6" fill="#6b5bd2"/>
    <rect x="712" y="520" width="40" height="10" rx="4" fill="#d2694a" stroke="#2a2018" stroke-width="3"/><g stroke="#2a2018" stroke-width="4"><path d="M718 530 l-6 36 M746 530 l6 36"/></g>
  </g>
  <ellipse cx="645" cy="300" rx="230" ry="90" fill="url(#hero_${m})"/>
  <g filter="url(#neon_${m})" opacity="${p.neonO}"><text x="645" y="330" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="48" letter-spacing="-1"><tspan font-style="italic" font-weight="400" fill="#ff7a45">Omni</tspan><tspan dx="12" font-weight="600" fill="#ffe08a">House</tspan></text></g>
  <text x="645" y="330" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="48" letter-spacing="-1" opacity="${0.9 * p.neonO}"><tspan font-style="italic" font-weight="400" fill="#ffc191">Omni</tspan><tspan dx="12" font-weight="600" fill="#fff3cf">House</tspan></text>
  <rect x="476" y="344" width="338" height="3" rx="1" fill="#ffb27a" opacity="${0.55 * p.neonO}"/>
  <g>
    <ellipse cx="1080" cy="612" rx="170" ry="40" fill="#2a9d8f" opacity="0.85"/><ellipse cx="1080" cy="612" rx="130" ry="30" fill="none" stroke="#1f7d72" stroke-width="4"/>
    <rect x="990" y="500" width="200" height="70" rx="14" fill="#d2694a" stroke="#2a2018" stroke-width="3"/><path d="M996 546 H1184 V564 q-94 7 -188 0 Z" fill="#a94e35" opacity="0.55"/><rect x="998" y="494" width="60" height="40" rx="10" fill="#e98a64" stroke="#2a2018" stroke-width="3"/><rect x="1062" y="494" width="60" height="40" rx="10" fill="#e07b56" stroke="#2a2018" stroke-width="3"/><rect x="1126" y="494" width="60" height="40" rx="10" fill="#d56f4c" stroke="#2a2018" stroke-width="3"/>
    <rect x="980" y="512" width="22" height="58" rx="8" fill="#c25c3f" stroke="#2a2018" stroke-width="3"/><rect x="1178" y="512" width="22" height="58" rx="8" fill="#c25c3f" stroke="#2a2018" stroke-width="3"/>
    <rect x="1030" y="588" width="100" height="14" rx="4" fill="#9c6532" stroke="#2a2018" stroke-width="3"/><rect x="1050" y="576" width="14" height="14" rx="3" fill="#f4ead5" stroke="#2a2018" stroke-width="2"/>
    <rect x="1196" y="470" width="40" height="40" rx="6" fill="#c98a4b" stroke="#2a2018" stroke-width="3"/><rect x="1218" y="473" width="16" height="34" rx="3" fill="#a86f38" opacity="0.5"/><rect x="1199" y="473" width="3" height="34" rx="1.5" fill="#e6b06a" opacity="0.6"/><g fill="#4f8a4c" stroke="#2f5f30" stroke-width="2"><path d="M1216 470 q-60 -30 -54 -100 q40 30 54 100z"/><path d="M1216 470 q56 -26 58 -92 q-44 26 -58 92z"/><path d="M1216 470 q-8 -64 6 -116 q22 56 -6 116z"/></g>
  </g>
  <g>
    <rect x="150" y="600" width="230" height="92" rx="6" fill="#b07f42" stroke="#2a2018" stroke-width="3"/><rect x="150" y="600" width="230" height="12" fill="#caa05e"/><rect x="153" y="672" width="224" height="18" fill="#8a6230" opacity="0.5"/><rect x="153" y="612" width="224" height="3" fill="#e0b878" opacity="0.5"/>
    <rect x="196" y="556" width="120" height="74" rx="6" fill="#2a2018"/><rect x="204" y="564" width="104" height="58" rx="3" fill="#1d2a2a"/><rect x="212" y="572" width="60" height="6" fill="#2a9d8f"/><rect x="212" y="584" width="84" height="4" fill="#5c6b6b"/><rect x="212" y="592" width="40" height="4" fill="#e8643c"/><rect x="212" y="600" width="70" height="4" fill="#5c6b6b"/>
    <rect x="250" y="630" width="12" height="14" fill="#2a2018"/><rect x="232" y="644" width="48" height="6" rx="3" fill="#2a2018"/>
    <g stroke="#2a2018" stroke-width="4" fill="none"><path d="M352 600 l0 -36 l-20 -16"/></g><rect x="316" y="540" width="26" height="14" rx="6" fill="#e8643c" stroke="#2a2018" stroke-width="3"/><rect x="158" y="582" width="16" height="18" rx="3" fill="#2a9d8f" stroke="#2a2018" stroke-width="2"/>
  </g>
  <rect width="1280" height="720" fill="${p.amb}" opacity="${p.ambO}"/><rect width="1280" height="720" fill="url(#vig_${m})"/>
  <rect width="1280" height="720" filter="url(#grain_${m})" opacity="0.09"/>`;
}

export function StudioScene({ mood, fill }: { mood: Mood; fill?: boolean }) {
  const p = PAL[mood];
  const svg = `<svg viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${defs(mood, p)}${geo(mood, p)}</svg>`;
  return <div className={fill ? "studio-fill" : "studio-banner"} dangerouslySetInnerHTML={{ __html: svg }} />;
}
