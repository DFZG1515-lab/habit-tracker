export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-skeleton rounded-xl bg-surface-hover ${className}`}
    />
  );
}
