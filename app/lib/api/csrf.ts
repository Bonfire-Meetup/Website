import { useQuery } from "@tanstack/react-query";

import { API_ROUTES } from "@/lib/api/routes";

async function fetchCsrfToken(): Promise<string> {
  const response = await fetch(API_ROUTES.CSRF);
  if (!response.ok) {
    return "";
  }
  const data = await response.json();
  return data?.token ?? "";
}

export function useCsrfToken() {
  const query = useQuery({
    queryKey: ["csrf-token"],
    queryFn: fetchCsrfToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return query.data ?? "";
}
