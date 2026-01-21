"use client";

import Script from "next/script";

export function TurnstileWidget({ className = "" }: { className?: string }) {
  const siteKey = process.env.NEXT_PUBLIC_BNF_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    return null;
  }

  return (
    <div className={className}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-theme="auto"
        data-appearance="interaction-only"
      />
    </div>
  );
}
