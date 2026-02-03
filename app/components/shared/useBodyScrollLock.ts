"use client";

import { useEffect } from "react";

type LockOptions = {
  preserveScroll?: boolean;
};

type BodyStyleSnapshot = {
  overflow: string;
  position: string;
  top: string;
  width: string;
};

let lockCount = 0;
let fixedCount = 0;
let originalStyle: BodyStyleSnapshot | null = null;
let fixedScrollY = 0;

const captureOriginalStyle = () => {
  if (originalStyle) {
    return;
  }

  originalStyle = {
    overflow: document.body.style.overflow,
    position: document.body.style.position,
    top: document.body.style.top,
    width: document.body.style.width,
  };
};

const applyOverflowLock = () => {
  captureOriginalStyle();
  document.body.style.overflow = "hidden";
  document.body.style.position = originalStyle?.position ?? "";
  document.body.style.top = originalStyle?.top ?? "";
  document.body.style.width = originalStyle?.width ?? "";
};

const applyFixedLock = () => {
  captureOriginalStyle();
  fixedScrollY = window.scrollY;
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${fixedScrollY}px`;
  document.body.style.width = "100%";
};

const restoreOriginal = () => {
  if (!originalStyle) {
    return;
  }

  document.body.style.overflow = originalStyle.overflow;
  document.body.style.position = originalStyle.position;
  document.body.style.top = originalStyle.top;
  document.body.style.width = originalStyle.width;
  originalStyle = null;
};

const lockBody = (options: LockOptions) => {
  lockCount += 1;

  if (options.preserveScroll) {
    fixedCount += 1;
    if (fixedCount === 1) {
      applyFixedLock();
    }
  } else if (fixedCount === 0) {
    applyOverflowLock();
  }
};

const unlockBody = (options: LockOptions) => {
  lockCount = Math.max(0, lockCount - 1);
  if (options.preserveScroll) {
    fixedCount = Math.max(0, fixedCount - 1);
  }

  if (lockCount === 0) {
    const shouldRestoreScroll = fixedCount === 0 && document.body.style.position === "fixed";
    const scrollTarget = fixedScrollY;
    restoreOriginal();
    if (shouldRestoreScroll) {
      window.scrollTo({ top: scrollTarget, behavior: "auto" });
    }
    fixedScrollY = 0;
    return;
  }

  if (fixedCount === 0) {
    const scrollTarget = fixedScrollY;
    document.body.style.position = originalStyle?.position ?? "";
    document.body.style.top = originalStyle?.top ?? "";
    document.body.style.width = originalStyle?.width ?? "";
    document.body.style.overflow = "hidden";
    window.scrollTo({ top: scrollTarget, behavior: "auto" });
    fixedScrollY = 0;
  }
};

export function useBodyScrollLock(locked: boolean, options: LockOptions = {}) {
  useEffect(() => {
    if (!locked) {
      return;
    }

    lockBody(options);

    return () => unlockBody(options);
  }, [locked, options.preserveScroll]);
}
