import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0c1b2e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 18,
            height: 36,
            background: "#0c1b2e",
            border: "6px solid #f6f1e8",
            display: "flex",
          }}
        />
        <div style={{ width: 10, height: 36, background: "#d0892b" }} />
        <div
          style={{
            width: 18,
            height: 36,
            background: "#0c1b2e",
            border: "6px solid #f6f1e8",
            display: "flex",
          }}
        />
      </div>
    ),
    size,
  );
}
