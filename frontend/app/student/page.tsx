"use client";

import { useEffect, useRef, useState } from "react";
import {
  studentTrackerService,
  type StatsResponse,
  type DailyPoint,
  type SubjectStats,
} from "@/services/studentTrackerService";
import { getErrorMessage } from "@/services/authService";
import { useInstitute } from "@/contexts/InstituteContext";
import { TopBar } from "@/components/layout/TopBar";
import { PageContent } from "@/components/layout/PageContent";

// ── Subject palette — vibrant accent colours for cards ────────────────────────
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

// ── Icon lookup by subject name (case-insensitive partial match) ───────────────
const ICON_MAP: [string, string][] = [
  ["math",        "📐"], ["algebra",    "📐"], ["calculus",  "📐"], ["trigono",  "📐"],
  ["physics",     "⚛️"],
  ["chemistry",   "🧪"], ["chem",       "🧪"],
  ["biology",     "🧬"], ["bio",        "🧬"], ["botany",    "🧬"], ["zoology",  "🧬"],
  ["history",     "📜"], ["civics",     "📜"], ["political", "📜"],
  ["geography",   "🌍"], ["geo",        "🌍"], ["environ",   "🌍"],
  ["computer",    "💻"], ["coding",     "💻"], ["program",   "💻"], ["cs",       "💻"],
  ["english",     "📝"], ["literature","📝"], ["essay",     "📝"], ["grammar",  "📝"],
  ["econom",      "📊"], ["account",   "📊"], ["commerce",  "📊"], ["finance",  "📊"],
  ["hindi",       "🗣️"], ["marathi",   "🗣️"], ["language",  "🗣️"], ["french",  "🗣️"],
  ["science",     "🔬"],
  ["art",         "🎨"], ["drawing",   "🎨"], ["design",    "🎨"],
  ["music",       "🎵"], ["guitar",    "🎵"], ["vocal",     "🎵"],
  ["sport",       "⚽"], ["physical",  "🏃"],
  ["sanskrit",    "🕉️"],
  ["psychology",  "🧠"],
];
function iconFor(name: string): string {
  const lower = name.toLowerCase();
  for (const [kw, icon] of ICON_MAP) {
    if (lower.includes(kw)) return icon;
  }
  return "📚";
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtH(h: number) {
  if (h === 0) return "0h";
  if (h < 1) return `${Math.round(h * 60)}m`;
  const w = Math.floor(h); const m = Math.round((h - w) * 60);
  return m > 0 ? `${w}h ${m}m` : `${w}h`;
}
function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Night owl 🦉";
  if (h < 12) return "Good morning ☀️";
  if (h < 17) return "Good afternoon 🌤";
  return "Good evening 🌙";
}
function calcStreak(daily: DailyPoint[]) {
  const by: Record<string, number> = {};
  for (const d of daily) by[d.date] = (by[d.date] ?? 0) + d.hours;
  let s = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    if ((by[k] ?? 0) > 0) s++; else if (i > 0) break;
  }
  return s;
}

// ── Study insights engine (100% client-side, from existing stats data) ────────
interface Insight {
  id: string;          // stable key used for localStorage dismiss
  emoji: string;
  title: string;
  body: string;
  accent: string;      // border/icon color
  bg: string;          // card background tint
}

