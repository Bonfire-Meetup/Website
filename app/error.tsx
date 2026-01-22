"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { Button } from "./components/ui/Button";
import { PAGE_ROUTES } from "./lib/routes/pages";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-neutral-900 dark:text-white">{t("title")}</h1>
        <p className="mb-8 text-neutral-600 dark:text-neutral-400">{t("message")}</p>
        <div className="flex justify-center gap-4">
          <Button onClick={reset} variant="primary">
            {t("tryAgain")}
          </Button>
          <Button href={PAGE_ROUTES.HOME} variant="secondary">
            {t("goHome")}
          </Button>
        </div>
      </div>
    </div>
  );
}
