import type { MDXComponents } from "mdx/types";

import { markdownComponents } from "@/components/shared/markdown/markdown-components";

export function useMDXComponents(): MDXComponents {
  return markdownComponents;
}
