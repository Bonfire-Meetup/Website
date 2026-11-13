"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useAdminTalkProposals, type AdminTalkProposal } from "@/lib/api/admin";

import {
  ADMIN_LABEL_CLASS,
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
  const query = useAdminTalkProposals();
  const proposals = query.data ?? [];

  return (
    <AdminListState
      isLoading={query.isLoading}
      isError={query.isError}
      isEmpty={proposals.length === 0}
      emptyMessage={t("empty")}
      onRetry={() => query.refetch()}
    >
      <TalkProposalsView proposals={proposals} />
    </AdminListState>
  );
}

export function TalkProposalsView({ proposals }: { proposals: AdminTalkProposal[] }) {
  const t = useTranslations("admin.talkProposals");
  const tCommon = useTranslations("admin.common");
  const [location, setLocation] = useState(ALL);
  const [search, setSearch] = useState("");

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
    <>
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
        <p className="py-10 text-center text-sm text-neutral-600 dark:text-neutral-400">
          {tCommon("noMatches")}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleProposals.map((proposal) => (
            <AdminCard key={proposal.id}>
              <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0">
                  <h3 className="text-lg leading-snug font-bold text-neutral-900 dark:text-white">
                    {proposal.talkTitle}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                    <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                      {proposal.speakerName}
                    </span>
                    <AdminTag tone="accent">
                      {t("duration", { minutes: proposal.duration })}
                    </AdminTag>
                    <AdminTag>{locationLabel(proposal.preferredLocation)}</AdminTag>
                  </div>
                </div>
                <AdminTimestamp value={proposal.createdAt} />
              </header>

              <div className="mt-4 flex flex-col gap-4 border-t border-neutral-200 pt-4 dark:border-white/10">
                <div>
                  <p className={`${ADMIN_LABEL_CLASS} mb-1.5`}>{t("abstract")}</p>
                  <AdminLongText text={proposal.abstract} />
                </div>
                {proposal.experience ? (
                  <div>
                    <p className={`${ADMIN_LABEL_CLASS} mb-1.5`}>{t("experience")}</p>
                    <AdminLongText text={proposal.experience} />
                  </div>
                ) : null}
              </div>

              <footer className="mt-4">
                <AdminMailLink email={proposal.email} subject={proposal.talkTitle} />
              </footer>
            </AdminCard>
          ))}
        </div>
      )}
    </>
  );
}
