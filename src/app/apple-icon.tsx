import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#18181b",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 40 40" fill="none">
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
      </div>
    ),
    { ...size }
  );
}
