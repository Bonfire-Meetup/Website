import type { Metadata } from "next";

import { getReaderEvents } from "@/lib/events/event-views";
import { buildSimplePageMetadata } from "@/lib/metadata";

import { ReaderClient } from "./ReaderClient";

export default async function ReaderPage() {
  return (
    <main className="gradient-bg-static min-h-screen px-2 pt-28 pb-16 sm:px-4 sm:pt-32 sm:pb-20">
      <div className="mx-auto max-w-4xl">
        <ReaderClient events={await getReaderEvents()} />
      </div>
    </main>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "reader" });
}
