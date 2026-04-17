import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useToast } from "../components/useToast";
import api from "../api/axios";
import { getImage, getInstructor } from "../utils/courseHelpers";
import { C } from "../styles/tokens";

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [course, setCourse] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [loadingApts, setLoadingApts] = useState(true);
  const { show, ToastUI } = useToast();

  const fetchCourse = useCallback(async () => {
    try {
      const [cRes, eRes] = await Promise.all([
        api.get("/courses"),
        api.get("/courses/my-enrollments"),
      ]);
      const allCourses = cRes.data.courses || [];
      const enrolledIds = (eRes.data.enrollments || []).map((e) => e.id);
      const enrolled = allCourses.filter((c) => enrolledIds.includes(c.id));
      setCourse(enrolled[enrolled.length - 1] || null);
    } catch {
      show("Failed to load course data.", false);
    } finally {
      setLoadingCourse(false);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      const r = await api.get("/appointments");
      const all = r.data.appointments || [];
      const upcoming = all
        .filter((a) => a.status !== "completed" && a.status !== "cancelled")
        .slice(0, 2);
      setAppointments(upcoming);
    } catch {
      show("Failed to load appointments.", false);
    } finally {
      setLoadingApts(false);
    }
  }, []);

  useEffect(() => {
    fetchCourse();
    fetchAppointments();
  }, [fetchCourse, fetchAppointments]);

  return (
    <Layout>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ── Welcome banner buttons ── */
        .db-btn-primary {
          padding: 10px 22px;
          background: #b5a06e;
          border: none;
          border-radius: 9px;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          display: inline-block;
          transition: filter .15s, background .15s;
        }
        .db-btn-primary:hover { filter: brightness(1.12); }

        .db-btn-ghost {
          padding: 10px 22px;
          border: 1px solid rgba(255,255,255,.2);
          border-radius: 9px;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          display: inline-block;
          transition: background .15s, border-color .15s;
        }
        .db-btn-ghost:hover {
          background: rgba(255,255,255,.1);
          border-color: rgba(255,255,255,.4);
        }

        /* ── Resume button ── */
        .db-resume-btn {
          width: 100%;
          padding: 10px;
          background: #1a2e4a;
          border: none;
          border-radius: 9px;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: filter .15s, background .15s;
        }
        .db-resume-btn:hover { filter: brightness(1.15); }

        /* ── Book Appointment link ── */
        .db-book-btn {
          display: block;
          text-align: center;
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          color: #64748b;
          font-size: 13px;
          text-decoration: none;
          margin-top: 4px;
          transition: background .15s, border-color .15s, color .15s;
        }
        .db-book-btn:hover {
          background: #f4f6f9;
          border-color: #b5a06e;
          color: #1a2e4a;
        }

        /* ── View-all links ── */
        .db-view-all {
          font-size: 12px;
          color: #b5a06e;
          text-decoration: none;
          transition: opacity .15s;
        }
        .db-view-all:hover { opacity: .7; }

        /* ── Two-column grid collapses to 1 on mobile ── */
        .db-main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 680px) {
          .db-main-grid { grid-template-columns: 1fr; }
        }

        /* ── Welcome banner responsive padding ── */
        .db-banner {
          background: linear-gradient(135deg,#1a2e4a 0%,#162540 60%,#2a4060 100%);
          border-radius: 16px;
          padding: 32px 40px;
          margin-bottom: 28px;
          position: relative;
          overflow: hidden;
        }
        @media (max-width: 480px) {
          .db-banner { padding: 24px 20px; }
        }

        /* ── Appointment card responsive ── */
        .db-apt-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px solid #e9edf2;
          flex-wrap: wrap;
        }
      `}</style>
      {ToastUI}

      {/* ── Welcome banner ── */}
      <div className="db-banner">
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(181,160,110,.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: 80,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(181,160,110,.05)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.gold,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Welcome back
          </p>
          <h1
            style={{
              fontSize: "clamp(20px,4vw,26px)",
              fontWeight: 700,
              color: "#fff",
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            {user?.name || "Student"} 👋
          </h1>
          <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 20 }}>
            Keep learning and growing every day!
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link to="/catalog" className="db-btn-primary">
              Explore Courses
            </Link>
            <Link to="/my-learning" className="db-btn-ghost">
              My Learning
            </Link>
          </div>
        </div>
      </div>

      {/* ── Two-column cards ── */}
      <div className="db-main-grid">
        {/* ── Continue Learning ── */}
        <div
          style={{
            background: C.white,
            borderRadius: 14,
            border: `1px solid ${C.border}`,
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 600, color: C.navy }}>
              Continue Learning
            </h2>
            <Link to="/my-learning" className="db-view-all">
              View all →
            </Link>
          </div>

          {loadingCourse && (
            <p style={{ fontSize: 13, color: C.muted }}>Loading…</p>
          )}

          {!loadingCourse && !course && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
                No courses enrolled yet.
              </p>
              <Link
                to="/catalog"
                style={{
                  fontSize: 13,
                  color: C.gold,
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Browse Courses
              </Link>
            </div>
          )}

          {!loadingCourse && course && (
            <div>
              <div
                style={{
                  position: "relative",
                  height: 140,
                  borderRadius: 10,
                  overflow: "hidden",
                  marginBottom: 14,
                }}
              >
                <img
                  src={getImage(course.id)}
                  alt={course.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top,rgba(26,46,74,.7) 0%,transparent 60%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 12,
                    left: 14,
                    right: 14,
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#fff",
                      marginBottom: 2,
                    }}
                  >
                    {course.title}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>
                    by {getInstructor(course.id)}
                  </p>
                </div>
              </div>

              {/* Static progress bar — as requested */}
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 5,
                  }}
                >
                  <span style={{ fontSize: 12, color: C.muted }}>
                    In progress
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "#e9edf2",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 999,
                      background: C.gold,
                      width: "45%",
                      transition: "width 1.2s ease",
                    }}
                  />
                </div>
              </div>

              <button className="db-resume-btn">Resume ▶</button>
            </div>
          )}
        </div>

        {/* ── Upcoming Appointments ── */}
        <div
          style={{
            background: C.white,
            borderRadius: 14,
            border: `1px solid ${C.border}`,
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 600, color: C.navy }}>
              Upcoming Appointments
            </h2>
            <Link to="/appointments" className="db-view-all">
              View all
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {loadingApts && (
              <p style={{ fontSize: 13, color: C.muted }}>Loading…</p>
            )}

            {!loadingApts && appointments.length === 0 && (
              <p style={{ fontSize: 13, color: C.muted }}>
                No upcoming appointments.
              </p>
            )}

            {!loadingApts &&
              appointments.map((apt) => {
                const d = new Date(apt.date);
                const mon = SHORT_MONTHS[d.getMonth()]?.toUpperCase();
                const day = d.getDate();
                return (
                  <div key={apt.id} className="db-apt-row">
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: C.navy,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 8,
                          fontWeight: 600,
                          color: "rgba(255,255,255,.7)",
                          lineHeight: 1,
                        }}
                      >
                        {mon}
                      </p>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#fff",
                          lineHeight: 1,
                        }}
                      >
                        {day}
                      </p>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: C.navy,
                          marginBottom: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {apt.practitioner || "Appointment"}
                      </p>
                      <p style={{ fontSize: 11, color: C.muted }}>
                        {d.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                        {apt.time ? ` · ${apt.time.slice(0, 5)}` : ""}
                        {apt.reason ? ` · ${apt.reason}` : ""}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: "#d97706",
                        background: "#fffbeb",
                        padding: "2px 8px",
                        borderRadius: 999,
                        border: "1px solid #fde68a",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Upcoming
                    </span>
                  </div>
                );
              })}

            <Link to="/appointments" className="db-book-btn">
              Book Appointment
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
