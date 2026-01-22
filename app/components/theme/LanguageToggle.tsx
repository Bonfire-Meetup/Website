"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconButton } from "../ui/IconButton";

type LanguageToggleProps = {
  locale: string;
  labels: {
    csLabel: string;
    enLabel: string;
    switchToCs: string;
    switchToEn: string;
  };
  onLocaleChange?: (locale: string) => void;
};

export function LanguageToggle({ locale, labels, onLocaleChange }: LanguageToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const newLocale = locale === "en" ? "cs" : "en";

    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
      router.refresh();
      onLocaleChange?.(newLocale);
    });
  };

  return (
    <IconButton
      onClick={toggleLocale}
      disabled={isPending}
      ariaLabel={locale === "en" ? labels.switchToCs : labels.switchToEn}
      size="pill"
      shape="rounded"
      variant="glass"
      className="text-sm font-medium hover:scale-105 active:scale-95 disabled:opacity-50"
    >
      <span className="uppercase">{locale === "en" ? labels.csLabel : labels.enLabel}</span>
    </IconButton>
  );
}
