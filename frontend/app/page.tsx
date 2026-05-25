"use client";

import { Footer } from "@/components/footer/page";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

/* ─── Tiny reusable primitives ─────────────────────────────────────── */

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6l3 3 5-5" />
    </svg>
  );
}

function ArrowRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 7h9M7.5 3.5L11 7l-3.5 3.5" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="7" cy="7" r="5.5" />
      <path d="M5.5 5.5l4 1.5-4 1.5V5.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ─── Nav ───────────────────────────────────────────────────────────── */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 48px", height: 64,
      background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.7)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderBottom: `1px solid ${scrolled ? "rgba(0,0,0,0.08)" : "transparent"}`,
      transition: "background 0.2s, border-color 0.2s",
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "var(--brand-primary)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 14l4-8 4 4 3-5 3 9" />
            <circle cx="9" cy="3" r="1.2" fill="white" stroke="none" />
          </svg>
        </div>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--ink-900)", letterSpacing: "-0.03em" }}>
          VidyaTrack
        </span>
      </Link>

      {/* Links */}
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        {["Features", "Pricing", "About", "Docs"].map((l) => (
          <Link key={l} href="#" style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink-500)", textDecoration: "none" }}>
            {l}
          </Link>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/login" style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-500)", textDecoration: "none" }}>
          Sign in
        </Link>
        <Link href="/register" style={{
          fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600,
          color: "white", background: "var(--brand-primary)",
          textDecoration: "none", padding: "9px 20px",
          borderRadius: "var(--radius-md)", transition: "background 0.15s",
        }}>
          Start free trial
        </Link>
      </div>
    </nav>
  );
}

