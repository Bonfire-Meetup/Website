import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

interface ParagraphProps {
  children?: ReactNode;
  className?: string;
}

/**
 * The `p` every guide MDX file renders. Blocks restyle or unwrap it, so markdown paragraphs take
 * the look of the block they sit in.
 */
export function GuideParagraph({ children, className }: ParagraphProps) {
  return <p className={className}>{children}</p>;
}

const isParagraph = (node: ReactNode): node is ReactElement<ParagraphProps> =>
  isValidElement(node) && node.type === GuideParagraph;

const isBlank = (node: ReactNode) => typeof node === "string" && node.trim() === "";

/** Direct children without the whitespace MDX leaves between blocks. */
export function blockChildren(children: ReactNode): ReactNode[] {
  return Children.toArray(children).filter((node) => !isBlank(node));
}

/** Content of each markdown paragraph, without its `<p>` wrapper. */
export function paragraphContents(children: ReactNode): ReactNode[] {
  const nodes = blockChildren(children);
  const paragraphs = nodes.filter(isParagraph);

  if (paragraphs.length > 0) {
    return paragraphs.map((paragraph) => paragraph.props.children);
  }

  return nodes.length > 0 ? [nodes] : [];
}

/** Gives markdown paragraphs that are direct children the class the surrounding block wants. */
export function styleParagraphs(
  children: ReactNode,
  className: (position: { isLast: boolean }) => string,
): ReactNode[] {
  const nodes = blockChildren(children);

  return nodes.map((node, index) =>
    isParagraph(node)
      ? cloneElement(node, { className: className({ isLast: index === nodes.length - 1 }) })
      : node,
  );
}

/** Content of every `<li>` of a markdown list. */
export function listItems(children: ReactNode): ReactNode[] {
  return Children.toArray(children)
    .filter((node): node is ReactElement<{ children?: ReactNode }> => isValidElement(node))
    .map((item) => item.props.children);
}
