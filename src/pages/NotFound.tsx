import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #1a1a1a, #0b0b0b)",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          textAlign: "center",
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "18px",
          padding: "3rem 2.5rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            letterSpacing: "0.35em",
            fontWeight: 700,
            fontSize: "0.9rem",
            opacity: 0.7,
            marginBottom: "1rem",
          }}
        >
          INTAKE
        </div>

        <h1
          style={{
            fontSize: "4rem",
            fontWeight: 800,
            margin: "0",
          }}
        >
          404
        </h1>

        <p
          style={{
            marginTop: "1rem",
            fontSize: "1.1rem",
            lineHeight: 1.6,
            opacity: 0.85,
          }}
        >
          This page doesn’t exist — or the link you followed has moved.
        </p>

        <Link
          to="/"
          style={{
            display: "inline-block",
            marginTop: "2rem",
            padding: "0.75rem 1.6rem",
            borderRadius: "999px",
            background: "linear-gradient(135deg, #ffffff, #d9d9d9)",
            color: "#000",
            fontWeight: 600,
            textDecoration: "none",
            transition: "transform 0.15s ease",
          }}
        >
          Back to Intake
        </Link>
      </div>
    </div>
  );
}
