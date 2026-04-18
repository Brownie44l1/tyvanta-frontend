import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import { useToast } from "../components/useToast";
import api from "../api/axios";

const SPECIALISTS = [
  {
    id: 1,
    name: "Dr. Amaka Nwosu",
    role: "Wellness Consultant",
    category: "health",
    rating: 4.9,
    sessions: 142,
    price: "₦3,500",
    duration: "30 min",
    color: "#7c3aed",
  },
  {
    id: 2,
    name: "Dr. Olumide Adeyemi",
    role: "Data Science Tutor",
    category: "tutor",
    rating: 4.9,
    sessions: 218,
    price: "₦4,000",
    duration: "60 min",
    color: "#1a2e4a",
  },
  {
    id: 3,
    name: "Sara Okonkwo",
    role: "Design Mentor",
    category: "mentor",
    rating: 4.8,
    sessions: 95,
    price: "₦3,200",
    duration: "45 min",
    color: "#b5a06e",
  },
];

const TIME_SLOTS = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
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

const C = {
  navy: "#1a2e4a",
  gold: "#b5a06e",
  muted: "#94a3b8",
  border: "#e9edf2",
  bg: "#f4f6f9",
  white: "#fff",
};

const Avatar = ({ initials, color, size = 44 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontWeight: 700,
      fontSize: size * 0.3,
    }}
  >
    {initials}
  </div>
);

