export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-base" x1="4" y1="2" x2="36" y2="38">
          <stop offset="0%" stopColor="#52525b" />
          <stop offset="55%" stopColor="#27272a" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>
        <linearGradient id="logo-sheen" x1="20" y1="2" x2="20" y2="22">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.6" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>

      <rect width="40" height="40" rx="12" fill="url(#logo-base)" />
      <rect width="40" height="20" rx="12" fill="url(#logo-sheen)" />
      <rect
        x="0.75"
        y="0.75"
        width="38.5"
        height="38.5"
        rx="11.25"
        stroke="#ffffff"
        strokeOpacity="0.15"
      />

      <circle
        cx="20"
        cy="20"
        r="9"
        stroke="white"
        strokeOpacity="0.18"
        strokeWidth="4"
      />
      <circle
        cx="20"
        cy="20"
        r="9"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="42.4 56.5"
        transform="rotate(-90 20 20)"
        filter="url(#logo-shadow)"
      />
      <circle cx="11" cy="20" r="1.7" fill="white" />
    </svg>
  );
}
