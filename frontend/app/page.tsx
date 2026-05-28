"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { MarketingNavbar } from "@/components/layout/MarketingNavbar";

/* ── Icons ─────────────────────────────────────────────────────────── */
const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7h9M7.5 3.5L11 7l-3.5 3.5" />
  </svg>
);
const Check = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6.5l3 3 6-5.5" />
  </svg>
);
const Play = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="6.5" cy="6.5" r="5" />
    <path d="M5 4.8l4 1.7-4 1.7V4.8z" fill="currentColor" stroke="none" />
  </svg>
);

/* ── Hero ───────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{
      minHeight: "100svh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "80px 24px 60px",
      background: "var(--surface-0)",
      textAlign: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, var(--ink-200) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 100%)",
        opacity: 0.5,
      }} />
      <div style={{
        position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
        width: 400, height: 300, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(ellipse, rgba(79,70,229,0.08) 0%, transparent 70%)",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, width: "100%" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 12px",
          background: "var(--brand-50)", border: "1px solid var(--brand-200)",
          borderRadius: "var(--radius-full)", marginBottom: 24,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand-primary)" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--brand-primary)", letterSpacing: "0.04em" }}>
            School management, reimagined
          </span>
        </div>

        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(36px, 9vw, 56px)",
          fontWeight: 800, lineHeight: 1.06,
          letterSpacing: "-0.04em",
          color: "var(--ink-900)",
          marginBottom: 18,
        }}>
          One platform.<br />
          <span style={{ color: "var(--brand-primary)" }}>Every school</span><br />
          workflow.
        </h1>

        <p style={{
          fontSize: 16, color: "var(--ink-500)", lineHeight: 1.7,
          maxWidth: 380, margin: "0 auto 36px",
        }}>
          Attendance, results, fees, and parent communication — all in one place. No training required.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          <Link href="/register" style={{
            fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600,
            padding: "14px 32px", borderRadius: "var(--radius-md)",
            background: "var(--brand-primary)", color: "white",
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
            width: "100%", maxWidth: 320, justifyContent: "center",
          }}>
            Start for free <ArrowRight />
          </Link>
          <button style={{
            fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 500,
            padding: "12px 28px", borderRadius: "var(--radius-md)",
            background: "transparent", color: "var(--ink-600)",
            border: "1px solid var(--ink-200)", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 7,
            width: "100%", maxWidth: 320, justifyContent: "center",
          }}>
            <Play /> See how it works
          </button>
        </div>

        <p style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 20 }}>
          No credit card. Setup in under 5 minutes.
        </p>
      </div>
    </section>
  );
}

/* ── Feature visuals ────────────────────────────────────────────────── */
function AttendanceVisual() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const pct  = [96, 91, 98, 88, 94];
  return (
    <div style={{ background: "var(--surface-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--radius-lg)", padding: "24px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--ink-800)" }}>Weekly Attendance</span>
        <span style={{ fontSize: 11, color: "var(--ink-400)", background: "var(--ink-100)", padding: "3px 8px", borderRadius: 4 }}>Class 9-B</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 80, marginBottom: 8 }}>
        {days.map((d, i) => (
          <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 10, color: "var(--ink-500)", fontWeight: 600 }}>{pct[i]}%</span>
            <div style={{ width: "100%", borderRadius: "3px 3px 0 0", height: `${pct[i] * 0.7}%`, background: pct[i] >= 95 ? "var(--brand-primary)" : pct[i] >= 90 ? "var(--brand-400)" : "var(--brand-200)" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {days.map((d) => <span key={d} style={{ flex: 1, textAlign: "center", fontSize: 10, color: "var(--ink-400)" }}>{d}</span>)}
      </div>
      <div style={{ marginTop: 16, padding: "10px 12px", background: "var(--brand-50)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand-primary)", flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "var(--brand-900)" }}>3 students below 85% — parents notified</span>
      </div>
    </div>
  );
}

function ResultsVisual() {
  const subjects = [
    { name: "Mathematics", score: 88 },
    { name: "Science", score: 74 },
    { name: "English", score: 91 },
    { name: "History", score: 67 },
  ];
  return (
    <div style={{ background: "var(--surface-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--radius-lg)", padding: "24px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--ink-800)" }}>Term 2 Results</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--brand-primary)", background: "var(--brand-50)", padding: "3px 8px", borderRadius: 4 }}>Published</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {subjects.map((s) => (
          <div key={s.name}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 13, color: "var(--ink-700)", fontWeight: 500 }}>{s.name}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: s.score >= 85 ? "var(--brand-primary)" : s.score >= 70 ? "var(--ink-700)" : "#d97706" }}>{s.score}</span>
            </div>
            <div style={{ height: 5, background: "var(--ink-100)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${s.score}%`, background: s.score >= 85 ? "var(--brand-primary)" : s.score >= 70 ? "var(--brand-400)" : "#f59e0b", borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeesVisual() {
  return (
    <div style={{ background: "var(--surface-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--radius-lg)", padding: "24px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--ink-800)" }}>Fee Collection</span>
        <span style={{ fontSize: 11, color: "var(--ink-400)" }}>Q3 2025</span>
      </div>
      {[
        { label: "Tuition fees",  status: "Paid",    date: "Aug 1"  },
        { label: "Lab charges",   status: "Paid",    date: "Aug 1"  },
        { label: "Annual day",    status: "Due",     date: "Sep 15" },
        { label: "Transport",     status: "Overdue", date: "Jul 15" },
      ].map((f) => (
        <div key={f.label} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--ink-100)", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-800)" }}>{f.label}</div>
            <div style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 2 }}>{f.date}</div>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
            background: f.status === "Paid" ? "#dcfce7" : f.status === "Due" ? "var(--brand-50)" : "#fef2f2",
            color:      f.status === "Paid" ? "#15803d" : f.status === "Due" ? "var(--brand-primary)" : "#dc2626",
          }}>{f.status}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Feature section ────────────────────────────────────────────────── */
