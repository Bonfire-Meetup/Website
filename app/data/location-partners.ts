import { LOCATIONS, WEBSITE_URLS, type LocationValue } from "@/lib/config/constants";

export interface LocationPartner {
  name: string;
  logo: string;
  url: string;
  logoClassName?: string;
}

const PRAGUE_PARTNERS: LocationPartner[] = [
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

export function getLocationPartners(location: LocationValue): LocationPartner[] {
  return PARTNERS_BY_LOCATION[location] ?? [];
}
