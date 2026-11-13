const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 500;

const toInt = (value: string | null, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export function parsePagination(searchParams: URLSearchParams) {
  return {
    limit: Math.min(Math.max(toInt(searchParams.get("limit"), DEFAULT_LIMIT), 1), MAX_LIMIT),
    offset: toInt(searchParams.get("offset"), 0),
  };
}

export function paginate<T>(items: T[], { limit, offset }: { limit: number; offset: number }) {
  return { items: items.slice(offset, offset + limit), limit, offset, total: items.length };
}
