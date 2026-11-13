"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import { StaticPageHero } from "@/components/layout/StaticPageHero";
import {
  BoltIcon,
  BuildingIcon,
  CameraIcon,
  FilmIcon,
  FireIcon,
  MicIcon,
  ShieldIcon,
  VideoIcon,
} from "@/components/shared/Icons";
import { SpeakerPhoto } from "@/components/speakers/SpeakerPhoto";
import { WEBSITE_URLS } from "@/lib/config/constants";
import { PAGE_ROUTES } from "@/lib/routes/pages";

interface TeamMember {
  /** Only set in the Hall of Fame: the chapter the person helped at. */
  city?: "prague" | "zlin";
  name: string;
  role: string;
}

interface TeamCity {
  name: string;
  tagline: string;
  members: TeamMember[];
}

type RoleIconType = "mic" | "video" | "camera" | "bolt" | "shield" | "building" | "film" | "fire";

const roleIconMap: Record<string, RoleIconType> = {
  fotografie: "camera",
  moderator: "mic",
  moderátor: "mic",
  nahrávání: "video",
  operations: "bolt",
  "operations, bodyguard": "shield",
  "operations, venue": "building",
  photography: "camera",
  produkce: "bolt",
  "produkce, bodyguard": "shield",
  "produkce, prostor": "building",
  recording: "video",
  "video, audio": "film",
};

function RoleIcon({ role, className }: { role: string; className?: string }) {
  const normalizedRole = role.toLowerCase();
  const iconType = roleIconMap[normalizedRole] || "fire";
  const icons: Record<RoleIconType, React.ReactNode> = {
    bolt: <BoltIcon className={className} />,
    building: <BuildingIcon className={className} />,
    camera: <CameraIcon className={className} />,
    film: <FilmIcon className={className} />,
    fire: <FireIcon className={className} />,
    mic: <MicIcon className={className} />,
    shield: <ShieldIcon className={className} />,
    video: <VideoIcon className={className} />,
  };
  return icons[iconType];
}

function renderWithBold(text: string) {
  const parts = text.split(/(?<bold>\*\*.*?\*\*)/gu);
  let offset = 0;
  return parts.map((part) => {
    const partOffset = offset;
    offset += part.length;

    if (part.startsWith("**") && part.endsWith("**")) {
      const content = part.slice(2, -2);
      return (
        <strong
          key={`bold-${partOffset}-${content.slice(0, 10)}`}
          className="font-semibold text-neutral-900 dark:text-white"
        >
          {content}
        </strong>
      );
    }
    return <span key={`text-${partOffset}`}>{part}</span>;
  });
}

const CITY_THEME = {
  prague: {
    avatar: "from-orange-500 to-rose-600",
    color: "var(--color-prague)",
    title: "from-rose-500 via-orange-500 to-amber-500",
  },
  alumni: {
    avatar: "from-neutral-400 to-neutral-600",
    color: "var(--color-neutral-500)",
    title: "from-neutral-500 to-neutral-400",
  },
  zlin: {
    avatar: "from-sky-500 to-indigo-600",
    color: "var(--color-zlin)",
    title: "from-blue-500 via-cyan-500 to-teal-500",
  },
} as const;

