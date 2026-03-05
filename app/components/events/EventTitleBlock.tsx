import { parseEventTitle } from "@/lib/events/presentation";

interface EventTitleBlockProps {
  title: string;
  titleGradientClassName: string;
  titleClassName: string;
  subtitleClassName: string;
  prefixClassName: string;
}

export function EventTitleBlock({
  title,
  titleGradientClassName,
  titleClassName,
  subtitleClassName,
  prefixClassName,
}: EventTitleBlockProps) {
  const parsedTitle = parseEventTitle(title);

  if (!parsedTitle) {
    return <span className={titleClassName}>{title}</span>;
  }

  return (
    <>
      <span className={prefixClassName}>{parsedTitle.prefix}</span>
      <span className={`${subtitleClassName} ${titleGradientClassName}`}>
        {parsedTitle.subtitle}
      </span>
    </>
  );
}