/* ─── Hero ──────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "120px 24px 80px",
      background: "var(--surface-0)", position: "relative", overflow: "hidden",
    }}>
      {/* Grid BG */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.35,
        backgroundImage: "linear-gradient(var(--ink-200) 1px, transparent 1px), linear-gradient(90deg, var(--ink-200) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%, black 30%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 0%, black 30%, transparent 100%)",
      }} />
      {/* Glow */}
      <div style={{
        position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)",
        width: 900, height: 600, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(ellipse at center, rgba(79,70,229,0.1) 0%, transparent 70%)",
      }} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 860, width: "100%" }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 14px 6px 6px",
          background: "var(--brand-50)", border: "1px solid var(--brand-200)",
          borderRadius: "var(--radius-full)", marginBottom: 28,
          animation: "fadeUp 0.5s ease both",
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: "50%", background: "var(--brand-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
              <path d="M5 1l1.2 2.6 2.8.3-2 2 .5 2.8L5 7.4 2.5 8.7l.5-2.8-2-2 2.8-.3z" />
            </svg>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-primary)", letterSpacing: "0.02em" }}>
            Trusted by 10,000+ schools worldwide
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(40px, 6vw, 72px)",
          fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.04em",
          color: "var(--ink-900)", maxWidth: 820, margin: "0 auto 20px",
          animation: "fadeUp 0.6s ease 0.1s both",
        }}>
          The school management platform that{" "}
          <em style={{ fontStyle: "normal", color: "var(--brand-primary)" }}>actually works</em>
        </h1>

        {/* Subheading */}
        <p style={{
          fontSize: "clamp(15px, 1.8vw, 18px)", color: "var(--ink-500)",
          lineHeight: 1.7, maxWidth: 560, margin: "0 auto 40px",
          animation: "fadeUp 0.6s ease 0.18s both",
        }}>
          Attendance, results, communication, and AI insights — unified in one platform designed for modern education.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 0.6s ease 0.24s both" }}>
          <Link href="/register" style={{
            fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600,
            padding: "13px 28px", borderRadius: "var(--radius-md)",
            background: "var(--brand-primary)", color: "white",
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
            transition: "background 0.15s",
          }}>
            Start free trial <ArrowRight />
          </Link>
          <button style={{
            fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600,
            padding: "13px 28px", borderRadius: "var(--radius-md)",
            background: "transparent", color: "var(--ink-700)",
            border: "1.5px solid var(--ink-200)", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            <PlayIcon /> Watch demo
          </button>
        </div>

        {/* Social proof */}
        <div style={{ marginTop: 36, fontSize: 12, color: "var(--ink-400)", display: "flex", alignItems: "center", gap: 12, justifyContent: "center", animation: "fadeUp 0.6s ease 0.32s both" }}>
          <div style={{ display: "flex" }}>
            {["RK", "PM", "AS", "JD"].map((init, i) => (
              <div key={init} style={{
                width: 26, height: 26, borderRadius: "50%",
                border: "2px solid white", background: "var(--brand-100)",
                marginLeft: i === 0 ? 0 : -6,
                fontSize: 10, fontWeight: 700, color: "var(--brand-primary)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{init}</div>
            ))}
          </div>
          <span>Join 2M+ students already on VidyaTrack</span>
        </div>
      </div>
    </section>
  );
}

/* ─── Logos band ────────────────────────────────────────────────────── */

function LogosBand() {
  const logos = ["Delhi Public School", "Symbiosis", "Kendriya Vidyalaya", "Ryan International", "Narayana Group"];
  return (
    <div style={{ padding: "48px 24px", borderTop: "1px solid rgba(0,0,0,0.05)", borderBottom: "1px solid rgba(0,0,0,0.05)", background: "var(--surface-0)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-400)", marginBottom: 28 }}>
          Powering institutions across India and beyond
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
          {logos.map((l) => (
            <span key={l} style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--ink-300)", letterSpacing: "-0.02em" }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Stats ─────────────────────────────────────────────────────────── */

function Stats() {
  const stats = [
    { num: "10K+", label: "Schools using VidyaTrack" },
    { num: "2M+", label: "Students managed daily" },
    { num: "99.9%", label: "Platform uptime SLA" },
    { num: "4 hrs", label: "Saved per admin per week" },
  ];
  return (
    <div style={{ padding: "72px 24px", background: "var(--surface-0)", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", maxWidth: 900, margin: "0 auto" }}>
        {stats.map((s) => (
          <div key={s.label} style={{ padding: "32px 28px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, letterSpacing: "-0.05em", color: "var(--ink-900)", marginBottom: 6 }}>
              {s.num}
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-500)" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Features grid ─────────────────────────────────────────────────── */

const FEATURES = [
  {
    title: "Smart Attendance",
    desc: "Automated attendance with real-time parent notifications. Biometric and QR-based check-in supported.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <rect x="2" y="5" width="16" height="12" rx="2" />
        <path d="M14 5V4a2 2 0 00-2-2H8a2 2 0 00-2 2v1M10 10v4m-2-2h4" />
      </svg>
    ),
  },
  {
    title: "Exam & Results",
    desc: "Create exams, grade in bulk, and publish results with automated report cards in one click.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <rect x="3" y="3" width="14" height="14" rx="2" />
        <path d="M7 10l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "AI Insights",
    desc: "Predictive analytics flag at-risk students early. Actionable recommendations, not just dashboards.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <circle cx="10" cy="10" r="7" />
        <path d="M10 7v3l2 2" />
      </svg>
    ),
  },
  {
    title: "Parent Communication",
    desc: "WhatsApp, SMS, and in-app messaging. Circulars, fee reminders, and event alerts in one place.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M2 5h16v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zM2 5l8 7 8-7" />
      </svg>
    ),
  },
  {
    title: "Fee Management",
    desc: "Online payments, auto-receipts, dues tracking, and financial reports. Razorpay integrated.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <rect x="3" y="3" width="6" height="6" rx="1" />
        <rect x="11" y="3" width="6" height="6" rx="1" />
        <rect x="3" y="11" width="6" height="6" rx="1" />
        <rect x="11" y="11" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    title: "Timetable Builder",
    desc: "Drag-and-drop scheduling with conflict detection. Substitution management and period tracking.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <rect x="3" y="3" width="14" height="14" rx="2" />
        <path d="M3 8h14M8 3v14" />
      </svg>
    ),
  },
];

function Features() {
  return (
    <section style={{ padding: "100px 24px", background: "var(--surface-1)" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brand-primary)", marginBottom: 12 }}>
            Everything you need
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, color: "var(--ink-900)", marginBottom: 16 }}>
            Built for every role in your school
          </h2>
          <p style={{ fontSize: 16, color: "var(--ink-500)", lineHeight: 1.7, maxWidth: 540, margin: "0 auto" }}>
            From admins to teachers to parents — one platform, every workflow covered.
          </p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2,
          background: "var(--ink-200)", border: "1px solid var(--ink-200)",
          borderRadius: "var(--radius-lg)", overflow: "hidden",
        }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ background: "var(--surface-0)", padding: "36px 32px", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-50)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface-0)")}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "var(--brand-50)", border: "1px solid var(--brand-200)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20, color: "var(--brand-primary)",
              }}>
                {f.icon}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--ink-900)", marginBottom: 10, letterSpacing: "-0.02em" }}>
                {f.title}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--ink-500)", lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Dashboard mockup (highlight section) ──────────────────────────── */

function DashboardMockup() {
  const bars = [55, 62, 58, 70, 75, 85];
  const students = [
    { init: "AK", name: "Arjun Kumar", badge: "↑ Improving", badgeColor: "#dcfce7", badgeText: "#15803d", score: 88 },
    { init: "PS", name: "Priya Sharma", badge: "⚠ At risk", badgeColor: "#fef9c3", badgeText: "#a16207", score: 61 },
    { init: "RM", name: "Rohan Mehta", badge: "↑ Top 5%", badgeColor: "#dcfce7", badgeText: "#15803d", score: 96 },
  ];

  return (
    <div style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--ink-200)", background: "var(--surface-1)", padding: 28, position: "relative" }}>
      <div style={{ position: "absolute", top: 16, right: 16, background: "var(--brand-primary)", color: "white", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: "var(--radius-full)", letterSpacing: "0.04em" }}>
        AI Live
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--ink-800)" }}>Class 10-A Overview</div>
          <div style={{ fontSize: 11, color: "var(--ink-400)", background: "var(--ink-100)", padding: "3px 8px", borderRadius: 4 }}>This week</div>
        </div>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {[{ val: "94%", lbl: "Attendance" }, { val: "78.4", lbl: "Avg. Score" }, { val: "3", lbl: "At-risk" }].map((s) => (
            <div key={s.lbl} style={{ background: "var(--surface-0)", border: "1px solid var(--ink-200)", borderRadius: 8, padding: 12 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--ink-900)", letterSpacing: "-0.04em" }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "var(--ink-400)", marginTop: 2 }}>{s.lbl}</div>
            </div>
          ))}
        </div>
        {/* Chart */}
        <div style={{ background: "var(--surface-0)", border: "1px solid var(--ink-200)", borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-500)", marginBottom: 12 }}>Performance trend — last 6 weeks</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
            {bars.map((h, i) => (
              <div key={i} style={{
                flex: 1, borderRadius: "3px 3px 0 0", height: `${h}%`,
                background: i < 3 ? "var(--brand-200)" : i < 5 ? "var(--brand-400)" : "var(--brand-primary)",
              }} />
            ))}
          </div>
        </div>
        {/* Student rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {students.map((s) => (
            <div key={s.init} style={{ background: "var(--surface-0)", border: "1px solid var(--ink-200)", borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--brand-100)", fontSize: 9, fontWeight: 700, color: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.init}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-800)", flex: 1 }}>{s.name}</div>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: s.badgeColor, color: s.badgeText }}>{s.badge}</span>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-primary)" }}>{s.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HighlightFeature() {
  const checks = [
    "Identify at-risk students 3 weeks in advance",
    "Automated progress reports for every student",
    "Benchmarking across classes, grades, and branches",
    "One-tap recommendations sent directly to teachers",
  ];
  return (
    <section style={{ padding: "100px 24px", background: "var(--surface-0)" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "var(--brand-50)", border: "1px solid var(--brand-200)", borderRadius: "var(--radius-full)", fontSize: 11, fontWeight: 700, color: "var(--brand-primary)", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 20 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 0l1.2 2.8 3 .3-2.2 2 .7 3L5 6.6 2.3 8.1l.7-3L.8 3.1l3-.3z" /></svg>
            AI-Powered
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.15, color: "var(--ink-900)", marginBottom: 18 }}>
            Insights that help you<br />act, not just inform
          </h2>
          <p style={{ fontSize: 15, color: "var(--ink-500)", lineHeight: 1.75, marginBottom: 28 }}>
            VidyaTrack's AI engine analyzes student behavior patterns across attendance, performance, and engagement to surface what matters — before it becomes a problem.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {checks.map((c) => (
              <div key={c} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13.5, color: "var(--ink-700)", lineHeight: 1.5 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--brand-50)", border: "1px solid var(--brand-200)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, color: "var(--brand-primary)" }}>
                  <CheckIcon />
                </div>
                {c}
              </div>
            ))}
          </div>
        </div>
        <DashboardMockup />
      </div>
    </section>
  );
}

/* ─── Pricing ───────────────────────────────────────────────────────── */

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "Up to 100 students · forever",
    features: ["Attendance tracking", "Basic report cards", "Parent notifications", "Email support"],
    featured: false,
    cta: "Get started free",
    ctaStyle: "secondary",
  },
  {
    name: "Growth",
    price: "₹4,999",
    period: "per month · up to 1,000 students",
    features: ["Everything in Starter", "AI insights & analytics", "Fee management + Razorpay", "WhatsApp & SMS alerts", "Priority support"],
    featured: true,
    badge: "Most popular",
    cta: "Start 14-day trial",
    ctaStyle: "primary",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "Unlimited students · multi-branch",
    features: ["Everything in Growth", "Dedicated account manager", "Custom integrations & API", "On-premise deployment"],
    featured: false,
    cta: "Contact sales",
    ctaStyle: "secondary",
  },
];

function Pricing() {
  return (
    <section style={{ padding: "100px 24px", background: "var(--surface-1)" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brand-primary)", marginBottom: 12 }}>Pricing</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, color: "var(--ink-900)", marginBottom: 16 }}>
            Simple, transparent pricing
          </h2>
          <p style={{ fontSize: 16, color: "var(--ink-500)", lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
            No hidden fees. No per-module charges. Pay once, use everything.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 960, margin: "0 auto" }}>
          {PLANS.map((plan) => (
            <div key={plan.name} style={{
              background: "var(--surface-0)", borderRadius: "var(--radius-lg)",
              border: plan.featured ? "2px solid var(--brand-primary)" : "1px solid var(--ink-200)",
              padding: "32px 28px", position: "relative",
            }}>
              {plan.badge && (
                <div style={{
                  position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
                  background: "var(--brand-primary)", color: "white",
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                  padding: "4px 14px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap",
                }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--ink-700)", marginBottom: 20 }}>{plan.name}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: plan.price === "Custom" ? 32 : 44, fontWeight: 800, letterSpacing: "-0.05em", color: "var(--ink-900)", lineHeight: 1, marginBottom: 6 }}>{plan.price}</div>
              <div style={{ fontSize: 13, color: "var(--ink-500)", marginBottom: 24 }}>{plan.period}</div>
              <div style={{ height: 1, background: "var(--ink-100)", marginBottom: 20 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-600)" }}>
                    <span style={{ color: "var(--brand-primary)", display: "flex" }}><CheckIcon /></span>
                    {f}
                  </div>
                ))}
              </div>
              <button style={{
                width: "100%", padding: 12, borderRadius: "var(--radius-md)", cursor: "pointer",
                fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600,
                ...(plan.ctaStyle === "primary"
                  ? { background: "var(--brand-primary)", color: "white", border: "none" }
                  : { background: "transparent", color: "var(--ink-700)", border: "1.5px solid var(--ink-200)" }),
              }}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ──────────────────────────────────────────────────── */

const TESTIMONIALS = [
  { init: "SR", name: "Sunita Rao", role: "Principal, DPS Pune", text: "We switched from three separate tools to VidyaTrack. The AI flagged attendance drops we'd missed for months. Our no-show rate dropped 40% in a single term." },
  { init: "AK", name: "Amit Kulkarni", role: "Admin Director, Ryan International", text: "Fee collection used to take 2 weeks of manual follow-ups. Now it's fully automated. We recovered ₹12L in dues we didn't even know existed in the first month." },
  { init: "NM", name: "Neha Malhotra", role: "Vice Principal, Kendriya Vidyalaya", text: "Setup was under 30 minutes. The timetable builder alone saves my staff coordinator an entire day every semester. Parents genuinely appreciate the app." },
];

function Testimonials() {
  return (
    <section style={{ padding: "100px 24px", background: "var(--surface-0)" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brand-primary)", marginBottom: 12 }}>What schools say</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, color: "var(--ink-900)" }}>
            Trusted by administrators<br />who've tried everything
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.init} style={{ background: "var(--surface-1)", borderRadius: "var(--radius-lg)", border: "1px solid var(--ink-200)", padding: 28 }}>
              <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                {[...Array(5)].map((_, i) => <span key={i} style={{ fontSize: 12, color: "#f59e0b" }}>★</span>)}
              </div>
              <p style={{ fontSize: 14, color: "var(--ink-700)", lineHeight: 1.7, marginBottom: 18 }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--brand-100)", fontSize: 11, fontWeight: 700, color: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>{t.init}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-900)" }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-400)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ─────────────────────────────────────────────────────── */

function FinalCTA() {
  return (
    <section style={{ padding: "100px 24px", background: "var(--ink-900)", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(79,70,229,0.4) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 10 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-0.04em", color: "white", marginBottom: 16 }}>
          Ready to modernize your school?
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", marginBottom: 36, maxWidth: 500, margin: "0 auto 36px" }}>
          Join thousands of schools already running on VidyaTrack. No credit card needed to start.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" style={{
            fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600,
            padding: "14px 32px", borderRadius: "var(--radius-md)",
            background: "white", color: "var(--brand-primary)",
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            Start free trial <ArrowRight />
          </Link>
          <button style={{
            fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600,
            padding: "14px 32px", borderRadius: "var(--radius-md)",
            background: "transparent", color: "rgba(255,255,255,0.75)",
            border: "1.5px solid rgba(255,255,255,0.2)", cursor: "pointer",
          }}>
            Talk to sales
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 900px) {
          nav { padding: 0 20px !important; }
        }
      `}</style>

      <Navbar />
      <Hero />
      <LogosBand />
      <Stats />
      <Features />
      <HighlightFeature />
      <Pricing />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </>
  );
}