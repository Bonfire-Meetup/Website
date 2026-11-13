"use client";

import { ApiError } from "@/lib/api/errors";
import { API_ROUTES } from "@/lib/api/routes";
import { useAuthScopedQuery } from "@/lib/api/useAuthScopedQuery";
import { USER_ROLES } from "@/lib/config/roles";
import type {
  AdminContactSubmission,
  AdminSurveyResponse,
  AdminTalkProposal,
} from "@/lib/data/forms";
import { useIsRole } from "@/lib/redux/hooks/useIsRole";
import { createAuthHeaders } from "@/lib/utils/http";

export type { AdminContactSubmission, AdminSurveyResponse, AdminTalkProposal };

async function fetchAdminList<T>(url: string, accessToken: string | null): Promise<T[]> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: createAuthHeaders(accessToken),
  });

  if (!response.ok) {
    throw new ApiError("Admin list fetch failed", response.status);
  }

  const body = (await response.json()) as { items: T[] };

  return body.items;
}

function useAdminList<T>(key: string, url: string) {
  const isAdmin = useIsRole(USER_ROLES.ADMIN);

  return useAuthScopedQuery<T[]>({
    baseQueryKey: ["admin", key],
    enabled: isAdmin,
    queryFn: ({ accessToken }) => fetchAdminList<T>(url, accessToken),
    staleTime: 30000,
  });
}

export function useAdminSurveyResponses() {
  return useAdminList<AdminSurveyResponse>("survey-responses", API_ROUTES.ADMIN.SURVEY_RESPONSES);
}

export function useAdminTalkProposals() {
  return useAdminList<AdminTalkProposal>("talk-proposals", API_ROUTES.ADMIN.TALK_PROPOSALS);
}

export function useAdminContactSubmissions() {
  return useAdminList<AdminContactSubmission>(
    "contact-submissions",
    API_ROUTES.ADMIN.CONTACT_SUBMISSIONS,
  );
}
