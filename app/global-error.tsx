"use client";

import { useEffect } from "react";

import { reportError } from "@/lib/rollbar/client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { digest: error.digest, source: "global_error" });
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", textAlign: "center" }}>
        <h1>Something went wrong</h1>
        <p>We encountered an unexpected error. Please try again.</p>
        <button
          onClick={() => reset()}
          style={{
            marginRight: "0.5rem",
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
          type="button"
        >
          Try again
        </button>
        <a href="/" style={{ padding: "0.5rem 1rem" }}>
          Go home
        </a>
      </body>
    </html>
  );
}
