"use client";

import { InlineButtonLoader } from "@/components/ui/InlineButtonLoader";

export function AsyncButtonContent({
  children,
  isPending,
}: {
  children: React.ReactNode;
  isPending: boolean;
}) {
  return (
    <span className="grid">
      <span
        className={`col-start-1 row-start-1 inline-flex items-center justify-center gap-2 transition-opacity ${
          isPending ? "opacity-0" : "opacity-100"
        }`}
      >
        {children}
      </span>
      <span
        className={`col-start-1 row-start-1 inline-flex items-center justify-center transition-opacity ${
          isPending ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isPending}
      >
        <InlineButtonLoader />
      </span>
    </span>
  );
}
