"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { ErrorMsg } from "@/components/ui/ErrorMsg";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { authService, getErrorMessage } from "@/services/authService";

type Step = "email" | "reset";

interface FieldError {
  [key: string]: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldError>({});
  const [apiError, setApiError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmailStep = () => {
    const next: FieldError = {};
    if (!email.trim()) next.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = "Enter a valid email address";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateResetStep = () => {
    const next: FieldError = {};
    if (!otp.trim()) next.otp = "Reset code is required";
    else if (!/^\d{6}$/.test(otp.trim())) next.otp = "Enter the 6-digit code";
    if (!password) next.password = "Password is required";
    else if (password.length < 8) next.password = "Minimum 8 characters";
    if (password !== confirmPassword) next.confirm_password = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const sendCode = async () => {
    if (!validateEmailStep()) return;
    setLoading(true);
    setApiError("");
    setInfo("");
    try {
      const response = await authService.requestPasswordReset(email.trim());
      setInfo(response.message);
      setStep("reset");
    } catch (err: unknown) {
      setApiError(getErrorMessage(err, "Could not send reset code. Try again."));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!validateResetStep()) return;
    setLoading(true);
    setApiError("");
    try {
      await authService.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        new_password: password,
      });
      sessionStorage.setItem("password_reset_success", "1");
      router.push("/login");
    } catch (err: unknown) {
      setApiError(getErrorMessage(err, "Could not reset password. Try again."));
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Enter") return;
    if (step === "email") sendCode();
    else resetPassword();
  };

  return (
    <AuthLayout topRightLabel="Sign in" topRightHref="/login">
      <div onKeyDown={onKeyDown}>
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              fontWeight: 700,
              color: "var(--ink-900)",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              marginBottom: 6,
            }}
          >
            {step === "email" ? "Forgot password" : "Enter reset code"}
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-500)", lineHeight: 1.6 }}>
            {step === "email"
              ? "We will email you a 6-digit code to reset your password."
              : `Enter the code sent to ${email} and choose a new password.`}
          </p>
        </div>

        {step === "email" ? (
          <div style={{ marginBottom: 24 }}>
            <Label required>Email Address</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(value) => {
                setEmail(value);
                setErrors((prev) => ({ ...prev, email: "" }));
                setApiError("");
              }}
              error={errors.email}
              autoComplete="email"
            />
            <ErrorMsg msg={errors.email} />
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <Label required>Reset code</Label>
              <Input
                type="text"
                placeholder="6-digit code"
                value={otp}
                onChange={(value) => {
                  setOtp(value.replace(/\D/g, "").slice(0, 6));
                  setErrors((prev) => ({ ...prev, otp: "" }));
                  setApiError("");
                }}
                error={errors.otp}
                autoComplete="one-time-code"
              />
              <ErrorMsg msg={errors.otp} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <Label required>New password</Label>
              <Input
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  setErrors((prev) => ({ ...prev, password: "" }));
                  setApiError("");
                }}
                error={errors.password}
                autoComplete="new-password"
              />
              <ErrorMsg msg={errors.password} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <Label required>Confirm password</Label>
              <Input
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(value) => {
                  setConfirmPassword(value);
                  setErrors((prev) => ({ ...prev, confirm_password: "" }));
                  setApiError("");
                }}
                error={errors.confirm_password}
                autoComplete="new-password"
              />
              <ErrorMsg msg={errors.confirm_password} />
            </div>
          </>
        )}

        {info && step === "reset" ? (
          <div
            style={{
              padding: "12px 14px",
              background: "var(--brand-50)",
              border: "1px solid var(--brand-200)",
              borderRadius: "var(--radius-md)",
              fontSize: 13,
              color: "var(--brand-700)",
              marginBottom: 16,
            }}
          >
            {info}
          </div>
        ) : null}

        {apiError ? (
          <div
            style={{
              padding: "12px 14px",
              background: "var(--error-bg)",
              border: "1px solid var(--error-border)",
              borderRadius: "var(--radius-md)",
              fontSize: 13,
              color: "var(--error)",
              marginBottom: 16,
            }}
          >
            {apiError}
          </div>
        ) : null}

        <Button
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
          onClick={step === "email" ? sendCode : resetPassword}
        >
          {loading
            ? step === "email"
              ? "Sending code..."
              : "Updating password..."
            : step === "email"
              ? "Send reset code"
              : "Update password"}
        </Button>

        {step === "reset" ? (
          <p style={{ textAlign: "center", fontSize: 14, color: "var(--ink-500)", marginTop: 20 }}>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
                setPassword("");
                setConfirmPassword("");
                setApiError("");
                setInfo("");
              }}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--brand-primary)",
                fontWeight: 500,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Use a different email
            </button>
            {" · "}
            <button
              type="button"
              onClick={sendCode}
              disabled={loading}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--brand-primary)",
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 14,
                opacity: loading ? 0.6 : 1,
              }}
            >
              Resend code
            </button>
          </p>
        ) : (
          <p style={{ textAlign: "center", fontSize: 14, color: "var(--ink-500)", marginTop: 24 }}>
            Remember your password?{" "}
            <Link href="/login" style={{ color: "var(--brand-primary)", fontWeight: 500, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        )}
      </div>
    </AuthLayout>
  );
}
