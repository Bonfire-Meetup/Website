type AccentBarSize = "sm" | "md" | "lg";

interface AccentBarProps {
  size?: AccentBarSize;
  className?: string;
}

const sizeClasses: Record<AccentBarSize, string> = {
  lg: "h-7",
  md: "h-6",
  sm: "h-5",
};

export function AccentBar({ size = "md", className = "" }: AccentBarProps) {
  return (
    <span
      aria-hidden="true"
      className={`from-brand-500 w-1 rounded-full bg-gradient-to-b to-rose-500 ${sizeClasses[size]} ${className}`}
    />
  );
}
