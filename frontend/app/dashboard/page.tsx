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
  type DashboardSummary,
} from "@/services/dashboardService";

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
              {summary.can_view_fees ? (
                <>
                  <StatCard label="Collected this month" value={formatInr(summary.fees_collected_this_month ?? 0)} tone="neutral" />
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
