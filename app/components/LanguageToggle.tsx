"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface LanguageToggleProps {
  locale: string;
  labels: {
    csLabel: string;
    enLabel: string;
    switchToCs: string;
    switchToEn: string;
  };
}

export function LanguageToggle({ locale, labels }: LanguageToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const newLocale = locale === "en" ? "cs" : "en";

    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
      router.refresh();
    });
  };

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      className="glass flex h-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
      aria-label={locale === "en" ? labels.switchToCs : labels.switchToEn}
    >
      <span className="uppercase">{locale === "en" ? labels.csLabel : labels.enLabel}</span>
    </button>
  );
}
