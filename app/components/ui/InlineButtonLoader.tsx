export function InlineButtonLoader() {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden="true">
      <span className="h-1.5 w-1.5 animate-[bounce_0.8s_ease-in-out_infinite] rounded-full bg-white/95" />
      <span className="h-1.5 w-1.5 animate-[bounce_0.8s_ease-in-out_0.12s_infinite] rounded-full bg-white/80" />
      <span className="h-1.5 w-1.5 animate-[bounce_0.8s_ease-in-out_0.24s_infinite] rounded-full bg-white/65" />
    </span>
  );
}