function computeInsights(stats: StatsResponse): Insight[] {
  const insights: Insight[] = [];
  const today = new Date().toISOString().slice(0, 10);

  // ── 1. Target exceeded today ─────────────────────────────────────────────
  const crushed = stats.subjects.filter(s => s.daily_target_hours > 0 && s.today_hours >= s.daily_target_hours);
  if (crushed.length > 0) {
    const names = crushed.map(s => s.subject_name).join(" & ");
    insights.push({
      id: `crushed-${today}`,
      emoji: "🎯",
      title: "Target crushed!",
      body: `You hit your daily goal for ${names}. Great focus today.`,
      accent: "#16a34a",
      bg: "#f0fdf4",
    });
  }

  // ── 2. Streak milestone ──────────────────────────────────────────────────
  const streak = calcStreak(stats.daily_last_30);
  const milestones = [3, 5, 7, 10, 14, 21, 30];
  if (milestones.includes(streak)) {
    insights.push({
      id: `streak-${streak}`,
      emoji: "🔥",
      title: `${streak}-day streak!`,
      body: streak >= 7
        ? `${streak} days straight — that kind of consistency builds real results.`
        : `You've studied ${streak} days in a row. Keep the momentum going!`,
      accent: "#f97316",
      bg: "#fff7ed",
    });
  }

  // ── 3. Best study time ───────────────────────────────────────────────────
  if (stats.recent_sessions.length >= 5) {
    const hourBuckets: Record<number, number> = {};
    for (const s of stats.recent_sessions) {
      const h = new Date(s.started_at).getHours();
      hourBuckets[h] = (hourBuckets[h] ?? 0) + 1;
    }
    const peakHour = parseInt(Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0][0]);
    const fmt = (h: number) => {
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 === 0 ? 12 : h % 12;
      return `${h12} ${ampm}`;
    };
    insights.push({
      id: `besttime-${peakHour}`,
      emoji: "⏰",
      title: "Your best study window",
      body: `Most of your sessions start around ${fmt(peakHour)}–${fmt(peakHour + 1)}. That's when your focus is sharpest.`,
      accent: "#7c3aed",
      bg: "#f5f3ff",
    });
  }

  // ── 4. Neglected subject (0 hours for 4+ days) ───────────────────────────
  const bySubjectDate: Record<number, Set<string>> = {};
  for (const d of stats.daily_last_30) {
    if (d.hours > 0) {
      if (!bySubjectDate[d.subject_id]) bySubjectDate[d.subject_id] = new Set();
      bySubjectDate[d.subject_id].add(d.date);
    }
  }
  for (const sub of stats.subjects) {
    if (sub.daily_target_hours === 0) continue;
    const dates = bySubjectDate[sub.subject_id];
    let daysSince = 30;
    for (let i = 0; i < 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      if (dates?.has(k)) { daysSince = i; break; }
    }
    if (daysSince >= 4) {
      insights.push({
        id: `neglect-${sub.subject_id}-${today}`,
        emoji: iconFor(sub.subject_name),
        title: `${sub.subject_name} needs attention`,
        body: daysSince >= 30
          ? `You haven't studied ${sub.subject_name} yet. Even a short session builds the habit.`
          : `No ${sub.subject_name} in ${daysSince} days. A quick session keeps it fresh.`,
        accent: "#0891b2",
        bg: "#ecfeff",
      });
      break; // show only the most neglected one
    }
  }

  // ── 5. Cold start — no study for 2+ days ────────────────────────────────
  const totalByDate: Record<string, number> = {};
  for (const d of stats.daily_last_30) totalByDate[d.date] = (totalByDate[d.date] ?? 0) + d.hours;
  let gapDays = 0;
  for (let i = 1; i <= 3; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    if ((totalByDate[k] ?? 0) === 0) gapDays++; else break;
  }
  if (gapDays >= 2 && crushed.length === 0) {
    insights.push({
      id: `coldstart-${today}`,
      emoji: "📚",
      title: "Time to get back on track",
      body: `${gapDays} days without a session. Research shows a 15-min session is enough to maintain retention.`,
      accent: "#e11d48",
      bg: "#fff1f2",
    });
  }

  return insights;
}

// ── Insight card component ────────────────────────────────────────────────────
function InsightCard({ insight, onDismiss }: { insight: Insight; onDismiss: () => void }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      padding: "14px 14px 14px 16px",
      background: insight.bg,
      border: `1.5px solid ${insight.accent}30`,
      borderLeft: `4px solid ${insight.accent}`,
      borderRadius: 14,
      animation: "staggerFadeUp 0.4s ease both",
      position: "relative",
    }}>
      <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{insight.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--ink-900)", marginBottom: 3 }}>
          {insight.title}
        </p>
        <p style={{ fontSize: 12, color: "var(--ink-600)", lineHeight: 1.55 }}>
          {insight.body}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          flexShrink: 0,
          width: 24, height: 24,
          borderRadius: "50%",
          border: "none",
          background: "rgba(0,0,0,0.06)",
          color: "var(--ink-400)",
          fontSize: 14,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          lineHeight: 1,
          padding: 0,
          marginTop: -2,
        }}
      >
        ×
      </button>
    </div>
  );
}

