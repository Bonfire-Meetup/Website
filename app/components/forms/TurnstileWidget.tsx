"use client";

import Script from "next/script";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { clientEnv } from "@/lib/config/env";
import { logWarn } from "@/lib/utils/log-client";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
      execute?: (widgetId: string) => void;
      getResponse?: (widgetId: string) => string;
    };
  }
}

export type TurnstileMode = "render" | "execute";

export interface TurnstileWidgetHandle {
  execute: () => Promise<string | null>;
  reset: () => void;
  getToken: () => string | null;
}

interface Props {
  className?: string;
  onError?: () => void;
  resetKey?: string | number;
  mode?: TurnstileMode;
  inputName?: string;
  onToken?: (token: string) => void;
  appearance?: "always" | "execute" | "interaction-only";
}

export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, Props>(function TurnstileWidget(
  {
    className = "",
    onError,
    resetKey,
    mode = "render",
    inputName = "cf-turnstile-response",
    onToken,
    appearance = "interaction-only",
  },
  ref,
) {
  const siteKey = clientEnv.NEXT_PUBLIC_BNF_TURNSTILE_SITE_KEY;

  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const [scriptLoaded, setScriptLoaded] = useState(() => {
    if (typeof window !== "undefined") {
      return Boolean(window.turnstile);
    }
    return false;
  });
  const [scriptError, setScriptError] = useState(false);

  const [token, setToken] = useState<string>("");

  const pendingExecuteResolveRef = useRef<((value: string | null) => void) | null>(null);
  const pendingExecuteTimeoutRef = useRef<number | null>(null);

  const clearPendingExecute = useCallback(() => {
    if (pendingExecuteTimeoutRef.current) {
      window.clearTimeout(pendingExecuteTimeoutRef.current);
      pendingExecuteTimeoutRef.current = null;
    }
    pendingExecuteResolveRef.current = null;
  }, []);

  const resolvePendingExecuteNull = useCallback(() => {
    if (pendingExecuteResolveRef.current) {
      pendingExecuteResolveRef.current(null);
      clearPendingExecute();
    }
  }, [clearPendingExecute]);

  const handleToken = useCallback(
    (newToken: string) => {
      setToken(newToken);
      onToken?.(newToken);

      if (pendingExecuteResolveRef.current) {
        pendingExecuteResolveRef.current(newToken);
        clearPendingExecute();
      }
    },
    [onToken, clearPendingExecute],
  );

  const handleWidgetError = useCallback(() => {
    setScriptError(true);
    onError?.();
    resolvePendingExecuteNull();
  }, [onError, resolvePendingExecuteNull]);

  const renderWidget = useCallback(() => {
    const ts = window.turnstile;
    if (!ts || !containerRef.current || !siteKey) {
      return false;
    }

    if (widgetIdRef.current) {
      try {
        ts.remove(widgetIdRef.current);
      } catch (error) {
        logWarn("turnstileWidget.remove_failed", { error: String(error) });
      }
      widgetIdRef.current = null;
    }

    containerRef.current.replaceChildren();

    setToken("");
    resolvePendingExecuteNull();

    try {
      widgetIdRef.current = ts.render(containerRef.current, {
        appearance,
        callback: (t: unknown) => {
          if (typeof t === "string") {
            handleToken(t);
          }
        },
        "error-callback": () => handleWidgetError(),
        execution: mode,

        "expired-callback": () => {
          setToken("");
          resolvePendingExecuteNull();
        },

        sitekey: siteKey,

        theme: "auto",

        "timeout-callback": () => {
          setToken("");
          resolvePendingExecuteNull();
        },
      });

      return true;
    } catch (error) {
      logWarn("turnstileWidget.render_failed", { error: String(error) });
      setScriptError(true);
      onError?.();
      return false;
    }
  }, [
    appearance,
    mode,
    siteKey,
    handleToken,
    handleWidgetError,
    resolvePendingExecuteNull,
    onError,
  ]);

  const reset = useCallback(() => {
    const ts = window.turnstile;
    if (!widgetIdRef.current || !ts) {
      return;
    }

    setToken("");
    clearPendingExecute();

    try {
      ts.reset(widgetIdRef.current);
    } catch {
      renderWidget();
    }
  }, [clearPendingExecute, renderWidget]);

  const execute = useCallback((): Promise<string | null> => {
    if (mode !== "execute") {
      return Promise.resolve(token || null);
    }

    const ts = window.turnstile;
    const widgetId = widgetIdRef.current;

    if (!ts || !widgetId || !ts.execute) {
      logWarn("turnstileWidget.execute_unavailable", {});
      return Promise.resolve(null);
    }

    if (token) {
      return Promise.resolve(token);
    }

    if (pendingExecuteResolveRef.current) {
      return new Promise((resolve) => {
        const prev = pendingExecuteResolveRef.current;
        pendingExecuteResolveRef.current = (val) => {
          prev?.(val);
          resolve(val);
        };
      });
    }

    return new Promise((resolve) => {
      pendingExecuteResolveRef.current = resolve;

      pendingExecuteTimeoutRef.current = window.setTimeout(() => {
        if (pendingExecuteResolveRef.current) {
          pendingExecuteResolveRef.current(null);
          clearPendingExecute();
        }
      }, 15_000);

      try {
        ts.execute?.(widgetId);
      } catch (error) {
        logWarn("turnstileWidget.execute_failed", { error: String(error) });
        resolve(null);
        clearPendingExecute();
      }
    });
  }, [clearPendingExecute, mode, token]);

  useImperativeHandle(
    ref,
    () => ({
      execute,
      getToken: () => token || null,
      reset,
    }),
    [execute, reset, token],
  );

  // Reset state on mount to ensure clean state when navigating between pages
  useEffect(() => {
    setToken("");
    clearPendingExecute();
    setScriptError(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!scriptLoaded && window.turnstile) {
      // Small delay to ensure Turnstile is fully ready when script was already loaded
      const timeoutId = window.setTimeout(() => {
        if (window.turnstile) {
          setScriptLoaded(true);
        }
      }, 50);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }
  }, [scriptLoaded]);

  useEffect(() => {
    if (resetKey === undefined) {
      return;
    }
    if (!scriptLoaded) {
      return;
    }
    if (!widgetIdRef.current) {
      return;
    }
    reset();
  }, [resetKey, scriptLoaded, reset]);

  useEffect(() => {
    if (!scriptLoaded || scriptError) {
      return;
    }
    if (!siteKey) {
      return;
    }
    if (!containerRef.current) {
      return;
    }
    if (!window.turnstile) {
      return;
    }

    // Use requestAnimationFrame to ensure DOM is ready before rendering
    const rafId = window.requestAnimationFrame(() => {
      if (containerRef.current && window.turnstile) {
        renderWidget();
      }
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [renderWidget, scriptLoaded, scriptError, siteKey]);

  useEffect(() => {
    const onPageShow = () => {
      if (window.turnstile && containerRef.current) {
        renderWidget();
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [renderWidget]);

  useEffect(
    () => () => {
      clearPendingExecute();
      const ts = window.turnstile;
      if (widgetIdRef.current && ts) {
        try {
          ts.remove(widgetIdRef.current);
        } catch (error) {
          logWarn("turnstileWidget.cleanup_failed", { error: String(error) });
        }
        widgetIdRef.current = null;
      }
    },
    [clearPendingExecute],
  );

  const handleScriptReady = useCallback(() => {
    setScriptError(false);
    setScriptLoaded(true);
  }, []);

  if (!siteKey) {
    return null;
  }

  return (
    <div className={className}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={handleScriptReady}
        onError={handleWidgetError}
      />

      {mode === "render" && <input type="hidden" name={inputName} value={token} />}

      <div ref={containerRef} />

      {scriptError && (
        <p className="mt-2 text-sm text-rose-500">
          Failed to load verification widget. Please refresh the page.
        </p>
      )}
    </div>
  );
});
