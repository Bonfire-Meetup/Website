"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [unsubscribedEmail, setUnsubscribedEmail] = useState("");

  const handleUnsubscribe = async () => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid unsubscribe link");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/v1/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setUnsubscribedEmail(data.email);
      } else {
        setStatus("error");
        setErrorMessage(
          data.error === "not_subscribed"
            ? "You are not subscribed to our newsletter"
            : "Failed to unsubscribe",
        );
      }
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 px-4 pt-32 pb-24 dark:bg-neutral-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-9),transparent_62%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-lg text-center">
        <h1 className="mb-4 text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
          Newsletter
        </h1>

        {status === "success" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 dark:border-emerald-900 dark:bg-emerald-950/30">
            <p className="mb-2 text-lg font-semibold text-emerald-800 dark:text-emerald-200">
              Successfully unsubscribed
            </p>
            <p className="text-emerald-700 dark:text-emerald-300">
              {unsubscribedEmail} has been removed from our newsletter
            </p>
          </div>
        ) : status === "error" ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 dark:border-red-900 dark:bg-red-950/30">
            <p className="mb-2 text-lg font-semibold text-red-800 dark:text-red-200">
              Unable to unsubscribe
            </p>
            <p className="text-red-700 dark:text-red-300">{errorMessage}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white/80 p-8 backdrop-blur-sm dark:border-neutral-800 dark:bg-white/5">
            <p className="mb-6 text-neutral-600 dark:text-neutral-400">
              Are you sure you want to unsubscribe from the Bonfire newsletter?
            </p>
            <Button
              onClick={handleUnsubscribe}
              disabled={!token || status === "loading"}
              variant="ghost"
            >
              {status === "loading" ? "Unsubscribing..." : "Unsubscribe"}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
