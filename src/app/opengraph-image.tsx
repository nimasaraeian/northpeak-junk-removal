import { ImageResponse } from "next/og";

export const alt = "NorthPeak Junk Removal — More Space. A Better Tomorrow.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0c1b2e",
          color: "#f6f1e8",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 44,
              height: 52,
              background: "#d0892b",
              display: "flex",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 36, fontWeight: 700 }}>NorthPeak</div>
            <div style={{ fontSize: 16, letterSpacing: 4 }}>JUNK REMOVAL</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 68, lineHeight: 0.95 }}>More Space.</div>
          <div style={{ fontSize: 68, lineHeight: 0.95, color: "#f0b25a" }}>
            A Better Tomorrow.
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#c8c0b3" }}>
          North Vancouver & Greater Vancouver
        </div>
      </div>
    ),
    size,
  );
}
