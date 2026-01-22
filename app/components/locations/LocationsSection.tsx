import { getTranslations } from "next-intl/server";

import { LOCATIONS } from "@/lib/config/constants";

import { SectionHeader } from "../ui/SectionHeader";

import { LocationCard } from "./LocationCard";

export async function LocationsSection() {
  const t = await getTranslations("sections.locations");
  const tCommon = await getTranslations("common");

  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <SectionHeader
          id="locations"
          title={t("title")}
          subtitle={t("subtitle", {
            country: tCommon("country"),
            prague: tCommon("prague"),
            zlin: tCommon("zlin"),
          })}
        />

        <div className="grid gap-8 md:grid-cols-2">
          <LocationCard
            name={t("prague.name", { prague: tCommon("prague") })}
            city={LOCATIONS.PRAGUE}
            description={t("prague.description", { prague: tCommon("prague") })}
            eventCount={7}
            sponsorsTitle={t("sponsorsTitle")}
            sponsors={[
              {
                logo: "/partners/flyingrat_light.png",
                name: "Flying Rat Studio",
                url: "https://flying-rat.studio",
              },
              {
                logo: "/partners/visiongame_light.png",
                name: "Visiongame",
                url: "http://visiongame.cz/",
              },
              {
                logo: "/partners/space_break_light.png",
                logoClassName: "h-7 sm:h-8",
                name: "Space Break",
                url: "https://www.instagram.com/spacebreakcoffee/",
              },
            ]}
          />
          <LocationCard
            name={t("zlin.name", { zlin: tCommon("zlin") })}
            city={LOCATIONS.ZLIN}
            description={t("zlin.description", { zlin: tCommon("zlin") })}
            eventCount={5}
            sponsorsTitle={t("sponsorsTitle")}
            sponsors={[
              {
                logo: "/partners/flyingrat_light.png",
                name: "Flying Rat Studio",
                url: "https://flying-rat.studio",
              },
              {
                logo: "/partners/visiongame_light.png",
                name: "Visiongame",
                url: "http://visiongame.cz/",
              },
              {
                logo: "/partners/polyperfect_light.png",
                name: "Polyperfect",
                url: "https://www.polyperfect.com/",
              },
              {
                logo: "/partners/tomas_bata_university_light.png",
                name: "Tomas Bata University",
                url: "https://www.utb.cz/",
              },
              {
                logo: "/partners/upper_light.png",
                name: "Upper",
                url: "https://upper.utb.cz/",
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
