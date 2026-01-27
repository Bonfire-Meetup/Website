import { Suspense } from "react";

import { AppProviders } from "../AppProviders";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AppProviders>{children}</AppProviders>
    </Suspense>
  );
}
