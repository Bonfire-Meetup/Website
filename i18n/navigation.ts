import { createNavigation } from "next-intl/navigation";
import { localePrefix, locales } from "./routing";

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
  localePrefix,
});
