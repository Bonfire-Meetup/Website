import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import {
  BoltIcon,
  BuildingIcon,
  CameraIcon,
  FilmIcon,
  FireIcon,
  MicIcon,
  ShieldIcon,
  VideoIcon,
} from "@/components/shared/icons";
import { WEBSITE_URLS } from "@/lib/config/constants";
import { PAGE_ROUTES } from "@/lib/routes/pages";

interface TeamMember {
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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

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
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const content = part.slice(2, -2);
      return (
        <strong
          key={`bold-${i}-${content.slice(0, 10)}`}
          className="font-semibold text-neutral-700 dark:text-neutral-200"
        >
          {content}
        </strong>
      );
    }
    return <span key={`text-${i}`}>{part}</span>;
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const tCommon = await getTranslations("common");
  const commonValues = {
    brandName: tCommon("brandName"),
    country: tCommon("country"),
    prague: tCommon("prague"),
    zlin: tCommon("zlin"),
  };
  return {
    description: t("crewDescription", commonValues),
    openGraph: {
      description: t("crewDescription", commonValues),
      title: t("crewTitle", commonValues),
      type: "website",
    },
    title: t("crewTitle", commonValues),
    twitter: {
      card: "summary_large_image",
      description: t("crewDescription", commonValues),
      title: t("crewTitle", commonValues),
    },
  };
}

function MemberCard({
  member,
  cityTheme,
  index,
}: {
  member: TeamMember;
  cityTheme: "prague" | "zlin";
  index: number;
}) {
  const themeClasses =
    cityTheme === "prague"
      ? "from-rose-500/20 via-orange-500/10 to-transparent hover:from-rose-500/30 hover:via-orange-500/20 border-rose-500/20 hover:border-rose-500/40"
      : "from-blue-500/20 via-cyan-500/10 to-transparent hover:from-blue-500/30 hover:via-cyan-500/20 border-blue-500/20 hover:border-blue-500/40";

  const avatarTheme =
    cityTheme === "prague"
      ? "from-rose-500 to-orange-500 shadow-rose-500/30"
      : "from-blue-500 to-cyan-500 shadow-blue-500/30";

  const glowTheme =
    cityTheme === "prague"
      ? "group-hover:shadow-[0_0_40px_rgba(244,63,94,0.3)]"
      : "group-hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]";

  return (
    <div
      className={`group recording-card-enter relative stagger-${Math.min(index + 1, 8)}`}
      style={{ opacity: 0 }}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 transition-all duration-300 ${themeClasses} ${glowTheme}`}
      >
        <div className="relative flex items-center gap-4">
          <div
            className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${avatarTheme} shadow-lg transition-transform duration-300 group-hover:scale-110`}
          >
            <span className="text-lg font-bold text-white">{getInitials(member.name)}</span>
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg dark:bg-white/10">
              <RoleIcon role={member.role} className="h-3.5 w-3.5" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="group-hover:text-brand-600 dark:group-hover:text-brand-400 truncate text-lg font-bold text-neutral-900 transition-colors dark:text-white">
              {member.name}
            </h3>
            <p className="truncate text-sm font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
              {member.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CitySection({
  city,
  theme,
  t,
}: {
  city: TeamCity;
  theme: "prague" | "zlin";
  t: (key: string) => string;
}) {
  const headerGradient =
    theme === "prague"
      ? "from-rose-500 via-orange-500 to-amber-500"
      : "from-blue-500 via-cyan-500 to-teal-500";

  return (
    <section className="relative">
      <div className="relative">
        <div className="mb-8 flex items-end gap-4">
          <div className="flex-1">
            <p className="mb-2 text-xs font-bold tracking-[0.3em] text-neutral-500 uppercase dark:text-neutral-400">
              {t("crewEyebrow")}
            </p>
            <h2
              className={`bg-gradient-to-r bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl ${headerGradient}`}
            >
              {city.name}
            </h2>
          </div>
          <p className="hidden pb-2 text-sm text-neutral-500 italic sm:block dark:text-neutral-400">
            &ldquo;{city.tagline}&rdquo;
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...city.members]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((member, index) => (
              <MemberCard
                key={`${city.name}-${member.name}`}
                member={member}
                cityTheme={theme}
                index={index}
              />
            ))}
        </div>
      </div>
    </section>
  );
}

