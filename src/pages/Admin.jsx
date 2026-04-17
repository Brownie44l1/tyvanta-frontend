import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/useToast";
import api from "../api/axios";

function Pill({ type, children }) {
  const map = {
    green: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
    yellow: { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    gray: { color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
    red: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  };
  const s = map[type] || map.gray;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 500,
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
      }}
    >
      {children}
    </span>
  );
}

const EMPTY_FORM = { title: "", description: "", status: "draft" };

export default function Admin() {
  const navigate = useNavigate();
  const { show, ToastUI } = useToast();
  const [activeSection, setActiveSection] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── lock body scroll when mobile sidebar is open ── */
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  /* ── close sidebar on nav ── */
  useEffect(() => {
    setSidebarOpen(false);
  }, [activeSection]);

  /* ── guard: admin only ── */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.role !== "admin") navigate("/dashboard");
  }, []);

  /* ── fetch data ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, apptRes] = await Promise.all([
          api.get("/courses/admin"),
          api.get("/appointments/admin"),
        ]);
        setCourses(
          (coursesRes.data.courses || []).map((c) => ({
            id: c.id,
            title: c.title,
            created_by: c.created_by || "—",
            enrolled: c.enrolled ?? 0,
            created_at: c.created_at
              ? new Date(c.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—",
          }))
        );
        setAppointments(apptRes.data.appointments || []);
      } catch {
        show("Failed to load data.", false);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required.";
    return errs;
  };

  const handleSave = async (forceStatus) => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }
    setSaving(true);
    const status = forceStatus || form.status;
    try {
      const res = await api.post("/courses", {
        title: form.title.trim(),
        description: form.description.trim(),
        status,
      });
      const created = res.data.course || res.data;
      const newCourse = {
        id: created.id || Date.now(),
        title: form.title.trim(),
        created_by: created.created_by || "—",
        enrolled: 0,
        created_at: created.created_at
          ? new Date(created.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
      };
      setCourses((prev) => [newCourse, ...prev]);
      setShowModal(false);
      setForm(EMPTY_FORM);
      show(
        status === "published"
          ? `🎉 "${newCourse.title}" published!`
          : `"${newCourse.title}" saved as draft.`
      );
    } catch (err) {
      show(err.response?.data?.error || "Could not save course.", false);
    } finally {
      setSaving(false);
    }
  };

  const deleteCourse = async (id) => {
    const c = courses.find((c) => c.id === id);
    try {
      await api.delete(`/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      show(`"${c?.title}" deleted.`);
    } catch (err) {
      show(err.response?.data?.error || "Could not delete course.", false);
    }
  };

  /* ── reusable form field ── */
  const Field = ({
    label,
    name,
    type = "text",
    options,
    placeholder,
    required,
  }) => (
    <div>
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#1a2e4a",
          display: "block",
          marginBottom: 5,
          textTransform: "uppercase",
          letterSpacing: ".04em",
        }}
      >
        {label}
        {required && " *"}
      </label>
      {options ? (
        <select
          value={form[name]}
          onChange={(e) => {
            setForm((f) => ({ ...f, [name]: e.target.value }));
            if (formErrors[name]) setFormErrors((f) => ({ ...f, [name]: "" }));
          }}
          style={{
            width: "100%",
            padding: "10px 14px",
            border: `1px solid ${formErrors[name] ? "#ef4444" : "#e2e8f0"}`,
            borderRadius: 8,
            fontSize: 13,
            fontFamily: "inherit",
            color: "#1a2e4a",
            outline: "none",
            background: "#fff",
          }}
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          value={form[name]}
          onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "10px 14px",
            border: `1px solid ${formErrors[name] ? "#ef4444" : "#e2e8f0"}`,
            borderRadius: 8,
            fontSize: 13,
            fontFamily: "inherit",
            color: "#1a2e4a",
            outline: "none",
            resize: "none",
            height: 80,
            boxSizing: "border-box",
          }}
        />
      ) : (
        <input
          type={type}
          value={form[name]}
          onChange={(e) => {
            setForm((f) => ({ ...f, [name]: e.target.value }));
            if (formErrors[name]) setFormErrors((f) => ({ ...f, [name]: "" }));
          }}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "10px 14px",
            border: `1px solid ${formErrors[name] ? "#ef4444" : "#e2e8f0"}`,
            borderRadius: 8,
            fontSize: 13,
            fontFamily: "inherit",
            color: "#1a2e4a",
            outline: "none",
            background: "#fff",
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#b5a06e")}
          onBlur={(e) =>
            (e.target.style.borderColor = formErrors[name]
              ? "#ef4444"
              : "#e2e8f0")
          }
        />
      )}
      {formErrors[name] && (
        <p style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>
          {formErrors[name]}
        </p>
      )}
    </div>
  );

  /* ── sidebar (shared by desktop + mobile overlay) ── */
  const sidebarContent = (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        background: "#0f1c30",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Logo */}
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
        <div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: ".18em",
            }}
          >
            TYVANTA
          </span>
          <span
            style={{
              display: "block",
              fontSize: 10,
              fontWeight: 600,
              color: "#b5a06e",
              letterSpacing: ".12em",
            }}
          >
            ADMIN
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          padding: "16px 12px",
          flex: 1,
        }}
      >
        {[
          ["courses", "Courses"],
          ["appointments", "Appointments"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 16px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: activeSection === key ? 500 : 400,
              color: activeSection === key ? "#d4c49a" : "#cbd5e1",
              background:
                activeSection === key ? "rgba(181,160,110,.22)" : "transparent",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "inherit",
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Logout */}
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

  /* ══════════════════════════ RENDER ══════════════════════════ */
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Ubuntu', sans-serif",
      }}
    >
      <style>{`
        /* ── keyframes ── */
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }

        /* ── mobile-first base ── */
        .adm-sidebar-desktop { display:none; }
        .adm-hamburger        { display:flex; }
        .adm-layout           { margin-left:0; width:100%; }
        .adm-main             { padding:16px; }
        .adm-header           { padding:10px 16px; gap:8px; }
        .adm-stats            { display:grid; grid-template-columns:1fr; gap:10px; margin-bottom:20px; }
        .adm-stat-card        { padding:16px 18px; }
        .adm-stat-value       { font-size:26px; }
        .adm-modal-wrap       { padding:16px 14px; border-radius:14px; }
        .adm-tab-label-full   { display:none; }
        .adm-tab-label-short  { display:inline; }
        .adm-title-date       { display:none; }
        .adm-new-btn-label    { display:none; }
        .adm-table-wrap       { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .adm-table            { min-width:480px; }
        .adm-appt-table       { min-width:520px; }
        th, td                { white-space:nowrap; }

        /* ── sm: 480px ── */
        @media(min-width:480px){
          .adm-stats           { grid-template-columns:repeat(2,1fr); }
        }

        /* ── md: 768px ── */
        @media(min-width:768px){
          .adm-sidebar-desktop { display:block; position:fixed; top:0; left:0; bottom:0; z-index:40; }
          .adm-hamburger        { display:none !important; }
          .adm-layout           { margin-left:240px; }
          .adm-main             { padding:28px 32px; }
          .adm-header           { padding:14px 32px; }
          .adm-stats            { grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:28px; }
          .adm-stat-card        { padding:20px 22px; }
          .adm-stat-value       { font-size:32px; }
          .adm-modal-wrap       { padding:28px; border-radius:20px; }
          .adm-tab-label-full   { display:inline; }
          .adm-tab-label-short  { display:none; }
          .adm-title-date       { display:block; }
          .adm-new-btn-label    { display:inline; }
        }
      `}</style>

      {/* ── Desktop sidebar (fixed) ── */}
      <div className="adm-sidebar-desktop">{sidebarContent}</div>

      {/* ── Mobile overlay sidebar ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
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

      {/* ── Main area ── */}
      <div
        className="adm-layout"
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        {/* ─ Header ─ */}
        <header
          className="adm-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fff",
            borderBottom: "1px solid #e9edf2",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Hamburger */}
            {!sidebarOpen && (
              <button
                className="adm-hamburger"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
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
            <div>
              <h1
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#1a2e4a",
                  margin: 0,
                }}
              >
                Admin Dashboard
              </h1>
              <p
                className="adm-title-date"
                style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* New Course button */}
          <button
            onClick={() => {
              setForm(EMPTY_FORM);
              setFormErrors({});
              setShowModal(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              background: "#b5a06e",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            <span>＋</span>
            <span className="adm-new-btn-label">New Course</span>
          </button>
        </header>

        {/* ─ Main content ─ */}
        <main className="adm-main" style={{ flex: 1, background: "#f4f6f9" }}>
          {/* Stats cards */}
          <div className="adm-stats">
            {[
              { label: "Total Courses", value: courses.length },
              {
                label: "Published",
                value: courses.filter((c) => c.status === "published").length,
              },
              { label: "Appointments", value: appointments.length },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="adm-stat-card"
                style={{
                  background: "#fff",
                  border: "1px solid #e9edf2",
                  borderRadius: 12,
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: ".07em",
                    marginBottom: 8,
                  }}
                >
                  {label}
                </p>
                <p
                  className="adm-stat-value"
                  style={{
                    fontWeight: 700,
                    color: "#1a2e4a",
                    lineHeight: 1,
                    margin: 0,
                  }}
                >
                  {loadingData ? "—" : value}
                </p>
              </div>
            ))}
          </div>

          {/* Section tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #e9edf2",
              marginBottom: 20,
            }}
          >
            {[
              ["courses", "Course Manager", "Courses"],
              ["appointments", "Appointment Manager", "Appts"],
            ].map(([key, full, short]) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                style={{
                  padding: "10px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: activeSection === key ? "#1a2e4a" : "#94a3b8",
                  borderBottom: `2px solid ${
                    activeSection === key ? "#b5a06e" : "transparent"
                  }`,
                  transition: "color .15s, border-color .15s",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                }}
              >
                <span className="adm-tab-label-short">{short}</span>
                <span className="adm-tab-label-full">{full}</span>
              </button>
            ))}
          </div>

          {/* ── Courses table ── */}
          {activeSection === "courses" && (
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e9edf2",
                overflow: "hidden",
              }}
            >
              <div className="adm-table-wrap">
                <table
                  className="adm-table"
                  style={{ width: "100%", borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr style={{ background: "#1a2e4a" }}>
                      {[
                        "COURSE",
                        "CREATED BY",
                        "ENROLLED",
                        "CREATED AT",
                        "ACTIONS",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "12px 20px",
                            textAlign: "left",
                            fontSize: 11,
                            fontWeight: 500,
                            color: "#fff",
                            letterSpacing: ".05em",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loadingData ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "24px 20px",
                            textAlign: "center",
                            color: "#94a3b8",
                            fontSize: 13,
                          }}
                        >
                          Loading…
                        </td>
                      </tr>
                    ) : courses.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "24px 20px",
                            textAlign: "center",
                            color: "#94a3b8",
                            fontSize: 13,
                          }}
                        >
                          No courses yet.
                        </td>
                      </tr>
                    ) : (
                      courses.map((c, i) => (
                        <tr
                          key={c.id}
                          style={{
                            borderBottom: "1px solid #f1f4f8",
                            background: i % 2 ? "#fafbfc" : "#fff",
                          }}
                        >
                          <td
                            style={{
                              padding: "14px 20px",
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#1a2e4a",
                              minWidth: 140,
                            }}
                          >
                            {c.title}
                          </td>
                          <td
                            style={{
                              padding: "14px 20px",
                              fontSize: 12,
                              color: "#64748b",
                            }}
                          >
                            {c.created_by}
                          </td>
                          <td
                            style={{
                              padding: "14px 20px",
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#1a2e4a",
                            }}
                          >
                            {c.enrolled.toLocaleString()}
                          </td>
                          <td
                            style={{
                              padding: "14px 20px",
                              fontSize: 12,
                              color: "#64748b",
                            }}
                          >
                            {c.created_at}
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <button
                              onClick={() => deleteCourse(c.id)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 7,
                                fontSize: 11,
                                fontWeight: 500,
                                fontFamily: "inherit",
                                cursor: "pointer",
                                border: "1px solid #e2e8f0",
                                background: "#fff",
                                color: "#64748b",
                                transition: "all .15s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#dc2626";
                                e.currentTarget.style.color = "#fff";
                                e.currentTarget.style.borderColor = "#dc2626";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#fff";
                                e.currentTarget.style.color = "#64748b";
                                e.currentTarget.style.borderColor = "#e2e8f0";
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Appointments table ── */}
          {activeSection === "appointments" && (
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e9edf2",
                overflow: "hidden",
              }}
            >
              <div className="adm-table-wrap">
                <table
                  className="adm-appt-table"
                  style={{ width: "100%", borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr style={{ background: "#1a2e4a" }}>
                      {[
                        "STUDENT",
                        "SPECIALIST",
                        "DATE & TIME",
                        "REASON",
                        "STATUS",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "12px 20px",
                            textAlign: "left",
                            fontSize: 11,
                            fontWeight: 500,
                            color: "#fff",
                            letterSpacing: ".05em",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loadingData ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "24px 20px",
                            textAlign: "center",
                            color: "#94a3b8",
                            fontSize: 13,
                          }}
                        >
                          Loading…
                        </td>
                      </tr>
                    ) : appointments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "24px 20px",
                            textAlign: "center",
                            color: "#94a3b8",
                            fontSize: 13,
                          }}
                        >
                          No appointments found.
                        </td>
                      </tr>
                    ) : (
                      appointments.map((r, i) => (
                        <tr
                          key={r.id}
                          style={{
                            borderBottom: "1px solid #f1f4f8",
                            background: i % 2 ? "#fafbfc" : "#fff",
                          }}
                        >
                          <td
                            style={{
                              padding: "14px 20px",
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#1a2e4a",
                              minWidth: 120,
                            }}
                          >
                            {r.user_name || r.user_email || "—"}
                          </td>
                          <td
                            style={{
                              padding: "14px 20px",
                              fontSize: 13,
                              color: "#64748b",
                            }}
                          >
                            {r.practitioner || "—"}
                          </td>
                          <td
                            style={{
                              padding: "14px 20px",
                              fontSize: 13,
                              color: "#64748b",
                            }}
                          >
                            {r.date} · {r.time}
                          </td>
                          <td
                            style={{
                              padding: "14px 20px",
                              fontSize: 13,
                              color: "#64748b",
                              maxWidth: 160,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {r.reason || "—"}
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <Pill
                              type={
                                r.status === "completed"
                                  ? "green"
                                  : r.status === "cancelled"
                                  ? "red"
                                  : "yellow"
                              }
                            >
                              {r.status
                                ? r.status.charAt(0).toUpperCase() +
                                  r.status.slice(1)
                                : "Upcoming"}
                            </Pill>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ══ Create Course Modal ══ */}
      {showModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,28,48,.6)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            className="adm-modal-wrap"
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: 480,
              maxHeight: "90vh",
              overflowY: "auto",
              animation: "modalIn .3s ease",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#1a2e4a",
                    margin: 0,
                  }}
                >
                  Create New Course
                </h2>
                <p
                  style={{ fontSize: 12, color: "#94a3b8", margin: "3px 0 0" }}
                >
                  Fill in the details to publish a new course.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "#f4f6f9",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field
                label="Course Title"
                name="title"
                placeholder="e.g. Advanced JavaScript Patterns"
                required
              />
              <Field
                label="Description"
                name="description"
                type="textarea"
                placeholder="What will students learn?"
              />
              <Field
                label="Status"
                name="status"
                options={["draft", "published"]}
              />
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 22,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  minWidth: 80,
                  padding: 11,
                  border: "1px solid #e2e8f0",
                  borderRadius: 9,
                  background: "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#64748b",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Discard
              </button>
              <button
                onClick={() => handleSave("draft")}
                disabled={saving}
                style={{
                  flex: 1,
                  minWidth: 80,
                  padding: 11,
                  border: "1px solid #1a2e4a",
                  borderRadius: 9,
                  background: "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#1a2e4a",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSave("published")}
                disabled={saving}
                style={{
                  flex: 2,
                  minWidth: 120,
                  padding: 11,
                  background: "#b5a06e",
                  border: "none",
                  borderRadius: 9,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {saving ? "Saving…" : "Publish Course →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {ToastUI}
    </div>
  );
}