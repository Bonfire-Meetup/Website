import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { MobileBackButton } from "./MobileBackButton";

export async function Header() {
  const t = await getTranslations("header");
  const tLang = await getTranslations("language");
  const locale = await getLocale();

  return (
    <header className="glass fixed top-0 right-0 left-0 z-50">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <MobileBackButton label={t("back")} />
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
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
          </Link>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          <Link
            href="/#top"
            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 transition-all duration-300 hover:bg-brand-100/60 hover:text-brand-700 dark:text-neutral-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
          >
            {t("home")}
          </Link>
          <Link
            href="/#events"
            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 transition-all duration-300 hover:bg-brand-100/60 hover:text-brand-700 dark:text-neutral-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
          >
            {t("events")}
          </Link>
          <Link
            href="/#locations"
            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 transition-all duration-300 hover:bg-brand-100/60 hover:text-brand-700 dark:text-neutral-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
          >
            {t("locations")}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageToggle
            locale={locale}
            labels={{
              csLabel: tLang("csLabel"),
              enLabel: tLang("enLabel"),
              switchToCs: tLang("switchTo", { language: tLang("czech") }),
              switchToEn: tLang("switchTo", { language: tLang("english") }),
            }}
          />
          <ThemeToggle />
          <Link
            href="/library"
            className="hidden rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500 md:inline-flex dark:bg-brand-500 dark:shadow-brand-500/30 dark:hover:bg-brand-400"
          >
            {t("library")}
          </Link>
          <Link
            href="/library"
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500 md:hidden dark:bg-brand-500 dark:shadow-brand-500/30 dark:hover:bg-brand-400"
          >
            {t("library")}
          </Link>
        </div>
      </div>
    </header>
  );
}
