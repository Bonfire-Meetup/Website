import type { CSSProperties, ReactElement } from "react";

import {
  clamp,
  hashToU64,
  pick,
  randInt,
  readIdFromAvatarSeed,
  round2,
  rngFromId,
} from "@/lib/utils/hash-rng";

export const AVATAR_PATTERNS = ["sprite", "circuit", "poly", "constellation"] as const;
export type AvatarPattern = (typeof AVATAR_PATTERNS)[number];

export interface AvatarArt {
  /** Solid colour shown if the browser cannot parse the gradients. */
  fallbackColor: string;
  /** Everything static, painted on the avatar itself. */
  background: string;
  /** Colour fields and firelight on their own layer, only when they need to drift. */
  drift?: string;
  /** Translucent dark tone of the palette, for the shaded rim and the initials halo. */
  shade: string;
  /** Unit vector from the centre towards the light. */
  lightX: number;
  lightY: number;
  elements: ReactElement[];
}

interface AvatarArtOptions {
  /** Background only: for sizes where the pattern would be noise. */
  lite: boolean;
  /** Emit the animated extras. Static avatars get none of those nodes. */
  live: boolean;
  /** Initials sit on top, so keep the pattern calm behind them. */
  quiet: boolean;
  pattern?: AvatarPattern;
}

type Rnd = () => number;
type VarStyle = CSSProperties & Record<`--${string}`, string>;

interface Oklch {
  l: number;
  c: number;
  h: number;
}

