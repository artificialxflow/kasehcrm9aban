import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f97316",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            width: 22,
            height: 14,
            borderBottom: "4px solid white",
            borderRadius: "0 0 12px 12px",
            marginTop: 4,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