// ── Dismiss storage helpers ───────────────────────────────────────────────────
function getDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem("vt_dismissed_insights");
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as Record<string, string>;
    const today = new Date().toISOString().slice(0, 10);
    // Keep only dismissals from today (auto-reset daily)
    const fresh = Object.entries(parsed).filter(([, date]) => date === today);
    return new Set(fresh.map(([id]) => id));
  } catch { return new Set(); }
}

function dismissInsight(id: string) {
  try {
    const raw = localStorage.getItem("vt_dismissed_insights");
    const today = new Date().toISOString().slice(0, 10);
    const parsed = raw ? JSON.parse(raw) as Record<string, string> : {};
    // Purge old dates before saving
    const fresh: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) if (v === today) fresh[k] = v;
    fresh[id] = today;
    localStorage.setItem("vt_dismissed_insights", JSON.stringify(fresh));
  } catch {}
}

// ── Count-up hook ─────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 900, trigger = false) {
  const [val, setVal] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    if (!trigger || target === 0) { setVal(target); return; }
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const pct  = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - pct, 3);
      setVal(Math.round(ease * target));
      if (pct < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, trigger]);
  return val;
}

// ── SVG ring ──────────────────────────────────────────────────────────────────
function Ring({ pct, color, size = 54 }: { pct: number; color: string; size?: number }) {
  const sw = 5.5; const r = (size - sw * 2) / 2; const c = 2 * Math.PI * r;
  const d = (Math.min(pct, 100) / 100) * c;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e4e4ec" strokeWidth={sw} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={`${d} ${c}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.1s cubic-bezier(.4,0,.2,1)" }} />
    </svg>
  );
}

// ── Line chart ────────────────────────────────────────────────────────────────
function AnimatedPath({ d, stroke, delay }: { d: string; stroke: string; delay: number }) {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    const timer = setTimeout(() => {
      el.style.transition = `stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)`;
      el.style.strokeDashoffset = "0";
    }, delay);
    return () => clearTimeout(timer);
  }, [d, delay]);
  return <path ref={ref} d={d} fill="none" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />;
}

