import { NextRequest } from "next/server";

const ALLOWED_HOSTS = new Set(["img.youtube.com", "i.ytimg.com"]);
const CACHE_HEADER = "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const urlParam = searchParams.get("url");

  if (!urlParam) {
    return new Response("Missing url", { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(urlParam);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }

  if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname)) {
    return new Response("Unsupported host", { status: 400 });
  }

  const upstream = await fetch(target.toString(), {
    next: { revalidate: 60 * 60 * 24 * 7 },
  });

  if (!upstream.ok) {
    return new Response(null, { status: upstream.status });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": CACHE_HEADER,
    },
  });
}