const Badge = ({ status }) => {
  const map = {
    upcoming: { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    completed: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
    cancelled: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
    pending: { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  };
  const s = map[status] || map.pending;
  return (
    <span
      style={{
        flexShrink: 0,
        fontSize: 11,
        fontWeight: 500,
        color: s.color,
        background: s.bg,
        padding: "3px 10px",
        borderRadius: 999,
        border: `1px solid ${s.border}`,
      }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ─── Mini Calendar ────────────────────────────────────────────────────────────
function MiniCalendar({ selectedDate, onSelect }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prev = () =>
    month === 0
      ? (setMonth(11), setYear((y) => y - 1))
      : setMonth((m) => m - 1);
  const next = () =>
    month === 11
      ? (setMonth(0), setYear((y) => y + 1))
      : setMonth((m) => m + 1);

  return (
    <div
      style={{
        background: C.bg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <button
          onClick={prev}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: C.muted,
            fontSize: 20,
            lineHeight: 1,
            padding: "0 4px",
          }}
        >
          ‹
        </button>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>
          {MONTHS[month]} {year}
        </p>
        <button
          onClick={next}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: C.muted,
            fontSize: 20,
            lineHeight: 1,
            padding: "0 4px",
          }}
        >
          ›
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div
            key={d}
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: C.muted,
              padding: "4px 0",
            }}
          >
            {d}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          textAlign: "center",
          justifyItems: "center",
          gap: 2,
        }}
      >
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const date = new Date(year, month, d);
          const isPast =
            date <
            new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isToday =
            year === today.getFullYear() &&
            month === today.getMonth() &&
            d === today.getDate();
          const label = `${SHORT_MONTHS[month]} ${d}, ${year}`;
          const isSel = selectedDate === label;
          return (
            <div
              key={d}
              onClick={() => !isPast && onSelect(label)}
              style={{
                width: "min(34px, 100%)",
                aspectRatio: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                fontSize: 12,
                cursor: isPast ? "not-allowed" : "pointer",
                fontWeight: 500,
                background: isSel ? C.navy : "transparent",
                color: isPast
                  ? "#cbd5e1"
                  : isSel
                  ? "#fff"
                  : isToday
                  ? C.gold
                  : C.navy,
                border: isToday && !isSel ? `2px solid ${C.gold}` : "none",
              }}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Booking Modal ────────────────────────────────────────────────────────────
function BookingModal({ onClose, onConfirm, preSelectedSpecId, submitting }) {
  const [step, setStep] = useState(preSelectedSpecId ? 2 : 1);
  const [specId, setSpecId] = useState(preSelectedSpecId || null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [sessionType, setSessionType] = useState("video");
  const [notes, setNotes] = useState("");

  const spec = SPECIALISTS.find((s) => s.id === specId);
  const initials = (name) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2);

  const StepDot = ({ n }) => {
    const done = n < step,
      active = n === step;
    return (
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          flexShrink: 0,
          background: done ? "#22c55e" : active ? C.navy : "#e9edf2",
          color: done || active ? "#fff" : C.muted,
        }}
      >
        {done ? "✓" : n}
      </div>
    );
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,28,48,.6)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: 0,
      }}
      className="modal-overlay"
    >
      <div
        style={{
          background: C.white,
          width: "100%",
          maxWidth: 580,
          maxHeight: "92dvh",
          overflowY: "auto",
          animation: "modalIn .3s ease",
          position: "relative",
        }}
        className="modal-sheet"
      >
        {/* Drag handle (mobile) */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 0",
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 999,
              background: C.border,
            }}
          />
        </div>

        {/* Close button — inside modal, above step indicator */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "10px 16px 0",
          }}
        >
          <button
            onClick={onClose}
            className="close-btn"
            style={{
              background: C.bg,
              border: `1.5px solid ${C.border}`,
              cursor: "pointer",
              width: 34,
              height: 34,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background .15s, border-color .15s",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke={C.navy}
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="1" y1="1" x2="11" y2="11" />
              <line x1="11" y1="1" x2="1" y2="11" />
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ padding: "12px 20px 0" }}>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 16 }}
          >
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: n < 3 ? 1 : 0,
                }}
              >
                <StepDot n={n} />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: step === n ? C.navy : C.muted,
                    marginLeft: 5,
                  }}
                >
                  {["Specialist", "Date & Time", "Confirm"][n - 1]}
                </span>
                {n < 3 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background: C.border,
                      margin: "0 8px",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div style={{ padding: "12px 20px 28px" }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: C.navy,
                marginBottom: 12,
              }}
            >
              Choose a Specialist
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SPECIALISTS.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSpecId(s.id);
                    setTimeout(() => setStep(2), 250);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    border: `1px solid ${specId === s.id ? C.navy : C.border}`,
                    borderRadius: 10,
                    cursor: "pointer",
                    background: specId === s.id ? "#f8fafc" : C.white,
                    transition: "all .15s",
                  }}
                >
                  <Avatar
                    initials={initials(s.name)}
                    color={s.color}
                    size={38}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.navy,
                        margin: 0,
                      }}
                    >
                      {s.name}
                    </p>
                    <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                      {s.role} · ★ {s.rating} · {s.price} / {s.duration}
                    </p>
                  </div>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      border: `2px solid ${
                        specId === s.id ? C.navy : C.border
                      }`,
                      background: specId === s.id ? C.navy : "transparent",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {specId === s.id && (
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div style={{ padding: "12px 20px 28px" }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: C.navy,
                marginBottom: 4,
              }}
            >
              Pick a Date & Time
            </h2>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
              Choose your preferred slot.
            </p>
            <MiniCalendar
              selectedDate={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setSelectedTime(null);
              }}
            />
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.navy,
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: ".05em",
              }}
            >
              Available Times —{" "}
              <span style={{ color: C.gold }}>
                {selectedDate || "Select a date"}
              </span>
            </p>
            {selectedDate ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 8,
                }}
              >
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    style={{
                      padding: "9px 6px",
                      border: `1px solid ${
                        selectedTime === t ? C.navy : C.border
                      }`,
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 500,
                      color: selectedTime === t ? "#fff" : "#64748b",
                      background: selectedTime === t ? C.navy : C.white,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all .15s",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: C.muted }}>
                ← Choose a date first
              </p>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                onClick={() => setStep(1)}
                className="back-btn"
                style={{
                  flex: 1,
                  padding: 11,
                  border: `1px solid ${C.border}`,
                  borderRadius: 9,
                  background: C.white,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#64748b",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background .15s, border-color .15s",
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedDate || !selectedTime}
                className="primary-btn"
                style={{
                  flex: 2,
                  padding: 11,
                  background: C.navy,
                  border: "none",
                  borderRadius: 9,
                  color: C.white,
                  fontSize: 13,
                  fontWeight: 500,
                  opacity: !selectedDate || !selectedTime ? 0.4 : 1,
                  cursor:
                    !selectedDate || !selectedTime ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  transition: "opacity .15s, filter .15s",
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && spec && (
          <div style={{ padding: "12px 20px 28px" }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: C.navy,
                marginBottom: 4,
              }}
            >
              Confirm Booking
            </h2>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
              Review your appointment details.
            </p>
            <div
              style={{
                background: C.bg,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <Avatar
                  initials={initials(spec.name)}
                  color={spec.color}
                  size={42}
                />
                <div>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: C.navy,
                      margin: 0,
                    }}
                  >
                    {spec.name}
                  </p>
                  <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                    {spec.role}
                  </p>
                </div>
              </div>
              <div
                style={{
                  borderTop: `1px solid ${C.border}`,
                  paddingTop: 12,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {[
                  ["Date", selectedDate],
                  ["Time", selectedTime],
                  ["Duration", spec.duration],
                  ["Fee", spec.price],
                ].map(([l, v]) => (
                  <div key={l}>
                    <p
                      style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}
                    >
                      {l}
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>
                      {v}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.navy,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Session Type
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  ["video", "Video"],
                  ["phone", "Phone"],
                  ["in-person", "In-Person"],
                ].map(([type, label]) => (
                  <button
                    key={type}
                    onClick={() => setSessionType(type)}
                    style={{
                      flex: 1,
                      padding: "9px 6px",
                      border: `1px solid ${
                        sessionType === type ? C.navy : C.border
                      }`,
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 500,
                      color: sessionType === type ? "#fff" : "#64748b",
                      background: sessionType === type ? C.navy : C.white,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all .15s",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.navy,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What would you like to discuss?"
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  fontSize: 13,
                  fontFamily: "inherit",
                  color: C.navy,
                  outline: "none",
                  resize: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = C.gold)}
                onBlur={(e) => (e.target.style.borderColor = C.border)}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setStep(2)}
                className="back-btn"
                style={{
                  flex: 1,
                  padding: 11,
                  border: `1px solid ${C.border}`,
                  borderRadius: 9,
                  background: C.white,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#64748b",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background .15s, border-color .15s",
                }}
              >
                ← Back
              </button>
              <button
                onClick={() =>
                  onConfirm({
                    spec,
                    date: selectedDate,
                    time: selectedTime,
                    sessionType,
                    notes,
                  })
                }
                disabled={submitting}
                className="confirm-btn"
                style={{
                  flex: 2,
                  padding: 11,
                  background: C.gold,
                  border: "none",
                  borderRadius: 9,
                  color: C.white,
                  fontSize: 13,
                  fontWeight: 600,
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  transition: "filter .15s, opacity .15s",
                }}
              >
                {submitting ? "Booking…" : "Confirm Booking ✓"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Appointment Row ──────────────────────────────────────────────────────────
function AptRow({ apt, onCancel, cancelling }) {
  const d = new Date(apt.date);
  const mon = SHORT_MONTHS[d.getMonth()]?.toUpperCase();
  const day = d.getDate();
  const isPast = apt.status === "completed" || apt.status === "cancelled";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: C.white,
        borderRadius: 12,
        border: `1px solid ${C.border}`,
        padding: "14px 16px",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: isPast ? C.bg : C.navy,
          border: isPast ? `1px solid ${C.border}` : "none",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontSize: 9,
            fontWeight: 600,
            lineHeight: 1,
            color: isPast ? C.muted : "rgba(255,255,255,.7)",
          }}
        >
          {mon}
        </p>
        <p
          style={{
            fontSize: 15,
            fontWeight: 700,
            lineHeight: 1,
            color: isPast ? C.muted : "#fff",
          }}
        >
          {day}
        </p>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.navy, margin: 0 }}>
          {apt.practitioner || "Appointment"}
        </p>
        <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
          {d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}{" "}
          · {apt.time?.slice(0, 5)}
          {apt.reason && ` · ${apt.reason}`}
        </p>
      </div>
      <Badge status={apt.status || "pending"} />
      {!isPast && (
        <button
          onClick={() => onCancel(apt.id)}
          disabled={cancelling === apt.id}
          className="cancel-row-btn"
          style={{
            padding: "7px 14px",
            border: "1px solid #fecaca",
            borderRadius: 7,
            background: C.white,
            fontSize: 12,
            color: "#dc2626",
            cursor: cancelling === apt.id ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            opacity: cancelling === apt.id ? 0.5 : 1,
            transition: "background .15s, color .15s",
          }}
        >
          {cancelling === apt.id ? "Cancelling…" : "Cancel"}
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [preSpec, setPreSpec] = useState(null);
  const { show, ToastUI } = useToast();

  const fetchAppointments = useCallback(async () => {
    try {
      const r = await api.get("/appointments");
      setAppointments(r.data.appointments || []);
    } catch {
      show("Failed to load appointments.", false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleConfirm = async ({ spec, date, time, sessionType, notes }) => {
    setSubmitting(true);
    const [rawTime, period] = time.split(" ");
    let [h, m] = rawTime.split(":").map(Number);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}`;
    // Convert "Apr 17, 2026" → "2026-04-17" to satisfy backend YYYY-MM-DD validation
    const parsedDate = new Date(date);
    const dateStr = `${parsedDate.getFullYear()}-${String(
      parsedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(parsedDate.getDate()).padStart(2, "0")}`;
    try {
      await api.post("/appointments", {
        date: dateStr,
        time: timeStr,
        reason: notes || undefined,
        practitioner: spec.name,
      });
      show(`Booked with ${spec.name} on ${date} at ${time}!`);
      setShowModal(false);
      await fetchAppointments();
    } catch (err) {
      show(err.response?.data?.error || "Could not book appointment.", false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await api.delete(`/appointments/${id}`);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      show("Appointment cancelled.");
    } catch {
      show("Could not cancel appointment.", false);
    } finally {
      setCancelling(null);
    }
  };

  const upcoming = appointments.filter(
    (a) => a.status !== "completed" && a.status !== "cancelled"
  );
  const past = appointments.filter(
    (a) => a.status === "completed" || a.status === "cancelled"
  );

  return (
    <Layout>
      <style>{`
        @keyframes modalIn { from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)} }
        .modal-sheet { border-radius: 20px 20px 0 0; }
        @media (min-width: 600px) {
          .modal-overlay { align-items: center !important; padding: 20px !important; }
          .modal-sheet { border-radius: 20px; max-width: 580px; }
        }
        .spec-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width: 480px) { .spec-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 860px) { .spec-grid { grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); } }
        .apt-header { flex-wrap: wrap; gap: 12px; }

        /* Cancel button in appointment row */
        .cancel-row-btn:hover:not(:disabled) {
          background: #dc2626 !important;
          color: #fff !important;
          border-color: #dc2626 !important;
        }

        /* Close button in modal */
        .close-btn:hover {
          background: #fef2f2 !important;
          border-color: #fecaca !important;
        }
        .close-btn:hover svg { stroke: #dc2626; }

        /* Back buttons */
        .back-btn:hover {
          background: ${C.bg} !important;
          border-color: #cbd5e1 !important;
        }

        /* Confirm / primary buttons */
        .confirm-btn:hover:not(:disabled) { filter: brightness(1.08); }
        .primary-btn:hover:not(:disabled) { filter: brightness(1.12); }

        /* Book Session button */
        .book-session-btn {
          background: ${C.navy};
          color: #fff;
          transition: background .15s, color .15s;
        }
        .book-session-btn:hover {
          background: ${C.gold} !important;
          color: #fff !important;
        }
      `}</style>
      {ToastUI}

      {/* Header */}
      <div
        className="apt-header"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: C.navy,
              marginBottom: 2,
            }}
          >
            Appointments
          </h1>
          <p style={{ fontSize: 13, color: C.muted }}>
            Book 1-on-1 sessions with specialists, mentors, or healthcare
            providers.
          </p>
        </div>
        <button
          onClick={() => {
            setPreSpec(null);
            setShowModal(true);
          }}
          className="confirm-btn"
          style={{
            flexShrink: 0,
            padding: "10px 18px",
            background: C.gold,
            border: "none",
            borderRadius: 9,
            color: C.white,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "filter .15s",
          }}
        >
          Book Appointment
        </button>
      </div>

      {/* Upcoming */}
      <section style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 600, color: C.navy }}>
            Upcoming
          </h2>
          <span
            style={{
              fontSize: 11,
              color: C.muted,
              background: C.bg,
              padding: "2px 8px",
              borderRadius: 999,
              border: `1px solid ${C.border}`,
            }}
          >
            {upcoming.length} sessions
          </span>
        </div>
        {loading && <p style={{ fontSize: 13, color: C.muted }}>Loading…</p>}
        {!loading && upcoming.length === 0 && (
          <p style={{ fontSize: 13, color: C.muted }}>
            No upcoming appointments. Book one above!
          </p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {upcoming.map((apt) => (
            <AptRow
              key={apt.id}
              apt={apt}
              onCancel={handleCancel}
              cancelling={cancelling}
            />
          ))}
        </div>
      </section>

      {/* Specialists */}
      <section style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 600, color: C.navy }}>
            Available Specialists
          </h2>
        </div>
        <div className="spec-grid">
          {SPECIALISTS.map((s) => (
            <div
              key={s.id}
              style={{
                background: C.white,
                borderRadius: 14,
                border: `1px solid ${C.border}`,
                padding: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <Avatar
                  initials={s.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                  color={s.color}
                />
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.navy,
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    {s.name}
                  </p>
                  <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                    {s.role}
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600 }}
                >
                  ★ {s.rating}
                </span>
                <span style={{ fontSize: 11, color: C.muted }}>
                  {s.sessions} sessions
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>
                  {s.price}
                </span>
                <span style={{ fontSize: 11, color: C.muted }}>
                  · {s.duration}
                </span>
              </div>
              <button
                onClick={() => {
                  setPreSpec(s.id);
                  setShowModal(true);
                }}
                className="book-session-btn"
                style={{
                  width: "100%",
                  padding: 9,
                  border: "none",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Book Session
              </button>
            </div>
          ))}
        </div>
      </section>

      {showModal && (
        <BookingModal
          preSelectedSpecId={preSpec}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
          submitting={submitting}
        />
      )}
    </Layout>
  );
}
