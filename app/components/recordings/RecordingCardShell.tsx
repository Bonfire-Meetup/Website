import Link from "next/link";
import type { ReactNode } from "react";

interface RecordingCardShellProps {
  className: string;
  image: ReactNode;
  body: ReactNode;
  imageClassName?: string;
  bodyClassName?: string;
  href?: string;
  ariaLabel?: string;
  prefetch?: boolean;
  overlayContent?: ReactNode;
  children?: ReactNode;
}

export function RecordingCardShell({
  className,
  image,
  body,
  imageClassName = "relative",
  bodyClassName,
  href,
  ariaLabel,
  prefetch = false,
  overlayContent,
  children,
}: RecordingCardShellProps) {
  const content = (
    <>
      {overlayContent}
      <div className={imageClassName}>{image}</div>
      {bodyClassName ? <div className={bodyClassName}>{body}</div> : body}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} prefetch={prefetch} className={className} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
