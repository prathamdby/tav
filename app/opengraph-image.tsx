import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "tav — Search at the speed of thought";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#0a0a0a",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 120,
          fontWeight: 700,
          color: "#00d4ff",
          letterSpacing: "-4px",
          lineHeight: 1,
          marginBottom: 24,
        }}
      >
        tav
      </div>
      <div
        style={{
          fontSize: 28,
          color: "#6b7280",
          letterSpacing: "0.5px",
        }}
      >
        Search at the speed of thought
      </div>
    </div>,
    { ...size }
  );
}
