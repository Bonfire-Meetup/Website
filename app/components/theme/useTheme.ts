"use client";

import { useTheme as useNextThemes } from "next-themes";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

export function useTheme(): ThemeContextType {
  const { theme, setTheme: setNextTheme, resolvedTheme } = useNextThemes();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setNextTheme(newTheme);
  };

  if (!mounted) {
    return {
      theme: "system",
      resolvedTheme: "light",
      setTheme,
    };
  }

  return {
    theme: (theme as Theme) || "system",
    resolvedTheme: (resolvedTheme as "light" | "dark") || "light",
    setTheme,
  };
}
