"use client";

import type { AudienceCounts } from "@/(app)/newsletters/editor/compose/types";
import { ApiError } from "@/lib/api/errors";
import { API_ROUTES } from "@/lib/api/routes";
import { useAuthScopedQuery } from "@/lib/api/useAuthScopedQuery";
import { USER_ROLES } from "@/lib/config/roles";
import type { ArchiveListItem, NewsletterDetail } from "@/lib/data/newsletter-archive";
import { useIsRole } from "@/lib/redux/hooks/useIsRole";
import { createAuthHeaders } from "@/lib/utils/http";

async function getJson<T>(url: string, accessToken: string | null): Promise<T> {
  const response = await fetch(url, { headers: createAuthHeaders(accessToken) });

  if (!response.ok) {
    throw new ApiError("Newsletter request failed", response.status);
  }

  return response.json() as Promise<T>;
}

function useEditorQuery<T>(key: unknown[], url: string, enabled = true) {
  const isEditor = useIsRole(USER_ROLES.EDITOR);

  return useAuthScopedQuery<T>({
    baseQueryKey: ["newsletters", ...key],
    enabled: isEditor && enabled,
    queryFn: ({ accessToken }) => getJson<T>(url, accessToken),
    staleTime: 30000,
  });
}

export function useNewsletterTestSends() {
  const query = useEditorQuery<{ items: ArchiveListItem[] }>(
    ["test-sends"],
    `${API_ROUTES.NEWSLETTER.LIST}?testSend=true`,
  );

  return { ...query, items: query.data?.items ?? [] };
}

export function useNewsletterDetail(slug: string | undefined) {
  return useEditorQuery<NewsletterDetail>(
    ["detail", slug],
    API_ROUTES.NEWSLETTER.ITEM(slug ?? ""),
    Boolean(slug),
  );
}

export function useNewsletterAudienceCounts() {
  return useEditorQuery<AudienceCounts>(["audience-counts"], API_ROUTES.NEWSLETTER.AUDIENCE_COUNTS);
}
