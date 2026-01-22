import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ThemeToggle } from "../theme/ThemeToggle";
import { LanguageToggle } from "../theme/LanguageToggle";
import { MobileMenu } from "./MobileMenu";
import { Button } from "../ui/Button";
import { AuthNavButton } from "../auth/AuthNavButton";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { type Locale } from "@/lib/i18n/locales";

export async function Header() {
  const t = await getTranslations("header");
  const tLang = await getTranslations("language");
  const locale = (await getLocale()) as Locale;

  const mobileLinks = [
    { href: PAGE_ROUTES.HOME, label: t("home") },
    { href: PAGE_ROUTES.ANCHOR.EVENTS, label: t("upcoming") },
    { href: PAGE_ROUTES.LIBRARY, label: t("library") },
    { href: PAGE_ROUTES.PHOTOS, label: t("photos") },
    { href: PAGE_ROUTES.CREW, label: t("crew") },
    { href: PAGE_ROUTES.PRESS, label: t("press") },
    { href: PAGE_ROUTES.CONTACT_WITH_TYPE("general"), label: t("contact") },
    { href: PAGE_ROUTES.LEGAL, label: t("codeOfConduct") },
  ];

  return (
    <header className="glass fixed top-0 right-0 left-0 z-50">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4">
        <div className="flex items-center gap-3 md:justify-self-start">
          <Link href={PAGE_ROUTES.HOME} className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <Image
              src="/assets/brand/RGB_PNG_01_bonfire_black_gradient.png"
              alt={t("logoAlt")}
              width={140}
              height={40}
              className="h-9 w-auto dark:hidden"
              priority
            />
            <Image
              src="/assets/brand/RGB_PNG_03_bonfire_white_gradient.png"
              alt={t("logoAlt")}
              width={140}
              height={40}
              className="hidden h-9 w-auto dark:block"
              priority
            />
          </Link>
        </div>

        <nav className="hidden items-center gap-2 md:flex md:justify-self-center">
          <Button href={PAGE_ROUTES.ANCHOR.TOP} variant="ghost" size="sm">
            {t("home")}
          </Button>
          <Button href={PAGE_ROUTES.ANCHOR.EVENTS} variant="ghost" size="sm">
            {t("upcoming")}
          </Button>
          <Button href={PAGE_ROUTES.PHOTOS} variant="ghost" size="sm">
            {t("photos")}
          </Button>
          <Button href={PAGE_ROUTES.CREW} variant="ghost" size="sm">
            {t("crew")}
          </Button>
          <Button href={PAGE_ROUTES.CONTACT_WITH_TYPE("general")} variant="ghost" size="sm">
            {t("contact")}
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
          <AuthNavButton />
          <Button href={PAGE_ROUTES.LIBRARY} variant="primary">
            {t("library")}
          </Button>
          <MobileMenu links={mobileLinks} menuLabel={t("menu")} closeLabel={t("close")} />
        </div>
      </div>
    </header>
  );
}
