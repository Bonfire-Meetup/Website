import type { CSSProperties, MouseEvent } from "react";

import { getPrefersReducedMotionMediaQuery } from "@/lib/utils/prefers-reduced-motion";

const MAX_ROTATION_DEG = 3.6;
const ACTIVE_SCALE = 1.012;
const ACTIVE_LIFT_PX = 0;
const MAX_PARALLAX_PX = 7;

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

let tiltCapability: boolean | null = null;
let capabilityWatchersAttached = false;

function supportsTilt() {
  if (typeof window === "undefined") {
    return false;
  }

  if (tiltCapability === null) {
    const reducedMotionMedia = getPrefersReducedMotionMediaQuery();
    const finePointerMedia = window.matchMedia(FINE_POINTER_QUERY);

    const recompute = () => {
      tiltCapability =
        reducedMotionMedia !== null && !reducedMotionMedia.matches && finePointerMedia.matches;
    };

    recompute();

    if (!capabilityWatchersAttached) {
      reducedMotionMedia?.addEventListener("change", recompute);
      finePointerMedia.addEventListener("change", recompute);
      capabilityWatchersAttached = true;
    }
  }

  return tiltCapability ?? false;
}

function setTiltVars(
  el: HTMLElement,
  values: {
    rotateXDeg: number;
    rotateYDeg: number;
    scale: number;
    liftPx: number;
    mediaX: number;
    mediaY: number;
  },
) {
  el.style.setProperty("--card-tilt-x", `${values.rotateXDeg.toFixed(2)}deg`);
  el.style.setProperty("--card-tilt-y", `${values.rotateYDeg.toFixed(2)}deg`);
  el.style.setProperty("--card-tilt-scale", values.scale.toFixed(3));
  el.style.setProperty("--card-tilt-lift", `${values.liftPx}px`);
  el.style.setProperty("--card-media-x", `${values.mediaX.toFixed(2)}px`);
  el.style.setProperty("--card-media-y", `${values.mediaY.toFixed(2)}px`);
}

function resetTilt(el: HTMLElement) {
  setTiltVars(el, { rotateXDeg: 0, rotateYDeg: 0, scale: 1, liftPx: 0, mediaX: 0, mediaY: 0 });
}

export const CARD_TILT_STYLE = {
  "--card-tilt-x": "0deg",
  "--card-tilt-y": "0deg",
  "--card-tilt-scale": "1",
  "--card-tilt-lift": "0px",
  "--card-media-x": "0px",
  "--card-media-y": "0px",
} as CSSProperties;

export const CARD_TILT_CLASS =
  "[transform:perspective(1100px)_rotateX(var(--card-tilt-x,0deg))_rotateY(var(--card-tilt-y,0deg))_translateY(var(--card-tilt-lift,0px))_scale(var(--card-tilt-scale,1))] will-change-transform";

export function createCardTiltHandlers() {
  let isActive = false;
  let rafId = 0;
  let currentEl: HTMLElement | null = null;
  let currentRect: DOMRect | null = null;
  let pointerX = 0;
  let pointerY = 0;

  const applyPointerTilt = () => {
    rafId = 0;

    if (!isActive || !currentEl || !currentRect) {
      return;
    }

    const x = (pointerX - currentRect.left) / currentRect.width;
    const y = (pointerY - currentRect.top) / currentRect.height;
    const normalizedX = Math.max(0, Math.min(1, x));
    const normalizedY = Math.max(0, Math.min(1, y));
    const rotateY = (normalizedX - 0.5) * (MAX_ROTATION_DEG * 2);
    const rotateX = (0.5 - normalizedY) * (MAX_ROTATION_DEG * 2);
    const mediaX = (0.5 - normalizedX) * (MAX_PARALLAX_PX * 2);
    const mediaY = (0.5 - normalizedY) * MAX_PARALLAX_PX;

    setTiltVars(currentEl, {
      rotateXDeg: rotateX,
      rotateYDeg: rotateY,
      scale: ACTIVE_SCALE,
      liftPx: ACTIVE_LIFT_PX,
      mediaX,
      mediaY,
    });
  };

  const schedulePointerTilt = () => {
    if (rafId !== 0) {
      return;
    }

    rafId = window.requestAnimationFrame(applyPointerTilt);
  };

  return {
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      if (!supportsTilt() || typeof window === "undefined") {
        return;
      }

      isActive = true;
      currentEl = event.currentTarget;
      currentRect = currentEl.getBoundingClientRect();
      pointerX = event.clientX;
      pointerY = event.clientY;
      schedulePointerTilt();
    },
    onMouseLeave: (event: MouseEvent<HTMLElement>) => {
      isActive = false;
      currentRect = null;
      currentEl = null;

      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }

      resetTilt(event.currentTarget);
    },
    onMouseMove: (event: MouseEvent<HTMLElement>) => {
      if (!supportsTilt() || typeof window === "undefined") {
        return;
      }

      if (!isActive || currentEl !== event.currentTarget) {
        isActive = true;
        currentEl = event.currentTarget;
        currentRect = currentEl.getBoundingClientRect();
      }

      pointerX = event.clientX;
      pointerY = event.clientY;
      schedulePointerTilt();
    },
  };
}
