import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

type TeamMember = {
  name: string;
  role: string;
};

type TeamCity = {
  name: string;
  tagline: string;
  members: TeamMember[];
};

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
      />
    </svg>
  );
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
      />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
      />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
      />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
      />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"
      />
    </svg>
  );
}

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0 1 18 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 0 1 6 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5"
      />
    </svg>
  );
}

function FireIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"
      />
    </svg>
  );
}

type RoleIconType = "mic" | "video" | "camera" | "bolt" | "shield" | "building" | "film" | "fire";

const roleIconMap: Record<string, RoleIconType> = {
  moderator: "mic",
  moderátor: "mic",
  recording: "video",
  nahrávání: "video",
  photography: "camera",
  fotografie: "camera",
  operations: "bolt",
  produkce: "bolt",
  "video, audio": "film",
  "operations, bodyguard": "shield",
  "produkce, bodyguard": "shield",
  "operations, venue": "building",
  "produkce, prostor": "building",
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
    mic: <MicIcon className={className} />,
    video: <VideoIcon className={className} />,
    camera: <CameraIcon className={className} />,
    bolt: <BoltIcon className={className} />,
    shield: <ShieldIcon className={className} />,
    building: <BuildingIcon className={className} />,
    film: <FilmIcon className={className} />,
    fire: <FireIcon className={className} />,
  };

  return icons[iconType];
}

function renderWithBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const content = part.slice(2, -2);
      return (
        <strong key={i} className="font-semibold text-neutral-700 dark:text-neutral-200">
          {content}
        </strong>
      );
    }
    return part;
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: t("crewTitle"),
    description: t("crewDescription"),
    openGraph: {
      title: t("crewTitle"),
      description: t("crewDescription"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("crewTitle"),
      description: t("crewDescription"),
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
      className={`group relative recording-card-enter stagger-${Math.min(index + 1, 8)}`}
      style={{ opacity: 0 }}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 transition-all duration-300 ${themeClasses} ${glowTheme}`}
      >
        <div className="relative flex items-center gap-4">
          {/* Avatar with initials */}
          <div
            className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${avatarTheme} shadow-lg transition-transform duration-300 group-hover:scale-110`}
          >
            <span className="text-lg font-bold text-white">{getInitials(member.name)}</span>
            {/* Floating role icon */}
            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg dark:bg-white/10">
              <RoleIcon role={member.role} className="h-3.5 w-3.5" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-neutral-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
              {member.name}
            </h3>
            <p className="truncate text-sm font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
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
        {/* City header */}
        <div className="mb-8 flex items-end gap-4">
          <div className="flex-1">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
              {t("crewEyebrow")}
            </p>
            <h2
              className={`bg-gradient-to-r bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl ${headerGradient}`}
            >
              {city.name}
            </h2>
          </div>
          <p className="hidden pb-2 text-sm italic text-neutral-500 sm:block dark:text-neutral-400">
            "{city.tagline}"
          </p>
        </div>

        {/* Members grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {city.members.map((member, index) => (
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
  const cities = t.raw("cities") as TeamCity[];

  return (
    <>
      <Header />
      <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        {/* Hero Section */}
        <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 pb-16 pt-28 sm:min-h-[80vh] sm:pb-24">
          {/* Static gradient background */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.15),transparent_60%)]" />
            <div className="absolute left-0 top-1/3 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.1),transparent_60%)]" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.1),transparent_60%)]" />
          </div>

          {/* Huge background text */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap">
            <span className="text-outline block text-[20vw] font-black leading-none opacity-[0.03] sm:text-[18vw] dark:opacity-[0.02]">
              THE CREW
            </span>
          </div>

          {/* Content */}
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <p className="mb-6 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.4em] text-brand-600 sm:gap-3 sm:text-sm sm:tracking-[0.5em] dark:text-brand-300">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-brand-400 sm:w-12" />
              {t("eyebrow")}
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-brand-400 sm:w-12" />
            </p>

            <h1 className="mb-8 text-4xl font-black tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl dark:text-white">
              <span className="block">Meet the</span>
              <span className="text-gradient block">beautiful chaos</span>
              <span className="block">crew</span>
            </h1>

            {/* Stats */}
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("stats")}</p>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center gap-2 text-neutral-500">
              <span className="text-xs uppercase tracking-widest">scroll</span>
              <div className="h-8 w-px bg-gradient-to-b from-brand-500 to-transparent" />
            </div>
          </div>
        </section>

        {/* Cities sections */}
        <div className="relative mx-auto max-w-6xl space-y-24 px-4 pb-24">
          {/* Prague */}
          {cities[0] && <CitySection city={cities[0]} theme="prague" t={t} />}

          {/* Divider */}
          <div className="relative py-8">
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
            <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-sm bg-brand-500/50" />
          </div>

          {/* Zlin */}
          {cities[1] && <CitySection city={cities[1]} theme="zlin" t={t} />}

          {/* Join callout */}
          <div className="text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("joinCallout")}{" "}
              <a
                href="mailto:hello+crew@bnf.events"
                className="font-medium text-brand-600 underline decoration-brand-600/30 underline-offset-2 transition-colors hover:text-brand-700 hover:decoration-brand-600 dark:text-brand-400 dark:decoration-brand-400/30 dark:hover:text-brand-300"
              >
                hello+crew@bnf.events
              </a>
            </p>
          </div>

          {/* Founder section */}
          <section className="relative mx-auto max-w-3xl">
            <div className="relative overflow-hidden rounded-2xl border border-brand-500/10 bg-gradient-to-br from-brand-500/5 via-transparent to-rose-500/5 px-6 py-8">
              <div className="relative text-center">
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-brand-600/70 dark:text-brand-400/70">
                  {t("founderEyebrow")}
                </p>

                <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
                  {t("founderTitle")}
                </h2>

                <blockquote className="mx-auto max-w-2xl">
                  <p className="text-base italic leading-relaxed text-neutral-500 sm:text-lg dark:text-neutral-400">
                    "{renderWithBold(t("founderNote"))}"
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
