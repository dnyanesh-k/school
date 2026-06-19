"use client";

import { use, useState } from "react";
import { API_URLS } from "@/config/urls";

interface LastTest {
  subject: string;
  marks_obtained: number;
  total_marks: number;
  test_title: string;
}

interface StudentView {
  first_name: string;
  class_name: string;
  last_test: LastTest | null;
  fees_due: number;
  next_due_date: string | null;
  next_due_amount: number | null;
  notes_url: string | null;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const e = error as { response?: { data?: { message?: string; detail?: string } } };
    if (e.response?.data?.message) return e.response.data.message;
    if (e.response?.data?.detail) return e.response.data.detail;
  }
  return "Something went wrong. Please try again.";
}

function ScoreBar({ obtained, total }: { obtained: number; total: number }) {
  const pct = total > 0 ? Math.round((obtained / total) * 100) : 0;
  const color = pct >= 75 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--error)";
  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          height: 6,
          borderRadius: "var(--radius-full)",
          background: "var(--ink-200)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: "var(--radius-full)",
            transition: "width 0.6s ease",
          }}
        />
      </div>
      <p style={{ fontSize: 11, color: "var(--ink-500)", marginTop: 4 }}>
        {obtained}/{total} marks · {pct}%
      </p>
    </div>
  );
}

export default function ParentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<StudentView | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) { setError("Enter the 6-digit PIN."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URLS.PARENT.PUBLIC_VIEW(token), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || json.detail || "Incorrect PIN or access denied.");
        return;
      }
      setView(json);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--surface-shell, #fafafe)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "env(safe-area-inset-top, 24px) 16px 40px",
      }}
    >
      {/* Header */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "20px 0 28px",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-sm)",
            background: "var(--brand-600)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
              stroke="#fff"
              strokeWidth="1.5"
            />
            <path
              d="M12 7v5l3 3"
              stroke="#fff"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--ink-900)",
            fontFamily: "var(--font-display)",
          }}
        >
          VidyaTrack
        </span>
      </div>

      {/* PIN entry card */}
      {!view && (
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            background: "var(--surface-card)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-card)",
            padding: "28px 24px",
          }}
        >
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--ink-900)",
              fontFamily: "var(--font-display)",
              marginBottom: 6,
            }}
          >
            Parent View
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink-500)", marginBottom: 24 }}>
            Enter the 6-digit PIN shared by the teacher.
          </p>

          <form onSubmit={handleSubmit}>
            <label
              htmlFor="pin"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--ink-600)",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              PIN
            </label>
            <input
              id="pin"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                setPin(v);
                if (error) setError(null);
              }}
              placeholder="——————"
              autoFocus
              style={{
                display: "block",
                width: "100%",
                height: 52,
                border: `1.5px solid ${error ? "var(--error)" : "var(--ink-200)"}`,
                borderRadius: "var(--radius-md)",
                padding: "0 16px",
                fontSize: 24,
                letterSpacing: "0.3em",
                fontFamily: "var(--font-display)",
                color: "var(--ink-900)",
                background: "var(--surface-0)",
                textAlign: "center",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            {error && (
              <p
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: "var(--error)",
                  padding: "8px 12px",
                  background: "var(--error-bg)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--error-border)",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || pin.length !== 6}
              style={{
                marginTop: 20,
                width: "100%",
                height: 48,
                borderRadius: "var(--radius-md)",
                background: pin.length === 6 && !loading ? "var(--brand-600)" : "var(--ink-200)",
                color: pin.length === 6 && !loading ? "#fff" : "var(--ink-400)",
                fontWeight: 700,
                fontSize: 15,
                border: "none",
                cursor: pin.length === 6 && !loading ? "pointer" : "not-allowed",
                fontFamily: "var(--font-display)",
                transition: "background var(--transition-fast)",
              }}
            >
              {loading ? "Verifying…" : "View Details"}
            </button>
          </form>
        </div>
      )}

      {/* Student summary card */}
      {view && (
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            animation: "fadeUp 0.3s ease",
          }}
        >
          {/* Header card */}
          <div
            style={{
              background: "var(--brand-600)",
              borderRadius: "var(--radius-lg)",
              padding: "24px 20px",
              color: "#fff",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "var(--radius-full)",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 12,
                fontFamily: "var(--font-display)",
              }}
            >
              {view.first_name[0].toUpperCase()}
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              {view.first_name}
            </p>
            <p style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>{view.class_name}</p>
          </div>

          {/* Last test score */}
          <div
            style={{
              background: "var(--surface-card)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-sm)",
              padding: "18px 20px",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--ink-500)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 10,
              }}
            >
              Last Test Score
            </p>
            {view.last_test ? (
              <>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--ink-900)" }}>
                  {view.last_test.test_title}
                </p>
                <p style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>
                  {view.last_test.subject}
                </p>
                <ScoreBar
                  obtained={view.last_test.marks_obtained}
                  total={view.last_test.total_marks}
                />
              </>
            ) : (
              <p style={{ fontSize: 13, color: "var(--ink-400)" }}>No test scores yet.</p>
            )}
          </div>

          {/* Fees */}
          <div
            style={{
              background: "var(--surface-card)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-sm)",
              padding: "18px 20px",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--ink-500)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 12,
              }}
            >
              Fee Status
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 11, color: "var(--ink-500)" }}>Total Due</p>
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: view.fees_due > 0 ? "var(--error)" : "var(--success)",
                    fontFamily: "var(--font-display)",
                    marginTop: 2,
                  }}
                >
                  ₹{view.fees_due.toLocaleString("en-IN")}
                </p>
              </div>
              {view.fees_due === 0 && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: "var(--radius-full)",
                    background: "var(--success-bg)",
                    color: "var(--success)",
                    border: "1px solid var(--success-border)",
                  }}
                >
                  All Paid
                </span>
              )}
            </div>

            {view.next_due_date && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  background: "var(--warning-bg)",
                  border: "1px solid var(--warning-border)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ fontSize: 11, color: "var(--warning)" }}>Next instalment</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-900)", marginTop: 2 }}>
                    {view.next_due_date}
                  </p>
                </div>
                {view.next_due_amount !== null && (
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--warning)", fontFamily: "var(--font-display)" }}>
                    ₹{view.next_due_amount.toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Class Notes — hidden until Drive sharing strategy is decided
          {view.notes_url && (
            <a href={view.notes_url} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, padding:"14px 16px", borderRadius:"var(--radius-lg)", background:"var(--surface-0)", border:"1px solid var(--ink-200)", boxShadow:"var(--shadow-sm)", textDecoration:"none" }}>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:"var(--ink-900)" }}>{view.class_name} — Class Notes</p>
                <p style={{ fontSize:11, color:"var(--ink-500)", marginTop:2 }}>Open notes folder on Google Drive</p>
              </div>
            </a>
          )}
          */}

          {/* Footer */}
          <p
            style={{
              textAlign: "center",
              fontSize: 11,
              color: "var(--ink-400)",
              padding: "8px 0 4px",
            }}
          >
            Powered by VidyaTrack
          </p>
        </div>
      )}
    </div>
  );
}
