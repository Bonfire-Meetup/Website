import { getTranslations } from "next-intl/server";
import { LocationCard } from "./LocationCard";
import { SectionHeader } from "../ui/SectionHeader";
import { LOCATIONS } from "@/lib/config/constants";

export async function LocationsSection() {
  const t = await getTranslations("sections.locations");
  const tCommon = await getTranslations("common");

  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <SectionHeader
          id="locations"
          title={t("title")}
          subtitle={t("subtitle", { country: tCommon("country") })}
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
            name={t("zlin.name", { zlin: tCommon("zlin") })}
            city={LOCATIONS.ZLIN}
            description={t("zlin.description", { zlin: tCommon("zlin") })}
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
                url: "https://www.utb.cz/",
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
