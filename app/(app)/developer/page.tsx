import type { Metadata } from "next";
import { Suspense } from "react";

import { DeveloperPageContent } from "@/components/developer/DeveloperPageContent";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getApiReference } from "@/lib/api/reference";
import { buildTitleSubtitleMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildTitleSubtitleMetadata({ ns: "developerPage.meta" });
}

async function ApiReferenceContent() {
  const reference = await getApiReference();

  return <DeveloperPageContent reference={reference} />;
}

export default function DeveloperPage() {
  return (
    <Suspense
      fallback={
        <main className="gradient-bg-static flex min-h-screen items-center justify-center">
          <LoadingSpinner size="lg" className="text-rose-600 dark:text-rose-400" />
        </main>
      }
    >
      <ApiReferenceContent />
    </Suspense>
  );
}
