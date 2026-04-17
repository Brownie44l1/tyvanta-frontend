import { useState, useEffect, useCallback } from "react";

export function useToast() {
  const [toast, setToast] = useState(null); // { msg, ok }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const show = useCallback((msg, ok = true) => setToast({ msg, ok }), []);

  const ToastUI = toast ? (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        background: "#1a2e4a",
        color: "#fff",
        padding: "14px 22px",
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: 10,
        zIndex: 200,
        boxShadow: "0 8px 24px rgba(0,0,0,.2)",
        animation: "fadeUp .3s ease",
      }}
    >
      {toast.ok ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#22c55e"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f87171"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
      {toast.msg}
    </div>
  ) : null;

  return { show, ToastUI };
}
