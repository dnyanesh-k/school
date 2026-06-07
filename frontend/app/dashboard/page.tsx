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

type FeePeriod = "week" | "month";

export default function DashboardHomePage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useInstitute();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feePeriod, setFeePeriod] = useState<FeePeriod>("month");

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
              {summary.can_view_fees ? (
                <>
                  <div className="vt-stat vt-stat--neutral">
                    <div className="vt-period-pills">
                      {(["week", "month"] as FeePeriod[]).map((p) => (
                        <button
                          key={p}
                          onClick={() => setFeePeriod(p)}
                          className={`vt-period-pill${feePeriod === p ? " active" : ""}`}
                        >
                          {p === "week" ? "Week" : "Month"}
                        </button>
                      ))}
                    </div>
                    <p className="vt-stat-value">
                      {formatInr(feePeriod === "week" ? (summary.fees_collected_this_week ?? 0) : (summary.fees_collected_this_month ?? 0))}
                    </p>
                    <p className="vt-stat-label">Collected</p>
                  </div>
                  <StatCard label="Fees pending" value={formatInr(summary.fees_pending ?? 0)} tone="warning" />
                </>
              ) : (
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

            <p className="vt-meta-line">
              {summary.can_view_fees && summary.collection_rate_pct != null && (
                <span className="vt-chip">{summary.collection_rate_pct}% collected</span>
              )}
              {summary.tests_this_week > 0 && (
                <span style={{ marginLeft: summary.can_view_fees && summary.collection_rate_pct != null ? 8 : 0 }}>
                  {summary.can_view_fees && summary.collection_rate_pct != null ? "· " : ""}
                  {summary.tests_this_week} test{summary.tests_this_week === 1 ? "" : "s"} this week
                </span>
              )}
            </p>

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
