"use client";

import { MoonIcon, SunIcon, SystemIcon } from "../shared/icons";
import { IconButton } from "../ui/IconButton";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const themes: ("light" | "dark" | "system")[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <IconButton
      onClick={cycleTheme}
      ariaLabel={`Current theme: ${theme}. Click to change.`}
      title={`Theme: ${theme}`}
      size="md"
      shape="rounded"
      variant="glass"
      className="hover:scale-105 active:scale-95"
    >
      {theme === "light" && <SunIcon className="h-5 w-5 text-amber-500 transition-transform" />}
      {theme === "dark" && <MoonIcon className="h-5 w-5 text-blue-400 transition-transform" />}
      {theme === "system" && (
        <SystemIcon className="h-5 w-5 text-neutral-500 transition-transform" />
      )}
    </IconButton>
  );
}