function FeatureBlock({ label, title, desc, checks, visual }: {
  label: string; title: string; desc: string; checks: string[]; visual: ReactNode;
}) {
  return (
    <div style={{ padding: "64px 24px", display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ maxWidth: 520, margin: "0 auto", width: "100%" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--brand-primary)", marginBottom: 10 }}>
          {label}
        </p>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.15, color: "var(--ink-900)", marginBottom: 14 }}>
          {title}
        </h2>
        <p style={{ fontSize: 15, color: "var(--ink-500)", lineHeight: 1.75, marginBottom: 24 }}>
          {desc}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {checks.map((c) => (
            <div key={c} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 14, color: "var(--ink-700)", lineHeight: 1.5 }}>
              <span style={{ color: "var(--brand-primary)", marginTop: 1, flexShrink: 0 }}><Check /></span>
              {c}
            </div>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 520, margin: "0 auto", width: "100%" }}>
        {visual}
      </div>
    </div>
  );
}

function Features() {
  return (
    <div style={{ background: "var(--surface-1)", borderTop: "1px solid var(--ink-100)" }}>
      <FeatureBlock
        label="Attendance"
        title="Know who's present before class starts"
        desc="QR-based check-in with instant parent alerts when a student is absent. No registers, no manual entry."
        checks={["Mark attendance in seconds", "Automated parent SMS and WhatsApp", "Absence trends flagged automatically"]}
        visual={<AttendanceVisual />}
      />
      <div style={{ height: 1, background: "var(--ink-100)", margin: "0 24px" }} />
      <FeatureBlock
        label="Exams & Results"
        title="From gradebook to report card in one click"
        desc="Enter marks in bulk, publish results instantly. Report cards generate automatically — no formatting required."
        checks={["Bulk mark entry with CSV import", "Instant result publication", "Auto-generated PDF report cards"]}
        visual={<ResultsVisual />}
      />
      <div style={{ height: 1, background: "var(--ink-100)", margin: "0 24px" }} />
      <FeatureBlock
        label="Fee Management"
        title="Collections that run themselves"
        desc="Online payment links, automated reminders, and real-time dues tracking. UPI, card, net banking."
        checks={["Razorpay & PayU integration", "Auto-reminders for overdue fees", "One-tap receipt generation"]}
        visual={<FeesVisual />}
      />
    </div>
  );
}

