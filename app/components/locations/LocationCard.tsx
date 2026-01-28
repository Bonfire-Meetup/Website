"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { LOCATIONS, type LocationValue } from "@/lib/config/constants";

import { FireIcon, MapPinIcon } from "../shared/icons";

interface LocationCardProps {
  name: string;
  city: LocationValue;
  description: string;
  eventCount: number;
  sponsorsTitle: string;
  sponsors: { name: string; logo: string; url: string; logoClassName?: string }[];
}

export function LocationCard({
  name,
  city,
  description,
  eventCount,
  sponsorsTitle,
  sponsors,
}: LocationCardProps) {
  const t = useTranslations("sections.locations");
  const tCommon = useTranslations("common");
  const logoDark =
    city === LOCATIONS.PRAGUE
      ? "/assets/brand/RGB_PNG_04_bonfire-prague_black_gradient.png"
      : "/assets/brand/RGB_PNG_07_bonfire-zlin_black_symbol_gradient.png";
  const logoLight =
    city === LOCATIONS.PRAGUE
      ? "/assets/brand/RGB_PNG_06_bonfire-prague_white_symbol_gradient.png"
      : "/assets/brand/RGB_PNG_09_bonfire-zlin_white_symbol_gradient.png";

  return (
    <div className="glass-card group relative p-8 sm:p-10">
      <div
        className={`pointer-events-none absolute top-0 right-0 h-56 w-56 translate-x-16 -translate-y-16 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-70 ${
          city === LOCATIONS.PRAGUE
            ? "bg-gradient-to-br from-red-400/30 to-rose-500/20 opacity-50"
            : "bg-gradient-to-br from-blue-400/30 to-indigo-500/20 opacity-50"
        }`}
      />

      <div className="relative">
        <div className="mb-8 flex items-center gap-4">
          <Image
            src={logoDark}
            alt={name}
            width={200}
            height={67}
            className="h-14 w-auto dark:hidden"
          />
          <Image
            src={logoLight}
            alt={name}
            width={200}
            height={67}
            className="hidden h-14 w-auto dark:block"
          />
        </div>

        <div className="mb-5 flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              city === LOCATIONS.PRAGUE
                ? "bg-red-100/80 dark:bg-red-500/10"
                : "bg-blue-100/80 dark:bg-blue-500/10"
            }`}
          >
            <MapPinIcon
              className={`h-5 w-5 ${city === LOCATIONS.PRAGUE ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}
            />
          </div>
          <span className="text-lg font-semibold text-neutral-900 dark:text-white">
            {city}, {t("country", { country: tCommon("country") })}
          </span>
        </div>

        <p className="mb-7 leading-relaxed text-neutral-600 dark:text-neutral-300">{description}</p>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
              city === LOCATIONS.PRAGUE
                ? "bg-red-100/80 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                : "bg-blue-100/80 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
            }`}
          >
            <FireIcon className="h-4 w-4" />
            {t("eventsHosted", { count: eventCount })}
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-xs font-semibold tracking-[0.28em] text-neutral-500 uppercase dark:text-neutral-400">
            {sponsorsTitle}
          </p>
          <div className="flex flex-wrap gap-3">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.name}
                className="flex items-center justify-center rounded-2xl bg-neutral-900/85 px-3 py-2 shadow-sm ring-1 shadow-black/20 ring-black/20 backdrop-blur dark:bg-white/5 dark:shadow-black/30 dark:ring-white/10"
              >
                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-80"
                  aria-label={t("websiteLabel", { name: sponsor.name })}
                >
                  <Image
                    src={sponsor.logo}
                    alt={sponsor.name}
                    width={140}
                    height={48}
                    className={`h-6 w-auto object-contain opacity-90 ${sponsor.logoClassName ?? ""}`}
                  />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
