import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useToast } from "../components/useToast";
import api from "../api/axios";
import { getImage } from "../utils/courseHelpers";
import { C } from "../styles/tokens";

function CourseCard({ course, isEnrolled, onEnroll, enrolling }) {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 14,
        border: `1px solid ${C.border}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "relative",
          height: 160,
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <img
          src={getImage(course.id)}
          alt={course.title}
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
        {isEnrolled && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "#22c55e",
              color: C.white,
              fontSize: 10,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 999,
            }}
          >
            Enrolled
          </div>
        )}
      </div>
      <div
        style={{
          padding: "14px 16px 16px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: C.navy,
            lineHeight: 1.35,
          }}
        >
          {course.title}
        </p>
        <p style={{ fontSize: 11, color: C.muted }}>
          by {course.created_by || "Tyvanta"}
        </p>
        {course.description && (
          <p
            style={{
              fontSize: 12,
              color: C.muted,
              lineHeight: 1.6,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {course.description}
          </p>
        )}
        <button
          onClick={() => !isEnrolled && onEnroll(course.id)}
          disabled={isEnrolled || enrolling === course.id}
          style={{
            marginTop: "auto",
            padding: "10px",
            background: isEnrolled ? "#f0fdf4" : C.navy,
            border: isEnrolled ? "1px solid #bbf7d0" : "none",
            borderRadius: 9,
            color: isEnrolled ? "#16a34a" : C.white,
            fontSize: 13,
            fontWeight: 500,
            cursor: isEnrolled ? "default" : "pointer",
            fontFamily: "inherit",
            opacity: enrolling === course.id ? 0.6 : 1,
            transition: "opacity .15s",
          }}
        >
          {isEnrolled
            ? "Continue Learning"
            : enrolling === course.id
            ? "Enrolling…"
            : "Enroll"}
        </button>
      </div>
    </div>
  );
}

export default function Catalog() {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(null);
  const { show, ToastUI } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cRes, eRes] = await Promise.all([
        api.get("/courses"),
        api.get("/courses/my-enrollments"),
      ]);
      setCourses(cRes.data.courses || []);
      // FIX: The enrollment response joins courses and returns c.id (the course id).
      // Use e.id (which IS the course id from the JOIN query) — confirmed from pg.repository.
      setEnrolledIds((eRes.data.enrollments || []).map((e) => e.id));
    } catch {
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      await api.post("/courses/enroll", { course_id: courseId });
      setEnrolledIds((prev) => [...prev, courseId]);
      show(`Enrolled in "${courses.find((x) => x.id === courseId)?.title}"!`);
    } catch (err) {
      show(err.response?.data?.error || "Could not enroll. Try again.", false);
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <Layout>
      <style>{`
        .course-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width: 480px) { .course-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 860px) { .course-grid { grid-template-columns: repeat(auto-fill, minmax(268px, 1fr)); gap: 18px; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .course-grid > * { animation: fadeUp .4s ease both; }
      `}</style>
      {ToastUI}

      {/* Hero */}
      <div
        style={{
          background:
            "linear-gradient(135deg,#1a2e4a 0%,#162540 60%,#2a4060 100%)",
          borderRadius: 16,
          padding: "28px 24px",
          marginBottom: 24,
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: C.gold,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Course Catalog
        </p>
        <h1
          style={{
            fontSize: "clamp(18px,4vw,24px)",
            fontWeight: 700,
            color: C.white,
            marginBottom: 6,
          }}
        >
          What do you want to learn today?
        </h1>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
          Browse expert-led courses.
        </p>
        <div style={{ display: "flex", gap: 24 }}>
          <div>
            <p
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: C.white,
                lineHeight: 1,
              }}
            >
              {loading ? "…" : courses.length}
            </p>
            <p style={{ fontSize: 11, color: "#7a9cc4" }}>Courses</p>
          </div>
          <div>
            <p
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: C.white,
                lineHeight: 1,
              }}
            >
              {loading ? "…" : enrolledIds.length}
            </p>
            <p style={{ fontSize: 11, color: "#7a9cc4" }}>My Enrollments</p>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: 14, color: "#ef4444", marginBottom: 12 }}>
            {error}
          </p>
          <button
            onClick={fetchData}
            style={{
              padding: "10px 24px",
              background: C.navy,
              border: "none",
              borderRadius: 9,
              color: C.white,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Try again
          </button>
        </div>
      )}

      {loading && !error && (
        <p style={{ fontSize: 13, color: C.muted }}>Loading courses…</p>
      )}
      {!loading && !error && courses.length === 0 && (
        <p style={{ fontSize: 13, color: C.muted }}>
          No courses available yet.
        </p>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="course-grid">
          {courses.map((course, i) => (
            <div key={course.id} style={{ animationDelay: `${i * 0.06}s` }}>
              <CourseCard
                course={course}
                isEnrolled={enrolledIds.includes(course.id)}
                onEnroll={handleEnroll}
                enrolling={enrolling}
              />
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
