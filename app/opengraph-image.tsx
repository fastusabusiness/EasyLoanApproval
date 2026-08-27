import { ImageResponse } from "next/og";

// Branded 1200×630 card shown when a Easy Loan Approval link is shared (WhatsApp, SMS,
// social). Uses system fonts so the build never depends on fetching a webfont.
export const alt = "Easy Loan Approval — Simple Loans, Easy Approval";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #eaf6e4 0%, #ffffff 55%, #eaf6e4 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "9999px",
              background: "linear-gradient(160deg, #1c3a5e, #16324a)",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "9999px",
                background: "#ffffff",
              }}
            />
          </div>
          <div style={{ fontSize: "44px", fontWeight: 800, color: "#1c3a5e" }}>
            Easy Loan Approval
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "104px",
            fontWeight: 800,
            color: "#13293f",
            marginTop: "48px",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
          }}
        >
          Simple Loans, Easy Approval.
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "38px",
            color: "#475569",
            marginTop: "28px",
          }}
        >
          Apply in under two minutes — no paperwork, no hidden fees.
        </div>

        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            marginTop: "44px",
            background: "#43a83a",
            color: "#ffffff",
            fontSize: "34px",
            fontWeight: 800,
            padding: "20px 44px",
            borderRadius: "9999px",
          }}
        >
          Apply Now →
        </div>
      </div>
    ),
    size
  );
}
