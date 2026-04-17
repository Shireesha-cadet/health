import { useNavigate } from "react-router-dom"
import heroImg from "../assets/hero.png"

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: "linear-gradient(135deg, #cfe8ff 0%, #e8f4ff 60%, #d0eaff 100%)" }}
    >
      {/* ── Main card ── */}
      <div
        className="flex w-full overflow-hidden shadow-2xl"
        style={{
          maxWidth: "960px",
          minHeight: "480px",
          borderRadius: "18px",
          margin: "24px",
        }}
      >
        {/* ══ LEFT NAVY STRIP — narrow, just logo ══ */}
        <div
          className="flex shrink-0 flex-col items-center py-8 px-4"
          style={{ width: "72px", background: "#0d2b6e" }}
        >
          {/* Caduceus logo */}
          <svg viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ width: "36px", height: "50px" }}>
            {/* Staff */}
            <line x1="20" y1="4" x2="20" y2="52" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            {/* Top knob */}
            <circle cx="20" cy="5" r="3.5" fill="white"/>
            {/* Wings top */}
            <path d="M20 10 C10 7 6 15 14 18 C6 21 10 29 20 26" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M20 10 C30 7 34 15 26 18 C34 21 30 29 20 26" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
            {/* Wings bottom */}
            <path d="M20 26 C10 29 6 37 14 40 C6 43 10 50 20 48" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M20 26 C30 29 34 37 26 40 C34 43 30 50 20 48" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
        </div>

        {/* ══ CENTER — white content area ══ */}
        <div
          className="flex flex-1 items-center"
          style={{ background: "#f0f7ff" }}
        >
          {/* Left content: heading + text + button */}
          <div className="flex flex-col justify-center px-12 py-10" style={{ flex: "0 0 45%" }}>
            {/* Heading with left blue border */}
            <div className="flex gap-4 items-stretch">
              <div style={{ width: "4px", borderRadius: "4px", background: "#1a56db", flexShrink: 0 }} />
              <div>
                <h1
                  className="font-extrabold leading-tight"
                  style={{ fontSize: "2rem", color: "#0d2b6e" }}
                >
                  WE CARE ABOUT
                </h1>
                <h1
                  className="font-extrabold leading-tight"
                  style={{ fontSize: "2rem", color: "#1a56db" }}
                >
                  YOUR HEALTH
                </h1>
              </div>
            </div>

            {/* Description */}
            <p
              className="mt-5 leading-relaxed"
              style={{ fontSize: "0.92rem", color: "#64748b", maxWidth: "320px" }}
            >
              AI-powered smart healthcare monitoring for elderly patients.
              Real-time vitals, emergency SOS alerts, and instant doctor access — all in one place.
            </p>

            {/* Log in button */}
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{
                marginTop: "32px",
                width: "180px",
                padding: "13px 0",
                borderRadius: "50px",
                background: "#1a56db",
                color: "white",
                fontWeight: "700",
                fontSize: "1rem",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 18px rgba(26,86,219,0.35)",
                transition: "background 0.2s, transform 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#1648c0")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#1a56db")}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Log in
            </button>
          </div>

          {/* Right content: doctor image in circle with decorative arcs */}
          <div
            className="relative flex items-center justify-center"
            style={{ flex: "0 0 55%", height: "100%", minHeight: "480px" }}
          >
            {/* Dark blue decorative arc — top right */}
            <div
              style={{
                position: "absolute",
                top: "18px",
                right: "32px",
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                border: "14px solid #0d2b6e",
                clipPath: "polygon(50% 0%, 100% 0%, 100% 50%)",
                opacity: 0.9,
              }}
            />

            {/* Light blue thin arc — wraps left of circle */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "10px",
                transform: "translateY(-50%)",
                width: "340px",
                height: "340px",
                borderRadius: "50%",
                border: "3px solid #60a5fa",
                opacity: 0.5,
                pointerEvents: "none",
              }}
            />

            {/* Doctor image circle */}
            <div
              style={{
                width: "310px",
                height: "310px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "4px solid #bfdbfe",
                boxShadow: "0 8px 40px rgba(13,43,110,0.18)",
                position: "relative",
                zIndex: 2,
              }}
            >
              <img
                src={heroImg}
                alt="Healthcare professionals"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top center",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
