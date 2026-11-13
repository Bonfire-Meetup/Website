import { Children, isValidElement, type ReactElement, type ReactNode } from "react";

import { GuideStepList, type GuideStepVariant } from "@/components/guides/GuideStepList";

import { listItems } from "./children";

interface ListProps {
  children?: ReactNode;
}

/** Markdown `1.` lists render as numbered steps. */
export function OrderedList({ children }: ListProps) {
  return <GuideStepList items={listItems(children)} />;
}

/** Markdown `-` lists render as dotted steps. */
export function UnorderedList({ children }: ListProps) {
  return <GuideStepList items={listItems(children)} variant="dot" />;
}

interface StepsProps {
  children: ReactNode;
  size?: "md" | "sm";
  variant: GuideStepVariant;
}

/** Wraps a markdown list to pick another marker style, e.g. `<Steps variant="rose-dot">`. */
export function Steps({ children, size, variant }: StepsProps) {
  const list = Children.toArray(children).find(
    (node): node is ReactElement<ListProps> =>
      isValidElement(node) && (node.type === OrderedList || node.type === UnorderedList),
  );

  return (
    <GuideStepList
      items={list ? listItems(list.props.children) : []}
      size={size}
      variant={variant}
    />
  );
}
