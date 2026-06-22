"use client";

import { useEffect, useRef, useState } from "react";
import { studentTrackerService, type Session, type Subject } from "@/services/studentTrackerService";
import { getErrorMessage } from "@/services/authService";
import { TopBar } from "@/components/layout/TopBar";
import { PageContent } from "@/components/layout/PageContent";
import { iconFor } from "../subjects/page";

// ── Colour palette (matches stats + subjects pages) ───────────────────────────
const PALETTE = [
  { accent: "#7c3aed", light: "#f5f3ff", muted: "#ddd6fe", grad: "135deg, #7c3aed, #a855f7" },
  { accent: "#f97316", light: "#fff7ed", muted: "#fed7aa", grad: "135deg, #f97316, #fb923c" },
  { accent: "#10b981", light: "#ecfdf5", muted: "#a7f3d0", grad: "135deg, #10b981, #34d399" },
  { accent: "#e11d48", light: "#fff1f2", muted: "#fecdd3", grad: "135deg, #e11d48, #f43f5e" },
  { accent: "#0891b2", light: "#ecfeff", muted: "#a5f3fc", grad: "135deg, #0891b2, #06b6d4" },
  { accent: "#f59e0b", light: "#fffbeb", muted: "#fde68a", grad: "135deg, #d97706, #f59e0b" },
  { accent: "#ec4899", light: "#fdf2f8", muted: "#fbcfe8", grad: "135deg, #ec4899, #f472b6" },
  { accent: "#14b8a6", light: "#f0fdfa", muted: "#99f6e4", grad: "135deg, #0f766e, #14b8a6" },
  { accent: "#8b5cf6", light: "#f5f3ff", muted: "#ddd6fe", grad: "135deg, #6d28d9, #8b5cf6" },
  { accent: "#16a34a", light: "#f0fdf4", muted: "#bbf7d0", grad: "135deg, #15803d, #16a34a" },
];
const pal = (i: number) => PALETTE[i % PALETTE.length];

function fmtH(h: number) {
  if (h === 0) return "0h";
  if (h < 1) return `${Math.round(h * 60)}m`;
  const w = Math.floor(h);
  const m = Math.round((h - w) * 60);
  return m > 0 ? `${w}h ${m}m` : `${w}h`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

// ── Live elapsed time (pure client-side, ticks every second) ─────────────────
function useElapsed(startedAt: string | null) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!startedAt) { setSecs(0); return; }
    const tick = () => setSecs(Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  return secs;
}

