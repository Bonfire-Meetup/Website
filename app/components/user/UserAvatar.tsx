"use client";

import type { CSSProperties, PointerEvent } from "react";

import { type AvatarPattern, getAvatarArt } from "@/components/user/avatar-art";
import { clamp } from "@/lib/utils/hash-rng";
import { getInitials } from "@/lib/utils/initials";

// Sparse black and white speckles with their own alpha, so the grain needs no blend mode.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='9 0 0 0 -4 9 0 0 0 -4 9 0 0 0 -4 0 .2 0 0 -.066'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/*
 * Loaded once per page, and only when a full-detail avatar is on it. The pointer variables are
 * registered as non-inheriting so a pointer move restyles four boxes, not every shape in the SVG.
 */
const AVATAR_CSS = `
@property --av-px { syntax: "<number>"; inherits: false; initial-value: 0; }
@property --av-py { syntax: "<number>"; inherits: false; initial-value: 0; }
@property --av-lx { syntax: "<number>"; inherits: false; initial-value: 0; }
@property --av-ly { syntax: "<number>"; inherits: false; initial-value: 0; }

.bnfAvatar.av-full { isolation: isolate; }
.bnfAvatar.av-live { content-visibility: auto; }

.bnfAvatar .av-art,
.bnfAvatar .av-drift,
.bnfAvatar.av-full::after,
.bnfAvatar.av-live::before {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
}

.bnfAvatar .av-art { width: 100%; height: 100%; }

.bnfAvatar.av-full::after {
  --av-lx: inherit;
  --av-ly: inherit;
  content: "";
  background-image: ${GRAIN};
  background-size: 160px 160px;
  box-shadow:
    inset calc(var(--av-lx) * var(--av-s) * -0.014px) calc(var(--av-ly) * var(--av-s) * -0.014px)
      calc(var(--av-s) * 0.026px) rgba(255, 255, 255, 0.42),
    inset calc(var(--av-lx) * var(--av-s) * 0.07px) calc(var(--av-ly) * var(--av-s) * 0.07px)
      calc(var(--av-s) * 0.16px) var(--av-shade),
    inset 0 0 0 1px rgba(255, 255, 255, 0.14);
}

.bnfAvatar.av-live::after { transition: box-shadow 0.4s ease; }

.bnfAvatar.av-live::before {
  --av-px: inherit;
  --av-py: inherit;
  content: "";
  z-index: 1;
  background: radial-gradient(
    circle at calc(50% + var(--av-px) * 42%) calc(50% + var(--av-py) * 42%),
    rgba(255, 255, 255, 0.22),
    rgba(255, 255, 255, 0) 46%
  );
  opacity: 0;
  transition: opacity 0.45s ease;
}

.bnfAvatar.av-live:hover::before { opacity: 1; }

.bnfAvatar .av-drift {
  inset: -30%;
  animation: bnfAvDrift 18s ease-in-out infinite alternate;
}

.bnfAvatar.av-live .av-art {
  --av-px: inherit;
  --av-py: inherit;
  transform: translate(calc(var(--av-px) * -3%), calc(var(--av-py) * -3%)) scale(1.07);
  transition: transform 0.4s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.bnfAvatar.av-live .av-initials {
  --av-px: inherit;
  --av-py: inherit;
  transform: translate(calc(var(--av-px) * 2.5%), calc(var(--av-py) * 2.5%));
  transition: transform 0.4s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.bnfAvatar .av-fl,
.bnfAvatar .av-glint {
  opacity: var(--op);
  animation: bnfAvFlicker var(--dur) ease-in-out var(--delay) infinite;
}

.bnfAvatar .av-glint {
  transform-box: fill-box;
  transform-origin: center;
  animation-name: bnfAvGlint;
}

.bnfAvatar .av-pulse {
  opacity: 0;
  stroke-dasharray: var(--dash) 400px;
  stroke-dashoffset: var(--dash);
  animation: bnfAvPulse var(--dur) cubic-bezier(0.45, 0, 0.25, 1) var(--delay) infinite;
}

.bnfAvatar .av-flash {
  opacity: 0;
  animation: bnfAvFlash var(--dur) linear var(--delay) infinite;
}

@keyframes bnfAvDrift {
  from { transform: rotate(-16deg) scale(1); }
  to   { transform: rotate(20deg) scale(1.1); }
}

@keyframes bnfAvFlicker {
  0%, 100% { opacity: var(--op); }
  50%      { opacity: var(--op2); }
}

@keyframes bnfAvGlint {
  0%, 100% { opacity: var(--op);  transform: scale(1) rotate(0deg); }
  50%      { opacity: var(--op2); transform: scale(0.62) rotate(45deg); }
}

@keyframes bnfAvPulse {
  0%        { stroke-dashoffset: var(--dash); opacity: 0; }
  6%        { opacity: 1; }
  40%       { opacity: 1; }
  46%, 100% { stroke-dashoffset: var(--end); opacity: 0; }
}

@keyframes bnfAvFlash {
  0%, 38%   { opacity: 0;   stroke-width: 1.6px; }
  46%       { opacity: 0.9; stroke-width: 3.8px; }
  70%, 100% { opacity: 0;   stroke-width: 7px; }
}

@media (prefers-reduced-motion: reduce) {
  .bnfAvatar.av-live *,
  .bnfAvatar.av-live::before,
  .bnfAvatar.av-live::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

/** Below this the pattern is noise, so the avatar is a single element with one background. */
const FULL_ART_MIN_SIZE = 40;

interface UserAvatarProps {
  avatarSeed?: string;
  size?: number;
  className?: string;
  name?: string | null;
  animated?: boolean;
  isTiny?: boolean;
  forceShape?: AvatarPattern;
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
  const lite = isTiny || size < FULL_ART_MIN_SIZE;
  const live = animated && !lite;

  const initials = name ? getInitials(name) : "";
  const showInitials = Boolean(initials) && size >= (isTiny ? 14 : 24);
  const renderedInitials = showInitials && isTiny && size < 22 ? initials.slice(0, 1) : initials;

  let fontSize = 0;
  if (showInitials) {
    const minFontSize = isTiny ? 10 : 12;
    const sizeMultiplier = isTiny ? 0.5 : 0.38;
    fontSize = Math.max(minFontSize, Math.floor(size * sizeMultiplier));
  }

  const art = getAvatarArt(seed, { lite, live, quiet: showInitials, pattern: forceShape });

  const rootStyle: CSSProperties & Record<`--${string}`, string> = {
    height: size,
    width: size,
    backgroundColor: art.fallbackColor,
    backgroundImage: art.background,
  };
  if (!lite) {
    rootStyle["--av-lx"] = `${art.lightX}`;
    rootStyle["--av-ly"] = `${art.lightY}`;
    rootStyle["--av-s"] = `${size}`;
    rootStyle["--av-shade"] = art.shade;
  }

  // Children ignore the pointer, so offsetX/Y are relative to the avatar: no layout read.
  const followPointer = (event: PointerEvent<HTMLDivElement>) => {
    const { style } = event.currentTarget;
    const x = clamp((event.nativeEvent.offsetX / size) * 2 - 1, -1, 1).toFixed(2);
    const y = clamp((event.nativeEvent.offsetY / size) * 2 - 1, -1, 1).toFixed(2);
    style.setProperty("--av-px", x);
    style.setProperty("--av-py", y);
    style.setProperty("--av-lx", x);
    style.setProperty("--av-ly", y);
  };

  const releasePointer = (event: PointerEvent<HTMLDivElement>) => {
    const { style } = event.currentTarget;
    style.setProperty("--av-px", "0");
    style.setProperty("--av-py", "0");
    style.setProperty("--av-lx", `${art.lightX}`);
    style.setProperty("--av-ly", `${art.lightY}`);
  };

  let variant = "";
  if (!lite) {
    variant = live ? " av-full av-live" : " av-full";
  }

  return (
    <div
      className={`bnfAvatar relative flex shrink-0 items-center justify-center overflow-hidden rounded-full${variant}${className ? ` ${className}` : ""}`}
      style={rootStyle}
      data-avatar-seed={seed}
      onPointerMove={live ? followPointer : undefined}
      onPointerLeave={live ? releasePointer : undefined}
    >
      {!lite && (
        <>
          <style href="bnf-avatar" precedence="default">
            {AVATAR_CSS}
          </style>
          {art.drift && <div className="av-drift" style={{ backgroundImage: art.drift }} />}
          <svg className="av-art" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            {art.elements}
          </svg>
        </>
      )}

      {showInitials && (
        <span
          className={`relative z-10 font-black text-white select-none ${live ? "av-initials pointer-events-none" : ""}`}
          style={{
            fontSize: `${fontSize}px`,
            letterSpacing: "0.02em",
            textShadow: lite
              ? "0 1px 2px rgba(0,0,0,0.4)"
              : `0 ${Math.max(1, Math.round(size * 0.012))}px ${Math.round(size * 0.03)}px rgba(0,0,0,0.22), 0 0 ${Math.round(size * 0.18)}px ${art.shade}`,
          }}
          aria-hidden="true"
        >
          {renderedInitials}
        </span>
      )}
    </div>
  );
}
