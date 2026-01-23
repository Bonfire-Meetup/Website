"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { STORAGE_KEYS } from "@/lib/storage/keys";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const themeRef = useRef<Theme>(theme);

  const getSystemTheme = useCallback((): "light" | "dark" => {
    if (typeof window === "undefined") {
      return "light";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, []);

  const applyTheme = useCallback(
    (newTheme: Theme) => {
      const resolved = newTheme === "system" ? getSystemTheme() : newTheme;
      const root = document.documentElement;
      const currentScrollY = window.scrollY;

      root.style.overflowAnchor = "none";
      root.classList.remove("smooth-scroll");

      const disableTransitionsStyle = document.createElement("style");
      disableTransitionsStyle.textContent =
        "* { transition: none !important; animation: none !important; }";
      document.head.appendChild(disableTransitionsStyle);

      root.classList.remove("light", "dark");
      root.classList.add(resolved);
      setResolvedTheme(resolved);

      const _ = root.offsetHeight;
      window.scrollTo(0, currentScrollY);

      requestAnimationFrame(() => {
        if (disableTransitionsStyle.parentNode) {
          document.head.removeChild(disableTransitionsStyle);
        }

        setTimeout(() => {
          root.style.overflowAnchor = "";
          root.classList.add("smooth-scroll");
        }, 100);
      });
    },
    [getSystemTheme],
  );

  const setTheme = useCallback(
    (newTheme: Theme) => {
      themeRef.current = newTheme;
      setThemeState(newTheme);
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
      applyTheme(newTheme);
    },
    [applyTheme],
  );

  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null;
    const initialTheme = savedTheme || "system";
    themeRef.current = initialTheme;
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (themeRef.current === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [applyTheme]);

  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ resolvedTheme: "light", setTheme, theme: "system" }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ resolvedTheme, setTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}
