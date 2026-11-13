declare module "*.md" {
  import type { MDXProps } from "mdx/types";
  import type { ReactNode } from "react";

  export default function MarkdownContent(props: MDXProps): ReactNode;
}

declare module "*.mdx" {
  import type { MDXProps } from "mdx/types";
  import type { ReactNode } from "react";

  /** YAML frontmatter of the file, exported by `remark-mdx-frontmatter`. */
  export const frontmatter: unknown;
  export default function MdxContent(props: MDXProps): ReactNode;
}