function CitySection({
  city,
  theme,
  crewEyebrow,
}: {
  city: TeamCity;
  theme: keyof typeof CITY_THEME;
  crewEyebrow: string;
}) {
  const tone = CITY_THEME[theme];
  const tCommon = useTranslations("common");
  const members = [...city.members].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section className="grid gap-x-12 gap-y-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="eyebrow text-xs" style={{ color: tone.color }}>
          {crewEyebrow}
        </p>
        <h2
          className={`mt-2 bg-gradient-to-r bg-clip-text pb-1 leading-none font-black tracking-tighter text-transparent ${theme === "alumni" ? "text-4xl sm:text-5xl" : "text-6xl sm:text-7xl"} ${tone.title}`}
        >
          {city.name}
        </h2>
        <p className="mt-4 text-neutral-600 dark:text-neutral-300">{city.tagline}</p>
      </div>

      <ul className="border-t border-neutral-200 dark:border-white/10">
        {members.map((member) => (
          <li
            key={`${city.name}-${member.name}`}
            className="flex items-center gap-4 border-b border-neutral-200 py-4 sm:gap-5 dark:border-white/10"
          >
            <SpeakerPhoto
              name={member.name}
              sizes="44px"
              className="w-11 shrink-0"
              initialsClassName="text-sm"
              gradientClassName={member.city ? CITY_THEME[member.city].avatar : tone.avatar}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
                {member.name}
              </p>
              {member.city && (
                <p
                  className="eyebrow text-2xs mt-1 flex items-center gap-1.5"
                  style={{ color: CITY_THEME[member.city].color }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {tCommon(member.city)}
                </p>
              )}
              <p className="tracking-label-sm text-2xs mt-0.5 font-mono text-neutral-500 uppercase sm:hidden dark:text-neutral-400">
                {member.role}
              </p>
            </div>
            <p className="tracking-label-sm flex shrink-0 items-center gap-2 text-right font-mono text-xs text-neutral-500 uppercase dark:text-neutral-400">
              <span className="hidden sm:inline">{member.role}</span>
              <span style={{ color: tone.color }}>
                <RoleIcon role={member.role} className="h-4 w-4" />
              </span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CrewPageContent() {
  const t = useTranslations("teamPage");
  const tCommon = useTranslations("common");
  const citiesRaw = t.raw("cities") as TeamCity[];
  const cities = citiesRaw.map((city) => ({
    ...city,
    name: city.name.replace("{prague}", tCommon("prague")).replace("{zlin}", tCommon("zlin")),
    tagline: city.tagline.replace("{prague}", tCommon("prague")).replace("{zlin}", tCommon("zlin")),
  }));
  const alumni = t.raw("alumni") as TeamCity & { eyebrow: string };
  const uniquePeopleCount = new Set(
    citiesRaw.flatMap((city) => city.members.map((member) => member.name)),
  ).size;
  const cityCount = citiesRaw.length;

  return (
    <main className="gradient-bg relative min-h-screen overflow-hidden">
      <StaticPageHero
        brandAccentClassName="bg-[radial-gradient(circle_at_center,var(--color-prague-glow-2),transparent_60%)]"
        containerClassName="mx-auto max-w-4xl text-center"
        eyebrow={t("eyebrow")}
        heroWord="THE CREW"
        heroWordSize="xxl"
        subtitle={
          <>
            <p className="mb-4 text-base text-neutral-600 sm:text-lg dark:text-neutral-400">
              {t("subtitle", { prague: tCommon("prague"), zlin: tCommon("zlin") })}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("stats", {
                prague: tCommon("prague"),
                zlin: tCommon("zlin"),
                people: uniquePeopleCount,
                cities: cityCount,
              })}
            </p>
          </>
        }
        subtitleClassName=""
        title={
          <h1 className="mb-4 text-4xl font-black tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl dark:text-white">
            <span className="block">{t("titlePart1")}</span>
            <span className="text-gradient block">{t("titleHighlight")}</span>
            <span className="block">{t("titlePart2")}</span>
          </h1>
        }
      />

      <div className="relative mx-auto max-w-5xl space-y-24 px-4 pb-24 sm:px-6">
        {cities[0] && (
          <CitySection city={cities[0]} theme="prague" crewEyebrow={t("crewEyebrow")} />
        )}
        {cities[1] && <CitySection city={cities[1]} theme="zlin" crewEyebrow={t("crewEyebrow")} />}
        {alumni.members.length > 0 && (
          <CitySection city={alumni} theme="alumni" crewEyebrow={alumni.eyebrow} />
        )}

        <div>
          <p className="text-neutral-600 dark:text-neutral-300">
            {t("joinCallout")}{" "}
            <a
              href={`mailto:${WEBSITE_URLS.CONTACT_EMAIL_CREW}`}
              className="text-brand-600 decoration-brand-600/30 hover:text-brand-700 hover:decoration-brand-600 dark:text-brand-400 dark:decoration-brand-400/30 dark:hover:text-brand-300 font-medium underline underline-offset-2 transition-colors"
            >
              {WEBSITE_URLS.CONTACT_EMAIL_CREW}
            </a>
            <span className="mx-1">{t("joinCalloutOr")}</span>
            <Link
              href={PAGE_ROUTES.CONTACT_WITH_TYPE("crew")}
              className="text-brand-600 decoration-brand-600/30 hover:text-brand-700 hover:decoration-brand-600 dark:text-brand-400 dark:decoration-brand-400/30 dark:hover:text-brand-300 font-medium underline underline-offset-2 transition-colors"
            >
              {t("joinCalloutContact")}
            </Link>
          </p>
        </div>

        <section
          aria-labelledby="founder-note-heading"
          className="shadow-floating relative mx-auto max-w-2xl rounded-sm bg-white px-7 py-10 ring-1 ring-black/5 sm:px-14 sm:py-14 dark:bg-neutral-900 dark:ring-white/10"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-rose-500 to-red-500" />

          <div className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-6 dark:border-white/10">
            <Image
              src="/assets/brand/RGB_SVG_01_bonfire_black_gradient.svg"
              alt="Bonfire"
              width={120}
              height={63}
              className="h-9 w-auto dark:hidden"
            />
            <Image
              src="/assets/brand/RGB_SVG_03_bonfire_white_gradient.svg"
              alt="Bonfire"
              width={120}
              height={63}
              className="hidden h-9 w-auto dark:block"
            />
            <p className="tracking-label-sm text-2xs text-right font-mono text-neutral-500 uppercase dark:text-neutral-400">
              {t("founderEyebrow")}
            </p>
          </div>

          <h2
            id="founder-note-heading"
            className="mt-8 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
          >
            {t("founderTitle")},
          </h2>
          <p className="mt-5 text-lg leading-8 text-neutral-700 dark:text-neutral-300">
            {renderWithBold(t("founderNote"))}
          </p>

          <div className="mt-10">
            <p className="text-2xl font-black tracking-tight text-neutral-900 italic dark:text-white">
              {t("founderSignature")}
            </p>
            <span className="mt-2 block h-0.5 w-16 bg-gradient-to-r from-orange-500 to-rose-500" />
          </div>
        </section>
      </div>
    </main>
  );
}
