import type { MDXComponents } from "mdx/types";
import { Children, type ComponentPropsWithoutRef, type ReactNode } from "react";

import { Link } from "@/i18n/navigation";

const HEADING_ID_PATTERN = /\s*\{#(?<id>[\w-]+)\}\s*$/u;
const LINK_CLASS = "text-brand-600 font-medium break-words hover:underline";

/**
 * Supports `## Heading {#custom-id}` so anchors stay the same in every language.
 */
function splitHeadingId(children: ReactNode): { content: ReactNode; id: string | undefined } {
  const nodes = Children.toArray(children);
  const last = nodes.at(-1);
  const id = typeof last === "string" ? HEADING_ID_PATTERN.exec(last)?.groups?.id : undefined;

  if (!id || typeof last !== "string") {
    return { content: children, id: undefined };
  }

  return { content: [...nodes.slice(0, -1), last.replace(HEADING_ID_PATTERN, "")], id };
}

export function MarkdownLink({ children, href = "" }: ComponentPropsWithoutRef<"a">) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={LINK_CLASS}>
        {children}
      </Link>
    );
  }

  const externalProps = /^https?:/u.test(href)
    ? { rel: "noopener noreferrer", target: "_blank" }
    : {};

  return (
    <a href={href} className={LINK_CLASS} {...externalProps}>
      {children}
    </a>
  );
}

/**
 * Markdown headings are shifted one level down because every page already has its own `h1`.
 */
export const markdownComponents: MDXComponents = {
  a: MarkdownLink,
  code: ({ children }) => (
    <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9em] text-neutral-800 dark:bg-white/10 dark:text-neutral-200">
      {children}
    </code>
  ),
  h1: ({ children }) => (
    <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">{children}</h2>
  ),
  h2: ({ children }) => {
    const { content, id } = splitHeadingId(children);
    return (
      <h3
        id={id}
        className="mt-10 scroll-mt-24 text-2xl font-bold text-neutral-900 dark:text-white"
      >
        {content}
      </h3>
    );
  },
  h3: ({ children }) => {
    const { content, id } = splitHeadingId(children);
    return (
      <h4
        id={id}
        className="mt-6 scroll-mt-24 text-xl font-semibold text-neutral-900 dark:text-white"
      >
        {content}
      </h4>
    );
  },
  hr: () => <hr className="border-neutral-200 dark:border-white/10" />,
  ol: ({ children }) => (
    <ol className="list-decimal space-y-2 pl-5 leading-relaxed text-neutral-600 marker:text-neutral-400 dark:text-neutral-400">
      {children}
    </ol>
  ),
  p: ({ children }) => (
    <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-neutral-900 dark:text-white">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="list-disc space-y-2 pl-5 leading-relaxed text-neutral-600 marker:text-neutral-400 dark:text-neutral-400">
      {children}
    </ul>
  ),
};
