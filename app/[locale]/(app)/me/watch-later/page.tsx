import type { Metadata } from "next";

import { buildMetaPageMetadata } from "@/lib/metadata";

import { WatchLaterClient } from "./WatchLaterClient";

export default function WatchLaterPage() {
  return (
    <main className="gradient-bg-static min-h-screen px-4 pt-32 pb-20">
      <div className="mx-auto max-w-6xl">
        <WatchLaterClient />
      </div>
    </main>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return buildMetaPageMetadata("watchLater", { commonValues: "brandOnly" });
}
