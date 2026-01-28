"use client";

import { LanguageToggle } from "../theme/LanguageToggle";
import { ThemeToggle } from "../theme/ThemeToggle";

export function AuthControls() {
  return (
    <div className="flex items-center gap-2">
      <LanguageToggle />
      <ThemeToggle />
    </div>
  );
}
