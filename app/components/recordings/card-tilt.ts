import type { CSSProperties, MouseEvent, PointerEvent } from "react";

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
  el.style.setProperty("--card-tilt-x", `${values.rotateXDeg}deg`);
  el.style.setProperty("--card-tilt-y", `${values.rotateYDeg}deg`);
  el.style.setProperty("--card-tilt-scale", `${values.scale}`);
  el.style.setProperty("--card-tilt-lift", `${values.liftPx}px`);
  el.style.setProperty("--card-media-x", `${values.mediaX}px`);
  el.style.setProperty("--card-media-y", `${values.mediaY}px`);
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
  "[transform:perspective(1100px)_rotateX(var(--card-tilt-x,0deg))_rotateY(var(--card-tilt-y,0deg))_translateY(var(--card-tilt-lift,0px))_scale(var(--card-tilt-scale,1))] motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out data-[card-tilt-active=true]:!duration-0 data-[card-tilt-active=true]:!ease-linear will-change-transform";
export const CARD_MEDIA_PARALLAX_BASE_CLASS =
  "object-[80%_30%] [transform:translate3d(var(--card-media-x,0px),var(--card-media-y,0px),0)_scale(1.02)] group-data-[card-tilt-active=true]:!duration-0 group-data-[card-tilt-active=true]:!ease-linear";
export const CARD_MEDIA_PARALLAX_HOVER_CLASS =
  "group-hover:[transform:translate3d(var(--card-media-x,0px),var(--card-media-y,0px),0)_scale(1.08)]";
export const CARD_MEDIA_PARALLAX_HERO_HOVER_CLASS =
  "group-hover:[transform:translate3d(var(--card-media-x,0px),var(--card-media-y,0px),0)_scale(1.06)]";

export function createCardTiltHandlers() {
  let isActive = false;
  let viewportListenersAttached = false;
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

  const handleViewportChange = () => {
    if (!isActive || !currentEl) {
      return;
    }

    currentRect = currentEl.getBoundingClientRect();
    schedulePointerTilt();
  };

  const attachViewportListeners = () => {
    if (viewportListenersAttached || typeof window === "undefined") {
      return;
    }

    window.addEventListener("resize", handleViewportChange, { passive: true });
    window.addEventListener("scroll", handleViewportChange, { capture: true, passive: true });
    viewportListenersAttached = true;
  };

  const detachViewportListeners = () => {
    if (!viewportListenersAttached || typeof window === "undefined") {
      return;
    }

    window.removeEventListener("resize", handleViewportChange);
    window.removeEventListener("scroll", handleViewportChange, true);
    viewportListenersAttached = false;
  };

  const handleEnter = (currentTarget: HTMLElement, clientX: number, clientY: number) => {
    if (!supportsTilt() || typeof window === "undefined") {
      return;
    }

    isActive = true;
    currentEl = currentTarget;
    currentRect = currentEl.getBoundingClientRect();
    pointerX = clientX;
    pointerY = clientY;
    attachViewportListeners();
    schedulePointerTilt();
  };

  const handleLeave = (currentTarget: HTMLElement) => {
    isActive = false;
    currentRect = null;
    currentEl = null;

    if (rafId !== 0) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }

    detachViewportListeners();
    currentTarget.removeAttribute("data-card-tilt-active");
    resetTilt(currentTarget);
  };

  const handleMove = (currentTarget: HTMLElement, clientX: number, clientY: number) => {
    if (!supportsTilt() || typeof window === "undefined") {
      return;
    }

    if (!isActive || currentEl !== currentTarget) {
      isActive = true;
      currentEl = currentTarget;
      currentRect = currentEl.getBoundingClientRect();
      attachViewportListeners();
    }

    currentTarget.dataset.cardTiltActive = "true";
    pointerX = clientX;
    pointerY = clientY;
    schedulePointerTilt();
  };

  return {
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      handleEnter(event.currentTarget, event.clientX, event.clientY);
    },
    onPointerLeave: (event: PointerEvent<HTMLElement>) => {
      handleLeave(event.currentTarget);
    },
    onPointerCancel: (event: PointerEvent<HTMLElement>) => {
      handleLeave(event.currentTarget);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      handleMove(event.currentTarget, event.clientX, event.clientY);
    },
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      handleEnter(event.currentTarget, event.clientX, event.clientY);
    },
    onMouseLeave: (event: MouseEvent<HTMLElement>) => {
      handleLeave(event.currentTarget);
    },
    onMouseMove: (event: MouseEvent<HTMLElement>) => {
      handleMove(event.currentTarget, event.clientX, event.clientY);
    },
  };
}
