export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="12" fill="#18181b" />
      <rect x="0.5" y="0.5" width="39" height="39" rx="11.5" stroke="#3f3f46" />

      <circle cx="20" cy="20" r="9" stroke="#3f3f46" strokeWidth="4" />
      <circle
        cx="20"
        cy="20"
        r="9"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="42.4 56.5"
        transform="rotate(-90 20 20)"
      />
    </svg>
  );
}
