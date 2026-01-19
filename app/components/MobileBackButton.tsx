"use client";

import { usePathname, useRouter } from "next/navigation";
import { IconButton } from "./IconButton";

export function MobileBackButton({ label }: { label: string }) {
  const pathname = usePathname();
  const router = useRouter();

  if (!pathname || pathname === "/") {
    return null;
  }

  const handleClick = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  };

  return (
    <IconButton
      onClick={handleClick}
      ariaLabel={label}
      size="sm"
      shape="full"
      variant="plain"
      className="md:hidden bg-white/80 text-neutral-700 shadow-sm shadow-black/10 ring-1 ring-black/5 hover:bg-white dark:bg-white/10 dark:text-white dark:ring-white/10"
    >
      <svg
        className="h-4.5 w-4.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
        />
      </svg>
    </IconButton>
  );
}
