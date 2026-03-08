import type { IconProps } from "./types";

export function ArrowLeftIcon({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

export function ArrowRightIcon({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
      />
    </svg>
  );
}

export function ChevronDownIcon({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

export function ChevronLeftIcon({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 19.5-7.5-7.5 7.5-7.5" />
    </svg>
  );
}

export function ChevronRightIcon({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export function HomeIcon({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

export function LinkIcon({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
      />
    </svg>
  );
}

export function ExternalLinkIcon({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 4h6v6" />
      <path d="M10 14 20 4" />
      <path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

export function MenuIcon({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function MoreHorizontalIcon({ className, ...props }: IconProps) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" {...props}>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

export function AnimatedMenuIcon({ className, isOpen, ...props }: IconProps & { isOpen: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle
        cx="12"
        cy="12"
        r="2"
        style={{
          transformOrigin: "center",
          transform: isOpen
            ? "translateX(-7px) translateY(-7px) rotate(45deg) scaleY(3)"
            : "translateX(-7px) translateY(0) rotate(0deg) scaleY(1)",
          transition: "transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />
      <circle
        cx="12"
        cy="12"
        r="2"
        style={{
          transformOrigin: "center",
          transform: isOpen
            ? "translateX(7px) translateY(7px) rotate(45deg) scaleY(3)"
            : "translateX(7px) translateY(0) rotate(0deg) scaleY(1)",
          transition: "transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1) 50ms",
        }}
      />
      <circle
        cx="12"
        cy="12"
        r="2"
        style={{
          transformOrigin: "center",
          transform: isOpen ? "scale(0)" : "scale(1)",
          opacity: isOpen ? 0 : 1,
          transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease-out",
        }}
      />
      <line
        x1="12"
        y1="12"
        x2="12"
        y2="12"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        style={{
          transformOrigin: "center",
          transform: isOpen
            ? "translateX(-7px) translateY(-7px) rotate(-45deg) scaleY(1.5)"
            : "scale(0)",
          opacity: isOpen ? 1 : 0,
          transition:
            "transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1) 100ms, opacity 300ms ease-out 100ms",
        }}
      />
      <line
        x1="12"
        y1="12"
        x2="12"
        y2="12"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        style={{
          transformOrigin: "center",
          transform: isOpen
            ? "translateX(7px) translateY(7px) rotate(-45deg) scaleY(1.5)"
            : "scale(0)",
          opacity: isOpen ? 1 : 0,
          transition:
            "transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1) 150ms, opacity 300ms ease-out 150ms",
        }}
      />
    </svg>
  );
}

export function CloseIcon({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6l-12 12" />
    </svg>
  );
}
