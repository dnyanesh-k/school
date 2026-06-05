import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNavbar } from "@/components/layout/MarketingNavbar";
import { MarketingFooter } from "@/components/layout/MarketingFooter";

export const metadata: Metadata = {
  title: "VidyaTrack — School Management App with AI for Indian Schools",
  description:
    "VidyaTrack is a mobile-first school and coaching management app. Automate attendance, fee collection, WhatsApp reminders and AI voice calls to parents. Starts at ₹499/month.",
  keywords: [
    "school management software India",
    "coaching management app",
    "attendance management system",
    "fee management software",
    "WhatsApp school app",
    "school ERP India",
    "student management system",
    "school app India",
    "vidyatrack",
  ],
  openGraph: {
    title: "VidyaTrack — Run Your School with AI",
    description:
      "Attendance, fees, WhatsApp reminders and AI voice calls — all from your phone. Starts at ₹499/month.",
    url: "https://vidyatrack.com",
    siteName: "VidyaTrack",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VidyaTrack — School Management with AI",
    description:
      "Mobile-first school ERP for Indian schools and coaching institutes. Attendance, fees, WhatsApp & AI voice follow-ups.",
  },
  alternates: {
    canonical: "https://vidyatrack.com",
  },
};
const BOX = { maxWidth: 520, margin: "0 auto", width: "100%" } as const;
const CARD = {
  background: "var(--surface-0)",
  border: "1px solid var(--ink-200)",
  borderRadius: "var(--radius-lg)",
  padding: "16px",
  boxShadow: "var(--shadow-sm)",
} as const;

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7h9M7.5 3.5L11 7l-3.5 3.5" />
  </svg>
);

/* ── Mini visuals (show, don't tell) ─────────────────────────────────── */
function attendanceColor(pct: number): { bar: string; label: string } {
  if (pct < 75) return { bar: "#eb5757ff", label: "#e46262ff" };
  if (pct < 90) return { bar: "#f59e0b", label: "#b45309" };
  if (pct == 100) return { bar: "#55d370ba", label: "#5ae47cff" };
  return { bar: "var(--brand-primary)", label: "var(--brand-primary)" };
}

function AttendanceVisual() {
  const days = ["M", "T", "W", "T", "F"];
  const pct = [92, 80, 98, 72, 100];
  const maxBarHeight = 64;
  return (
    <div style={CARD}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, color: "var(--ink-800)" }}>Attendance</span>
        <span style={{ fontSize: 10, color: "var(--ink-400)", background: "var(--ink-100)", padding: "2px 7px", borderRadius: 4 }}>9-B</span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
        {days.map((d, i) => {
          const colors = attendanceColor(pct[i]);
          const barHeight = Math.round((pct[i] / 100) * maxBarHeight);
          return (
            <div key={`${d}-${i}`} style={{ flex: 1, minWidth: 0 }}>
              <div style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: colors.label, marginBottom: 6, height: 14 }}>
                {pct[i]}%
              </div>
              <div
                style={{
                  height: maxBarHeight,
                  display: "flex",
                  alignItems: "flex-end",
                  background: "var(--surface-1)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0 3px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: barHeight,
                    borderRadius: "3px 3px 0 0",
                    background: colors.bar,
                  }}
                />
              </div>
              <div style={{ textAlign: "center", fontSize: 9, fontWeight: 600, color: "var(--ink-400)", marginTop: 6 }}>
                {d}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: "8px 10px", background: "var(--brand-50)", borderRadius: "var(--radius-sm)", fontSize: 11, color: "var(--brand-700)", display: "flex", alignItems: "center", gap: 6 }}>
        <span>💬</span> 2 absent — parents notified
      </div>
    </div>
  );
}

function FeesVisual() {
  return (
    <div style={CARD}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, color: "var(--ink-800)" }}>Fees</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", background: "#fef2f2", padding: "2px 7px", borderRadius: 4 }}>₹48K due</span>
      </div>
      {[
        { label: "Tuition", status: "Paid", ok: true },
        { label: "Transport", status: "Overdue", ok: false },
      ].map((f) => (
        <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--ink-100)", fontSize: 12 }}>
          <span style={{ color: "var(--ink-700)" }}>{f.label}</span>
          <span style={{ fontWeight: 700, fontSize: 10, color: f.ok ? "#15803d" : "#dc2626" }}>{f.status}</span>
        </div>
      ))}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 999, background: "#dcfce7", color: "#15803d" }}>💬 WhatsApp reminders</span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 999, background: "var(--brand-50)", color: "var(--brand-primary)" }}>📞 AI voice calls</span>
      </div>
    </div>
  );
}

