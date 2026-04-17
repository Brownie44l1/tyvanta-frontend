import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import { useToast } from "../components/useToast";
import api from "../api/axios";
import { getImage, getInstructor } from "../utils/courseHelpers";
import { C } from "../styles/tokens";

export default function MyLearning() {
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const { show, ToastUI } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, eRes] = await Promise.all([
        api.get("/courses"),
        api.get("/courses/my-enrollments"),
      ]);
      const allCourses = cRes.data.courses || [];
      const enrolledIds = (eRes.data.enrollments || []).map((e) => e.id);
      setEnrolled(allCourses.filter((c) => enrolledIds.includes(c.id)));
    } catch {
      show("Failed to load your courses.", false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const continueCourse = enrolled[enrolled.length - 1] || null;

  return (
    <Layout>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .ml-grid { display:grid; grid-template-columns:1fr; gap:16px; }
        @media (min-width:480px) { .ml-grid { grid-template-columns:repeat(2,1fr); } }
        @media (min-width:860px) { .ml-grid { grid-template-columns:repeat(auto-fill,minmax(268px,1fr)); } }
        .course-card { transition:transform .2s, box-shadow .2s; }
        .course-card:hover { transform:translateY(-4px); box-shadow:0 10px 36px rgba(26,46,74,.13); }
        .list-row { transition:box-shadow .2s; }
        .list-row:hover { box-shadow:0 4px 16px rgba(26,46,74,.08); }
        .resume-btn:hover { filter:brightness(1.1); }
      `}</style>
      {ToastUI}

      {/* Continue banner */}
      {!loading && continueCourse && (
        <div
          style={{
            background: "linear-gradient(135deg,#1a2e4a 0%,#2a4060 100%)",
            borderRadius: 16,
            padding: "24px 28px",
            display: "flex-col",
            alignItems: "center",
            gap: 20,
            marginBottom: 28,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div>
            <p
              style={{
                fontSize: 11,
                color: "#7a9cc4",
                marginBottom: 3,
                textTransform: "uppercase",
                letterSpacing: ".06em",
                fontWeight: 500,
              }}
            >
              Continue where you left off
            </p>
          </div>
          {/* Decorative circle */}
          <div
            style={{
              position: "absolute",
              right: -30,
              top: -30,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(181,160,110,.08)",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              position: "relative",
              zIndex: 1,
              flexWrap: "wrap",
            }}
          >
            {/* Thumbnail */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <img
                src={getImage(continueCourse.id)}
                alt={continueCourse.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {/* Text + button row */}
            <div className="continue-banner-body">
              <div style={{ flex: 1, minWidth: 0, zIndex: 1 }}>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: C.white,
                    marginBottom: 4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {continueCourse.title}
                </p>
                <p style={{ fontSize: 12, color: C.muted }}>
                  {getInstructor(continueCourse.id)}
                </p>
              </div>
            </div>
            <button
              className="resume-btn"
              style={{
                padding: "11px 24px",
                background: C.gold,
                border: "none",
                borderRadius: 9,
                color: C.white,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                zIndex: 1,
                transition: "filter .15s",
              }}
            >
              Resume
            </button>
          </div>

          <style>{`
      .continue-banner-body {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 16px;
        min-width: 0;
      }
      @media (max-width: 480px) {
        .continue-banner-body {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .resume-btn {
          width: 100%;
          text-align: center;
        }
      }
    `}</style>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <p style={{ fontSize: 13, color: C.muted }}>Loading your courses…</p>
      )}

      {/* Empty */}
      {!loading && enrolled.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: C.muted,
              marginBottom: 6,
            }}
          >
            You haven't enrolled in any courses yet.
          </p>
          <p style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 20 }}>
            Browse the catalog to get started.
          </p>
          <Link
            to="/catalog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 24px",
              background: C.navy,
              borderRadius: 9,
              color: C.white,
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Browse Courses
          </Link>
        </div>
      )}

      {/* Grid view */}
      {!loading && enrolled.length > 0 && view === "grid" && (
        <div className="ml-grid">
          {enrolled.map((c, i) => (
            <div
              key={c.id}
              className="course-card"
              style={{
                background: C.white,
                borderRadius: 14,
                overflow: "hidden",
                border: `1px solid ${C.border}`,
                display: "flex",
                flexDirection: "column",
                animation: "fadeUp .4s ease both",
                animationDelay: `${i * 0.06}s`,
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: 160,
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={getImage(c.id)}
                  alt={c.title}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top,rgba(26,46,74,.5) 0%,transparent 55%)",
                  }}
                />
              </div>
              <div
                style={{
                  padding: "14px 16px 16px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.navy,
                    marginBottom: 3,
                    lineHeight: 1.35,
                  }}
                >
                  {c.title}
                </p>
                <p style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
                  by {getInstructor(c.id)}
                </p>
                {c.description && (
                  <p
                    style={{
                      fontSize: 12,
                      color: C.muted,
                      lineHeight: 1.5,
                      marginBottom: 10,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {c.description}
                  </p>
                )}
                <div style={{ marginTop: "auto" }}>
                  <button
                    style={{
                      width: "100%",
                      padding: 10,
                      background: C.navy,
                      border: "1px solid #bbf7d0",
                      borderRadius: 9,
                      color: C.white,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Continue Learning
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {!loading && enrolled.length > 0 && view === "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {enrolled.map((c, i) => (
            <div
              key={c.id}
              className="list-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: C.white,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                padding: "14px 20px",
                animation: "fadeUp .4s ease both",
                animationDelay: `${i * 0.06}s`,
                flexWrap: "wrap",
              }}
            >
              <img
                src={getImage(c.id)}
                alt={c.title}
                style={{
                  width: 72,
                  height: 52,
                  borderRadius: 8,
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.navy,
                    marginBottom: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.title}
                </p>
                <p style={{ fontSize: 11, color: C.muted }}>
                  {getInstructor(c.id)}
                  {c.description &&
                    ` · ${c.description.slice(0, 60)}${
                      c.description.length > 60 ? "…" : ""
                    }`}
                </p>
              </div>
              <button
                style={{
                  padding: "8px 16px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 7,
                  color: "#16a34a",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "inherit",
                  marginLeft: "auto",
                }}
              >
                Continue
              </button>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
