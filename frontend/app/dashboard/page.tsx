"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { PageContent } from "@/components/layout/PageContent";
import { StatCard, StatGrid } from "@/components/ui/StatCard";
import { AlertCard } from "@/components/ui/AlertCard";
import { QuickLinkCard } from "@/components/ui/QuickLinkCard";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { useInstitute } from "@/contexts/InstituteContext";
import {
  dashboardService,
  formatInr,
  getErrorMessage,
  type AttendanceTrendPoint,
  type DashboardSummary,
} from "@/services/dashboardService";

const DAY_SHORT = ["S", "M", "T", "W", "T", "F", "S"];
const BAR_COLORS = ["#6366f1", "#16a34a", "#d97706", "#e11d48"];
const BAR_MAX_PX = 56;

function AttendanceTrend({ trend }: { trend: AttendanceTrendPoint[] }) {
  if (!trend || trend.length === 0) return null;

  // Skip Sundays (holiday)
  const filtered = trend.filter((t) => {
    const [y, m, d] = t.date.split("-").map(Number);
    return new Date(y, m - 1, d).getDay() !== 0;
  });
  if (filtered.length === 0) return null;

  const max = Math.max(...filtered.map((t) => t.pct), 1);
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="vt-trend-card">
      <p className="vt-trend-title">Attendance — last 6 days</p>
      <div className="vt-trend-bars">
        {filtered.map((t, i) => {
          const [y, m, d] = t.date.split("-").map(Number);
          const jsDate = new Date(y, m - 1, d);
          const dayLabel = `${DAY_SHORT[jsDate.getDay()]}/${d}`;
          const isToday = t.date === todayStr;
          const barPx = Math.max(Math.round((t.pct / max) * BAR_MAX_PX), 4);
          const color = BAR_COLORS[i % BAR_COLORS.length];
          return (
            <div key={t.date} className="vt-trend-col">
              <span className="vt-trend-pct">{t.pct}%</span>
              <div
                className={`vt-trend-bar${isToday ? " today" : ""}`}
                style={{ height: barPx, background: color }}
              >
                {t.absent > 0 && (
                  <span className="vt-trend-absent">{t.absent}</span>
                )}
              </div>
              <span className={`vt-trend-day${isToday ? " today" : ""}`}>{dayLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function firstName(fullName: string | null | undefined) {
  if (!fullName) return "";
  return fullName.trim().split(/\s+/)[0];
}

function formatShortDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function DashboardHomePage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useInstitute();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Wait until auth is resolved; redirect handled by InstituteProvider
    if (authLoading) return;

    let active = true;

    (async () => {
      try {
        const data = await dashboardService.getSummary();
        if (!active) return;
        setSummary(data);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Could not load dashboard summary"));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [authLoading]);

  const attentionCount =
    summary
      ? (summary.can_view_fees && (summary.fee_defaulters_count ?? 0) > 0 ? 1 : 0) +
        (summary.absent_today_count > 0 ? 1 : 0) +
        (summary.tests_pending_scores > 0 ? 1 : 0)
      : 0;

  return (
    <>
      <TopBar title="Home" />

      <PageContent>
        {(loading || authLoading) && <DashboardSkeleton />}

        {!loading && !authLoading && error && <div className="vt-error-banner">{error}</div>}

        {!loading && !authLoading && summary && (
          <div className="animate-fadeUp">
            <div className="vt-greeting">
              <h1 className="vt-greeting-title">
                {getGreeting()}
                {authUser?.full_name ? `, ${firstName(authUser.full_name)}` : ""}
              </h1>
              <p className="vt-greeting-sub">
                {attentionCount > 0
                  ? `${attentionCount} item${attentionCount === 1 ? "" : "s"} need your attention today.`
                  : "You're all caught up for today."}
              </p>
            </div>

            <StatGrid>
              <StatCard label="Total students" value={String(summary.total_students)} tone="brand" />
              <StatCard label="Today's attendance" value={`${summary.attendance_today_pct}%`} tone="success" />
              {!summary.can_view_fees && (
                <>
                  <StatCard label="Tests this week" value={String(summary.tests_this_week)} tone="neutral" />
                  <StatCard
                    label="Scores pending"
                    value={String(summary.tests_pending_scores)}
                    tone={summary.tests_pending_scores > 0 ? "warning" : "neutral"}
                  />
                </>
              )}
            </StatGrid>

            {summary.can_view_fees && (
              <div style={{ marginBottom: 20 }}>
                <p className="vt-section-title" style={{ marginBottom: 12 }}>Fee overview</p>

                {/* Collected vs planned progress */}
                {(summary.fees_total_planned ?? 0) > 0 && (
                  <div
                    style={{
                      background: "var(--surface-0)",
                      borderRadius: "var(--radius-lg)",
                      padding: "16px",
                      boxShadow: "var(--shadow-sm)",
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                      <p style={{ fontSize: "13px", color: "var(--ink-500)" }}>Collected vs planned</p>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px", color: "var(--ink-900)" }}>
                        {summary.collection_rate_pct ?? 0}%
                      </p>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 8, borderRadius: 4, background: "var(--ink-100)", overflow: "hidden", marginBottom: 10 }}>
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 4,
                          background: "var(--success)",
                          width: `${Math.min(summary.collection_rate_pct ?? 0, 100)}%`,
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <p style={{ fontSize: "12px", color: "var(--ink-400)", marginBottom: 2 }}>Collected</p>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "14px", color: "var(--success)" }}>
                          {formatInr(summary.fees_collected ?? 0)}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "12px", color: "var(--ink-400)", marginBottom: 2 }}>Total planned</p>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "14px", color: "var(--ink-700)" }}>
                          {formatInr(summary.fees_total_planned ?? 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Due next week + overdue row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div
                    style={{
                      background: "var(--surface-0)",
                      borderRadius: "var(--radius-lg)",
                      padding: "14px",
                      boxShadow: "var(--shadow-sm)",
                      border: "1px solid var(--warning-border)",
                    }}
                  >
                    <p style={{ fontSize: "12px", color: "var(--ink-500)", marginBottom: 4 }}>Due next 7 days</p>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", color: "var(--warning)", marginBottom: 4 }}>
                      {formatInr(summary.fees_due_next_week ?? 0)}
                    </p>
                    {summary.next_week_start && summary.next_week_end && (
                      <p style={{ fontSize: "11px", color: "var(--ink-400)" }}>
                        {formatShortDate(summary.next_week_start)} – {formatShortDate(summary.next_week_end)}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      background: "var(--surface-0)",
                      borderRadius: "var(--radius-lg)",
                      padding: "14px",
                      boxShadow: "var(--shadow-sm)",
                      border: "1px solid var(--error-border)",
                    }}
                  >
                    <p style={{ fontSize: "12px", color: "var(--ink-500)", marginBottom: 4 }}>Overdue</p>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", color: "var(--error)", marginBottom: 4 }}>
                      {formatInr(summary.fees_pending ?? 0)}
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--ink-400)" }}>
                      {summary.fee_defaulters_count ?? 0} student{(summary.fee_defaulters_count ?? 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {summary.attendance_trend.length > 0 && (
              <AttendanceTrend trend={summary.attendance_trend} />
            )}

            {attentionCount > 0 && (
              <>
                <p className="vt-section-title">Needs attention</p>
                <div className="vt-stack" style={{ marginBottom: 16 }}>
                  {summary.can_view_fees && (summary.fee_defaulters_count ?? 0) > 0 && (
                    <AlertCard
                      title={`${summary.fee_defaulters_count} fee defaulter${summary.fee_defaulters_count === 1 ? "" : "s"}`}
                      description="Follow up on overdue installments"
                      onClick={() => router.push("/dashboard/fees")}
                    />
                  )}
                  {summary.absent_today_count > 0 && (
                    <AlertCard
                      title={`${summary.absent_today_count} absent today`}
                      description="Review attendance or contact parents"
                      onClick={() => router.push("/dashboard/attendance")}
                    />
                  )}
                  {summary.tests_pending_scores > 0 && (
                    <AlertCard
                      title={`${summary.tests_pending_scores} test${summary.tests_pending_scores === 1 ? "" : "s"} need scores`}
                      description="Enter marks for completed tests"
                      onClick={() => router.push("/dashboard/settings?tab=tests")}
                    />
                  )}
                </div>
              </>
            )}

            {summary.tests_this_week > 0 && (
              <p className="vt-meta-line">
                {summary.tests_this_week} test{summary.tests_this_week === 1 ? "" : "s"} this week
              </p>
            )}

            <p className="vt-section-title">Quick actions</p>

            <div className="vt-stack">
              <QuickLinkCard
                label="Mark attendance"
                description="Take today's class attendance"
                onClick={() => router.push("/dashboard/attendance")}
              />
              <QuickLinkCard
                label="Enter test scores"
                description="Manage tests and enter marks"
                onClick={() => router.push("/dashboard/settings?tab=tests")}
              />
              {summary.can_view_fees && (
                <QuickLinkCard
                  label="Fee defaulters"
                  description="Follow up on pending installments"
                  onClick={() => router.push("/dashboard/fees")}
                />
              )}
              <QuickLinkCard
                label="Students"
                description="Browse and manage student records"
                onClick={() => router.push("/dashboard/students")}
              />
            </div>
          </div>
        )}
      </PageContent>
    </>
  );
}
