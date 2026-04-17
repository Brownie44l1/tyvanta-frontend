import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function EyeOpen() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosed() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Logo() {
  return (
    <div className="login-logo">
      <svg
        width="40"
        height="40"
        viewBox="0 0 38 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="7" y="7" width="9" height="28" rx="2.5" fill="#1a2e4a" />
        <rect x="7" y="26" width="28" height="9" rx="2.5" fill="#b5a06e" />
      </svg>
      <p
        style={{
          color: "#1a2e4a",
          letterSpacing: "0.15em",
          fontSize: "1.25rem",
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        TYVANTA
      </p>
    </div>
  );
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLogin({ email, password }) {
  const errors = {};
  const cleanEmail = email.trim();
  if (!cleanEmail) errors.email = "Email is required.";
  else if (cleanEmail.length > 254) errors.email = "Email is too long.";
  else if (!EMAIL_REGEX.test(cleanEmail))
    errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Password is required.";
  else if (password.length < 8)
    errors.password = "Password must be at least 8 characters.";
  return errors;
}

const ATTEMPT_LIMIT = 5;
const LOCKOUT_MS = 60 * 1000;

function checkRateLimit() {
  const now = Date.now();
  const raw = localStorage.getItem("login_attempts");
  const attempts = raw ? JSON.parse(raw) : { count: 0, since: now };
  if (now - attempts.since > LOCKOUT_MS) {
    localStorage.setItem(
      "login_attempts",
      JSON.stringify({ count: 1, since: now })
    );
    return { blocked: false };
  }
  if (attempts.count >= ATTEMPT_LIMIT) {
    const remaining = Math.ceil((LOCKOUT_MS - (now - attempts.since)) / 1000);
    return { blocked: true, remaining };
  }
  localStorage.setItem(
    "login_attempts",
    JSON.stringify({ count: attempts.count + 1, since: attempts.since })
  );
  return { blocked: false };
}

function clearRateLimit() {
  localStorage.removeItem("login_attempts");
}

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value.length > 254) return;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const validationErrors = validateLogin(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const { blocked, remaining } = checkRateLimit();
    if (blocked) {
      setServerError(`Too many attempts. Please wait ${remaining} seconds.`);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      clearRateLimit();
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      // Route based on role
      const role = res.data.user?.role;
      navigate(role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Logo />
        <h3
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#1a2e4a",
            marginBottom: "4px",
          }}
        >
          Log In
        </h3>
        <p className="login-subtitle">Enter your account details</p>
        {serverError && <div className="login-server-error">{serverError}</div>}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            autoComplete="email"
            maxLength={254}
            className={`login-input${errors.email ? " has-error" : ""}`}
          />
          {errors.email && <p className="login-field-error">{errors.email}</p>}
          <div className="login-password-wrap">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              autoComplete="current-password"
              maxLength={128}
              className={`login-input${errors.password ? " has-error" : ""}`}
            />
            <button
              type="button"
              className="login-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeClosed /> : <EyeOpen />}
            </button>
          </div>
          {errors.password && (
            <p className="login-field-error">{errors.password}</p>
          )}
          <button type="submit" disabled={loading} className="login-submit">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="login-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
