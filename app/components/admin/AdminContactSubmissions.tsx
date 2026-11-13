"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useAdminContactSubmissions } from "@/lib/api/admin";

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
  const tCommon = useTranslations("admin.common");
  const query = useAdminContactSubmissions();
  const [type, setType] = useState(ALL);
  const [search, setSearch] = useState("");

  const submissions = query.data ?? [];
  const typeOf = (value: string | null) => value || DEFAULT_TYPE;
  const typeLabel = (value: string) => (t.has(`types.${value}`) ? t(`types.${value}`) : value);
  const availableTypes = [...new Set(submissions.map((item) => typeOf(item.inquiryType)))].sort();
  const visibleSubmissions = submissions.filter(
    (item) =>
      (type === ALL || typeOf(item.inquiryType) === type) &&
      matchesSearch(search, [item.subject, item.name, item.email, item.message]),
  );

  return (
    <AdminListState
      isLoading={query.isLoading}
      isError={query.isError}
      isEmpty={submissions.length === 0}
      emptyMessage={t("empty")}
      onRetry={() => query.refetch()}
    >
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
        <p className="py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {tCommon("noMatches")}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleSubmissions.map((item) => (
            <AdminCard key={item.id}>
              <header className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {item.subject}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">{item.name}</p>
                </div>
                <AdminTimestamp value={item.createdAt} />
              </header>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <AdminTag tone="accent">{typeLabel(typeOf(item.inquiryType))}</AdminTag>
                <AdminMailLink email={item.email} subject={item.subject} />
              </div>

              <div className="surface-inset px-4 py-3">
                <AdminLongText text={item.message} />
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </AdminListState>
  );
}
