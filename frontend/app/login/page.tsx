"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService, getErrorMessage } from "@/services/authService";
import { Input }      from "@/components/ui/Input";
import { Label }      from "@/components/ui/Label";
import { ErrorMsg }   from "@/components/ui/ErrorMsg";
import { Button }     from "@/components/ui/Button";
import { AuthLayout } from "@/components/auth/AuthLayout";

interface LoginForm  { email: string; password: string; }
interface FieldError { [key: string]: string; }

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm]         = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors]     = useState<FieldError>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  const set = (field: keyof LoginForm) => (value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
    setApiError("");
  };

  const validate = (): boolean => {
    const e: FieldError = {};
    if (!form.email.trim())                    e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = "Enter a valid email address";
    if (!form.password)                        e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      const response = await authService.login({ email: form.email, password: form.password });
      router.push(authService.getHomeRoute());
    } catch (err: unknown) {
      setApiError(getErrorMessage(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") submit(); };

  return (
    <AuthLayout topRightLabel="Register" topRightHref="/register">
      <div onKeyDown={onKeyDown}>

        {/* Heading */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--ink-900)",
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
            marginBottom: 6,
          }}>
            Welcome back
          </h1>
          <p style={{ fontSize: "14px", color: "var(--ink-500)" }}>
            Sign in to manage your institute
          </p>
        </div>

        {/* Email */}
        <div style={{ marginBottom: "16px" }}>
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

        {/* Password */}
        <div style={{ marginBottom: "8px" }}>
          <Label required>Password</Label>
          <Input
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={set("password")}
            error={errors.password}
            autoComplete="current-password"
          />
          <ErrorMsg msg={errors.password} />
        </div>

        {/* Forgot — tight under password field */}
        <div style={{ textAlign: "right", marginBottom: "28px" }}>
          <a href="/forgot-password" style={{
            fontSize: "13px",
            color: "var(--brand-primary)",
            fontWeight: 500,
            textDecoration: "none",
          }}>
            Forgot password?
          </a>
        </div>

        {/* API error */}
        {apiError && (
          <div style={{
            padding: "12px 14px",
            background: "var(--error-bg)",
            border: "1px solid var(--error-border)",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            color: "var(--error)",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span>⚠</span> {apiError}
          </div>
        )}

        {/* Sign in button */}
        <Button variant="primary" onClick={submit} loading={loading} disabled={loading} fullWidth>
          {loading ? "Signing in..." : "Sign In"}
        </Button>

        {/* Register link — simple text, not a second button */}
        <p style={{
          textAlign: "center",
          fontSize: "14px",
          color: "var(--ink-500)",
          marginTop: "24px",
        }}>
          New to VidyaTrack?{" "}
          <a href="/register" style={{
            color: "var(--brand-primary)",
            fontWeight: 500,
            textDecoration: "none",
          }}>
            Create account
          </a>
        </p>

      </div>
    </AuthLayout>
  );
}