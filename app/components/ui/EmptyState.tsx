import type { ReactNode } from "react";

import { AccentBar } from "./AccentBar";
import { Card } from "./Card";

interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
  className?: string;
  messageClassName?: string;
  accentClassName?: string;
}

export function EmptyState({
  message,
  icon,
  className = "",
  messageClassName = "",
  accentClassName = "",
}: EmptyStateProps) {
  return (
    <Card className={`mx-auto text-center ${className}`}>
      {icon ? <div className="mb-4 text-5xl">{icon}</div> : null}
      <div className="flex items-center justify-center gap-3">
        <AccentBar size="sm" className={accentClassName} />
        <p
          className={`text-lg font-medium text-neutral-600 dark:text-neutral-400 ${messageClassName}`}
        >
          {message}
        </p>
      </div>
    </Card>
  );
}
