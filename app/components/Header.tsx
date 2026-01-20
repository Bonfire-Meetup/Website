import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { MobileBackButton } from "./MobileBackButton";
import { Button } from "./Button";

export async function Header() {
  const t = await getTranslations("header");
  const tLang = await getTranslations("language");
  const locale = await getLocale();

  return (
    <header className="glass fixed top-0 right-0 left-0 z-50">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4">
        <div className="flex items-center gap-3 md:justify-self-start">
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

        <nav className="hidden items-center gap-2 md:flex md:justify-self-center">
          <Button href="/#top" variant="ghost" size="sm">
            {t("home")}
          </Button>
          <Button href="/#events" variant="ghost" size="sm">
            {t("upcoming")}
          </Button>
          <Button href="/crew" variant="ghost" size="sm">
            {t("crew")}
          </Button>
        </nav>
        <div className="flex items-center gap-2 md:justify-self-end">
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
          <Button href="/library" variant="primary">
            {t("library")}
          </Button>
        </div>
      </div>
    </header>
  );
}
