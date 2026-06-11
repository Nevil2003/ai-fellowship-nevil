import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Mastical Agency OS — your agency in your pocket"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          background: "linear-gradient(135deg, #09090f 0%, #14102a 60%, #1a0f2e 100%)",
          padding: "80px 96px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo mark */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "48px" }}>
          <svg width="40" height="40" viewBox="0 0 28 28" fill="none">
            <path
              d="M7 9C7 6.8 8.8 5 11 5C13.2 5 15 6.8 15 9C15 11.2 13.2 13 11 13C8.8 13 7 14.8 7 17C7 19.2 8.8 21 11 21"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M21 19C21 21.2 19.2 23 17 23C14.8 23 13 21.2 13 19C13 16.8 14.8 15 17 15C19.2 15 21 13.2 21 11C21 8.8 19.2 7 17 7"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeOpacity="0.7"
            />
          </svg>
          <span
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: "#f0f0f0",
              letterSpacing: "4px",
            }}
          >
            MASTICAL
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 70,
            fontWeight: 700,
            color: "#f0f0f0",
            lineHeight: 1.05,
            letterSpacing: "-2px",
            marginBottom: 32,
          }}
        >
          Your agency,
          <br />
          <span style={{ color: "#a78bfa" }}>in your pocket.</span>
        </div>

        {/* Subline */}
        <div style={{ fontSize: 24, color: "#8a8a9a", fontWeight: 400, letterSpacing: "-0.3px" }}>
          AI content operations &middot; neural scoring &middot; strategy on demand
        </div>
      </div>
    ),
    { ...size },
  )
}
