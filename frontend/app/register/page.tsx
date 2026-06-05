"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, getErrorMessage } from "@/services/authService";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ErrorMsg } from "@/components/ui/ErrorMsg";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/auth/AuthLayout";

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

interface FieldError { [key: string]: string; }

const STEPS = [
  { id: 1, label: "Institute" },
  { id: 2, label: "Location" },
  { id: 3, label: "Account" },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: "28px" }}>
      {STEPS.map((step, i) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <div key={step.id} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: done || active ? "var(--brand-primary)" : "var(--ink-100)",
                border: active ? "2px solid var(--brand-primary)" : "2px solid transparent",
                transition: "all 0.25s ease",
                boxShadow: active ? "0 0 0 4px rgba(249,115,22,0.15)" : "none",
              }}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span style={{ fontSize: "13px", fontWeight: 600, color: active ? "white" : "var(--ink-500)", fontFamily: "var(--font-display)" }}>
                    {step.id}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: "11px", fontWeight: active ? 600 : 400,
                color: active ? "var(--brand-primary)" : done ? "var(--ink-500)" : "var(--ink-300)",
                letterSpacing: "0.02em", whiteSpace: "nowrap",
              }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: "2px",
                background: done ? "var(--brand-primary)" : "var(--ink-100)",
                margin: "0 6px", marginBottom: "18px",
                transition: "background 0.3s ease", borderRadius: 2,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function TypeCard({ value, label, description, icon, selected, onSelect }: {
  value: string; label: string; description: string;
  icon: string; selected: boolean; onSelect: () => void;
}) {
  return (
    <button type="button" onClick={onSelect} style={{
      flex: 1, padding: "16px 12px",
      border: `2px solid ${selected ? "var(--brand-primary)" : "var(--ink-300)"}`,
      borderRadius: "var(--radius-lg)",
      background: selected ? "var(--brand-50)" : "var(--surface-0)",
      cursor: "pointer", textAlign: "left",
      transition: "all 0.18s ease",
      boxShadow: selected ? "0 0 0 3px rgba(249,115,22,0.12)" : "none",
      display: "flex", flexDirection: "column", gap: 6,
    }}>
      <span style={{ fontSize: "24px" }}>{icon}</span>
      <span style={{ fontSize: "14px", fontWeight: 600, color: selected ? "var(--brand-700)" : "var(--ink-700)", fontFamily: "var(--font-display)" }}>
        {label}
      </span>
      <span style={{ fontSize: "12px", color: "var(--ink-500)", lineHeight: 1.4 }}>
        {description}
      </span>
    </button>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (authService.isLoggedIn()) {
      router.replace(authService.getHomeRoute());
    }
  }, [router]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState<FieldError>({});

  const [form, setForm] = useState<RegisterForm>({
    name: "", email: "", phone: "", address: "",
    city: "", institute_type: "", admin_name: "",
    password: "", confirm_password: "",
  });

  const set = (field: keyof RegisterForm) => (value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

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

  const next = () => { if (validate(step)) setStep(s => s + 1); };
  const back = () => { setStep(s => s - 1); setErrors({}); };

  const submit = async () => {
    if (!validate(3)) return;
    setLoading(true);
    setApiError("");
    try {
      await authService.register({
        name: form.name, email: form.email, phone: form.phone,
        address: form.address, city: form.city,
        institute_type: form.institute_type,
        admin_name: form.admin_name, password: form.password,
      });
      router.push("/register/pending");
    } catch (err: unknown) {
      setApiError(getErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const fieldGap = { marginBottom: "18px" };

  return (
    <AuthLayout topRightLabel="Sign in" topRightHref="/login">

      {/* Heading */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700,
          color: "var(--ink-900)", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 6,
        }}>
          {step === 1 && "Set up your institute"}
          {step === 2 && "Where are you located?"}
          {step === 3 && "Create your account"}
        </h1>
        <p style={{ fontSize: "14px", color: "var(--ink-500)", lineHeight: 1.5 }}>
          {step === 1 && "Tell us about your institute to get started."}
          {step === 2 && "Help parents and students find you easily."}
          {step === 3 && "These are your login credentials."}
        </p>
      </div>

      <StepIndicator current={step} />

      {/* Step 1 */}
      {step === 1 && (
        <div className="animate-fadeUp">
          <div style={fieldGap}>
            <Label required>Institute Name</Label>
            <Input placeholder="e.g. Sunrise Coaching Classes" value={form.name} onChange={set("name")} error={errors.name} autoComplete="organization" />
            <ErrorMsg msg={errors.name} />
          </div>
          <div style={fieldGap}>
            <Label required>Type of Institute</Label>
            <div style={{ display: "flex", gap: 12, marginTop: 2 }}>
              <TypeCard value="school" label="School" description="CBSE, ICSE, State Board" icon="🏫" selected={form.institute_type === "school"} onSelect={() => set("institute_type")("school")} />
              <TypeCard value="coaching" label="Coaching" description="Tuition, entrance prep" icon="📚" selected={form.institute_type === "coaching"} onSelect={() => set("institute_type")("coaching")} />
            </div>
            <ErrorMsg msg={errors.institute_type} />
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="animate-slideIn">
          <div style={fieldGap}>
            <Label required>City / Town / Village</Label>
            <Input placeholder="e.g. Pune, Wai, Nawalgarh" value={form.city} onChange={set("city")} error={errors.city} autoComplete="address-level2" />
            <ErrorMsg msg={errors.city} />
          </div>
          <div style={fieldGap}>
            <Label required>Phone Number</Label>
            <Input type="tel" placeholder="9876543210" value={form.phone} onChange={set("phone")} error={errors.phone} prefix="+91" autoComplete="tel" />
            <ErrorMsg msg={errors.phone} />
          </div>
          <div style={fieldGap}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
              <Label>Address</Label>
              <span style={{ fontSize: 11, color: "var(--ink-400)", fontWeight: 400 }}>(optional)</span>
            </div>
            <Input placeholder="Street, Area" value={form.address} onChange={set("address")} autoComplete="street-address" />
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="animate-slideIn">
          <div style={fieldGap}>
            <Label required>Your Name</Label>
            <Input placeholder="Admin's full name" value={form.admin_name} onChange={set("admin_name")} error={errors.admin_name} autoComplete="name" />
            <ErrorMsg msg={errors.admin_name} />
          </div>
          <div style={fieldGap}>
            <Label required>Email Address</Label>
            <Input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} error={errors.email} autoComplete="email" />
            <ErrorMsg msg={errors.email} />
          </div>
          <div style={fieldGap}>
            <Label required>Password</Label>
            <Input type="password" placeholder="Minimum 8 characters" value={form.password} onChange={set("password")} error={errors.password} autoComplete="new-password" />
            <ErrorMsg msg={errors.password} />
          </div>
          <div style={fieldGap}>
            <Label required>Confirm Password</Label>
            <Input type="password" placeholder="Repeat your password" value={form.confirm_password} onChange={set("confirm_password")} error={errors.confirm_password} autoComplete="new-password" />
            <ErrorMsg msg={errors.confirm_password} />
          </div>

          {apiError && (
            <div style={{
              padding: "12px 14px", background: "var(--error-bg)",
              border: "1px solid var(--error-border)", borderRadius: "var(--radius-md)",
              fontSize: "13px", color: "var(--error)", marginBottom: "18px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>⚠</span> {apiError}
            </div>
          )}

          <p style={{ fontSize: "12px", color: "var(--ink-500)", lineHeight: 1.5, marginBottom: "18px" }}>
            By registering you agree to VidyaTrack's{" "}
            <a href="/terms" style={{ color: "var(--brand-primary)", textDecoration: "none" }}>Terms of Service</a>{" "}and{" "}
            <a href="/privacy" style={{ color: "var(--brand-primary)", textDecoration: "none" }}>Privacy Policy</a>.
          </p>
        </div>
      )}

      {/* Nav buttons */}
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        {step > 1 && <Button variant="secondary" onClick={back}>← Back</Button>}
        <Button variant="primary" onClick={step < 3 ? next : submit} loading={loading} disabled={loading}>
          {loading ? "Creating account..." : step < 3 ? "Continue →" : "Create Account"}
        </Button>
      </div>

      {step === 1 && (
        <p style={{ textAlign: "center", fontSize: "14px", color: "var(--ink-500)", marginTop: "24px" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "var(--brand-primary)", fontWeight: 500, textDecoration: "none" }}>Sign in</a>
        </p>
      )}

    </AuthLayout>
  );
}