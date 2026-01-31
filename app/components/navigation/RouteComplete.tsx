"use client";

import { Suspense } from "react";

import { useRouteComplete } from "../shared/NavigationContext";

function RouteCompleteInner() {
  useRouteComplete();
  return null;
}

export function RouteComplete() {
  return (
    <Suspense fallback={null}>
      <RouteCompleteInner />
    </Suspense>
  );
}