function LineChart({ data, subjects, period }: {
  data: DailyPoint[];
  subjects: { id: number; name: string }[];
  period: "week" | "month";
}) {
  const days = period === "week" ? 7 : 30;
  const today = new Date();
  const range: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    range.push(d.toISOString().slice(0, 10));
  }
  const map: Record<string, Record<number, number>> = {};
  for (const d of data) { if (!map[d.date]) map[d.date] = {}; map[d.date][d.subject_id] = d.hours; }
  const W = 320; const H = 140; const P = { top: 18, right: 10, bottom: 26, left: 30 };
  const iW = W - P.left - P.right; const iH = H - P.top - P.bottom;
  const maxVal = Math.max(
    ...range.map(date => subjects.reduce((s, sub) => s + (map[date]?.[sub.id] ?? 0), 0)), 0.5,
  );
  const toX = (i: number) => P.left + (i / Math.max(range.length - 1, 1)) * iW;
  const toY = (v: number) => P.top + iH - (v / maxVal) * iH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
      {[0, maxVal / 2, maxVal].map((v, i) => (
        <g key={i}>
          <line x1={P.left} x2={W - P.right} y1={toY(v)} y2={toY(v)}
            stroke={i === 0 ? "#e4e4ec" : "#f2f2f6"} strokeWidth={1}
            strokeDasharray={i > 0 ? "3 4" : ""} />
          {v > 0 && <text x={P.left - 5} y={toY(v) + 3} fontSize={8} fill="#9898aa" textAnchor="end">
            {Math.round(v * 10) / 10}h
          </text>}
        </g>
      ))}
      {subjects.map((s, si) => {
        const color = PALETTE[si % PALETTE.length].accent;
        const pts = range.map((date, i) => ({ x: toX(i), y: toY(map[date]?.[s.id] ?? 0), v: map[date]?.[s.id] ?? 0 }));
        const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
        const area = [`M${toX(0)},${toY(0)}`, ...pts.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`), `L${toX(range.length - 1)},${toY(0)}`, "Z"].join(" ");
        const dot = pts.slice().reverse().find(p => p.v > 0);
        return (
          <g key={s.id}>
            <path d={area} fill={color} fillOpacity={0.07} />
            <AnimatedPath d={line} stroke={color} delay={si * 120} />
            {dot && <circle cx={dot.x} cy={dot.y} r={3.5} fill={color} stroke="#fff" strokeWidth={1.5} />}
          </g>
        );
      })}
      {range.map((date, i) => {
        const every = period === "month" ? 5 : 1;
        if (i % every !== 0 && i !== range.length - 1) return null;
        const d = new Date(date + "T00:00:00");
        const label = period === "week"
          ? d.toLocaleDateString("en", { weekday: "short" }).slice(0, 3)
          : (i === 0 || i === range.length - 1)
            ? d.toLocaleDateString("en", { day: "numeric", month: "short" })
            : d.toLocaleDateString("en", { day: "numeric" });
        return <text key={date} x={toX(i)} y={H - 6} fontSize={8} fill="#9898aa" textAnchor="middle">{label}</text>;
      })}
    </svg>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ height: 158, borderRadius: 20, background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)", animation: "pulse 1.5s ease-in-out infinite" }} />
      {[90, 90, 90].map((h, i) => (
        <div key={i} style={{ height: h, borderRadius: 16, background: "var(--ink-100)", animation: `pulse 1.5s ease-in-out ${i * 0.15}s infinite` }} />
      ))}
    </div>
  );
}

// ── Today's hourly timeline bar chart ────────────────────────────────────────
function TodayTimeline({
  sessions, subjects, ready, enterStyle,
}: {
  sessions: import("@/services/studentTrackerService").Session[];
  subjects: SubjectStats[];
  ready: boolean;
  enterStyle: React.CSSProperties;
}) {
  const totalToday = subjects.reduce((s, x) => s + x.today_hours, 0);
  // stable subject → palette index (by position in subjects array)
  const subjectIndexMap = new Map(subjects.map((s, i) => [s.subject_id, i]));
  const fmt12 = (h: number) => `${h % 12 === 0 ? 12 : h % 12}${h >= 12 ? "PM" : "AM"}`;

  // ── Build hourly buckets ───────────────────────────────────────────────────
  // Spread each session's minutes into the hours it spans
  type BucketMap = Map<number, number>; // subjectId → minutes
  const bucketsByHour = new Map<number, BucketMap>();

  for (const sess of sessions) {
    const durationMins = sess.duration_minutes ?? 0;
    if (durationMins <= 0) continue;
    const startDate = new Date(sess.started_at);
    let cursor = startDate.getHours() * 60 + startDate.getMinutes(); // absolute minutes since midnight
    let remaining = durationMins;

    while (remaining > 0) {
      const h = Math.floor(cursor / 60);
      if (h > 23) break;
      const minsLeftInHour = 60 - (cursor % 60);
      const minsThisSlot = Math.min(remaining, minsLeftInHour);

      if (!bucketsByHour.has(h)) bucketsByHour.set(h, new Map());
      const bucket = bucketsByHour.get(h)!;
      bucket.set(sess.subject_id, (bucket.get(sess.subject_id) ?? 0) + minsThisSlot);

      cursor += minsThisSlot;
      remaining -= minsThisSlot;
    }
  }

  if (bucketsByHour.size === 0) {
    return (
      <div style={{ ...enterStyle, background: "var(--surface-0)", borderRadius: 16, boxShadow: "var(--shadow-card)", padding: "14px 16px 20px", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--ink-900)" }}>Today&apos;s timeline</p>
          <p style={{ fontSize: 13, color: "var(--ink-400)" }}>0h studied</p>
        </div>
        <p style={{ fontSize: 13, color: "var(--ink-400)", textAlign: "center", padding: "16px 0" }}>No sessions yet today. Start one! 🚀</p>
      </div>
    );
  }

  // ── Compute chart dimensions ───────────────────────────────────────────────
  const allHours = Array.from(bucketsByHour.keys()).sort((a, b) => a - b);
  const minHour = allHours[0];
  const maxHour = allHours[allHours.length - 1];
  const hourRange: number[] = [];
  for (let h = minHour; h <= maxHour; h++) hourRange.push(h);

  const bucketTotals = hourRange.map(h => {
    const b = bucketsByHour.get(h);
    return b ? Array.from(b.values()).reduce((s, v) => s + v, 0) : 0;
  });
  const maxMins = Math.max(...bucketTotals, 20); // at least 20 min scale

  // SVG dimensions
  const BAR_W = 28;
  const BAR_GAP = 10;
  const CHART_H = 120;
  const PAD = { top: 20, right: 8, bottom: 28, left: 8 };
  const svgW = hourRange.length * (BAR_W + BAR_GAP) + PAD.left + PAD.right;
  const svgH = CHART_H + PAD.top + PAD.bottom;

  return (
    <div style={{ ...enterStyle, background: "var(--surface-0)", borderRadius: 16, boxShadow: "var(--shadow-card)", padding: "14px 16px 12px", marginBottom: 8 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--ink-900)" }}>Today&apos;s timeline</p>
        <p style={{ fontSize: 13, color: "var(--ink-400)" }}>{fmtH(totalToday)} studied</p>
      </div>

      {/* Legend — only subjects studied today */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginBottom: 10 }}>
        {subjects.filter(s => s.today_hours > 0).map(s => {
          const idx = subjectIndexMap.get(s.subject_id) ?? 0;
          return (
            <span key={s.subject_id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "var(--ink-600)" }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: PALETTE[idx % PALETTE.length].accent, display: "inline-block", flexShrink: 0 }} />
              {s.subject_name}
            </span>
          );
        })}
      </div>

      {/* SVG bar chart — horizontally scrollable on small screens */}
      <div style={{ overflowX: "auto", overflowY: "hidden" }}>
        <svg width={svgW} height={svgH} style={{ display: "block", minWidth: svgW }}>
          {/* Horizontal grid lines */}
          {[0, 0.5, 1].map((frac, i) => {
            const y = PAD.top + CHART_H - frac * CHART_H;
            const label = frac === 0 ? "" : fmtH((frac * maxMins) / 60);
            return (
              <g key={i}>
                <line x1={PAD.left} x2={svgW - PAD.right} y1={y} y2={y}
                  stroke={frac === 0 ? "#e4e4ec" : "#f2f2f6"} strokeWidth={1}
                  strokeDasharray={frac > 0 ? "3 4" : ""} />
                {label && (
                  <text x={PAD.left} y={y - 3} fontSize={10} fill="#9898aa" textAnchor="start">{label}</text>
                )}
              </g>
            );
          })}

          {/* Stacked bars per hour */}
          {hourRange.map((h, bi) => {
            const x = PAD.left + bi * (BAR_W + BAR_GAP);
            const bucket = bucketsByHour.get(h) ?? new Map<number, number>();
            const entries = Array.from(bucket.entries()).sort((a, b) => a[0] - b[0]);
            const totalMins = entries.reduce((s, [, v]) => s + v, 0);

            let stackY = PAD.top + CHART_H; // start from bottom

            return (
              <g key={h}>
                {/* Stacked segments */}
                {entries.map(([sid, mins]) => {
                  const idx = subjectIndexMap.get(sid) ?? 0;
                  const color = PALETTE[idx % PALETTE.length].accent;
                  const segH = ready ? Math.max(2, Math.round((mins / maxMins) * CHART_H)) : 0;
                  stackY -= segH;
                  return (
                    <rect key={sid}
                      x={x} y={stackY} width={BAR_W} height={segH}
                      fill={color} rx={2}
                      style={{ transition: `height 0.9s cubic-bezier(.4,0,.2,1) ${bi * 50}ms, y 0.9s cubic-bezier(.4,0,.2,1) ${bi * 50}ms` }}
                    />
                  );
                })}

                {/* Round top corners on the topmost segment */}
                {entries.length > 0 && (() => {
                  const idx = subjectIndexMap.get(entries[entries.length - 1][0]) ?? 0;
                  const color = PALETTE[idx % PALETTE.length].accent;
                  const topH = ready ? Math.max(2, Math.round((entries[entries.length - 1][1] / maxMins) * CHART_H)) : 0;
                  const topY = PAD.top + CHART_H - Math.round((totalMins / maxMins) * CHART_H);
                  return <rect x={x} y={topY} width={BAR_W} height={Math.min(topH, 6)} fill={color} rx={4} />;
                })()}

                {/* Duration label above bar */}
                {totalMins > 0 && (
                  <text
                    x={x + BAR_W / 2}
                    y={PAD.top + CHART_H - Math.round((totalMins / maxMins) * CHART_H) - 4}
                    fontSize={10} fill="#6b6b80" textAnchor="middle" fontWeight="600"
                  >
                    {totalMins >= 60 ? `${Math.floor(totalMins / 60)}h${totalMins % 60 > 0 ? `${totalMins % 60}m` : ""}` : `${Math.round(totalMins)}m`}
                  </text>
                )}

                {/* Hour label on X axis */}
                <text
                  x={x + BAR_W / 2} y={svgH - 6}
                  fontSize={11} fill="#9898aa" textAnchor="middle" fontWeight="600"
                >
                  {fmt12(h)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function StudentStatsPage() {
  const { user } = useInstitute();
  const [stats, setStats]   = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [ready, setReady]   = useState(false);

  const fetchStats = () => {
    studentTrackerService.getStats()
      .then(s => { setStats(s); setTimeout(() => setReady(true), 60); })
      .catch(err => setError(getErrorMessage(err, "Failed to load stats")))
      .finally(() => setLoading(false));
  };

  // Fetch on mount + re-fetch silently whenever the user returns to this tab
  useEffect(() => {
    fetchStats();
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        // Silent refresh — don't show skeleton, just update numbers
        studentTrackerService.getStats()
          .then(s => setStats(s))
          .catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const todayHrs  = stats?.subjects.reduce((s, x) => s + x.today_hours, 0) ?? 0;
  const avgPct    = stats?.subjects.length
    ? Math.round(stats.subjects.reduce((s, x) => s + x.weekly_pct, 0) / stats.subjects.length) : 0;
  const dayStreak = stats ? calcStreak(stats.daily_last_30) : 0;

  const animPct    = useCountUp(avgPct, 950, ready);
  const animStreak = useCountUp(dayStreak, 700, ready);

  const subjectList = stats?.subjects.map(s => ({ id: s.subject_id, name: s.subject_name })) ?? [];

  // ── Insights ─────────────────────────────────────────────────────────────
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  useEffect(() => { setDismissedIds(getDismissed()); }, []);

  const allInsights = stats ? computeInsights(stats) : [];
  const activeInsight = allInsights.find(i => !dismissedIds.has(i.id)) ?? null;

  const handleDismiss = (id: string) => {
    dismissInsight(id);
    setDismissedIds(prev => new Set([...prev, id]));
  };

  // KEY FIX: when ready=true, DON'T set opacity:0 inline — let animation control it.
  // CSS animations cannot override inline styles; inline opacity:0 would keep elements invisible forever.
  const enter = (delay: number): React.CSSProperties => ready
    ? { animation: `staggerFadeUp 0.42s cubic-bezier(.4,0,.2,1) ${delay}ms both` }
    : { opacity: 0 };

  return (
    <>
      <TopBar title="Overview" />
      <PageContent>
        {loading && <Skeleton />}

        {!loading && error && (
          <div style={{ padding: "12px 16px", background: "var(--error-bg)", border: "1px solid var(--error-border)", borderRadius: 12, color: "var(--error)", fontSize: 13 }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* ─── Hero — warm purple-violet (Quizlet / BYJU'S palette) ─── */}
            <div style={{
              ...enter(0),
              borderRadius: 20,
              backgroundImage: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 52%, #a855f7 100%)",
              backgroundSize: "200% 200%",
              padding: "20px 20px 18px",
              color: "#fff",
              boxShadow: "0 8px 32px rgba(124,58,237,0.35)",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Floating decorative circles */}
              {[
                { t: -28, r: -28, s: 110, a: "floatY 5s ease-in-out 0s infinite" },
                { b: -20, l: -16, s: 80,  a: "floatY 6.5s ease-in-out 1.5s infinite" },
                { t: "40%", r: "22%", s: 40, a: "floatY 4s ease-in-out 0.8s infinite" },
              ].map((c, i) => (
                <div key={i} style={{
                  position: "absolute",
                  top: c.t, right: c.r, bottom: c.b, left: c.l,
                  width: c.s, height: c.s, borderRadius: "50%",
                  background: "rgba(255,255,255,0.07)",
                  animation: c.a,
                } as React.CSSProperties} />
              ))}

              <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", opacity: 0.7, textTransform: "uppercase", marginBottom: 3 }}>
                {greeting()}
              </p>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, marginBottom: 18, lineHeight: 1.15 }}>
                {user?.full_name?.split(" ")[0] ?? "Student"}
              </p>

              {/* Stat pills — pop in staggered, no inline opacity when ready */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { icon: "📚", label: "Today",    value: fmtH(todayHrs) },
                  { icon: "🎯", label: "Avg goal", value: `${animPct}%` },
                  { icon: "🔥", label: "Streak",   value: `${animStreak}d` },
                ].map((stat, si) => (
                  <div key={stat.label} style={{
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 12,
                    padding: "10px 6px 8px",
                    textAlign: "center",
                    border: "1px solid rgba(255,255,255,0.15)",
                    ...(ready
                      ? { animation: `popIn 0.38s cubic-bezier(.4,0,.2,1) ${180 + si * 75}ms both` }
                      : { opacity: 0 }),
                  }}>
                    <div style={{ fontSize: 18, lineHeight: 1, marginBottom: 4 }}>{stat.icon}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: 1.1 }}>{stat.value}</div>
                    <div style={{ fontSize: 13, opacity: 0.7, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Active session banner ─── */}
            {stats?.active_session && (
              <div style={{
                ...enter(100),
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px",
                background: "linear-gradient(135deg, #ecfdf5, #dcfce7)",
                border: "1.5px solid #86efac", borderRadius: 14,
              }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", flexShrink: 0, boxShadow: "0 0 0 4px rgba(34,197,94,0.25)", animation: "pulse 1.8s ease-in-out infinite" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>Session active</p>
                  <p style={{ fontSize: 12, color: "#166534", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stats.active_session.subject_name}</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#15803d", background: "#bbf7d0", padding: "3px 8px", borderRadius: 99 }}>LIVE</span>
              </div>
            )}

            {/* ─── Insight card ─── */}
            {activeInsight && (
              <div style={enter(90)}>
                <InsightCard
                  insight={activeInsight}
                  onDismiss={() => handleDismiss(activeInsight.id)}
                />
              </div>
            )}

            {/* ─── Empty state ─── */}
            {(!stats || stats.subjects.length === 0) && (
              <div style={{ ...enter(120), padding: "52px 24px", textAlign: "center", background: "var(--surface-0)", borderRadius: 20, boxShadow: "var(--shadow-card)" }}>
                <div style={{ fontSize: 52, marginBottom: 12, animation: "floatY 3.5s ease-in-out infinite" }}>📖</div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--ink-900)", marginBottom: 8 }}>Add your first subject</p>
                <p style={{ fontSize: 13, color: "var(--ink-500)", lineHeight: 1.6, maxWidth: 260, margin: "0 auto" }}>Head to the Subjects tab to set up what you&apos;re studying.</p>
              </div>
            )}

            {/* ─── Subject cards ─── */}
            {stats && stats.subjects.length > 0 && (
              <>
                <p style={{ ...enter(80), fontSize: 13, fontWeight: 700, letterSpacing: "0.09em", color: "var(--ink-400)", textTransform: "uppercase", marginTop: 2 }}>
                  Your subjects
                </p>

                {stats.subjects.map((s: SubjectStats, i) => {
                  const p = pal(i);
                  const pct = Math.min(s.weekly_pct, 100);
                  const weekTargetHours = s.daily_target_hours * 7;
                  return (
                    <div key={s.subject_id} style={{ ...enter(120 + i * 65), background: "var(--surface-0)", borderRadius: 16, boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
                      <div style={{ height: 3, background: `linear-gradient(${p.grad})` }} />
                      <div style={{ padding: "14px 16px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                          {/* Ring + floating icon */}
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <Ring pct={pct} color={p.accent} size={54} />
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                              animation: ready ? `floatY ${3.5 + i * 0.4}s ease-in-out ${i * 0.3}s infinite` : undefined }}>
                              {iconFor(s.subject_name)}
                            </div>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink-900)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {s.subject_name}
                            </p>
                            <p style={{ fontSize: 13, color: "var(--ink-400)", marginTop: 2, fontWeight: 500 }}>{fmtH(s.daily_target_hours)}/day · {fmtH(weekTargetHours)}/week</p>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ padding: "4px 10px", borderRadius: 99, background: pct >= 100 ? "#dcfce7" : p.light, fontSize: 13, fontWeight: 700, color: pct >= 100 ? "#16a34a" : p.accent, border: `1px solid ${pct >= 100 ? "#86efac" : p.muted}`, marginBottom: 4 }}>
                              {pct >= 100 ? "✓ Done" : `${fmtH(s.this_week_hours)} / ${fmtH(weekTargetHours)}`}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: p.accent, textAlign: "right" }}>{pct}% this week</div>
                          </div>
                        </div>
                        {/* Animated bar */}
                        <div style={{ height: 6, background: "var(--ink-100)", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: ready ? `${pct}%` : "0%", background: `linear-gradient(90deg, ${p.accent}, ${p.muted})`, borderRadius: 99, transition: `width 1.2s cubic-bezier(.4,0,.2,1) ${i * 80}ms` }} />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", marginTop: 10 }}>
                        {[
                          { label: "Today",      value: fmtH(s.today_hours),      hi: s.today_hours >= s.daily_target_hours },
                          { label: "This week",  value: fmtH(s.this_week_hours) },
                          { label: "This month", value: fmtH(s.this_month_hours) },
                        ].map((stat, si) => (
                          <div key={stat.label} style={{ padding: "10px 6px", textAlign: "center", borderTop: "1px solid var(--ink-100)", borderRight: si < 2 ? "1px solid var(--ink-100)" : undefined }}>
                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: stat.hi ? "#16a34a" : "var(--ink-900)" }}>{stat.value}</p>
                            <p style={{ fontSize: 13, color: "var(--ink-400)", marginTop: 1, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* ─── Chart ─── */}
                <div style={{ ...enter(120 + stats.subjects.length * 65), background: "var(--surface-0)", borderRadius: 16, boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 8px" }}>
                    <div>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--ink-900)" }}>Study hours</p>
                      <p style={{ fontSize: 13, color: "var(--ink-400)", marginTop: 1 }}>{period === "week" ? "Last 7 days" : "Last 30 days"}</p>
                    </div>
                    <div style={{ display: "flex", background: "var(--ink-100)", borderRadius: 9, padding: 3, gap: 2 }}>
                      {(["week", "month"] as const).map(p => (
                        <button key={p} type="button" onClick={() => setPeriod(p)} style={{ padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", background: period === p ? "#fff" : "transparent", color: period === p ? "#7c3aed" : "var(--ink-500)", boxShadow: period === p ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.18s ease" }}>
                          {p === "week" ? "7d" : "30d"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", padding: "0 16px 8px" }}>
                    {subjectList.map((s, i) => (
                      <span key={s.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--ink-500)" }}>
                        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: PALETTE[i % PALETTE.length].accent, flexShrink: 0 }} />
                        {s.name}
                      </span>
                    ))}
                  </div>
                  <div style={{ padding: "0 8px 12px" }}>
                    <LineChart data={stats.daily_last_30} subjects={subjectList} period={period} />
                  </div>
                </div>

                {/* ─── Today's hourly timeline chart ─── */}
                <TodayTimeline
                  sessions={stats.today_sessions}
                  subjects={stats.subjects}
                  ready={ready}
                  enterStyle={enter(120 + stats.subjects.length * 65 + 80)}
                />
              </>
            )}
          </div>
        )}
      </PageContent>
    </>
  );
}
