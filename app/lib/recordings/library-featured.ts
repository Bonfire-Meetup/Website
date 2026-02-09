export const LIBRARY_FEATURED_SHORT_IDS = [
  "x7q4b1",
  "y8bwzq",
  "czv1aj",
  "nyb4xq",
  "qk5pzk",
] as const;

const DEFAULT_ORDER = [...LIBRARY_FEATURED_SHORT_IDS];

export function getFeaturedCandidates<T extends { shortId: string }>(
  recordings: T[],
  limit: number,
  order?: string[],
): T[] {
  const priorityOrder = order ?? DEFAULT_ORDER;
  const orderMap = new Map<string, number>(priorityOrder.map((id, i) => [id, i]));
  const featured: T[] = [];
  const rest: T[] = [];

  for (const r of recordings) {
    if (orderMap.has(r.shortId)) {
      featured.push(r);
    } else {
      rest.push(r);
    }
  }

  featured.sort((a, b) => (orderMap.get(a.shortId) ?? 0) - (orderMap.get(b.shortId) ?? 0));
  return [...featured, ...rest].slice(0, limit);
}
