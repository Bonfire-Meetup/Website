import type { Metadata } from "next";

import { allEvents } from "@/data/events-calendar";
import { buildSimplePageMetadata } from "@/lib/metadata";

import { ReaderClient } from "./ReaderClient";

export default function ReaderPage() {
  return (
    <main className="gradient-bg-static min-h-screen px-2 pt-28 pb-16 sm:px-4 sm:pt-32 sm:pb-20">
      <div className="mx-auto max-w-4xl">
        <ReaderClient events={allEvents} />
      </div>
    </main>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "reader" });
}
