import { useState, useEffect } from "react";

export default function Topbar({ onMenuClick, menuOpen }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const TODAY = new Date().toLocaleDateString("en-US", {
    ...(isMobile ? {} : { weekday: "long" }),
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#fff",
        borderBottom: "1px solid #e9edf2",
        position: "sticky",
        top: 0,
        zIndex: 30,
        padding: "0 30px",
        height: "64px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Hamburger — only renders on mobile, only shows when menu is closed */}
        {!menuOpen && (
          <button
            onClick={onMenuClick}
            className="mobile-hamburger-btn"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1a2e4a"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>{TODAY}</p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? 28 : 42,
        }}
      >
        {/* Notification bell */}
        <button
          style={{
            position: "relative",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1a2e4a"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 8,
              height: 8,
              background: "#b5a06e",
              borderRadius: "50%",
            }}
          />
        </button>

        {/* Avatar + name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#1a2e4a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            {initials}
          </div>
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1a2e4a",
                  margin: 0,
                }}
              >
                {user?.name || "User"}
              </p>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .mobile-hamburger-btn { display: flex; }
        @media (min-width: 768px) {
          .mobile-hamburger-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
}
