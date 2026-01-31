"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface NavigationContextType {
  startNavigation: () => void;
  completeNavigation: () => void;
  isNavigating: boolean;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const completeTimerRef = useRef<number | null>(null);
  const isNavigatingRef = useRef(false);

  const startNavigation = useCallback(() => {
    if (completeTimerRef.current) {
      window.clearTimeout(completeTimerRef.current);
      completeTimerRef.current = null;
    }
    isNavigatingRef.current = true;
    setIsNavigating(true);
  }, []);

  const completeNavigation = useCallback(() => {
    isNavigatingRef.current = false;
    completeTimerRef.current = window.setTimeout(() => {
      setIsNavigating(false);
    }, 150);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href) {
        return;
      }

      if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
        return;
      }

      if (!isNavigatingRef.current) {
        startNavigation();
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      if (completeTimerRef.current) {
        window.clearTimeout(completeTimerRef.current);
      }
    };
  }, [startNavigation]);

  return (
    <NavigationContext.Provider value={{ startNavigation, completeNavigation, isNavigating }}>
      {children}
    </NavigationContext.Provider>
  );
}

interface NavigationLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
  children: React.ReactNode;
}

export function NavigationLink({ children, onClick, ...props }: NavigationLinkProps) {
  const { startNavigation } = useNavigation();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    startNavigation();
    onClick?.(e);
  };

  return (
    <Link onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}

export function useRouteComplete() {
  const { completeNavigation } = useNavigation();
  const pathname = usePathname();
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (!hasCompletedRef.current) {
      hasCompletedRef.current = true;
      return;
    }

    const timer = window.setTimeout(() => {
      completeNavigation();
    }, 50);

    return () => window.clearTimeout(timer);
  }, [pathname, completeNavigation]);
}