function fmtElapsed(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Animation helper ──────────────────────────────────────────────────────────
function enter(delay = 0, ready = true) {
  if (!ready) return { opacity: 0 };
  return {
    animation: `staggerFadeUp 0.45s ease both`,
    animationDelay: `${delay * 80}ms`,
  };
}

export default function SessionPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [justEnded, setJustEnded] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const stats = await studentTrackerService.getStats();
      setActiveSession(stats.active_session);
      const subs = stats.subjects.map(s => ({
        id: s.subject_id,
        name: s.subject_name,
        daily_target_hours: s.daily_target_hours,
      }));
      setSubjects(subs);
      if (!selected && subs.length > 0) setSelected(subs[0].id);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().then(() => setTimeout(() => setReady(true), 60));
  }, []);

  const handleStart = async () => {
    if (!selected) return;
    setBusy(true); setError("");
    try {
      const s = await studentTrackerService.startSession(selected);
      setActiveSession(s);
      setJustEnded(null);
    } catch (err) { setError(getErrorMessage(err, "Failed to start session")); }
    finally { setBusy(false); }
  };

  const handleEnd = async () => {
    setBusy(true); setError("");
    try {
      const s = await studentTrackerService.endSession();
      setJustEnded(s);
      setActiveSession(null);
    } catch (err) { setError(getErrorMessage(err, "Failed to end session")); }
    finally { setBusy(false); }
  };

  const activeSubjectIndex = activeSession
    ? subjects.findIndex(s => s.id === activeSession.subject_id)
    : -1;
  const activePal = activeSubjectIndex >= 0 ? pal(activeSubjectIndex) : pal(0);
  const selectedIndex = subjects.findIndex(s => s.id === selected);
  const elapsed = useElapsed(activeSession?.started_at ?? null);

  return (
    <>
      <TopBar title="Session" />
      <PageContent>

        {/* ── Skeleton ── */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[130, 72, 72, 56].map((h, i) => (
              <div key={i} style={{ height: h, borderRadius: 16, background: "var(--ink-100)", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        )}

        {!loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* ── No subjects empty state ── */}
            {subjects.length === 0 && (
              <div style={{
                ...enter(0, ready),
                padding: "52px 24px",
                textAlign: "center",
                background: "var(--surface-0)",
                borderRadius: 20,
                boxShadow: "var(--shadow-card)",
              }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>🗂️</div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--ink-900)", marginBottom: 8 }}>No subjects yet</p>
                <p style={{ fontSize: 13, color: "var(--ink-500)", lineHeight: 1.6, maxWidth: 240, margin: "0 auto" }}>
                  Go to the Subjects tab and add what you're studying first.
                </p>
              </div>
            )}

            {/* ── Active session view ── */}
            {subjects.length > 0 && activeSession && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* ── Clean live session card ── */}
                <div style={{
                  ...enter(0, ready),
                  borderRadius: 20,
                  background: "var(--surface-0)",
                  border: `1.5px solid ${activePal.muted}`,
                  padding: "28px 24px 24px",
                  textAlign: "center",
                  // Slow glow breathes once every 4s — the only moving ambient element
                  animation: ready
                    ? `staggerFadeUp 0.45s ease both, cardGlow 4s ease-in-out infinite`
                    : undefined,
                  ["--glow-color" as string]: `${activePal.accent}30`,
                }}>
                  {/* Subject row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
                    <span style={{ fontSize: 22 }}>{iconFor(activeSession.subject_name)}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--ink-800)" }}>
                      {activeSession.subject_name}
                    </span>
                    {/* Breathing live dot — the only looping animation */}
                    <span style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 4, fontSize: 13, fontWeight: 700, color: "#16a34a" }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: "#22c55e",
                        display: "inline-block",
                        animation: "breathe 2s ease-in-out infinite",
                      }} />
                      Live
                    </span>
                  </div>

                  {/* Timer — the hero, ticks every second */}
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontSize: 60,
                    lineHeight: 1,
                    color: activePal.accent,
                    letterSpacing: "0.04em",
                    fontVariantNumeric: "tabular-nums",
                    marginBottom: 8,
                  }}>
                    {fmtElapsed(elapsed)}
                  </div>

                  <p style={{ fontSize: 12, color: "var(--ink-400)", marginBottom: 0 }}>
                    Started at {fmtTime(activeSession.started_at)}
                  </p>
                </div>

                {error && (
                  <div style={{ padding: "10px 14px", background: "var(--error-bg)", border: "1px solid var(--error-border)", borderRadius: 10, color: "var(--error)", fontSize: 13 }}>
                    {error}
                  </div>
                )}

                {/* End button */}
                <button
                  type="button"
                  onClick={handleEnd}
                  disabled={busy}
                  style={{
                    ...enter(1, ready),
                    width: "100%",
                    padding: "16px",
                    borderRadius: 14,
                    border: "2px solid #fecaca",
                    background: busy ? "#fef2f2" : "var(--surface-0)",
                    color: "#dc2626",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: busy ? "not-allowed" : "pointer",
                    boxShadow: "var(--shadow-card)",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    opacity: busy ? 0.7 : 1,
                  }}
                >
                  <span style={{ fontSize: 20 }}>⏹</span>
                  {busy ? "Ending session…" : "End Session"}
                </button>
              </div>
            )}

            {/* ── Start session view ── */}
            {subjects.length > 0 && !activeSession && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Just-ended result card */}
                {justEnded && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "16px",
                    background: "linear-gradient(135deg, #ecfdf5, #dcfce7)",
                    border: "1.5px solid #86efac",
                    borderRadius: 16,
                    animation: "popIn 0.4s ease both",
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      background: "#22c55e",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, flexShrink: 0,
                    }}>✓</div>
                    <div>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#15803d" }}>
                        Session complete!
                      </p>
                      <p style={{ fontSize: 13, color: "#166534", marginTop: 2 }}>
                        <strong>{justEnded.subject_name}</strong> — {justEnded.duration_minutes != null ? fmtH(justEnded.duration_minutes / 60) : "—"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Subject header */}
                <div style={enter(0, ready)}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--ink-900)", marginBottom: 4 }}>
                    What will you study?
                  </p>
                  <p style={{ fontSize: 12, color: "var(--ink-400)" }}>Tap to select, then start your session.</p>
                </div>

                {/* Subject cards (tap to select) */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {subjects.map((s, i) => {
                    const p = pal(i);
                    const isSelected = selected === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelected(s.id)}
                        style={{
                          ...enter(i + 1, ready),
                          width: "100%",
                          padding: "14px 16px",
                          borderRadius: 14,
                          border: `2px solid ${isSelected ? p.accent : "var(--ink-200)"}`,
                          background: isSelected ? p.light : "var(--surface-0)",
                          cursor: "pointer",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          boxShadow: isSelected ? `0 4px 16px ${p.accent}30` : "var(--shadow-sm)",
                          transition: "border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease",
                        }}
                      >
                        {/* Subject icon */}
                        <div style={{
                          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                          background: isSelected ? p.light : "var(--surface-1)",
                          border: `2px solid ${isSelected ? p.muted : "var(--ink-200)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 22,
                          transition: "all 0.15s ease",
                        }}>
                          {iconFor(s.name)}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: 15,
                            color: isSelected ? p.accent : "var(--ink-900)",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {s.name}
                          </p>
                          <p style={{ fontSize: 12, color: isSelected ? p.accent : "var(--ink-400)", marginTop: 2, opacity: 0.8 }}>
                            {s.daily_target_hours}h / day target
                          </p>
                        </div>

                        {/* Radio dot */}
                        <div style={{
                          width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                          border: `2px solid ${isSelected ? p.accent : "var(--ink-300)"}`,
                          background: isSelected ? p.accent : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.15s ease",
                        }}>
                          {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {error && (
                  <div style={{ padding: "10px 14px", background: "var(--error-bg)", border: "1px solid var(--error-border)", borderRadius: 10, color: "var(--error)", fontSize: 13 }}>
                    {error}
                  </div>
                )}

                {/* Start button */}
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={busy || !selected}
                  style={{
                    ...enter(subjects.length + 1, ready),
                    width: "100%",
                    padding: "17px",
                    borderRadius: 14,
                    border: "none",
                    backgroundImage: selected && !busy
                      ? `linear-gradient(${pal(selectedIndex >= 0 ? selectedIndex : 0).grad})`
                      : "none",
                    backgroundColor: selected && !busy ? "transparent" : "var(--ink-200)",
                    backgroundSize: "200% 200%",
                    color: selected && !busy ? "#fff" : "var(--ink-400)",
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 16,
                    cursor: busy || !selected ? "not-allowed" : "pointer",
                    boxShadow: selected && !busy
                      ? `0 8px 28px ${pal(selectedIndex >= 0 ? selectedIndex : 0).accent}50`
                      : "none",
                    transition: "background 0.25s ease, box-shadow 0.25s ease, opacity 0.15s ease",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{busy ? "⏳" : "▶"}</span>
                  {busy ? "Starting…" : "Start Session"}
                </button>
              </div>
            )}
          </div>
        )}
      </PageContent>
    </>
  );
}