function ResultsVisual() {
  const rows = [
    { name: "Math", score: 88 },
    { name: "Science", score: 74 },
    { name: "English", score: 91 },
  ];
  return (
    <div style={CARD}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, color: "var(--ink-800)", marginBottom: 12 }}>Results</div>
      {rows.map((s) => (
        <div key={s.name} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
            <span style={{ color: "var(--ink-600)" }}>{s.name}</span>
            <span style={{ fontWeight: 700, color: "var(--brand-primary)" }}>{s.score}</span>
          </div>
          <div style={{ height: 4, background: "var(--ink-100)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${s.score}%`, background: "var(--brand-primary)", borderRadius: 3 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function NotifyCard({
  title,
  body,
  tone,
  className,
}: {
  title: string;
  body: string;
  tone: "green" | "brand";
  className?: string;
}) {
  const isGreen = tone === "green";
  return (
    <div
      className={className}
      style={{
        padding: "12px 14px",
        borderRadius: "var(--radius-md)",
        background: isGreen ? "#dcfce7" : "var(--brand-50)",
        textAlign: "left",
      }}
    >
      <div
        className="lp-notify-title"
        style={{ color: isGreen ? "#15803d" : "var(--brand-primary)" }}
      >
        {title}
      </div>
      <div className="lp-notify-body">{body}</div>
    </div>
  );
}

function CommsVisual() {
  return (
    <div style={CARD}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--ink-800)", marginBottom: 12 }}>
        Parent communications
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <NotifyCard
          title="WhatsApp sent ✓"
          body="Fee reminder with UPI payment link"
          tone="green"
        />
        <NotifyCard
          title="Voice call done ✓"
          body="Parent confirmed payment by Friday"
          tone="brand"
        />
      </div>
    </div>
  );
}

function HeroDashboardVisual() {
  return (
    <div style={{ textAlign: "left" }}>

      {/* ── Top bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid var(--ink-100)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🏫</div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--ink-900)", lineHeight: 1.2 }}>Sunrise Public School</div>
            <div style={{ fontSize: 10, color: "var(--ink-400)" }}>Good morning, Rajesh 👋</div>
          </div>
        </div>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--brand-50)", border: "1px solid var(--brand-200)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>R</div>
      </div>

      {/* ── 4-stat grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {[
          { label: "Students", value: "342", sub: "6 added this month", color: "var(--brand-primary)", bg: "var(--brand-50)" },
          { label: "Attendance", value: "91%", sub: "Today · Class 10", color: "#15803d", bg: "#dcfce7" },
          { label: "Fees collected", value: "₹1.2L", sub: "This month", color: "#b45309", bg: "#fef3c7" },
          { label: "Pending fees", value: "₹48K", sub: "18 defaulters", color: "#dc2626", bg: "#fef2f2" },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: "var(--radius-md)", padding: "10px 12px" }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: s.color, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--ink-900)", letterSpacing: "-0.02em", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "var(--ink-500)", marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Action items ── */}
      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Needs attention</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { icon: "💬", text: "WhatsApp sent to 24 fee defaulters", tag: "Done", tagColor: "#15803d", tagBg: "#dcfce7" },
          { icon: "📞", text: "AI voice call — 8 parents confirmed", tag: "Done", tagColor: "#15803d", tagBg: "#dcfce7" },
          { icon: "📋", text: "Class 9-B attendance not marked", tag: "Pending", tagColor: "#b45309", tagBg: "#fef3c7" },
        ].map((item) => (
          <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--surface-1)", borderRadius: "var(--radius-sm)" }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontSize: 11, color: "var(--ink-700)", flex: 1, lineHeight: 1.3 }}>{item.text}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: item.tagColor, background: item.tagBg, padding: "2px 7px", borderRadius: 999, flexShrink: 0 }}>{item.tag}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

const SHOWCASE = [
  { icon: "📋", title: "Attendance", tag: "WhatsApp alerts to parents", visual: <AttendanceVisual /> },
  { icon: "💰", title: "Fees", tag: "WhatsApp reminders & AI voice calls", visual: <FeesVisual /> },
  { icon: "📊", title: "Results", tag: "Publish and share instantly", visual: <ResultsVisual /> },
  { icon: "📱", title: "Parent communications", tag: "WhatsApp and voice follow-ups", visual: <CommsVisual /> },
];

/* ── Hero ───────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="lp-hero-section" style={{ padding: "96px 20px 64px", background: "var(--surface-0)", textAlign: "center", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(79,70,229,0.08), transparent 65%)" }} />

      <div style={{ ...BOX, position: "relative", zIndex: 1 }}>
        <div className="lp-reveal" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "var(--brand-50)", border: "1px solid var(--brand-200)", borderRadius: "var(--radius-full)", marginBottom: 16 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand-primary)" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--brand-primary)" }}>School app · Made for India</span>
        </div>

        <h1 className="lp-reveal lp-reveal-d1" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(34px, 9vw, 50px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.04em", color: "var(--ink-900)", marginBottom: 12 }}>
          Run your institute<br /><span style={{ color: "var(--brand-primary)" }}>with AI</span>
        </h1>

        <div className="lp-reveal lp-reveal-d2" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 22 }}>
          {[
            { icon: "📞", label: "AI voice calls", bg: "var(--brand-50)", color: "var(--brand-primary)", border: "var(--brand-200)" },
            { icon: "💬", label: "WhatsApp", bg: "#dcfce7", color: "#15803d", border: "#86efac" },
            { icon: "📋", label: "Attendance", bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" },
            { icon: "💰", label: "Fees", bg: "#fef3c7", color: "#b45309", border: "#fcd34d" },
            { icon: "📊", label: "Results", bg: "#fae8ff", color: "#9333ea", border: "#e9d5ff" },
          ].map((item) => (
            <span
              key={item.label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                fontWeight: 700,
                color: item.color,
                background: item.bg,
                border: `1px solid ${item.border}`,
                borderRadius: "var(--radius-full)",
                padding: "6px 12px",
              }}
            >
              <span style={{ fontSize: 12, lineHeight: 1 }}>{item.icon}</span>
              {item.label}
            </span>
          ))}
        </div>

        <Link href="/register" className="lp-reveal lp-reveal-d3" style={{
          fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600,
          padding: "14px 28px", borderRadius: "var(--radius-md)",
          background: "var(--brand-primary)", color: "white",
          textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
          width: "100%", maxWidth: 280, justifyContent: "center", marginBottom: 8,
        }}>
          Get started <ArrowRight />
        </Link>
        <p className="lp-reveal lp-reveal-d4" style={{ fontSize: 11, color: "var(--ink-400)", marginBottom: 16 }}>No credit card · 5 min setup</p>
      </div>

      <div className="lp-hero-preview" style={{ ...BOX, marginTop: 44 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-400)", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Live preview
        </p>
        <div className="lp-float">
          <div className="lp-hero-preview-card">
            <HeroDashboardVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Visual showcase ─────────────────────────────────────────────────── */
function VisualShowcase() {
  return (
    <section id="features" className="lp-section-gap" style={{ padding: "40px 20px 44px", background: "var(--surface-1)", borderTop: "1px solid var(--ink-100)", overflow: "hidden" }}>
      <div style={{ ...BOX, marginBottom: 24, textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--ink-900)", marginBottom: 6 }}>
          Everything your school needs, in one app
        </h2>
      </div>

      <div className="lp-features" style={BOX}>
        {SHOWCASE.map((item) => (
          <div key={item.title}>
            <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24, lineHeight: 1 }}>{item.icon}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--ink-900)" }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "var(--brand-primary)", fontWeight: 600, marginTop: 2 }}>{item.tag}</div>
              </div>
            </div>
            {item.visual}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── 3-step visual ──────────────────────────────────────────────────── */
function Steps() {
  const steps = [
    { icon: "🏫", label: "Register" },
    { icon: "👥", label: "Add students" },
    { icon: "📱", label: "Go live" },
  ];
  return (
    <section className="lp-section-gap" style={{ padding: "40px 20px", background: "var(--surface-0)", borderTop: "1px solid var(--ink-100)" }}>
      <div style={BOX}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, textAlign: "center", color: "var(--ink-900)", marginBottom: 20 }}>
          Up in 3 steps
        </h2>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          {steps.map((s, i) => (
            <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, margin: "0 auto 8px",
                background: i === 2 ? "var(--brand-primary)" : "var(--surface-1)",
                border: "1px solid var(--ink-200)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>
                {s.icon}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-700)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Social proof ───────────────────────────────────────────────────── */
function SocialProof() {
  return (
    <section className="lp-section-gap" style={{ padding: "36px 20px", background: "var(--surface-1)", borderTop: "1px solid var(--ink-100)" }}>
      <div style={{ ...BOX, ...CARD, textAlign: "center", padding: "22px 18px" }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>⭐⭐⭐⭐⭐</div>
        <p style={{ fontSize: 14, color: "var(--ink-700)", lineHeight: 1.6, marginBottom: 12 }}>
          &ldquo;Fee follow-ups on WhatsApp and voice calls saved us two weeks every month.&rdquo;
        </p>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-900)" }}>Amit K. · School Admin</div>
      </div>
    </section>
  );
}

const PRICING_PLANS = [
  {
    name: "Basic",
    students: "Up to 200 students",
    price: "499",
    features: ["Attendance", "Fees", "Results", "WhatsApp"],
    popular: false,
  },
  {
    name: "Growth",
    students: "Up to 500 students",
    price: "1,249",
    features: ["Everything in Basic", "AI voice calls", "Fee automation"],
    popular: true,
  },
  {
    name: "Pro",
    students: "Up to 1,000 students",
    price: "2,499",
    features: ["Everything in Growth", "Priority support", "Analytics"],
    popular: false,
  },
  {
    name: "School",
    students: "Up to 2,000 students",
    price: "4,999",
    features: ["Everything in Pro", "Multi-branch ready", "Dedicated support"],
    popular: false,
  },
] as const;

const trialButtonStyle = {
  display: "block",
  textAlign: "center" as const,
  padding: "12px",
  borderRadius: "var(--radius-md)",
  background: "var(--brand-primary)",
  color: "#fff",
  textDecoration: "none",
  fontFamily: "var(--font-display)",
  fontSize: 13,
  fontWeight: 600,
};

/* ── Pricing ────────────────────────────────────────────────────────── */
function Pricing() {
  return (
    <section id="pricing" className="lp-section-gap" style={{ padding: "40px 20px", background: "var(--surface-0)", borderTop: "1px solid var(--ink-100)" }}>
      <div style={BOX}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, textAlign: "center", color: "var(--ink-900)", marginBottom: 8 }}>
          Pricing that grows with your school
        </h2>
        <p style={{ fontSize: 13, color: "var(--ink-500)", textAlign: "center", lineHeight: 1.55, marginBottom: 20 }}>
          Simple pricing based on student count. No hidden fees.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              style={{
                ...CARD,
                position: "relative",
                border: plan.popular ? "2px solid var(--brand-primary)" : "1px solid var(--ink-200)",
              }}
            >
              {plan.popular && (
                <span style={{
                  position: "absolute", top: -10, left: 14,
                  background: "var(--brand-primary)", color: "#fff",
                  fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                }}>
                  Popular
                </span>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 12 }}>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink-900)" }}>{plan.name}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 2 }}>{plan.students}</div>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--ink-900)", flexShrink: 0 }}>
                  ₹{plan.price}<span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-400)" }}>/mo</span>
                </div>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 14px", textAlign: "left" }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ fontSize: 12, color: "var(--ink-600)", marginBottom: 6, paddingLeft: 18, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: "var(--brand-primary)", fontWeight: 700 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" style={trialButtonStyle}>
                Get started
              </Link>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: "var(--ink-400)", textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
          2,000+ students? ·{" "}
          <a href="mailto:vidyatrackai@gmail.com" style={{ color: "var(--brand-primary)", fontWeight: 600, textDecoration: "none" }}>
            Contact us for custom pricing
          </a>
        </p>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section style={{ padding: "48px 20px", background: "var(--ink-900)", textAlign: "center" }}>
      <div style={BOX}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 5vw, 30px)", fontWeight: 800, color: "#fff", marginBottom: 10, letterSpacing: "-0.03em" }}>
          Ready to run your school smarter?
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>Works on any phone · No training needed · Set up in 5 minutes</p>
        <Link href="/register" style={{
          fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600,
          padding: "14px 28px", borderRadius: "var(--radius-md)",
          background: "#fff", color: "var(--brand-primary)",
          textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
        }}>
          Get started <ArrowRight />
        </Link>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div style={{ overflowX: "hidden" }}>
      <MarketingNavbar />
      <Hero />
      <VisualShowcase />
      <Steps />
      <SocialProof />
      <Pricing />
      <FinalCTA />
      <MarketingFooter />
    </div>
  );
}
