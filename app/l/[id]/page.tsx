import { notFound, permanentRedirect } from "next/navigation";

import shortLinks from "@/data/short-links.json";

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return Object.keys(shortLinks).map((id) => ({ id }));
}

export default async function ShortLinkPage({ params }: Props) {
  const { id } = await params;
  const destination = (shortLinks as Record<string, string>)[id];

  if (!destination) {
    notFound();
  }

  permanentRedirect(destination);
}
