import { getTranslations } from "next-intl/server";
import { LocationCard } from "./LocationCard";
import { LOCATIONS } from "../lib/constants";

export async function LocationsSection() {
  const t = await getTranslations("sections.locations");

  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div id="locations" className="mb-16 scroll-mt-24 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <LocationCard
            name={t("prague.name")}
            city={LOCATIONS.PRAGUE}
            description={t("prague.description")}
            eventCount={7}
            sponsorsTitle={t("sponsorsTitle")}
            sponsors={[
              {
                name: "Flying Rat Studio",
                logo: "/partners/flyingrat_light.png",
                url: "https://flying-rat.studio",
              },
              {
                name: "Visiongame",
                logo: "/partners/visiongame_light.png",
                url: "http://visiongame.cz/",
              },
              {
                name: "Space Break",
                logo: "/partners/space_break_light.png",
                url: "https://www.instagram.com/spacebreakcoffee/",
                logoClassName: "h-7 sm:h-8",
              },
            ]}
          />
          <LocationCard
            name={t("zlin.name")}
            city={LOCATIONS.ZLIN}
            description={t("zlin.description")}
            eventCount={5}
            sponsorsTitle={t("sponsorsTitle")}
            sponsors={[
              {
                name: "Flying Rat Studio",
                logo: "/partners/flyingrat_light.png",
                url: "https://flying-rat.studio",
              },
              {
                name: "Visiongame",
                logo: "/partners/visiongame_light.png",
                url: "http://visiongame.cz/",
              },
              {
                name: "Polyperfect",
                logo: "/partners/polyperfect_light.png",
                url: "https://www.polyperfect.com/",
              },
              {
                name: "Tomas Bata University",
                logo: "/partners/tomas_bata_university_light.png",
                url: "https://www.utb.cz/en/",
              },
              {
                name: "Upper",
                logo: "/partners/upper_light.png",
                url: "https://upper.utb.cz/",
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