/* ── Testimonials ───────────────────────────────────────────────────── */
function Testimonials() {
  const quotes = [
    { init: "SR", name: "Sunita Rao",      role: "Principal, DPS Pune",              text: "We were running attendance on paper and fees on Excel. VidyaTrack replaced both in a week. The AI flagged patterns we'd never have spotted on our own." },
    { init: "AK", name: "Amit Kulkarni",   role: "Admin, Ryan International",        text: "Fee follow-ups used to eat two weeks of every month. Now they're automated. We recovered overdue payments we'd written off as lost." },
    { init: "NM", name: "Neha Malhotra",   role: "VP, Kendriya Vidyalaya",           text: "The timetable builder sold our staff coordinator instantly. Setup took 20 minutes. Parents actually complimented us on the communication app." },
  ];

  return (
    <section style={{ padding: "64px 24px", background: "var(--surface-0)", borderTop: "1px solid var(--ink-100)" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--brand-primary)", marginBottom: 10, textAlign: "center" }}>
          From schools using VidyaTrack
        </p>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.15, color: "var(--ink-900)", marginBottom: 36, textAlign: "center" }}>
          Built for the people who actually run schools
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {quotes.map((q) => (
            <div key={q.init} style={{ background: "var(--surface-1)", border: "1px solid var(--ink-200)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
                {[...Array(5)].map((_, i) => <span key={i} style={{ fontSize: 11, color: "#f59e0b" }}>★</span>)}
              </div>
              <p style={{ fontSize: 14, color: "var(--ink-700)", lineHeight: 1.7, marginBottom: 14 }}>"{q.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--brand-100)", fontSize: 10, fontWeight: 700, color: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{q.init}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-900)" }}>{q.name}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-400)" }}>{q.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing ────────────────────────────────────────────────────────── */
function Pricing() {
  const plans = [
    {
      name: "Starter", price: "Free", note: "Up to 100 students",
      features: ["Attendance tracking", "Basic report cards", "Parent email alerts", "Up to 5 staff accounts"],
      cta: "Get started free", primary: false, badge: "",
    },
    {
      name: "School", price: "₹4,999", period: "/mo", note: "Up to 1,000 students",
      badge: "Most popular",
      features: ["Everything in Starter", "AI insights & alerts", "Fee management + payments", "WhatsApp & SMS", "Unlimited staff"],
      cta: "Start 14-day trial", primary: true,
    },
    {
      name: "Enterprise", price: "Custom", note: "Unlimited · multi-branch",
      features: ["Everything in School", "Dedicated account manager", "Custom integrations", "On-premise option", "SLA guarantee"],
      cta: "Talk to us", primary: false, badge: "",
    },
  ];

  return (
    <section style={{ padding: "64px 24px", background: "var(--surface-1)", borderTop: "1px solid var(--ink-100)" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--brand-primary)", marginBottom: 10, textAlign: "center" }}>Pricing</p>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.15, color: "var(--ink-900)", marginBottom: 8, textAlign: "center" }}>
          Pay for what you use
        </h2>
        <p style={{ fontSize: 15, color: "var(--ink-500)", lineHeight: 1.7, marginBottom: 32, textAlign: "center" }}>
          No module charges. No hidden fees. Cancel anytime.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {plans.map((p) => (
            <div key={p.name} style={{
              background: "var(--surface-0)", borderRadius: "var(--radius-lg)",
              border: p.primary ? "2px solid var(--brand-primary)" : "1px solid var(--ink-200)",
              padding: "22px 20px", position: "relative",
            }}>
              {p.badge && (
                <div style={{
                  position: "absolute", top: -10, left: 18,
                  background: "var(--brand-primary)", color: "white",
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
                  padding: "3px 10px", borderRadius: "var(--radius-full)",
                }}>
                  {p.badge}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 12 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--ink-800)", marginBottom: 3 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-400)" }}>{p.note}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, letterSpacing: "-0.04em", color: "var(--ink-900)" }}>{p.price}</span>
                  {"period" in p && p.period && <span style={{ fontSize: 12, color: "var(--ink-400)" }}>{p.period}</span>}
                </div>
              </div>
              <div style={{ height: 1, background: "var(--ink-100)", marginBottom: 14 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                {p.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-600)" }}>
                    <span style={{ color: "var(--brand-primary)" }}><Check /></span>
                    {f}
                  </div>
                ))}
              </div>
              <button style={{
                width: "100%", padding: "11px 0", borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                ...(p.primary
                  ? { background: "var(--brand-primary)", color: "white", border: "none" }
                  : { background: "transparent", color: "var(--ink-700)", border: "1.5px solid var(--ink-200)" }),
              }}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Final CTA ──────────────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section style={{ padding: "80px 24px", background: "var(--ink-900)", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 500, height: 300, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(ellipse, rgba(79,70,229,0.35) 0%, transparent 70%)",
      }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 440, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px, 6vw, 40px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, color: "white", marginBottom: 14 }}>
          Your school deserves better tools.
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 32, lineHeight: 1.7 }}>
          Start free. No credit card. Works on any device.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          <Link href="/register" style={{
            fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600,
            padding: "14px 32px", borderRadius: "var(--radius-md)",
            background: "white", color: "var(--brand-primary)",
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
            width: "100%", maxWidth: 320, justifyContent: "center",
          }}>
            Get started free <ArrowRight />
          </Link>
          <Link href="/login" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", marginTop: 4 }}>
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ─────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: "var(--ink-900)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "28px 24px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14, alignItems: "center", textAlign: "center" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>VidyaTrack</span>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          {["Privacy", "Terms", "Security", "Contact"].map((l) => (
            <Link key={l} href="#" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", fontSize: 12 }}>{l}</Link>
          ))}
        </div>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>© 2025 VidyaTrack</span>
      </div>
    </footer>
  );
}

/* ── Page ───────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <MarketingNavbar />
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </>
  );
}