export default async function TeamPage() {
  const t = await getTranslations("teamPage");
  const tCommon = await getTranslations("common");
  const citiesRaw = t.raw("cities") as TeamCity[];

  const cities = citiesRaw.map((city) => ({
    ...city,
    name: city.name.replace("{prague}", tCommon("prague")).replace("{zlin}", tCommon("zlin")),
    tagline: city.tagline.replace("{prague}", tCommon("prague")).replace("{zlin}", tCommon("zlin")),
  }));

  return (
    <>
      <Header />
      <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 pt-28 pb-16 sm:min-h-[80vh] sm:pb-24">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.15),transparent_60%)]" />
            <div className="absolute top-1/3 left-0 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.1),transparent_60%)]" />
            <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.1),transparent_60%)]" />
          </div>

          <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap select-none">
            <span className="text-outline block text-[20vw] leading-none font-black opacity-[0.03] sm:text-[18vw] dark:opacity-[0.02]">
              THE CREW
            </span>
          </div>

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <p className="text-brand-600 dark:text-brand-300 mb-6 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.4em] uppercase sm:gap-3 sm:text-sm sm:tracking-[0.5em]">
              <span className="to-brand-400 h-px w-8 bg-gradient-to-r from-transparent sm:w-12" />
              {t("eyebrow")}
              <span className="to-brand-400 h-px w-8 bg-gradient-to-l from-transparent sm:w-12" />
            </p>

            <h1 className="mb-4 text-4xl font-black tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl dark:text-white">
              <span className="block">Meet the</span>
              <span className="text-gradient block">beautiful chaos</span>
              <span className="block">crew</span>
            </h1>

            <p className="mb-4 text-base text-neutral-600 sm:text-lg dark:text-neutral-400">
              {t("subtitle", { prague: tCommon("prague"), zlin: tCommon("zlin") })}
            </p>

            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("stats", { prague: tCommon("prague"), zlin: tCommon("zlin") })}
            </p>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center gap-2 text-neutral-500">
              <span className="text-xs tracking-widest uppercase">scroll</span>
              <div className="from-brand-500 h-8 w-px bg-gradient-to-b to-transparent" />
            </div>
          </div>
        </section>

        <div className="relative mx-auto max-w-6xl space-y-24 px-4 pb-24">
          {cities[0] && <CitySection city={cities[0]} theme="prague" t={t} />}

          <div className="relative py-8">
            <div className="via-brand-500/30 absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent to-transparent" />
            <div className="bg-brand-500/50 absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-sm" />
          </div>

          {cities[1] && <CitySection city={cities[1]} theme="zlin" t={t} />}

          <div className="text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("joinCallout")}{" "}
              <a
                href={`mailto:${WEBSITE_URLS.CONTACT_EMAIL_CREW}`}
                className="text-brand-600 decoration-brand-600/30 hover:text-brand-700 hover:decoration-brand-600 dark:text-brand-400 dark:decoration-brand-400/30 dark:hover:text-brand-300 font-medium underline underline-offset-2 transition-colors"
              >
                {WEBSITE_URLS.CONTACT_EMAIL_CREW}
              </a>
              <span className="mx-1">{t("joinCalloutOr")}</span>
              <a
                href={PAGE_ROUTES.CONTACT_WITH_TYPE("crew")}
                className="text-brand-600 decoration-brand-600/30 hover:text-brand-700 hover:decoration-brand-600 dark:text-brand-400 dark:decoration-brand-400/30 dark:hover:text-brand-300 font-medium underline underline-offset-2 transition-colors"
              >
                {t("joinCalloutContact")}
              </a>
            </p>
          </div>

          <section className="relative mx-auto max-w-3xl">
            <div className="border-brand-500/10 from-brand-500/5 relative overflow-hidden rounded-2xl border bg-gradient-to-br via-transparent to-rose-500/5 px-6 py-8">
              <div className="relative text-center">
                <p className="text-brand-600/70 dark:text-brand-400/70 mb-2 text-xs font-medium tracking-widest uppercase">
                  {t("founderEyebrow")}
                </p>

                <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
                  {t("founderTitle")}
                </h2>

                <blockquote className="mx-auto max-w-2xl">
                  <p className="text-base leading-relaxed text-neutral-500 italic sm:text-lg dark:text-neutral-400">
                    &ldquo;{renderWithBold(t("founderNote"))}&rdquo;
                  </p>
                  <p className="mt-4 text-right text-sm font-medium text-neutral-600 dark:text-neutral-300">
                    — {t("founderSignature")}
                  </p>
                </blockquote>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
