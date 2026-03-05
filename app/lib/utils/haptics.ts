"use client";

import { useCallback } from "react";
import type { HapticInput, TriggerOptions } from "web-haptics";
import { useWebHaptics } from "web-haptics/react";

const HAPTIC_PATTERNS = {
  error: "error",
  neutral: "nudge",
  success: "success",
  warning: "buzz",
} as const;

export function useHaptics() {
  const { cancel, isSupported, trigger } = useWebHaptics();

  const success = useCallback(
    (options?: TriggerOptions) => trigger(HAPTIC_PATTERNS.success, options),
    [trigger],
  );

  const error = useCallback(
    (options?: TriggerOptions) => trigger(HAPTIC_PATTERNS.error, options),
    [trigger],
  );

  const neutral = useCallback(
    (options?: TriggerOptions) => trigger(HAPTIC_PATTERNS.neutral, options),
    [trigger],
  );

  const warning = useCallback(
    (options?: TriggerOptions) => trigger(HAPTIC_PATTERNS.warning, options),
    [trigger],
  );

  const custom = useCallback(
    (input?: HapticInput, options?: TriggerOptions) => trigger(input, options),
    [trigger],
  );

  return {
    cancel,
    custom,
    error,
    isSupported,
    neutral,
    netural: neutral,
    success,
    warning,
  };
}