function hexToOklch(hex: string): Oklch {
  const n = parseInt(hex.slice(1), 16);
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = lin((n >> 16) & 255);
  const g = lin((n >> 8) & 255);
  const b = lin(n & 255);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  return { l: L, c: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}

const PALETTES = [
  { colors: ["#F97316", "#EC4899", "#F43F5E"], accent: "#FCD34D" },
  { colors: ["#3B82F6", "#F97316", "#EC4899"], accent: "#34D399" },
  { colors: ["#10B981", "#3B82F6", "#F97316"], accent: "#F472B6" },
  { colors: ["#F97316", "#EF4444", "#EC4899"], accent: "#38BDF8" },
  { colors: ["#F97316", "#3B82F6", "#22C55E"], accent: "#FB923C" },
  { colors: ["#EC4899", "#F43F5E", "#F97316"], accent: "#2DD4BF" },
  { colors: ["#06B6D4", "#3B82F6", "#F97316"], accent: "#FBBF24" },
  { colors: ["#F43F5E", "#F97316", "#EF4444"], accent: "#4ADE80" },
  { colors: ["#14B8A6", "#06B6D4", "#3B82F6"], accent: "#F472B6" },
  { colors: ["#EAB308", "#F97316", "#EF4444"], accent: "#FB923C" },
].map(({ colors, accent }) => ({
  accent,
  fallback: colors[1],
  tones: [...colors, accent].map(hexToOklch),
}));

const r1 = (n: number) => Math.round(n * 10) / 10;

// Compact on purpose: these strings are inlined into the HTML of every avatar.
const short = (n: number) => `${n}`.replace(/^(?<sign>-?)0\./u, "$<sign>.");

function css(color: Oklch, alpha = 1): string {
  const l = Math.round(clamp(color.l, 0, 1) * 100);
  const c = short(round2(Math.max(0, color.c)));
  const h = Math.round(color.h);
  return alpha >= 1 ? `oklch(${l}% ${c} ${h})` : `oklch(${l}% ${c} ${h}/${short(round2(alpha))})`;
}

function tone(color: Oklch, lightness: number, chroma = 1): Oklch {
  return { l: lightness, c: color.c * chroma, h: color.h };
}

interface Field {
  x: number;
  y: number;
  r: number;
  color: Oklch;
  alpha: number;
}

// The drifting layer is 160% of the avatar, so its fields are squeezed to land in the same place.
function paint({ x, y, r, color, alpha }: Field, wide = false): string {
  const k = wide ? 1.6 : 1;
  const o = wide ? 30 : 0;
  const radius = Math.round(r / k);
  return `radial-gradient(${radius}% ${radius}% at ${Math.round((x + o) / k)}% ${Math.round((y + o) / k)}%,${css(color, alpha)},transparent)`;
}

interface Core {
  rnd: Rnd;
  pattern: AvatarPattern;
  accent: string;
  fallbackColor: string;
  background: string;
  drift?: string;
  shade: string;
  lightX: number;
  lightY: number;
}

function computeCore(seed: string, lite: boolean, live: boolean): Core {
  const id = readIdFromAvatarSeed(seed) ?? hashToU64(seed);
  const rnd = rngFromId(id);

  // Draw order below is frozen: it decides palette, pattern and light, so members keep theirs.
  const pal = pick(rnd, PALETTES);
  const pattern = pick(rnd, AVATAR_PATTERNS);
  randInt(rnd, 0, 359);
  const angle = randInt(rnd, 0, 359);
  randInt(rnd, 60, 160);
  const mid = randInt(rnd, 42, 62);
  randInt(rnd, 18, 28);
  randInt(rnd, 18, 30);
  const ox = randInt(rnd, 18, 82);
  const oy = randInt(rnd, 18, 82);
  const swirl = rnd() * Math.PI * 2;
  const spread = 1.9 + rnd() * 1.3;

  const [c1, c2, c3, accent] = pal.tones;

  const dx = ox - 50;
  const dy = oy - 50;
  const dist = Math.hypot(dx, dy) || 1;
  // A light dead centre has no direction, so fall back to the classic top-left key light.
  const lightX = dist < 6 ? -0.7 : round2(dx / dist);
  const lightY = dist < 6 ? -0.7 : round2(dy / dist);
  const bloomX = 50 + lightX * 30;
  const bloomY = 50 + lightY * 30;

  const glow: Oklch = { l: 0.86, c: Math.min(accent.c, 0.16), h: accent.h };
  const dusk = css(tone(c1, 0.4, 0.95));
  const night = css(tone(c3, 0.34, 0.9));
  const at = (a: number, reach: number) => ({
    x: 50 + Math.cos(a) * reach,
    y: 50 + Math.sin(a) * reach,
  });

  const shared = {
    rnd,
    pattern,
    accent: pal.accent,
    fallbackColor: pal.fallback,
    shade: css(tone(c3, 0.2, 0.6), 0.55),
    lightX,
    lightY,
  };

  if (lite) {
    const background = [
      paint({ x: bloomX, y: bloomY, r: 40, color: glow, alpha: 0.42 }),
      paint({ ...at(swirl, 34), r: 55, color: c3, alpha: 0.9 }),
      `linear-gradient(${angle}deg in oklch,${dusk},${css(c2)} ${mid}%,${night})`,
    ].join(",");
    return { ...shared, background };
  }

  const base = `linear-gradient(${angle}deg in oklch,${dusk},${css(tone(c1, 0.62, 1.05))} 24%,${css(tone(c2, c2.l, 1.05))} ${mid}%,${css(tone(c3, 0.58, 1.05))} 80%,${night})`;
  const fields: Field[] = [
    { x: bloomX, y: bloomY, r: 22, color: glow, alpha: 0.5 },
    { x: bloomX, y: bloomY, r: 52, color: glow, alpha: 0.14 },
    { ...at(swirl, 34), r: 54, color: c3, alpha: 0.95 },
    { ...at(swirl + spread, 36), r: 58, color: c1, alpha: 0.9 },
    { ...at(swirl - spread * 0.85, 30), r: 42, color: accent, alpha: 0.4 },
  ];

  if (live) {
    return { ...shared, background: base, drift: fields.map((f) => paint(f, true)).join(",") };
  }
  return { ...shared, background: [...fields.map((f) => paint(f)), base].join(",") };
}

interface Timing {
  dur: number;
  delay: number;
}

// Always drawn, even for static avatars, so a seed gives the same picture either way.
function drawTiming(rnd: Rnd, minDur: number, maxDur: number): Timing {
  const dur = round2(minDur + rnd() * (maxDur - minDur));
  return { dur, delay: round2(rnd() * dur) };
}

function flicker(from: number, to: number, { dur, delay }: Timing): VarStyle {
  return {
    "--op": `${round2(from)}`,
    "--op2": `${round2(to)}`,
    "--dur": `${dur}s`,
    "--delay": `-${delay}s`,
  };
}

function calmAt(x: number, y: number, calm: number): number {
  const e = Math.hypot((x - 50) / 46, (y - 50) / 31);
  return calm + (1 - calm) * clamp((e - 0.45) / 0.55, 0, 1);
}

/**
 * Shapes that share a fill and (rounded) opacity collapse into one path, which turns
 * dozens of nodes into a handful.
 */
function createLayers(step: number) {
  const layers = new Map<string, { fill: string; op: number; d: string }>();
  return {
    add(fill: string, op: number, d: string) {
      const level = Math.round(op / step);
      if (level <= 0) {
        return;
      }
      const key = `${fill}-${level}`;
      const layer = layers.get(key);
      if (layer) {
        layer.d += d;
      } else {
        layers.set(key, { fill, op: round2(level * step), d });
      }
    },
    entries: () => [...layers.entries()],
  };
}

const dot = (x: number, y: number) => `M${r1(x)} ${r1(y)}h.01`;

function ring(x: number, y: number, r: number): string {
  return `M${r1(x - r)} ${r1(y)}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
}

function glintPath(x: number, y: number, r: number): string {
  const k = r1(r * 0.14);
  const R = r1(r);
  return `M${x} ${r1(y - R)}q${k} ${r1(R - k)} ${R} ${R}q${r1(k - R)} ${k} ${-R} ${R}q${-k} ${r1(k - R)} ${-R} ${-R}q${r1(R - k)} ${-k} ${R} ${-R}z`;
}

interface BuildContext {
  rnd: Rnd;
  accent: string;
  live: boolean;
  /** Opacity multiplier at a point: below 1 near the initials, 1 everywhere else. */
  calm: (x: number, y: number) => number;
  lightX: number;
  lightY: number;
}

function buildConstellation({ rnd, accent, live, calm }: BuildContext): ReactElement[] {
  const out: ReactElement[] = [];

  const dust = createLayers(0.14);
  const dustCount = randInt(rnd, 16, 24);
  for (let n = 0; n < dustCount; n++) {
    const a = rnd() * Math.PI * 2;
    const reach = Math.sqrt(rnd()) * 47;
    const x = 50 + Math.cos(a) * reach;
    const y = 50 + Math.sin(a) * reach;
    const op = (0.28 + rnd() * 0.42) * calm(x, y);
    const twinkles = rnd() < 0.3;
    const timing = drawTiming(rnd, 2.2, 5.5);
    if (live && twinkles) {
      const d = dot(x, y);
      out.push(
        <path
          key={`twinkle-${d}`}
          className="av-fl"
          style={flicker(op, Math.min(1, op + 0.5), timing)}
          d={d}
          stroke="#fff"
          strokeWidth={r1(0.6 + op * 1.4)}
          strokeLinecap="round"
        />,
      );
    } else {
      dust.add("#fff", op, dot(x, y));
    }
  }
  for (const [key, layer] of dust.entries()) {
    out.push(
      <path
        key={`dust-${key}`}
        d={layer.d}
        stroke="#fff"
        strokeOpacity={layer.op}
        strokeWidth={r1(0.6 + layer.op * 1.4)}
        strokeLinecap="round"
      />,
    );
  }

  const wanted = randInt(rnd, 6, 8);
  const stars: { x: number; y: number; mag: number }[] = [];
  for (let guard = 0; stars.length < wanted && guard < 240; guard++) {
    const a = rnd() * Math.PI * 2;
    const reach = Math.sqrt(15 * 15 + rnd() * (41 * 41 - 15 * 15));
    const x = r1(50 + Math.cos(a) * reach);
    const y = r1(50 + Math.sin(a) * reach);
    const mag = rnd();
    if (stars.every((s) => Math.hypot(s.x - x, s.y - y) >= 15)) {
      stars.push({ x, y, mag });
    }
  }

  // Minimum spanning tree: one connected figure, like a constellation on a star chart.
  const linked = new Set([0]);
  const cycle = round2(5.5 + rnd() * 2.5);
  let figure = "";
  while (linked.size < stars.length) {
    let from = -1;
    let to = -1;
    let bestD = Infinity;
    for (const i of linked) {
      for (let j = 0; j < stars.length; j++) {
        if (!linked.has(j)) {
          const d = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
          if (d < bestD) {
            bestD = d;
            from = i;
            to = j;
          }
        }
      }
    }
    if (to < 0) {
      break;
    }
    const d = `M${stars[from].x} ${stars[from].y}L${stars[to].x} ${stars[to].y}`;
    figure += d;
    if (live) {
      const len = r1(bestD);
      const vars: VarStyle = {
        "--dash": `${r1(Math.min(7, len * 0.4))}px`,
        "--end": `-${len}px`,
        "--dur": `${cycle}s`,
        "--delay": `${round2((linked.size - 1) * 0.42)}s`,
      };
      out.push(
        <path
          key={`pulse-${from}-${to}`}
          className="av-pulse"
          style={vars}
          d={d}
          stroke="#fff"
          strokeWidth={1.1}
          strokeLinecap="round"
        />,
      );
    }
    linked.add(to);
  }
  out.push(<path key="figure" d={figure} stroke="#fff" strokeOpacity={0.42} strokeWidth={0.55} />);

  // Star sizes come in magnitude classes, the way printed star charts draw them.
  const ranked = [...stars].sort((a, b) => b.mag - a.mag);
  const leads = ranked.slice(0, 2);
  const leadTimings = leads.map(() => drawTiming(rnd, 3, 5));
  const classes = [
    { members: leads, r: 1.9, tint: accent, lead: true },
    { members: ranked.slice(2).filter((s) => s.mag >= 0.4), r: 1.5, tint: "#fff", lead: false },
    { members: ranked.slice(2).filter((s) => s.mag < 0.4), r: 1.1, tint: "#fff", lead: false },
  ];
  for (const { members, r, tint, lead } of classes) {
    if (members.length > 0) {
      const dots = members.map((s) => dot(s.x, s.y)).join("");
      if (lead) {
        out.push(
          <path
            key="glow"
            d={dots}
            stroke={tint}
            strokeOpacity={0.2}
            strokeWidth={r1(r * 6.4)}
            strokeLinecap="round"
          />,
        );
      }
      out.push(
        <path
          key={`halo-${r}`}
          d={dots}
          stroke={tint}
          strokeOpacity={lead ? 0.34 : 0.18}
          strokeWidth={r1(r * 3.6)}
          strokeLinecap="round"
        />,
      );
      if (lead && live) {
        members.forEach((s, n) => {
          out.push(
            <path
              key={`glint-${s.x}-${s.y}`}
              className="av-glint"
              style={flicker(0.95, 0.55, leadTimings[n])}
              d={glintPath(s.x, s.y, r * 4.2)}
              fill="#fff"
            />,
          );
        });
      } else if (lead) {
        out.push(
          <path
            key="glints"
            d={members.map((s) => glintPath(s.x, s.y, r * 4.2)).join("")}
            fill="#fff"
            opacity={0.95}
          />,
        );
      }
      out.push(
        <path
          key={`core-${r}`}
          d={dots}
          stroke="#fff"
          strokeOpacity={0.95}
          strokeWidth={r * 2}
          strokeLinecap="round"
        />,
      );
    }
  }

  return out;
}

function buildCircuit({ rnd, accent, live }: BuildContext): ReactElement[] {
  const pulses: ReactElement[] = [];

  const lanes = [0, 1, 2, 3, 4, 5, 6, 7];
  for (let i = lanes.length - 1; i > 0; i--) {
    const j = randInt(rnd, 0, i);
    [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
  }
  const bundles = randInt(rnd, 5, 6);
  const accentBundle = randInt(rnd, 0, bundles - 1);
  const spacing = 4.4;
  const padR = 1.4;
  const inks = new Map<string, { traces: string; pins: string; pads: string }>();

  for (let b = 0; b < bundles; b++) {
    const theta = (lanes[b] * Math.PI) / 4;
    const dir = { x: Math.cos(theta), y: Math.sin(theta) };
    const perp = { x: -dir.y, y: dir.x };

    const count = randInt(rnd, 1, 3);
    const bendRoll = rnd();
    const bend = bendRoll < 0.22 ? 0 : bendRoll < 0.61 ? 1 : -1;
    const startR = 17 + randInt(rnd, 0, 2) * 2.5;
    const run1 = 5 + rnd() * 8;
    const phi = (bend * Math.PI) / 4;

    // Longest second leg that still lands its pad inside the circle.
    const pivotR = startR + run1;
    const reach = Math.sqrt((pivotR * Math.cos(phi)) ** 2 - pivotR ** 2 + 42 ** 2);
    const run2 = Math.min(9 + rnd() * 9, reach - pivotR * Math.cos(phi));

    const dir2 = {
      x: dir.x * Math.cos(phi) - dir.y * Math.sin(phi),
      y: dir.x * Math.sin(phi) + dir.y * Math.cos(phi),
    };
    const perp2 = { x: -dir2.y, y: dir2.x };

    const color = b === accentBundle ? accent : "#fff";
    const timing = drawTiming(rnd, 3.2, 5.8);
    const ink = inks.get(color) ?? { traces: "", pins: "", pads: "" };
    inks.set(color, ink);

    let bundleTraces = "";
    let bundleEnds = "";
    let longest = 0;

    for (let k = 0; k < count; k++) {
      const off = (k - (count - 1) / 2) * spacing;
      const sx = 50 + dir.x * startR + perp.x * off;
      const sy = 50 + dir.y * startR + perp.y * off;

      // Parallel traces turn at staggered points so the lane spacing survives the corner.
      const corner = run1 - off * Math.tan(phi / 2);
      const cx = sx + dir.x * corner;
      const cy = sy + dir.y * corner;
      const ex = 50 + dir.x * pivotR + perp2.x * off + dir2.x * run2;
      const ey = 50 + dir.y * pivotR + perp2.y * off + dir2.y * run2;

      // Stop the line at the pad's edge so the ring stays hollow.
      const tx = ex - dir2.x * padR;
      const ty = ey - dir2.y * padR;

      bundleTraces += `M${r1(sx)} ${r1(sy)}L${r1(cx)} ${r1(cy)}L${r1(tx)} ${r1(ty)}`;
      bundleEnds += dot(ex, ey);
      ink.pins += dot(sx, sy);
      ink.pads += ring(ex, ey, padR);
      longest = Math.max(longest, Math.hypot(cx - sx, cy - sy) + Math.hypot(tx - cx, ty - cy));
    }

    ink.traces += bundleTraces;

    // A whole bus fires as one node: the dash pattern restarts on every subpath.
    if (live) {
      const vars: VarStyle = {
        "--dash": "6px",
        "--end": `-${r1(longest)}px`,
        "--dur": `${timing.dur}s`,
        "--delay": `-${timing.delay}s`,
      };
      pulses.push(
        <path
          key={`pulse-${lanes[b]}`}
          className="av-pulse"
          style={vars}
          d={bundleTraces}
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />,
        <path
          key={`flash-${lanes[b]}`}
          className="av-flash"
          style={vars}
          d={bundleEnds}
          stroke={color}
          strokeLinecap="round"
        />,
      );
    }
  }

  const statics: ReactElement[] = [];
  for (const [color, ink] of inks) {
    statics.push(
      <path
        key={`traces-${color}`}
        d={ink.traces}
        stroke={color}
        strokeOpacity={0.5}
        strokeWidth={0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />,
      <path
        key={`pins-${color}`}
        d={ink.pins}
        stroke={color}
        strokeOpacity={0.75}
        strokeWidth={1.9}
        strokeLinecap="round"
      />,
      <path
        key={`pads-${color}`}
        d={ink.pads}
        stroke={color}
        strokeOpacity={0.85}
        strokeWidth={0.8}
      />,
    );
  }

  return [...statics, ...pulses];
}

function buildSprite({ rnd, accent, live, calm }: BuildContext): ReactElement[] {
  const blinks: ReactElement[] = [];
  const layers = createLayers(0.07);
  const grid = 9;
  const half = Math.ceil(grid / 2);
  const cell = 100 / grid;
  const gap = 0.55;
  const side = r1(cell - gap);

  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < half; x++) {
      const roll = rnd();
      const strength = rnd();
      const animates = rnd() < 0.22;
      const timing = drawTiming(rnd, 1.8, 4.6);
      if (roll >= 0.3) {
        let fill = "#fff";
        let op = 0.1 + strength * 0.2;
        let op2 = op + 0.3;
        if (roll < 0.46) {
          fill = "#000";
          op = 0.08 + strength * 0.12;
          op2 = op * 0.3;
        } else if (roll >= 0.86) {
          fill = accent;
          op = 0.55 + strength * 0.3;
          op2 = Math.min(1, op + 0.35);
        }

        const quiet = calm((x + 0.5) * cell, (y + 0.5) * cell);
        const top = r1(y * cell + gap / 2);
        const columns = x === grid - 1 - x ? [x] : [x, grid - 1 - x];
        const d = columns
          .map((col) => `M${r1(col * cell + gap / 2)} ${top}h${side}v${side}h${-side}z`)
          .join("");

        // A mirrored pair is one node and blinks as one, like a creature and not like noise.
        if (live && animates) {
          blinks.push(
            <path
              key={`blink-${x}-${y}`}
              className="av-fl"
              style={flicker(op * quiet, op2 * quiet, timing)}
              d={d}
              fill={fill}
            />,
          );
        } else {
          layers.add(fill, op * quiet, d);
        }
      }
    }
  }

  const statics = layers
    .entries()
    .map(([key, layer]) => (
      <path key={`px-${key}`} d={layer.d} fill={layer.fill} fillOpacity={layer.op} />
    ));
  return [...statics, ...blinks];
}

function buildPoly({ rnd, accent, live, calm, lightX, lightY }: BuildContext): ReactElement[] {
  const glints: ReactElement[] = [];
  const layers = createLayers(0.05);
  const cells = 5;
  const min = -4;
  const step = (100 - min * 2) / cells;

  const points: { x: number; y: number }[][] = [];
  for (let gy = 0; gy <= cells; gy++) {
    const row: { x: number; y: number }[] = [];
    for (let gx = 0; gx <= cells; gx++) {
      const edge = gx === 0 || gy === 0 || gx === cells || gy === cells;
      const jitter = edge ? 0 : step * 0.34;
      row.push({
        x: r1(min + gx * step + (rnd() - 0.5) * 2 * jitter),
        y: r1(min + gy * step + (rnd() - 0.5) * 2 * jitter),
      });
    }
    points.push(row);
  }

  for (let gy = 0; gy < cells; gy++) {
    for (let gx = 0; gx < cells; gx++) {
      const tl = points[gy][gx];
      const tr = points[gy][gx + 1];
      const bl = points[gy + 1][gx];
      const br = points[gy + 1][gx + 1];
      const facets =
        rnd() < 0.5
          ? [
              [tl, tr, br],
              [tl, br, bl],
            ]
          : [
              [tl, tr, bl],
              [tr, br, bl],
            ];

      for (const [a, b, c] of facets) {
        const mx = (a.x + b.x + c.x) / 3;
        const my = (a.y + b.y + c.y) / 3;
        const facing = ((mx - 50) * lightX + (my - 50) * lightY) / 50;
        // Facets lean towards or away from the light, with enough noise to read as cut stone.
        const lit = clamp(facing * 0.55 + (rnd() * 2 - 1) * 0.75, -1, 1);
        const isAccent = rnd() < 0.09;
        const accentOp = 0.32 + rnd() * 0.2;
        const animates = rnd() < 0.2;
        const timing = drawTiming(rnd, 3, 7.5);

        let fill = "#fff";
        let op = lit * 0.3;
        if (isAccent) {
          fill = accent;
          op = accentOp;
        } else if (lit < 0) {
          fill = "#000";
          op = -lit * 0.22;
        }
        op *= calm(mx, my);

        const d = `M${a.x} ${a.y}L${b.x} ${b.y}L${c.x} ${c.y}z`;
        if (live && animates) {
          glints.push(
            <path
              key={`facet-${d}`}
              className="av-fl"
              style={flicker(op, isAccent ? op * 0.45 : Math.min(0.5, op + 0.16), timing)}
              d={d}
              fill={fill}
              stroke="#fff"
              strokeOpacity={0.5}
              strokeWidth={0.3}
              strokeLinejoin="round"
            />,
          );
        } else {
          layers.add(fill, op, d);
        }
      }
    }
  }

  const statics = layers
    .entries()
    .map(([key, layer]) => (
      <path
        key={`facets-${key}`}
        d={layer.d}
        fill={layer.fill}
        stroke="#fff"
        strokeOpacity={0.5}
        strokeWidth={0.3}
        strokeLinejoin="round"
        opacity={layer.op}
      />
    ));
  return [...statics, ...glints];
}

const BUILDERS: Record<AvatarPattern, (context: BuildContext) => ReactElement[]> = {
  sprite: buildSprite,
  circuit: buildCircuit,
  poly: buildPoly,
  constellation: buildConstellation,
};

// How much of each pattern stays visible directly behind the initials.
const CENTER_CALM: Record<AvatarPattern, number> = {
  sprite: 0.5,
  circuit: 1,
  poly: 0.6,
  constellation: 0.3,
};

const steady = () => 1;

const CACHE_MAX = 512;
const cache = new Map<string, AvatarArt>();

export function getAvatarArt(seed: string, options: AvatarArtOptions): AvatarArt {
  const { lite, pattern: forced } = options;
  const live = options.live && !lite;
  const quiet = options.quiet && !lite;
  const key = `${lite ? 1 : 0}${live ? 1 : 0}${quiet ? 1 : 0}|${forced ?? ""}|${seed}`;
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const { rnd, accent, pattern: own, ...core } = computeCore(seed, lite, live);
  const pattern = forced ?? own;
  const level = CENTER_CALM[pattern];

  const elements = lite
    ? []
    : BUILDERS[pattern]({
        rnd,
        accent,
        live,
        calm: quiet && level < 1 ? (x, y) => calmAt(x, y, level) : steady,
        lightX: core.lightX,
        lightY: core.lightY,
      });

  const art: AvatarArt = { ...core, elements };
  cache.set(key, art);
  if (cache.size > CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) {
      cache.delete(oldest);
    }
  }
  return art;
}
