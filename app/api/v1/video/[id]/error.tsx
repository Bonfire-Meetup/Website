"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/app/components/ui/Button";

export default function VideoApiError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error("Video API error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-neutral-900 dark:text-white">
          {t("api.title")}
        </h1>
        <p className="mb-8 text-neutral-600 dark:text-neutral-400">{t("api.message")}</p>
        <Button onClick={reset} variant="primary">
          {t("tryAgain")}
        </Button>
      </div>
    </div>
  );
}
