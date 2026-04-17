import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="32"
        height="32"
        viewBox="0 0 38 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="7" y="7" width="9" height="28" rx="2.5" fill="#1a2e4a" />
        <rect x="7" y="26" width="28" height="9" rx="2.5" fill="#b5a06e" />
      </svg>
      <p
        style={{ color: "#1a2e4a", letterSpacing: "0.15em" }}
        className="text-lg font-bold leading-none"
      >
        TYVANTA
      </p>
    </div>
  );
}

function validateCourse({ title, description }) {
  const errors = {};
  const cleanTitle = title.trim();

  if (!cleanTitle) {
    errors.title = "Course title is required.";
  } else if (cleanTitle.length < 3) {
    errors.title = "Title must be at least 3 characters.";
  } else if (cleanTitle.length > 200) {
    errors.title = "Title is too long (max 200 characters).";
  } else if (/<[^>]*>/.test(cleanTitle)) {
    errors.title = "Title cannot contain HTML.";
  }

  if (description && description.length > 1000) {
    errors.description = "Description is too long (max 1000 characters).";
  } else if (description && /<[^>]*>/.test(description)) {
    errors.description = "Description cannot contain HTML.";
  }

  return errors;
}

export default function Courses() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  // Create course form (admin only)
  const [showForm, setShowForm] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: "", description: "" });
  const [formErrors, setFormErrors] = useState({});
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const fetchData = async () => {
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        api.get("/courses"),
        api.get("/courses/my-enrollments"),
      ]);
      setCourses(coursesRes.data.courses);
      setEnrolledIds(enrollmentsRes.data.enrollments.map((e) => e.id));
    } catch (err) {
      setToast({ message: "Failed to load courses.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (course_id) => {
    setEnrolling(course_id);
    try {
      await api.post("/courses/enroll", { course_id });
      setToast({ message: "Enrolled successfully!", type: "success" });
      fetchData();
    } catch (err) {
      setToast({
        message: err.response?.data?.error || "Could not enroll.",
        type: "error",
      });
    } finally {
      setEnrolling(null);
    }
  };

  const handleCourseFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "title" && value.length > 200) return;
    if (name === "description" && value.length > 1000) return;
    setCourseForm({ ...courseForm, [name]: value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    const errors = validateCourse(courseForm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setCreating(true);
    try {
      await api.post("/courses", {
        title: courseForm.title.trim(),
        description: courseForm.description.trim(),
      });
      setToast({ message: "Course created successfully!", type: "success" });
      setCourseForm({ title: "", description: "" });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setToast({
        message: err.response?.data?.error || "Could not create course.",
        type: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleFocus = (e) => (e.target.style.borderColor = "#b5a06e");
  const handleBlur = (e) =>
    (e.target.style.borderColor = formErrors[e.target.name]
      ? "#ef4444"
      : "#e5e7eb");

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg text-sm font-medium shadow-md transition-all ${
            toast.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-6">
          <Link
            to="/appointments"
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Appointments
          </Link>
          <span className="text-sm font-medium" style={{ color: "#1a2e4a" }}>
            {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#1a2e4a" }}>
              Courses
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Browse and enroll in available courses
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-sm font-medium px-4 py-2 rounded-lg text-white transition-colors"
              style={{ backgroundColor: "#1a2e4a" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#14233a")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#1a2e4a")}
            >
              {showForm ? "Cancel" : "+ New Course"}
            </button>
          )}
        </div>

        {/* Admin: Create course form */}
        {isAdmin && showForm && (
          <form
            onSubmit={handleCreateCourse}
            noValidate
            className="bg-white border border-gray-100 rounded-xl p-6 mb-6"
          >
            <h2
              className="text-sm font-semibold mb-4"
              style={{ color: "#1a2e4a" }}
            >
              New Course
            </h2>
            <div className="mb-3.5">
              <input
                type="text"
                name="title"
                value={courseForm.title}
                onChange={handleCourseFormChange}
                placeholder="Course title"
                maxLength={200}
                className="w-full px-4 py-3 border rounded-lg text-sm placeholder-gray-400 focus:outline-none transition-colors"
                style={{
                  color: "#1a2e4a",
                  borderColor: formErrors.title ? "#ef4444" : "#e5e7eb",
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              {formErrors.title && (
                <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
              )}
            </div>
            <div className="mb-4">
              <textarea
                name="description"
                value={courseForm.description}
                onChange={handleCourseFormChange}
                placeholder="Course description (optional)"
                maxLength={1000}
                rows={3}
                className="w-full px-4 py-3 border rounded-lg text-sm placeholder-gray-400 focus:outline-none transition-colors resize-none"
                style={{
                  color: "#1a2e4a",
                  borderColor: formErrors.description ? "#ef4444" : "#e5e7eb",
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <div className="flex justify-between items-center mt-1">
                {formErrors.description ? (
                  <p className="text-red-500 text-xs">
                    {formErrors.description}
                  </p>
                ) : (
                  <span />
                )}
                <p className="text-xs text-gray-300">
                  {courseForm.description.length}/1000
                </p>
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-colors"
              style={{ backgroundColor: "#b5a06e" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#9e8a5c")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#b5a06e")}
            >
              {creating ? "Creating..." : "Create Course"}
            </button>
          </form>
        )}

        {/* Course list */}
        {loading ? (
          <p className="text-sm text-gray-400">Loading courses...</p>
        ) : courses.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
            <p className="text-gray-400 text-sm">No courses available yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {courses.map((course) => {
              const isEnrolled = enrolledIds.includes(course.id);
              return (
                <div
                  key={course.id}
                  className="bg-white border border-gray-100 rounded-xl p-5 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-sm"
                      style={{ color: "#1a2e4a" }}
                    >
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                        {course.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-300 mt-2">
                      By {course.created_by}
                    </p>
                  </div>
                  <button
                    onClick={() => !isEnrolled && handleEnroll(course.id)}
                    disabled={isEnrolled || enrolling === course.id}
                    className="shrink-0 text-xs font-medium px-4 py-2 rounded-lg transition-colors disabled:cursor-default"
                    style={{
                      backgroundColor: isEnrolled ? "#f0fdf4" : "#b5a06e",
                      color: isEnrolled ? "#16a34a" : "#ffffff",
                    }}
                    onMouseEnter={(e) => {
                      if (!isEnrolled)
                        e.target.style.backgroundColor = "#9e8a5c";
                    }}
                    onMouseLeave={(e) => {
                      if (!isEnrolled)
                        e.target.style.backgroundColor = "#b5a06e";
                    }}
                  >
                    {isEnrolled
                      ? "✓ Enrolled"
                      : enrolling === course.id
                      ? "Enrolling..."
                      : "Enroll"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
