import { LOCATIONS, WEBSITE_URLS, type LocationValue } from "@/lib/config/constants";

export interface LocationPartner {
  name: string;
  logo: string;
  url: string;
  logoClassName?: string;
}

const THE_PITCHERS_FIRST_EVENT_DATE = "2026-11-26";

const PRAGUE_BASE_PARTNERS: LocationPartner[] = [
  {
    logo: "/partners/flyingrat_light.png",
    name: "Flying Rat Studio",
    url: WEBSITE_URLS.PARTNERS.FLYING_RAT,
  },
  {
    logo: "/partners/visiongame_light.png",
    name: "Visiongame",
    url: WEBSITE_URLS.PARTNERS.VISIONGAME,
  },
];

const PRAGUE_PARTNERS: LocationPartner[] = [
  ...PRAGUE_BASE_PARTNERS,
  {
    logo: "/partners/the_pitchers_light.png",
    logoClassName: "h-8 sm:h-10",
    name: "The Pitchers",
    url: WEBSITE_URLS.PARTNERS.THE_PITCHERS,
  },
];

const PRAGUE_SPACE_BREAK_ERA_PARTNERS: LocationPartner[] = [
  ...PRAGUE_BASE_PARTNERS,
  {
    logo: "/partners/space_break_light.png",
    logoClassName: "h-7 sm:h-8",
    name: "Space Break",
    url: WEBSITE_URLS.PARTNERS.SPACE_BREAK,
  },
];

const ZLIN_PARTNERS: LocationPartner[] = [
  {
    logo: "/partners/flyingrat_light.png",
    name: "Flying Rat Studio",
    url: WEBSITE_URLS.PARTNERS.FLYING_RAT,
  },
  {
    logo: "/partners/visiongame_light.png",
    name: "Visiongame",
    url: WEBSITE_URLS.PARTNERS.VISIONGAME,
  },
  {
    logo: "/partners/polyperfect_light.png",
    name: "Polyperfect",
    url: WEBSITE_URLS.PARTNERS.POLYPERFECT,
  },
  {
    logo: "/partners/tomas_bata_university_light.png",
    name: "Tomas Bata University",
    url: WEBSITE_URLS.PARTNERS.UTB,
  },
  {
    logo: "/partners/upper_light.png",
    name: "Upper",
    url: WEBSITE_URLS.PARTNERS.UPPER_UTB,
  },
];

const PARTNERS_BY_LOCATION: Record<LocationValue, LocationPartner[]> = {
  [LOCATIONS.PRAGUE]: PRAGUE_PARTNERS,
  [LOCATIONS.ZLIN]: ZLIN_PARTNERS,
};

export function getLocationPartners(
  location: LocationValue,
  eventDate?: string,
): LocationPartner[] {
  if (location === LOCATIONS.PRAGUE && eventDate && eventDate < THE_PITCHERS_FIRST_EVENT_DATE) {
    return PRAGUE_SPACE_BREAK_ERA_PARTNERS;
  }

  return PARTNERS_BY_LOCATION[location] ?? [];
}
