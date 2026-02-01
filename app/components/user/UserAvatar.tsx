"use client";

import React, { type ReactElement, useMemo } from "react";

import {
  clamp,
  hashToU64,
  pick,
  randInt,
  readIdFromAvatarSeed,
  round2,
  rngFromId,
} from "@/lib/utils/hash-rng";

const AVATAR_CSS = `
.bnfAvatar .av-line {
  opacity: var(--op, 0.18);
  stroke-dasharray: none;
  stroke-dashoffset: 0;
}

.bnfAvatar .av-dot {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
}

.bnfAvatar .av-px {
  opacity: var(--op, 0.16);
}

.bnfAvatar .av-poly {
  opacity: var(--op, 0.14);
  transform-box: fill-box;
  transform-origin: center;
}

.bnfAvatar .av-anim .av-line {
  stroke-dasharray: var(--len);
  stroke-dashoffset: var(--len);
  animation: bnfAvDraw var(--dur) linear infinite;
  animation-delay: var(--delay);
}

.bnfAvatar .av-anim .av-dot {
  animation: bnfAvDot var(--dur) linear infinite;
  animation-delay: var(--delay);
}

.bnfAvatar .av-anim .av-node-end {
  opacity: 0;
}

.bnfAvatar .av-anim .av-px.av-px-anim {
  animation: bnfAvPx var(--dur) ease-in-out infinite;
  animation-delay: var(--delay);
}

.bnfAvatar .av-anim .av-poly {
  animation: bnfAvPoly var(--dur) ease-in-out infinite;
  animation-delay: var(--delay);
}

@keyframes bnfAvDraw {
  0%   { stroke-dashoffset: var(--len); opacity: 0; }
  12%  { stroke-dashoffset: var(--len); opacity: var(--op, 0.18); }
  66%  { stroke-dashoffset: 0;          opacity: var(--op, 0.18); }
  82%  { stroke-dashoffset: 0;          opacity: var(--op, 0.18); }
  100% { stroke-dashoffset: 0;          opacity: 0; }
}

@keyframes bnfAvDot {
  0%, 58%  { opacity: 0; transform: scale(0.65); }
  66%      { opacity: 0.95; transform: scale(1); }
  82%      { opacity: 0.95; transform: scale(1); }
  100%     { opacity: 0; transform: scale(0.65); }
}

@keyframes bnfAvPx {
  0%, 55%  { opacity: var(--op, 0.14); }
  66%      { opacity: var(--op2, 0.42); }
  82%      { opacity: var(--op2, 0.42); }
  100%     { opacity: var(--op, 0.14); }
}

@keyframes bnfAvPoly {
  0%   { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.98) rotate(-6deg); }
  18%  { opacity: var(--op, 0.14); }
  54%  { opacity: var(--op, 0.14); transform: translate(calc(var(--tx) * -1), calc(var(--ty) * -1)) scale(1.035) rotate(10deg); }
  78%  { opacity: var(--op, 0.14); }
  100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(1.0) rotate(-8deg); }
}
`;

const palettes = [
  { colors: ["#8B5CF6", "#EC4899", "#F43F5E"], accent: "#FCD34D" },
  { colors: ["#3B82F6", "#8B5CF6", "#EC4899"], accent: "#34D399" },
  { colors: ["#10B981", "#3B82F6", "#8B5CF6"], accent: "#F472B6" },
  { colors: ["#F97316", "#EF4444", "#EC4899"], accent: "#38BDF8" },
  { colors: ["#A855F7", "#3B82F6", "#22C55E"], accent: "#FB923C" },
  { colors: ["#EC4899", "#F43F5E", "#F97316"], accent: "#2DD4BF" },
  { colors: ["#06B6D4", "#3B82F6", "#8B5CF6"], accent: "#FBBF24" },
  { colors: ["#F43F5E", "#A855F7", "#6366F1"], accent: "#4ADE80" },
  { colors: ["#14B8A6", "#06B6D4", "#3B82F6"], accent: "#F472B6" },
  { colors: ["#EAB308", "#F97316", "#EF4444"], accent: "#A78BFA" },
];

const patterns = ["sprite", "circuit", "poly", "constellation"] as const;
type PatternType = (typeof patterns)[number];

interface AvatarSpec {
  background: string;
  pattern: PatternType;
  patternElements: ReactElement[];
  shimmerAngle: number;
}

