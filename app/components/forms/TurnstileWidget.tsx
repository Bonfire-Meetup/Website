"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

import { clientEnv } from "@/lib/config/env";
import { logWarn } from "@/lib/utils/log-client";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

export function TurnstileWidget({
  className = "",
  onError,
  resetKey,
}: {
  className?: string;
  onError?: () => void;
  resetKey?: string | number;
}) {
  const siteKey = clientEnv.NEXT_PUBLIC_BNF_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  const renderWidget = useCallback(() => {
    if (!window.turnstile || !containerRef.current) {
      return false;
    }

    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch (error) {
        logWarn("turnstileWidget.remove_failed", { error: String(error) });
      }
      widgetIdRef.current = null;
    }

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        appearance: "interaction-only",
        sitekey: siteKey,
        theme: "auto",
      });
      return true;
    } catch (error) {
      console.error("Failed to render Turnstile widget:", error);
      setScriptError(true);
      onError?.();
      return false;
    }
  }, [siteKey, onError]);

  useEffect(() => {
    if (
      resetKey === undefined ||
      !scriptLoaded ||
      !widgetIdRef.current ||
      !window.turnstile ||
      !containerRef.current
    ) {
      return;
    }

    try {
      window.turnstile.reset(widgetIdRef.current);
    } catch {
      renderWidget();
    }
  }, [resetKey, scriptLoaded, renderWidget]);

  useEffect(() => {
    if (!siteKey || !containerRef.current || !scriptLoaded || !window.turnstile) {
      return;
    }
    renderWidget();
  }, [siteKey, scriptLoaded, renderWidget]);

  const handleScriptLoad = () => {
    setScriptLoaded(true);
    setTimeout(() => {
      if (window.turnstile && containerRef.current) {
        renderWidget();
      }
    }, 100);
  };

  const handleScriptError = () => {
    setScriptError(true);
    onError?.();
  };

  useEffect(
    () => () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          logWarn("turnstileWidget.cleanup_failed", { error: String(error) });
        }
        widgetIdRef.current = null;
      }
    },
    [],
  );

  if (!siteKey) {
    return null;
  }

  return (
    <div className={className}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />
      <div ref={containerRef} />
      {scriptError && (
        <p className="mt-2 text-sm text-rose-500">
          Failed to load verification widget. Please refresh the page.
        </p>
      )}
    </div>
  );
}
