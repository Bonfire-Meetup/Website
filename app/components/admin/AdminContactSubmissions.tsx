"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useAdminContactSubmissions, type AdminContactSubmission } from "@/lib/api/admin";

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
const DEFAULT_TYPE = "general";

export function AdminContactSubmissions() {
  const t = useTranslations("admin.contact");
  const query = useAdminContactSubmissions();
  const submissions = query.data ?? [];

  return (
    <AdminListState
      isLoading={query.isLoading}
      isError={query.isError}
      isEmpty={submissions.length === 0}
      emptyMessage={t("empty")}
      onRetry={() => query.refetch()}
    >
      <ContactSubmissionsView submissions={submissions} />
    </AdminListState>
  );
}

export function ContactSubmissionsView({ submissions }: { submissions: AdminContactSubmission[] }) {
  const t = useTranslations("admin.contact");
  const tCommon = useTranslations("admin.common");
  const [type, setType] = useState(ALL);
  const [search, setSearch] = useState("");

  const typeOf = (value: string | null) => value || DEFAULT_TYPE;
  const typeLabel = (value: string) => (t.has(`types.${value}`) ? t(`types.${value}`) : value);
  const availableTypes = [...new Set(submissions.map((item) => typeOf(item.inquiryType)))].sort();
  const visibleSubmissions = submissions.filter(
    (item) =>
      (type === ALL || typeOf(item.inquiryType) === type) &&
      matchesSearch(search, [item.subject, item.name, item.email, item.message]),
  );

  return (
    <>
      <AdminToolbar count={visibleSubmissions.length}>
        <AdminSelect
          value={type}
          onChange={setType}
          label={t("filterType")}
          options={[
            { label: t("allTypes"), value: ALL },
            ...availableTypes.map((value) => ({ label: typeLabel(value), value })),
          ]}
        />
        <AdminSearchField value={search} onChange={setSearch} />
      </AdminToolbar>

      {visibleSubmissions.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-600 dark:text-neutral-400">
          {tCommon("noMatches")}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleSubmissions.map((item) => (
            <AdminCard key={item.id}>
              <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0">
                  <h3 className="text-lg leading-snug font-bold text-neutral-900 dark:text-white">
                    {item.subject}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                    <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                      {item.name}
                    </span>
                    <AdminTag tone="accent">{typeLabel(typeOf(item.inquiryType))}</AdminTag>
                  </div>
                </div>
                <AdminTimestamp value={item.createdAt} />
              </header>

              <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-white/10">
                <AdminLongText text={item.message} />
              </div>

              <footer className="mt-4">
                <AdminMailLink email={item.email} subject={item.subject} />
              </footer>
            </AdminCard>
          ))}
        </div>
      )}
    </>
  );
}