const CACHE_MAX = 512;
const cache = new Map<string, AvatarSpec>();

function cacheGet(key: string) {
  return cache.get(key);
}

function cacheSet(key: string, value: AvatarSpec) {
  cache.set(key, value);
  if (cache.size > CACHE_MAX) {
    const first = cache.keys().next().value as string | undefined;
    if (first) {
      cache.delete(first);
    }
  }
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const h = hex.charCodeAt(0) === 35 ? hex.slice(1) : hex;
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mix(a: RGB, b: RGB, t: number): RGB {
  const tt = t <= 0 ? 0 : t >= 1 ? 1 : t;
  return {
    r: (a.r + (b.r - a.r) * tt) | 0,
    g: (a.g + (b.g - a.g) * tt) | 0,
    b: (a.b + (b.b - a.b) * tt) | 0,
  };
}

function rgba(c: RGB, a: number): string {
  const aa = a <= 0 ? 0 : a >= 1 ? 1 : a;
  return `rgba(${c.r},${c.g},${c.b},${round2(aa)})`;
}

interface Core {
  rnd: () => number;
  pattern: PatternType;
  accent: string;
  background: string;
  shimmerAngle: number;
}

function computeCore(seed: string, isTiny: boolean): Core {
  const id = readIdFromAvatarSeed(seed) ?? hashToU64(seed);
  const rnd = rngFromId(id);

  const pal = pick(rnd, palettes);
  const [c1, c2, c3] = pal.colors;
  const { accent } = pal;

  const pattern = pick(rnd, patterns);
  const shimmerAngle = randInt(rnd, 0, 359);

  const a1 = randInt(rnd, 0, 359);
  const a2 = (a1 + randInt(rnd, 60, 160)) % 360;

  const s2 = randInt(rnd, 42, 62);
  const s1 = clamp(s2 - randInt(rnd, 18, 28), 10, 40);
  const s3 = clamp(s2 + randInt(rnd, 18, 30), 65, 92);

  const ox = randInt(rnd, 18, 82);
  const oy = randInt(rnd, 18, 82);

  const r1 = hexToRgb(c1);
  const r2 = hexToRgb(c2);
  const r3 = hexToRgb(c3);
  const ra = hexToRgb(accent);

  const deep = mix(mix(r1, r3, 0.5), { r: 0, g: 0, b: 0 }, 0.18);
  const hi = mix(ra, r2, 0.55);
  const tintA = mix(r1, ra, 0.22);
  const tintB = mix(r3, ra, 0.28);

  const base = `linear-gradient(${a1}deg, ${rgba(deep, 1)} 0%, ${c1} ${s1}%, ${c2} ${s2}%, ${c3} ${s3}%, ${rgba(r3, 0.98)} 100%)`;

  const highlight = `radial-gradient(circle at ${ox}% ${oy}%, ${rgba(hi, 0.52)} 0%, ${rgba(hi, 0.18)} 22%, ${rgba(hi, 0)} 60%)`;

  const conic = `conic-gradient(from ${a2}deg at 50% 50%, ${rgba(tintA, 0.12)} 0deg, ${rgba(tintB, 0.0)} 120deg, ${rgba(tintB, 0.1)} 240deg, ${rgba(tintA, 0.12)} 360deg)`;

  const vignette = `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.22) 100%)`;

  const background = isTiny
    ? `${vignette}, ${base}`
    : `${vignette}, ${conic}, ${highlight}, ${base}`;

  return { rnd, pattern, accent, background, shimmerAngle };
}

function polygonPoints(
  cx: number,
  cy: number,
  r: number,
  sides: number,
  rotRad: number,
  jitter: number,
  rnd: () => number,
): string {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = rotRad + (i * 2 * Math.PI) / sides;
    const j = jitter > 0 ? (rnd() - 0.5) * 2 * jitter : 0;
    const rr = Math.max(2, r + j);
    const x = round2(cx + Math.cos(a) * rr);
    const y = round2(cy + Math.sin(a) * rr);
    pts.push(`${x},${y}`);
  }
  return pts.join(" ");
}

