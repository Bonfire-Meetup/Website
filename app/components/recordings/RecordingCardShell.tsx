import Link from "next/link";
import type {
  AnimationEventHandler,
  CSSProperties,
  MouseEventHandler,
  PointerEventHandler,
  ReactNode,
} from "react";

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
  style?: CSSProperties;
  onMouseEnter?: MouseEventHandler<HTMLElement>;
  onMouseMove?: MouseEventHandler<HTMLElement>;
  onMouseLeave?: MouseEventHandler<HTMLElement>;
  onPointerEnter?: PointerEventHandler<HTMLElement>;
  onPointerMove?: PointerEventHandler<HTMLElement>;
  onPointerLeave?: PointerEventHandler<HTMLElement>;
  onPointerCancel?: PointerEventHandler<HTMLElement>;
  onAnimationEnd?: AnimationEventHandler<HTMLElement>;
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
  style,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onPointerCancel,
  onAnimationEnd,
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
      <Link
        href={href}
        prefetch={prefetch}
        className={className}
        aria-label={ariaLabel}
        style={style}
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onPointerEnter={onPointerEnter}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerCancel={onPointerCancel}
        onAnimationEnd={onAnimationEnd}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={className}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerCancel}
      onAnimationEnd={onAnimationEnd}
    >
      {content}
    </div>
  );
}
