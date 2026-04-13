import { isGuildSubscriptionEnabled } from "@/lib/config/guild-subscription-feature";

import { MeClient } from "./MeClient";

export default async function MePage() {
  const isGuildEnabled = isGuildSubscriptionEnabled();

  return (
    <main className="gradient-bg-static min-h-screen px-4 pt-20 pb-20 sm:pt-32">
      <div className="mx-auto max-w-6xl">
        <MeClient isGuildEnabled={isGuildEnabled} />
      </div>
    </main>
  );
}