function generateAvatar(seed: string, isTiny: boolean, forcePatternType?: PatternType): AvatarSpec {
  const forceKey = forcePatternType ? `|f:${forcePatternType}` : "";
  const key = (isTiny ? "t|" : "n|") + seed + forceKey;
  const cached = cacheGet(key);
  if (cached) {
    return cached;
  }

  const core = computeCore(seed, isTiny);

  if (isTiny) {
    const spec: AvatarSpec = {
      background: core.background,
      pattern: forcePatternType ?? core.pattern,
      patternElements: [],
      shimmerAngle: core.shimmerAngle,
    };
    cacheSet(key, spec);
    return spec;
  }

  const { rnd } = core;
  const { accent, background, shimmerAngle } = core;
  const pattern = forcePatternType ?? core.pattern;

  const patternElements: ReactElement[] = [];

  if (pattern === "constellation") {
    const pts: { x: number; y: number }[] = [];
    const n = randInt(rnd, 7, 10);
    for (let i = 0; i < n; i++) {
      pts.push({ x: randInt(rnd, 14, 86), y: randInt(rnd, 14, 86) });
    }

    for (let i = 0; i < n; i++) {
      let bestJ = -1;
      let bestD = Infinity;
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = dx * dx + dy * dy;
          if (d < bestD) {
            bestD = d;
            bestJ = j;
          }
        }
      }
      if (bestJ >= 0) {
        const x1 = pts[i].x;
        const y1 = pts[i].y;
        const x2 = pts[bestJ].x;
        const y2 = pts[bestJ].y;
        const len = round2(Math.hypot(x2 - x1, y2 - y1));

        const dur = round2(clamp(1.6 + len / 22 + rnd() * 1.6, 1.9, 5.2));
        const delay = `-${round2(rnd() * dur)}s`;
        const op = round2(0.14 + rnd() * 0.16);

        const vars: React.CSSProperties & Record<string, string> = {
          "--len": `${len}`,
          "--dur": `${dur}s`,
          "--delay": delay,
          "--op": `${op}`,
        };

        patternElements.push(
          <line
            key={`l-${i}-${bestJ}`}
            x1={`${x1}%`}
            y1={`${y1}%`}
            x2={`${x2}%`}
            y2={`${y2}%`}
            className="av-line"
            style={vars}
            stroke="#ffffff"
            strokeWidth={0.95}
            strokeLinecap="round"
          />,
        );

        patternElements.push(
          <circle
            key={`ld-${i}-${bestJ}`}
            className="av-dot"
            style={vars}
            cx={`${x2}%`}
            cy={`${y2}%`}
            r="1.9%"
            fill={accent}
          />,
        );
      }
    }

    pts.forEach((p, i) => {
      const hi = rnd() < 0.25;
      patternElements.push(
        <circle
          key={`s-${i}`}
          cx={`${p.x}%`}
          cy={`${p.y}%`}
          r={hi ? "2.1%" : "1.3%"}
          fill={hi ? accent : "#ffffff"}
          opacity={hi ? 0.8 : 0.55}
        />,
      );
    });
  }

  if (pattern === "circuit") {
    const traces = randInt(rnd, 4, 7);
    for (let t = 0; t < traces; t++) {
      const startX = randInt(rnd, 2, 8) * 10;
      const startY = randInt(rnd, 2, 8) * 10;
      const turns = randInt(rnd, 2, 4);

      let x = startX;
      let y = startY;
      let d = rnd() < 0.5 ? 0 : 1;

      const pts: { x: number; y: number }[] = [{ x, y }];
      let path = `M ${x} ${y}`;

      for (let k = 0; k < turns; k++) {
        const lenSeg = randInt(rnd, 1, 4) * 10;
        if (d === 0) {
          x = clamp(x + (rnd() < 0.5 ? -lenSeg : lenSeg), 10, 90);
        } else {
          y = clamp(y + (rnd() < 0.5 ? -lenSeg : lenSeg), 10, 90);
        }
        pts.push({ x, y });
        path += ` L ${x} ${y}`;
        d = 1 - d;
      }

      let totalLen = 0;
      for (let i = 1; i < pts.length; i++) {
        totalLen += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      }
      totalLen = round2(totalLen);

      const baseOp = round2(0.12 + rnd() * 0.14);
      const dur = round2(clamp(1.7 + totalLen / 34 + rnd() * 1.6, 2.0, 6.2));
      const delay = `-${round2(rnd() * dur)}s`;

      const stroke = t % 3 === 0 ? accent : "#ffffff";
      const vars: React.CSSProperties & Record<string, string> = {
        "--len": `${Math.max(8, totalLen)}`,
        "--dur": `${dur}s`,
        "--delay": delay,
        "--op": `${baseOp}`,
      };

      patternElements.push(
        <path
          key={`p-${t}`}
          d={path}
          className="av-line"
          style={vars}
          fill="none"
          stroke={stroke}
          strokeWidth={1.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        />,
      );

      patternElements.push(
        <circle
          key={`n-${t}-a`}
          cx={`${startX}%`}
          cy={`${startY}%`}
          r="1.6%"
          fill={stroke}
          opacity={0.55}
        />,
      );

      patternElements.push(
        <circle
          key={`n-${t}-b`}
          className="av-node-end"
          cx={`${x}%`}
          cy={`${y}%`}
          r="1.9%"
          fill={stroke}
          opacity={0.7}
        />,
      );

      patternElements.push(
        <circle
          key={`d-${t}`}
          className="av-dot"
          style={vars}
          cx={`${x}%`}
          cy={`${y}%`}
          r="2.2%"
          fill={stroke}
        />,
      );
    }
  }

  if (pattern === "sprite") {
    const grid = 7;
    const cell = 100 / grid;
    const filled: { x: number; y: number }[] = [];
    for (let y = 0; y < grid; y++) {
      for (let x = 0; x < Math.ceil(grid / 2); x++) {
        const dx = Math.abs(x - 2);
        const dy = Math.abs(y - 3);
        const bias = 0.62 - 0.08 * (dx + dy);
        const on = rnd() < bias;
        if (on) {
          filled.push({ x, y });
          const mx = grid - 1 - x;
          if (mx !== x) {
            filled.push({ x: mx, y });
          }
        }
      }
    }
    if (filled.length < 10) {
      for (let i = 0; i < 10; i++) {
        filled.push({ x: randInt(rnd, 0, 6), y: randInt(rnd, 0, 6) });
      }
    }

    const maxRects = 28;
    const animateCount = 6;
    const animIndices = new Set<number>();
    while (animIndices.size < animateCount && animIndices.size < maxRects) {
      animIndices.add(randInt(rnd, 0, maxRects - 1));
    }

    const pxColorA = accent;
    const pxColorB = "#ffffff";
    const useAlt = rnd() < 0.35;

    filled.slice(0, maxRects).forEach((p, i) => {
      const isAccent = useAlt ? i % 3 === 0 : i % 4 === 0;
      const color = isAccent ? pxColorA : pxColorB;

      const baseOp = round2(0.12 + (i % 7) * 0.03);
      const hiOp = round2(clamp(baseOp + 0.22 + rnd() * 0.12, 0.22, 0.65));

      const dur = round2(clamp(1.8 + rnd() * 2.2, 1.8, 4.2));
      const delay = `-${round2(rnd() * dur)}s`;

      const anim = animIndices.has(i) && isAccent;
      const vars: React.CSSProperties & Record<string, string> = {
        "--op": `${baseOp}`,
        "--op2": `${hiOp}`,
        "--dur": `${dur}s`,
        "--delay": delay,
      };

      patternElements.push(
        <rect
          key={`px-${i}`}
          x={`${round2(p.x * cell)}%`}
          y={`${round2(p.y * cell)}%`}
          width={`${round2(cell)}%`}
          height={`${round2(cell)}%`}
          fill={color}
          className={`av-px ${anim ? "av-px-anim" : ""}`}
          style={vars}
        />,
      );
    });
  }

  if (pattern === "poly") {
    const count = randInt(rnd, 4, 6);
    for (let i = 0; i < count; i++) {
      const sides = rnd() < 0.68 ? 3 : randInt(rnd, 4, 5);
      const cx = randInt(rnd, 18, 82);
      const cy = randInt(rnd, 18, 82);
      const r = randInt(rnd, 10, 18) + (sides === 3 ? 2 : 0);
      const rot = rnd() * Math.PI * 2;
      const jitter = sides === 3 ? 1.4 : 1.1;

      const pts = polygonPoints(cx, cy, r, sides, rot, jitter, rnd);

      const isAccent = i % 3 === 0 || rnd() < 0.22;
      const stroke = isAccent ? accent : "#ffffff";
      const strokeWidth = sides === 3 ? 1.35 : 1.15;

      const op = round2(0.12 + rnd() * 0.12);
      const dur = round2(clamp(2.2 + rnd() * 3.4, 2.2, 6.4));
      const delay = `-${round2(rnd() * dur)}s`;

      const tx = round2((rnd() - 0.5) * 6);
      const ty = round2((rnd() - 0.5) * 6);

      const vars: React.CSSProperties & Record<string, string> = {
        "--op": `${op}`,
        "--dur": `${dur}s`,
        "--delay": delay,
        "--tx": `${tx}px`,
        "--ty": `${ty}px`,
      };

      patternElements.push(
        <polygon
          key={`poly-${i}`}
          points={pts}
          className="av-poly"
          style={vars}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={op}
        />,
      );

      if (isAccent && rnd() < 0.45) {
        const shardSides = 3;
        const sr = Math.max(5, Math.round(r * 0.48));
        const srot = rot + (rnd() - 0.5) * 0.7;
        const scx = round2(cx + (rnd() - 0.5) * 6);
        const scy = round2(cy + (rnd() - 0.5) * 6);
        const spts = polygonPoints(scx, scy, sr, shardSides, srot, 0.8, rnd);

        const op2 = round2(clamp(op + 0.18, 0.22, 0.62));
        const vars2: React.CSSProperties & Record<string, string> = {
          "--op": `${round2(op2 * 0.65)}`,
          "--dur": `${dur}s`,
          "--delay": delay,
          "--tx": `${round2(tx * 0.7)}px`,
          "--ty": `${round2(ty * 0.7)}px`,
        };

        patternElements.push(
          <polygon
            key={`poly-shard-${i}`}
            points={spts}
            className="av-poly"
            style={vars2}
            fill={accent}
            stroke="none"
            opacity={round2(op2 * 0.55)}
          />,
        );
      }
    }
  }

  const spec: AvatarSpec = { background, pattern, patternElements, shimmerAngle };
  cacheSet(key, spec);
  return spec;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "";
  }
  const first = words[0];
  if (words.length === 1) {
    return first?.charAt(0).toUpperCase() ?? "";
  }
  const last = words[words.length - 1];
  return ((first?.charAt(0) ?? "") + (last?.charAt(0) ?? "")).toUpperCase();
}

