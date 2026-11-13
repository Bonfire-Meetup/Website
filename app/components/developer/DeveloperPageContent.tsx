"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { StaticPageHero } from "@/components/layout/StaticPageHero";
import { AccentBar } from "@/components/ui/AccentBar";
import type { ApiAccess, ApiEndpoint, ApiReference } from "@/lib/api/reference/types";
import { WEBSITE_URLS } from "@/lib/config/constants";

import { ApiEndpointCard } from "./ApiEndpointCard";

const ACCESS_FILTERS = ["all", "public", "signedIn", "roles", "machine"] as const;

type AccessFilter = (typeof ACCESS_FILTERS)[number];

const ACCESS_FILTER_KINDS: Record<Exclude<AccessFilter, "all">, ApiAccess["kind"][]> = {
  machine: ["secret", "signature"],
  public: ["public", "optional-user"],
  roles: ["role"],
  signedIn: ["user", "self"],
};

const API_BASE_URL = `${WEBSITE_URLS.BASE}/api/v1`;

const QUICK_REFERENCE = [
  { key: "baseUrl", values: [API_BASE_URL] },
  { key: "auth", values: ["Authorization: Bearer <token>"] },
  { key: "errors", values: ['{ "error": "<code>" }'] },
  { key: "success", values: ['{ "ok": true }', "201 Created", '{ "items": [] }'] },
] as const;

const matchesQuery = (endpoint: ApiEndpoint, query: string) => {
  const needle = query.trim().toLowerCase();

  if (!needle) {
    return true;
  }

  const haystack = [
    endpoint.method,
    endpoint.path,
    endpoint.summary,
    endpoint.description,
    endpoint.access.kind === "role" ? endpoint.access.role : endpoint.access.kind,
    ...endpoint.responses.map((response) => response.error),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return needle.split(/\s+/u).every((word) => haystack.includes(word));
};

const groupAnchor = (name: string) => `group-${name}`;

export function DeveloperPageContent({ reference }: { reference: ApiReference }) {
  const t = useTranslations("developerPage");
  const [query, setQuery] = useState("");
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");

  const groupLabel = (name: string) =>
    t.has(`groups.${name}`) ? t(`groups.${name}`) : name.replace(/-/gu, " ");
  const visibleGroups = reference.groups
    .map((group) => ({
      ...group,
      endpoints: group.endpoints.filter(
        (endpoint) =>
          (accessFilter === "all" ||
            ACCESS_FILTER_KINDS[accessFilter].includes(endpoint.access.kind)) &&
          matchesQuery(endpoint, query),
      ),
    }))
    .filter((group) => group.endpoints.length > 0);

  return (
    <main className="gradient-bg-static relative min-h-screen px-2 pt-28 pb-16 sm:px-4 sm:pt-32 sm:pb-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-9),transparent_62%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <StaticPageHero
          backgroundVariant="none"
          containerClassName="mx-auto max-w-2xl text-center"
          eyebrow={t("eyebrow")}
          sectionPreset="inline"
          subtitle={t("subtitle")}
          title={
            <div className="flex items-center justify-center gap-4">
              <AccentBar />
              <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-5xl dark:text-white">
                {t("title")}
              </h1>
            </div>
          }
        >
          <ul className="mt-5 flex flex-wrap justify-center gap-2">
            {[
              t("chips.endpoints", { count: reference.endpointCount }),
              t("chips.groups", { count: reference.groups.length }),
              t("chips.generated"),
            ].map((chip) => (
              <li
                key={chip}
                className="surface rounded-full px-3 py-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300"
              >
                {chip}
              </li>
            ))}
          </ul>
        </StaticPageHero>

        <section
          aria-label={t("quickRef.title")}
          className="surface mb-10 grid overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        >
          <dl className="grid content-center gap-x-6 gap-y-3 p-5 sm:grid-cols-[7rem_minmax(0,1fr)] sm:p-6">
            {QUICK_REFERENCE.map((row) => (
              <div key={row.key} className="contents">
                <dt className="eyebrow text-2xs pt-1 text-neutral-500 dark:text-neutral-400">
                  {t(`quickRef.${row.key}`)}
                </dt>
                <dd className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {row.values.map((value) => (
                    <code
                      key={value}
                      className="surface-inset px-2 py-1 font-mono text-xs text-neutral-800 dark:text-neutral-100"
                    >
                      {value}
                    </code>
                  ))}
                  {row.key === "auth" ? <span>{t("quickRef.authNote")}</span> : null}
                </dd>
              </div>
            ))}
          </dl>
          <pre className="overflow-x-auto bg-neutral-950 p-5 font-mono text-xs leading-relaxed text-neutral-300 sm:p-6">
            <code>
              <span className="text-neutral-500">$ </span>
              {`curl ${API_BASE_URL}/me \\\n    -H "Authorization: Bearer $TOKEN"`}
              {"\n\n"}
              <span className="text-amber-400">HTTP 401</span>
              {"\n"}
              <span className="text-emerald-300">{`{ "error": "unauthorized" }`}</span>
            </code>
          </pre>
        </section>

        <div className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <nav aria-label={t("nav")} className="sticky top-28 flex flex-col gap-1">
              <span className="eyebrow mb-2 text-xs text-neutral-500 dark:text-neutral-400">
                {t("nav")}
              </span>
              {visibleGroups.map((group) => (
                <a
                  key={group.name}
                  href={`#${groupAnchor(group.name)}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-rose-100/60 hover:text-rose-700 dark:text-neutral-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                >
                  <span className="truncate">{groupLabel(group.name)}</span>
                  <span className="text-xs text-neutral-400 tabular-nums">
                    {group.endpoints.length}
                  </span>
                </a>
              ))}
            </nav>
          </aside>

          <div className="flex min-w-0 flex-col gap-8">
            <div className="flex flex-col gap-3">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
                aria-label={t("searchPlaceholder")}
                className="surface h-11 w-full px-4 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-rose-400/60 focus:ring-2 focus:ring-rose-500/20 dark:text-neutral-100"
              />
              <div role="group" aria-label={t("filters.label")} className="flex flex-wrap gap-1.5">
                {ACCESS_FILTERS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    aria-pressed={accessFilter === filter}
                    onClick={() => setAccessFilter(filter)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      accessFilter === filter
                        ? "bg-gradient-to-r from-orange-500 to-rose-600 text-white"
                        : "surface text-neutral-600 hover:text-rose-700 dark:text-neutral-300 dark:hover:text-rose-300"
                    }`}
                  >
                    {t(`filters.${filter}`)}
                  </button>
                ))}
              </div>
            </div>

            {visibleGroups.length === 0 ? (
              <p className="py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
                {t("noResults")}
              </p>
            ) : (
              visibleGroups.map((group) => (
                <section
                  key={group.name}
                  id={groupAnchor(group.name)}
                  className="flex scroll-mt-28 flex-col gap-3"
                >
                  <h2 className="flex items-baseline gap-3 text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                    {groupLabel(group.name)}
                    <span className="text-sm font-medium text-neutral-400 tabular-nums">
                      {group.endpoints.length}
                    </span>
                  </h2>
                  {group.endpoints.map((endpoint) => (
                    <ApiEndpointCard key={endpoint.id} endpoint={endpoint} />
                  ))}
                </section>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
