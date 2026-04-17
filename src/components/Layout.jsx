import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar menuOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div
        className="layout-content"
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        <Topbar
          menuOpen={menuOpen}
          onMenuClick={() => setMenuOpen((v) => !v)}
        />
        <main style={{ flex: 1, padding: "28px 32px", background: "#f4f6f9" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
