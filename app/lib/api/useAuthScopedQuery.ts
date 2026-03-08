"use client";

import {
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { ensureFreshToken } from "@/lib/api/query-utils";
import { useAuthStatus, type AuthQueryScope } from "@/lib/redux/hooks";

type ResolvedAuthQueryScope = Exclude<AuthQueryScope, "pending">;

interface UseAuthScopedQueryOptions<TData, TError = ApiError> extends Omit<
  UseQueryOptions<TData, TError, TData, QueryKey>,
  "enabled" | "placeholderData" | "queryFn" | "queryKey"
> {
  baseQueryKey: QueryKey;
  enabled?: boolean;
  keepAnonymousPlaceholderOnAuth?: boolean;
  queryFn: (context: {
    accessToken: string | null;
    queryScope: ResolvedAuthQueryScope;
  }) => Promise<TData>;
}

export function useAuthScopedQuery<TData, TError = ApiError>({
  baseQueryKey,
  enabled = true,
  keepAnonymousPlaceholderOnAuth = false,
  queryFn,
  ...options
}: UseAuthScopedQueryOptions<TData, TError>) {
  const { queryScope } = useAuthStatus();
  const queryClient = useQueryClient();
  const canFetch = enabled && queryScope !== "pending";
  const scopedQueryKey = [...baseQueryKey, queryScope] as QueryKey;
  const anonymousQueryKey = [...baseQueryKey, "anon"] as QueryKey;
  const placeholderData =
    keepAnonymousPlaceholderOnAuth && queryScope === "auth"
      ? ((() => queryClient.getQueryData<TData>(anonymousQueryKey)) as unknown as UseQueryOptions<
          TData,
          TError,
          TData,
          QueryKey
        >["placeholderData"])
      : undefined;

  const query = useQuery({
    ...options,
    enabled: canFetch,
    placeholderData,
    queryFn: async () => {
      if (queryScope === "pending") {
        throw new ApiError("Authentication pending", 503) as TError;
      }

      const accessToken = queryScope === "auth" ? await ensureFreshToken() : null;

      if (queryScope === "auth" && !accessToken) {
        throw new ApiError("Authentication required", 401) as TError;
      }

      return queryFn({ accessToken, queryScope });
    },
    queryKey: scopedQueryKey,
  });

  return {
    ...query,
    isAuthTransitioning: queryScope === "auth" && query.isFetching && query.isPlaceholderData,
    isLoading: query.isLoading || queryScope === "pending",
    queryScope,
  };
}