interface UserAvatarProps {
  avatarSeed?: string;
  size?: number;
  className?: string;
  name?: string | null;
  animated?: boolean;
  isTiny?: boolean;
  forceShape?: PatternType;
}

export function UserAvatar({
  avatarSeed,
  size = 80,
  className = "",
  name,
  animated = false,
  isTiny = false,
  forceShape,
}: UserAvatarProps) {
  const seed = avatarSeed || "default";

  const { background, patternElements, shimmerAngle } = useMemo(
    () => generateAvatar(seed, isTiny, forceShape),
    [seed, isTiny, forceShape],
  );

  const initials = name ? getInitials(name) : "";
  const showInitials = Boolean(initials) && size >= (isTiny ? 14 : 24);
  const renderedInitials = showInitials && isTiny && size < 22 ? initials.slice(0, 1) : initials;

  const fontSize = showInitials
    ? Math.max(isTiny ? 10 : 12, Math.floor(size * (isTiny ? 0.5 : 0.38)))
    : 0;

  return (
    <div
      className={`bnfAvatar relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ height: size, width: size, background }}
      data-avatar-seed={seed}
      data-avatar-tiny={isTiny ? "1" : "0"}
      data-avatar-force-shape={forceShape ?? ""}
    >
      {!isTiny && (
        <>
          <style>{AVATAR_CSS}</style>

          <svg
            className={`absolute inset-0 h-full w-full ${animated ? "av-anim" : ""}`}
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
          >
            <g>{patternElements}</g>
          </svg>

          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  rgba(255,255,255,0.0) 0px,
                  rgba(255,255,255,0.0) 2px,
                  rgba(0,0,0,0.18) 3px
                )
              `,
            }}
          />

          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `linear-gradient(${shimmerAngle}deg, transparent 18%, rgba(255,255,255,0.35) 50%, transparent 82%)`,
            }}
          />
        </>
      )}

      {showInitials && (
        <span
          className="relative z-10 font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)] select-none"
          style={{ fontSize: `${fontSize}px`, letterSpacing: "0.02em" }}
          aria-hidden="true"
        >
          {renderedInitials}
        </span>
      )}
    </div>
  );
}
