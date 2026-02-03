"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function ScrollToTop() {
  const pathname = usePathname();
  const isHistoryNavRef = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      isHistoryNavRef.current = true;
    };

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (isHistoryNavRef.current) {
      isHistoryNavRef.current = false;
      return;
    }

    if (window.location.hash) {
      return;
    }

    window.scrollTo({ behavior: "auto", left: 0, top: 0 });
  }, [pathname]);

  return null;
}
