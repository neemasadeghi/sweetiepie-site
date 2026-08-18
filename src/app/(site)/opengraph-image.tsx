import { ImageResponse } from "next/og";

export const alt = "sweetiepie — Director";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #ffd8ef 0%, #f5c8e3 45%, #edb8d6 100%)",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontFamily: "Georgia, serif",
            color: "#000",
            letterSpacing: "-0.03em",
          }}
        >
          sweetiepie
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 26,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#4a4a4a",
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          Director
        </div>
      </div>
    ),
    { ...size }
  );
}
