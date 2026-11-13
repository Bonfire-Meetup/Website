"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useAdminTalkProposals } from "@/lib/api/admin";

import {
  AdminCard,
  AdminListState,
  AdminLongText,
  AdminMailLink,
  AdminSearchField,
  AdminSelect,
  AdminTag,
  AdminTimestamp,
  AdminToolbar,
  matchesSearch,
} from "./AdminPrimitives";

const ALL = "all";
const LOCATIONS = ["prague", "zlin", "either"] as const;

export function AdminTalkProposals() {
  const t = useTranslations("admin.talkProposals");
  const tCommon = useTranslations("admin.common");
  const query = useAdminTalkProposals();
  const [location, setLocation] = useState(ALL);
  const [search, setSearch] = useState("");

  const proposals = query.data ?? [];
  const locationLabel = (value: string | null) =>
    value && t.has(`locations.${value}`) ? t(`locations.${value}`) : t("locations.either");
  const visibleProposals = proposals.filter(
    (proposal) =>
      (location === ALL || (proposal.preferredLocation ?? "either") === location) &&
      matchesSearch(search, [
        proposal.talkTitle,
        proposal.speakerName,
        proposal.email,
        proposal.abstract,
        proposal.experience,
      ]),
  );

  return (
    <AdminListState
      isLoading={query.isLoading}
      isError={query.isError}
      isEmpty={proposals.length === 0}
      emptyMessage={t("empty")}
      onRetry={() => query.refetch()}
    >
      <AdminToolbar count={visibleProposals.length}>
        <AdminSelect
          value={location}
          onChange={setLocation}
          label={t("filterLocation")}
          options={[
            { label: t("allLocations"), value: ALL },
            ...LOCATIONS.map((value) => ({ label: locationLabel(value), value })),
          ]}
        />
        <AdminSearchField value={search} onChange={setSearch} />
      </AdminToolbar>

      {visibleProposals.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {tCommon("noMatches")}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleProposals.map((proposal) => (
            <AdminCard key={proposal.id}>
              <header className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {proposal.talkTitle}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    {proposal.speakerName}
                  </p>
                </div>
                <AdminTimestamp value={proposal.createdAt} />
              </header>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <AdminTag tone="accent">{t("duration", { minutes: proposal.duration })}</AdminTag>
                <AdminTag>{locationLabel(proposal.preferredLocation)}</AdminTag>
                <AdminMailLink email={proposal.email} subject={proposal.talkTitle} />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="eyebrow text-2xs text-neutral-500 dark:text-neutral-400">
                    {t("abstract")}
                  </span>
                  <div className="surface-inset px-4 py-3">
                    <AdminLongText text={proposal.abstract} />
                  </div>
                </div>
                {proposal.experience ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="eyebrow text-2xs text-neutral-500 dark:text-neutral-400">
                      {t("experience")}
                    </span>
                    <div className="surface-inset px-4 py-3">
                      <AdminLongText text={proposal.experience} />
                    </div>
                  </div>
                ) : null}
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </AdminListState>
  );
}
