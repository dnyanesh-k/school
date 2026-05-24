"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authservice";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  institute_type: "school" | "coaching" | "";
  admin_name: string;
  password: string;
  confirm_password: string;
}

interface FieldError {
  [key: string]: string;
}

// ─── Step config ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Institute" },
  { id: 2, label: "Location" },
  { id: 3, label: "Account" },
];

// ─── Inline styles / design tokens ───────────────────────────────────────────
// All CSS vars defined once — carries forward to every page in the product
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  :root {
    --font-display: 'Sora', sans-serif;
    --font-body: 'DM Sans', sans-serif;

    /* Brand */
//     --brand-primary: #1a6b4a;
// --brand-secondary: #22c97a;
// --brand-accent: #f0faf5;
// --brand-dark: #0d3d2a;
    --brand-primary: #4F46E5;
    --brand-secondary: #F97316;
    --brand-accent: #EEF2FF;
    --brand-dark: #3730A3;

    /* Neutrals */
    --ink-900: #0f1117;
    --ink-700: #2d3142;
    --ink-500: #6b7280;
    --ink-300: #c4c9d4;
    --ink-100: #f4f5f7;
    --ink-50:  #fafafa;

    /* Surfaces */
    --surface-0: #ffffff;
    --surface-1: #f8faf9;
    --surface-card: #ffffff;

    /* Feedback */
    --error: #e53e3e;
    --error-bg: #fff5f5;
    --success: #1a6b4a;

    /* Radius */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 24px;

    /* Shadow */
    --shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06);
    --shadow-input-focus: 0 0 0 3px rgba(34,201,122,0.18);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: var(--font-body);
    background: var(--surface-1);
    color: var(--ink-900);
    -webkit-font-smoothing: antialiased;
  }
