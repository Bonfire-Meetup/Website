import type { CSSProperties, MouseEvent } from "react";

const MAX_ROTATION_DEG = 3.6;
const ACTIVE_SCALE = 1.012;
const ACTIVE_LIFT_PX = 0;
const MAX_PARALLAX_PX = 7;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

function supportsTilt() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    !window.matchMedia(REDUCED_MOTION_QUERY).matches &&
    window.matchMedia(FINE_POINTER_QUERY).matches
  );
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
  return {
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      if (!supportsTilt()) {
        return;
      }

      setTiltVars(event.currentTarget, {
        rotateXDeg: 0,
        rotateYDeg: 0,
        scale: ACTIVE_SCALE,
        liftPx: ACTIVE_LIFT_PX,
        mediaX: 0,
        mediaY: 0,
      });
    },
    onMouseLeave: (event: MouseEvent<HTMLElement>) => {
      resetTilt(event.currentTarget);
    },
    onMouseMove: (event: MouseEvent<HTMLElement>) => {
      if (!supportsTilt()) {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * (MAX_ROTATION_DEG * 2);
      const rotateX = (0.5 - y) * (MAX_ROTATION_DEG * 2);
      const mediaX = (0.5 - x) * (MAX_PARALLAX_PX * 2);
      const mediaY = (0.5 - y) * MAX_PARALLAX_PX;

      setTiltVars(event.currentTarget, {
        rotateXDeg: rotateX,
        rotateYDeg: rotateY,
        scale: ACTIVE_SCALE,
        liftPx: ACTIVE_LIFT_PX,
        mediaX,
        mediaY,
      });
    },
  };
}
