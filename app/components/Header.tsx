import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";

export async function Header() {
  const t = await getTranslations("header");

  return (
    <header className="glass fixed top-0 right-0 left-0 z-50">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <Image
            src="/bonfire_logo_dark.png"
            alt={t("logoAlt")}
            width={140}
            height={40}
            className="h-9 w-auto dark:hidden"
            priority
          />
          <Image
            src="/bonfire_logo_light.png"
            alt={t("logoAlt")}
            width={140}
            height={40}
            className="hidden h-9 w-auto dark:block"
            priority
          />
        </a>

        <nav className="hidden items-center gap-2 md:flex">
          <a
            href="/#events"
            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 transition-all duration-300 hover:bg-brand-100/60 hover:text-brand-700 dark:text-neutral-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
          >
            {t("events")}
          </a>
          <a
            href="/recordings"
            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 transition-all duration-300 hover:bg-brand-100/60 hover:text-brand-700 dark:text-neutral-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
          >
            {t("recordings")}
          </a>
          <a
            href="/#locations"
            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 transition-all duration-300 hover:bg-brand-100/60 hover:text-brand-700 dark:text-neutral-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
          >
            {t("locations")}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
