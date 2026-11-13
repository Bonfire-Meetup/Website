import type { ReactNode } from "react";

interface MarkdownDocumentProps {
  children: ReactNode;
}

/**
 * Wraps a rendered markdown document. The paragraph right after the title is styled as a
 * "last updated" note and the one after it as the lead paragraph.
 */
export function MarkdownDocument({ children }: MarkdownDocumentProps) {
  return (
    <div className="space-y-4 [&>h2+p]:text-sm [&>h2+p]:text-neutral-500 dark:[&>h2+p]:text-neutral-400 [&>h2+p+p]:text-lg [&>h2+p+p]:text-neutral-700 dark:[&>h2+p+p]:text-neutral-300 [&>h2+p>em]:not-italic">
      {children}
    </div>
  );
}
