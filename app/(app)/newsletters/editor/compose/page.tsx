import { Suspense } from "react";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

import { NewsletterEditorPageClient } from "./NewsletterEditorPageClient";

function NewsletterEditorFallback() {
  return (
    <main className="gradient-bg-static relative min-h-screen overflow-hidden px-2 pt-24 pb-16 sm:px-4 sm:pt-32 sm:pb-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-9),transparent_62%)]" />
      </div>
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="flex min-h-[400px] items-center justify-center">
          <LoadingSpinner size="lg" className="text-rose-600 dark:text-rose-400" />
        </div>
      </div>
    </main>
  );
}

export default function NewsletterEditorPage() {
  return (
    <Suspense fallback={<NewsletterEditorFallback />}>
      <NewsletterEditorPageClient />
    </Suspense>
  );
}
