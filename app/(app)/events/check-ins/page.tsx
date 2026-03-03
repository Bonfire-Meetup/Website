import type { Metadata } from "next";

import { buildSimplePageMetadata } from "@/lib/metadata";

import { CheckInClient } from "./CheckInClient";

export default function CheckInPage() {
  return (
    <main className="gradient-bg-static min-h-screen px-4 pt-32 pb-20">
      <div className="mx-auto max-w-6xl">
        <CheckInClient />
      </div>
    </main>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "checkIn" });
}
