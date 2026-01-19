type AccentBarSize = "sm" | "md" | "lg";

type AccentBarProps = {
  size?: AccentBarSize;
  className?: string;
};

const sizeClasses: Record<AccentBarSize, string> = {
  sm: "h-5",
  md: "h-6",
  lg: "h-7",
};

export function AccentBar({ size = "md", className = "" }: AccentBarProps) {
  return (
    <span
      aria-hidden="true"
      className={`w-1 rounded-full bg-gradient-to-b from-brand-500 to-rose-500 ${sizeClasses[size]} ${className}`}
    />
  );
}
