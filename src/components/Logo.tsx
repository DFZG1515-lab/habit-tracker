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
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="55%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="logo-sheen" x1="20" y1="2" x2="20" y2="22">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.6" floodColor="#1e1b4b" floodOpacity="0.45" />
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

      <path
        d="M13 20.5L18 25.5L27.5 14.5"
        stroke="white"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#logo-shadow)"
      />
    </svg>
  );
}
