import { useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: "/catalog",
    label: "Explore Courses",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    to: "/my-learning",
    label: "My Learning",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    to: "/appointments",
    label: "Appointments",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
];

function NavItem({ to, label, icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 16px",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: isActive ? 500 : 400,
        color: isActive ? "#d4c49a" : "#cbd5e1",
        background: isActive ? "rgba(181,160,110,.18)" : "transparent",
        textDecoration: "none",
        transition: "background .15s, color .15s",
      })}
    >
      <span style={{ opacity: 0.75, flexShrink: 0 }}>{icon}</span>
      {label}
    </NavLink>
  );
}

export default function Sidebar({ menuOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Close sidebar on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const sidebarContent = (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        background: "#1a2e4a",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "20px 20px 18px",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <svg width="38" height="38" viewBox="0 0 42 42" fill="none">
          <rect x="7" y="7" width="9" height="28" rx="2.5" fill="#fff" />
          <rect x="7" y="26" width="28" height="9" rx="2.5" fill="#b5a06e" />
        </svg>
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "0.18em",
          }}
        >
          TYVANTA
        </span>
      </div>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          padding: "16px 12px",
          flex: 1,
        }}
      >
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} onClick={onClose} />
        ))}
      </nav>

      <div style={{ margin: "0 12px 16px" }}>
        <div
          onClick={handleLogout}
          style={{
            borderRadius: 12,
            padding: 14,
            textAlign: "center",
            background: "rgba(181,160,110,.15)",
            border: "1px solid rgba(181,160,110,.25)",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#b5a06e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 8px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>
          <p
            style={{
              color: "#d4c49a",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 0,
            }}
          >
            Logout
          </p>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: always visible */}
      <div
        className="sidebar-desktop"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 40,
          display: "none",
        }}
      >
        {sidebarContent}
      </div>

      {/* Mobile: overlay, only when open */}
      {menuOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 45,
            background: "rgba(0,0,0,.5)",
            display: "flex",
          }}
        >
          <div onClick={(e) => e.stopPropagation()}>{sidebarContent}</div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .sidebar-desktop { display: block !important; }
        }
      `}</style>
    </>
  );
}
