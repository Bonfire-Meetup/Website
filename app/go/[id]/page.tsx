import { notFound, permanentRedirect } from "next/navigation";

import { allEvents, getEventById } from "@/data/events-calendar";
import shortLinks from "@/data/short-links.json";
import { PAGE_ROUTES } from "@/lib/routes/pages";

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return [...Object.keys(shortLinks), ...allEvents.map((event) => event.id)].map((id) => ({ id }));
}

export default async function ShortLinkPage({ params }: Props) {
  const { id } = await params;
  const destination =
    (shortLinks as Record<string, string>)[id] ??
    (getEventById(id) ? PAGE_ROUTES.EVENT(id) : undefined);

  if (!destination) {
    notFound();
  }

  permanentRedirect(destination);
}
