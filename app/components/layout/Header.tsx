"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import { PAGE_ROUTES } from "@/lib/routes/pages";

import { AuthNavButton } from "../auth/AuthNavButton";
import { LanguageToggle } from "../theme/LanguageToggle";
import { ThemeToggle } from "../theme/ThemeToggle";
import { Button } from "../ui/Button";

export function Header() {
  const t = useTranslations("header");

  return (
    <header className="glass fixed top-0 right-0 left-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 md:grid md:h-18 md:grid-cols-[1fr_auto_1fr] md:gap-4 lg:px-8">
        <div className="flex items-center gap-3 md:justify-self-start">
          <Link
            href={PAGE_ROUTES.HOME}
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <Image
              src="/assets/brand/RGB_PNG_01_bonfire_black_gradient.png"
              alt={t("logoAlt")}
              width={140}
              height={40}
              className="h-8 w-auto md:h-9 dark:hidden"
              priority
            />
            <Image
              src="/assets/brand/RGB_PNG_03_bonfire_white_gradient.png"
              alt={t("logoAlt")}
              width={140}
              height={40}
              className="hidden h-8 w-auto md:h-9 dark:block"
              priority
            />
          </Link>
        </div>

        <nav className="hidden items-center gap-2 md:flex md:justify-self-center">
          <Button href={PAGE_ROUTES.ANCHOR.TOP} variant="ghost" size="sm">
            {t("home")}
          </Button>
          <Button href={PAGE_ROUTES.EVENT_UPCOMING} variant="ghost" size="sm">
            {t("upcoming")}
          </Button>
          <Button href={PAGE_ROUTES.PHOTOS} variant="ghost" size="sm">
            {t("photos")}
          </Button>
          <Button href={PAGE_ROUTES.CREW} variant="ghost" size="sm">
            {t("crew")}
          </Button>
          <Button href={PAGE_ROUTES.FAQ} variant="ghost" size="sm" prefetch={false}>
            {t("faq")}
          </Button>
          <Button href={PAGE_ROUTES.CONTACT_WITH_TYPE("general")} variant="ghost" size="sm">
            {t("contact")}
          </Button>
        </nav>

        <div className="flex items-center gap-2 md:justify-self-end">
          <div className="hidden md:flex md:items-center md:gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <div className="hidden md:block">
            <AuthNavButton />
          </div>
          <Button
            href={PAGE_ROUTES.LIBRARY}
            variant="primary"
            size="sm"
            className="md:size-[default]"
          >
            {t("library")}
          </Button>
        </div>
      </div>
    </header>
  );
}
