"use client";

import { useTranslations } from "next-intl";

import { getLocationPartners } from "@/data/location-partners";
import { LOCATIONS } from "@/lib/config/constants";
import { hostedEventCountOf } from "@/lib/events/event-lists";
import type { EventItem } from "@/lib/events/types";

import { SectionHeader } from "../ui/SectionHeader";

import { LocationCard } from "./LocationCard";

export function LocationsSection({ events }: { events: EventItem[] }) {
  const t = useTranslations("sections.locations");
  const tCommon = useTranslations("common");
  const now = new Date();

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
            eventCount={hostedEventCountOf(events, LOCATIONS.PRAGUE, now)}
            sponsorsTitle={t("sponsorsTitle")}
            sponsors={getLocationPartners(LOCATIONS.PRAGUE)}
          />
          <LocationCard
            name={t("zlin.name", { zlin: tCommon("zlin") })}
            city={LOCATIONS.ZLIN}
            description={t("zlin.description", { zlin: tCommon("zlin") })}
            eventCount={hostedEventCountOf(events, LOCATIONS.ZLIN, now)}
            sponsorsTitle={t("sponsorsTitle")}
            sponsors={getLocationPartners(LOCATIONS.ZLIN)}
          />
        </div>
      </div>
    </section>
  );
}
