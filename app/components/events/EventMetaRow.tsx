interface EventMetaRowProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  className: string;
  iconContainerClassName: string;
  href?: string;
  textClassName?: string;
}

export function EventMetaRow({
  icon,
  children,
  className,
  iconContainerClassName,
  href,
  textClassName = "",
}: EventMetaRowProps) {
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        <div className={iconContainerClassName}>{icon}</div>
        <span className={textClassName}>{children}</span>
      </a>
    );
  }

  return (
    <div className={className}>
      <div className={iconContainerClassName}>{icon}</div>
      <span className={textClassName}>{children}</span>
    </div>
  );
}