`;

// ─── Small reusable primitives ────────────────────────────────────────────────

function Label({ children, required }: { children: string; required?: boolean }) {
  return (
    <label style={{
      display: "block",
      fontFamily: "var(--font-body)",
      fontSize: "13px",
      fontWeight: 500,
      color: "var(--ink-700)",
      marginBottom: "6px",
      letterSpacing: "0.01em",
    }}>
      {children}
      {required && <span style={{ color: "var(--brand-primary)", marginLeft: 3 }}>*</span>}
    </label>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p style={{
      fontSize: "12px",
      color: "var(--error)",
      marginTop: "5px",
      display: "flex",
      alignItems: "center",
      gap: 4,
    }}>
      <span>⚠</span> {msg}
    </p>
  );
}

function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  prefix,
  autoComplete,
}: {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  prefix?: string;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      {prefix && (
        <span style={{
          position: "absolute",
          left: 14,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--ink-500)",
          fontSize: "14px",
          fontWeight: 500,
          pointerEvents: "none",
          zIndex: 1,
        }}>
          {prefix}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          height: "52px",
          padding: prefix ? "0 16px 0 36px" : "0 16px",
          border: `1.5px solid ${error ? "var(--error)" : focused ? "var(--brand-primary)" : "var(--ink-300)"}`,
          borderRadius: "var(--radius-md)",
          fontSize: "15px",
          fontFamily: "var(--font-body)",
          color: "var(--ink-900)",
          background: focused ? "#fff" : error ? "var(--error-bg)" : "var(--surface-0)",
          outline: "none",
          transition: "all 0.18s ease",
          boxShadow: focused ? "var(--shadow-input-focus)" : "none",
          WebkitAppearance: "none",
        }}
      />
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          height: "52px",
          padding: "0 40px 0 16px",
          border: `1.5px solid ${error ? "var(--error)" : focused ? "var(--brand-primary)" : "var(--ink-300)"}`,
          borderRadius: "var(--radius-md)",
          fontSize: "15px",
          fontFamily: "var(--font-body)",
          color: value ? "var(--ink-900)" : "var(--ink-500)",
          background: "var(--surface-0)",
          outline: "none",
          transition: "all 0.18s ease",
          boxShadow: focused ? "var(--shadow-input-focus)" : "none",
          WebkitAppearance: "none",
          appearance: "none",
          cursor: "pointer",
        }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {/* Custom chevron */}
      <svg
        style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        width="16" height="16" viewBox="0 0 16 16" fill="none"
      >
        <path d="M4 6l4 4 4-4" stroke="var(--ink-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: "28px" }}>
      {STEPS.map((step, i) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <div key={step.id} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
            {/* Circle */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: done ? "var(--brand-primary)" : active ? "var(--brand-primary)" : "var(--ink-100)",
                border: active ? "2px solid var(--brand-primary)" : "2px solid transparent",
                transition: "all 0.25s ease",
                boxShadow: active ? "0 0 0 4px rgba(26,107,74,0.12)" : "none",
              }}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: active ? "white" : "var(--ink-500)",
                    fontFamily: "var(--font-display)",
                  }}>
                    {step.id}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: "11px",
                fontWeight: active ? 600 : 400,
                color: active ? "var(--brand-primary)" : done ? "var(--ink-500)" : "var(--ink-300)",
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}>
                {step.label}
              </span>
            </div>
            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1,
                height: "2px",
                background: done ? "var(--brand-primary)" : "var(--ink-100)",
                margin: "0 6px",
                marginBottom: "18px",
                transition: "background 0.3s ease",
                borderRadius: 2,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Institute type cards ─────────────────────────────────────────────────────
function TypeCard({
  value,
  label,
  description,
  icon,
  selected,
  onSelect,
}: {
  value: string;
  label: string;
  description: string;
  icon: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        flex: 1,
        padding: "16px 12px",
        border: `2px solid ${selected ? "var(--brand-primary)" : "var(--ink-300)"}`,
        borderRadius: "var(--radius-lg)",
        background: selected ? "var(--brand-accent)" : "var(--surface-0)",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.18s ease",
        boxShadow: selected ? "0 0 0 3px rgba(26,107,74,0.1)" : "none",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <span style={{ fontSize: "24px" }}>{icon}</span>
      <span style={{
        fontSize: "14px",
        fontWeight: 600,
        color: selected ? "var(--brand-dark)" : "var(--ink-700)",
        fontFamily: "var(--font-display)",
      }}>
        {label}
      </span>
      <span style={{
        fontSize: "12px",
        color: "var(--ink-500)",
        lineHeight: 1.4,
      }}>
        {description}
      </span>
    </button>
  );
}

// ─── Main Register Page ───────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState<FieldError>({});

  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    institute_type: "",
    admin_name: "",
    password: "",
    confirm_password: "",
  });

  const set = (field: keyof RegisterForm) => (value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  // ── Validation per step ──
  const validate = (s: number): boolean => {
    const e: FieldError = {};

    if (s === 1) {
      if (!form.name.trim()) e.name = "Institute name is required";
      if (!form.institute_type) e.institute_type = "Please select institute type";
    }

    if (s === 2) {
      if (!form.city.trim()) e.city = "City is required";
      if (!form.phone.trim()) e.phone = "Phone number is required";
      else if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Enter valid 10-digit mobile number";
    }

    if (s === 3) {
      if (!form.admin_name.trim()) e.admin_name = "Your name is required";
      if (!form.email.trim()) e.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter valid email address";
      if (!form.password) e.password = "Password is required";
      else if (form.password.length < 8) e.password = "Minimum 8 characters";
      if (form.password !== form.confirm_password) e.confirm_password = "Passwords do not match";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validate(step)) setStep(s => s + 1);
  };

  const back = () => {
    setStep(s => s - 1);
    setErrors({});
  };

  const submit = async () => {
    if (!validate(3)) return;
    setLoading(true);
    setApiError("");
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        institute_type: form.institute_type,
        admin_name: form.admin_name,
        password: form.password,
      };
      const response = await authService.register(payload);
      // Save token and redirect
      localStorage.setItem("vt_token", response.access_token);
      router.push("/setup");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Shared field gap ──
  const fieldGap = { marginBottom: "18px" };

  return (
    <>
      <style>{globalStyles}</style>

      {/* Page wrapper */}
      <div style={{
        minHeight: "100dvh",
        background: "var(--surface-1)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-body)",
      }}>

        {/* Header strip */}
        <div style={{
          padding: "18px 20px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          background: "var(--surface-0)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Logo mark */}
            <div style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-sm)",
              background: "var(--brand-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L3 6v6l6 4 6-4V6L9 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(255,255,255,0.15)"/>
                <path d="M9 10V7M7.5 8.5h3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "17px",
              color: "var(--brand-dark)",
              letterSpacing: "-0.02em",
            }}>
              VidyaTrack
            </span>
          </div>
          <a
            href="/login"
            style={{
              fontSize: "13px",
              color: "var(--brand-primary)",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Sign in
          </a>
        </div>

        {/* Scrollable content */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 20px 40px",
          maxWidth: "480px",
          width: "100%",
          margin: "0 auto",
        }}>

          {/* Page heading */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--ink-900)",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              marginBottom: 6,
            }}>
              {step === 1 && "Set up your institute"}
              {step === 2 && "Where are you located?"}
              {step === 3 && "Create your account"}
            </h1>
            <p style={{
              fontSize: "14px",
              color: "var(--ink-500)",
              lineHeight: 1.5,
            }}>
              {step === 1 && "Tell us about your institute to get started."}
              {step === 2 && "Help parents and students find you easily."}
              {step === 3 && "These are your login credentials."}
            </p>
          </div>

          {/* Step indicator */}
          <StepIndicator current={step} />

          {/* ── Step 1 — Institute Info ── */}
          {step === 1 && (
            <div>
              <div style={fieldGap}>
                <Label required>Institute Name</Label>
                <Input
                  placeholder="e.g. Sunrise Coaching Classes"
                  value={form.name}
                  onChange={set("name")}
                  error={errors.name}
                  autoComplete="organization"
                />
                <ErrorMsg msg={errors.name} />
              </div>

              <div style={fieldGap}>
                <Label required>Type of Institute</Label>
                <div style={{ display: "flex", gap: 12, marginTop: 2 }}>
                  <TypeCard
                    value="school"
                    label="School"
                    description="CBSE, ICSE, State Board"
                    icon="🏫"
                    selected={form.institute_type === "school"}
                    onSelect={() => {
                      set("institute_type")("school");
                    }}
                  />
                  <TypeCard
                    value="coaching"
                    label="Coaching"
                    description="Tuition, entrance prep"
                    icon="📚"
                    selected={form.institute_type === "coaching"}
                    onSelect={() => {
                      set("institute_type")("coaching");
                    }}
                  />
                </div>
                <ErrorMsg msg={errors.institute_type} />
              </div>
            </div>
          )}

          {/* ── Step 2 — Location ── */}
          {step === 2 && (
            <div>
              <div style={fieldGap}>
                <Label required>City</Label>
                <Select
                  value={form.city}
                  onChange={set("city")}
                  placeholder="Select your city"
                  error={errors.city}
                  options={[
                    { value: "Pune", label: "Pune" },
                    { value: "Sambhajinagar", label: "Sambhajinagar" },
                    { value: "Mumbai", label: "Mumbai" },
                    { value: "Nashik", label: "Nashik" },
                    { value: "Nagpur", label: "Nagpur" },
                    { value: "Other", label: "Other" },
                  ]}
                />
                <ErrorMsg msg={errors.city} />
              </div>

              <div style={fieldGap}>
                <Label required>Phone Number</Label>
                <Input
                  type="tel"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={set("phone")}
                  error={errors.phone}
                  prefix="+91"
                  autoComplete="tel"
                />
                <ErrorMsg msg={errors.phone} />
              </div>

              <div style={fieldGap}>
                <Label>Address</Label>
                <Input
                  placeholder="Street, Area (optional)"
                  value={form.address}
                  onChange={set("address")}
                  error={errors.address}
                  autoComplete="street-address"
                />
              </div>
            </div>
          )}

          {/* ── Step 3 — Account ── */}
          {step === 3 && (
            <div>
              <div style={fieldGap}>
                <Label required>Your Name</Label>
                <Input
                  placeholder="Admin's full name"
                  value={form.admin_name}
                  onChange={set("admin_name")}
                  error={errors.admin_name}
                  autoComplete="name"
                />
                <ErrorMsg msg={errors.admin_name} />
              </div>

              <div style={fieldGap}>
                <Label required>Email Address</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set("email")}
                  error={errors.email}
                  autoComplete="email"
                />
                <ErrorMsg msg={errors.email} />
              </div>

              <div style={fieldGap}>
                <Label required>Password</Label>
                <Input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={set("password")}
                  error={errors.password}
                  autoComplete="new-password"
                />
                <ErrorMsg msg={errors.password} />
              </div>

              <div style={fieldGap}>
                <Label required>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Repeat your password"
                  value={form.confirm_password}
                  onChange={set("confirm_password")}
                  error={errors.confirm_password}
                  autoComplete="new-password"
                />
                <ErrorMsg msg={errors.confirm_password} />
              </div>

              {/* API error */}
              {apiError && (
                <div style={{
                  padding: "12px 14px",
                  background: "var(--error-bg)",
                  border: "1px solid #fed7d7",
                  borderRadius: "var(--radius-md)",
                  fontSize: "13px",
                  color: "var(--error)",
                  marginBottom: "18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <span>⚠</span> {apiError}
                </div>
              )}

              {/* Terms note */}
              <p style={{
                fontSize: "12px",
                color: "var(--ink-500)",
                lineHeight: 1.5,
                marginBottom: "18px",
              }}>
                By registering you agree to VidyaTrack's{" "}
                <a href="/terms" style={{ color: "var(--brand-primary)", textDecoration: "none" }}>
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" style={{ color: "var(--brand-primary)", textDecoration: "none" }}>
                  Privacy Policy
                </a>.
              </p>
            </div>
          )}

          {/* ── Navigation buttons ── */}
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            {step > 1 && (
              <button
                type="button"
                onClick={back}
                style={{
                  flex: 1,
                  height: "52px",
                  border: "1.5px solid var(--ink-300)",
                  borderRadius: "var(--radius-md)",
                  background: "transparent",
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "var(--ink-700)",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  transition: "all 0.15s ease",
                }}
              >
                ← Back
              </button>
            )}
            <button
              type="button"
              onClick={step < 3 ? next : submit}
              disabled={loading}
              style={{
                flex: 2,
                height: "52px",
                border: "none",
                borderRadius: "var(--radius-md)",
                background: loading ? "var(--ink-300)" : "var(--brand-primary)",
                fontSize: "15px",
                fontWeight: 600,
                color: "white",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.01em",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: "spin 0.8s linear infinite" }}>
                    <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" fill="none" strokeDasharray="28" strokeDashoffset="10"/>
                  </svg>
                  Creating account...
                </>
              ) : step < 3 ? (
                "Continue →"
              ) : (
                "Create Account"
              )}
            </button>
          </div>

          {/* Login link */}
          {step === 1 && (
            <p style={{
              textAlign: "center",
              fontSize: "14px",
              color: "var(--ink-500)",
              marginTop: "24px",
            }}>
              Already have an account?{" "}
              <a href="/login" style={{
                color: "var(--brand-primary)",
                fontWeight: 500,
                textDecoration: "none",
              }}>
                Sign in
              </a>
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        button:active {
          transform: scale(0.98);
        }
        input::placeholder, select::placeholder {
          color: var(--ink-300);
        }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px white inset;
        }
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </>
  );
}