import type { Metadata } from "next";

import { buildMetaPageMetadata } from "@/lib/metadata";

import { WatchLaterClient } from "./WatchLaterClient";

export default function WatchLaterPage() {
  return (
    <main className="gradient-bg-static relative min-h-screen overflow-hidden px-4 pt-32 pb-20">
      <div className="mx-auto max-w-7xl">
        <WatchLaterClient />
      </div>
    </main>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return buildMetaPageMetadata("watchLater", { commonValues: "brandOnly" });
}
