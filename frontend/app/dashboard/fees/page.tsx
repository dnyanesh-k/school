"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { TabAddButton } from "@/components/layout/TabAddButton";
import { PageContent } from "@/components/layout/PageContent";
import { ClassFilterTabs } from "@/components/common/ClassFilterTabs";
import { Pagination } from "@/components/common/Pagination";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { AddFeePlanSheet, FeeDetailSheet } from "@/components/fees/FeeSheets";
import { useToast } from "@/hooks/useToast";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import {
  feeService,
  getErrorMessage,
  formatDate,
  formatInr,
  type Defaulter,
  type FeeSummary,
  type FeeOverviewStats,
} from "@/services/feeService";
import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";
import { authService } from "@/services/authService";

interface ClassOption {
  id: number;
  name: string;
}

type PageView = "overview" | "defaulters";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ViewToggle({ view, onChange, defaulterCount }: { view: PageView; onChange: (v: PageView) => void; defaulterCount: number }) {
  return (
    <SegmentedControl
      value={view}
      onChange={onChange}
      options={[
        { id: "overview", label: "All students" },
        { id: "defaulters", label: "Defaulters", badge: defaulterCount },
      ]}
    />
  );
}

function SummaryPill({ label, value, tone }: { label: string; value: string; tone: "brand" | "success" | "error" | "neutral" }) {
  const styles = {
    brand: { bg: "var(--brand-accent)", color: "var(--brand-primary)", border: "var(--brand-200)" },
    success: { bg: "#ecfdf5", color: "var(--success)", border: "#bbf7d0" },
    error: { bg: "var(--error-bg)", color: "var(--error)", border: "var(--error-border)" },
    neutral: { bg: "var(--ink-50)", color: "var(--ink-700)", border: "var(--ink-200)" },
  }[tone];

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        padding: "12px 10px",
        borderRadius: "var(--radius-md)",
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "10px", color: "var(--ink-500)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </p>
      <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", color: styles.color, lineHeight: 1.2 }}>
        {value}
      </p>
    </div>
  );
}

function FeeStatusChip({ status }: { status: FeeSummary["status"] }) {
  const map = {
    none: { label: "No plan", bg: "var(--ink-100)", color: "var(--ink-500)" },
    paid: { label: "Paid", bg: "#ecfdf5", color: "var(--success)" },
    partial: { label: "Partial", bg: "var(--brand-accent)", color: "var(--brand-primary)" },
    overdue: { label: "Overdue", bg: "var(--error-bg)", color: "var(--error)" },
    pending: { label: "Pending", bg: "#fff7ed", color: "#c2410c" },
  }[status];

  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: "var(--radius-full)",
        background: map.bg,
        color: map.color,
        whiteSpace: "nowrap",
      }}
    >
      {map.label}
    </span>
  );
}

function StudentFeeRow({
  summary,
  onOpen,
  onAddPlan,
}: {
  summary: FeeSummary;
  onOpen: () => void;
  onAddPlan: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        background: "var(--surface-0)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        border: summary.status === "overdue" ? "1px solid var(--error-border)" : "1px solid transparent",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: summary.status === "overdue" ? "var(--error-bg)" : "var(--brand-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "13px",
            color: summary.status === "overdue" ? "var(--error)" : "var(--brand-primary)",
          }}
        >
          {getInitials(summary.student_name)}
        </span>
      </div>

      <button
        type="button"
        onClick={summary.has_plan ? onOpen : onAddPlan}
        style={{
          flex: 1,
          minWidth: 0,
          background: "none",
          border: "none",
          padding: 0,
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "15px",
            color: "var(--ink-900)",
            marginBottom: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {summary.student_name}
        </p>
        <p style={{ fontSize: "12px", color: "var(--ink-500)", marginBottom: 4 }}>
          {summary.class_name}
          {summary.has_plan ? ` · Pending ${formatInr(summary.pending_amount)}` : ""}
        </p>
        <FeeStatusChip status={summary.status} />
      </button>

      <button
        type="button"
        onClick={summary.has_plan ? onOpen : onAddPlan}
        style={{
          flexShrink: 0,
          minHeight: 44,
          padding: "0 12px",
          borderRadius: "var(--radius-full)",
          border: "1.5px solid var(--ink-200)",
          background: "var(--surface-0)",
          fontSize: "12px",
          fontWeight: 600,
          color: "var(--ink-700)",
          cursor: "pointer",
          fontFamily: "var(--font-body)",
        }}
      >
        {summary.has_plan ? "View" : "Add plan"}
      </button>
    </div>
  );
}

function DefaulterRow({ defaulter }: { defaulter: Defaulter }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        background: "var(--surface-0)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        border: "1px solid var(--error-border)",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: "var(--error-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "13px", color: "var(--error)" }}>
          {getInitials(defaulter.student_name)}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "15px",
            color: "var(--ink-900)",
            marginBottom: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {defaulter.student_name}
        </p>
        <p style={{ fontSize: "12px", color: "var(--ink-500)", marginBottom: 4 }}>
          {defaulter.class_name} · Due {formatDate(defaulter.due_date)}
        </p>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--error)",
            fontFamily: "var(--font-display)",
          }}
        >
          {formatInr(defaulter.pending_amount)}
        </span>
      </div>

      <a
        href={feeService.buildWhatsAppUrl(
          defaulter.parent_phone,
          defaulter.student_name,
          defaulter.pending_amount,
          defaulter.due_date
        )}
        target="_blank"
        rel="noreferrer"
        aria-label={`WhatsApp parent of ${defaulter.student_name}`}
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          minWidth: 44,
          minHeight: 44,
          padding: "0 12px",
          background: "#25D366",
          borderRadius: "var(--radius-md)",
          fontSize: "12px",
          fontWeight: 600,
          color: "white",
          textDecoration: "none",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.557 4.126 1.526 5.855L.057 23.882l6.186-1.438A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.37l-.36-.214-3.722.865.93-3.617-.235-.372A9.818 9.818 0 0 1 2.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z" />
        </svg>
        <span className="vt-wa-label">Remind</span>
      </a>
    </div>
  );
}

export default function FeesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<PageView>("overview");
  const [summaries, setSummaries] = useState<FeeSummary[]>([]);
  const [defaulters, setDefaulters] = useState<Defaulter[]>([]);
  const [overviewStats, setOverviewStats] = useState<FeeOverviewStats>({ collected: 0, pending: 0, overdue: 0 });
  const [overviewPage, setOverviewPage] = useState(1);
  const [overviewTotalPages, setOverviewTotalPages] = useState(1);
  const [overviewTotal, setOverviewTotal] = useState(0);
  const [defaulterPage, setDefaulterPage] = useState(1);
  const [defaulterTotalPages, setDefaulterTotalPages] = useState(1);
  const [defaulterTotal, setDefaulterTotal] = useState(0);
  const [studentsWithoutPlan, setStudentsWithoutPlan] = useState<{ id: number; name: string; class_name: string }[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingDefaulters, setLoadingDefaulters] = useState(false);
  const [detailStudent, setDetailStudent] = useState<{ id: number; name: string } | null>(null);
  const [addPlanStudentId, setAddPlanStudentId] = useState<number | null>(null);
  const [showAddPlan, setShowAddPlan] = useState(false);

  useEffect(() => {
    if (!authService.canViewFees()) {
      router.replace("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    api
      .get(API_URLS.CLASSES.LIST)
      .then((response) => {
        const data = response.data as ClassOption[];
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass((current) => current ?? data[0].id);
        }
      })
      .catch(() => setClasses([]))
      .finally(() => setLoadingClasses(false));
  }, []);

  const loadOverview = useCallback(async () => {
    setLoadingOverview(true);
    try {
      const data = await feeService.getSummaries(selectedClass ?? undefined, overviewPage, DEFAULT_PAGE_SIZE);
      setSummaries(data.items);
      setOverviewStats(data.stats);
      setOverviewTotalPages(data.total_pages);
      setOverviewTotal(data.total);
    } catch (error) {
      setSummaries([]);
      showToast(getErrorMessage(error, "Failed to load fee overview"), "error");
    } finally {
      setLoadingOverview(false);
    }
  }, [selectedClass, overviewPage, showToast]);

  const loadDefaulters = useCallback(async () => {
    setLoadingDefaulters(true);
    try {
      const data = await feeService.getDefaulters(selectedClass ?? undefined, defaulterPage, DEFAULT_PAGE_SIZE);
      setDefaulters(data.items);
      setDefaulterTotalPages(data.total_pages);
      setDefaulterTotal(data.total);
    } catch (error) {
      setDefaulters([]);
      showToast(getErrorMessage(error, "Failed to load defaulters"), "error");
    } finally {
      setLoadingDefaulters(false);
    }
  }, [selectedClass, defaulterPage, showToast]);

  const loadStudentsWithoutPlan = useCallback(async () => {
    try {
      const all = await feeService.listAllSummaries(selectedClass ?? undefined);
      setStudentsWithoutPlan(
        all
          .filter((item) => !item.has_plan)
          .map((item) => ({
            id: item.student_id,
            name: item.student_name,
            class_name: item.class_name,
          })),
      );
    } catch {
      setStudentsWithoutPlan([]);
    }
  }, [selectedClass]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadOverview(), loadDefaulters()]);
  }, [loadOverview, loadDefaulters]);

  useEffect(() => {
    setOverviewPage(1);
    setDefaulterPage(1);
  }, [selectedClass]);

  useEffect(() => {
    if (activeView === "overview") loadOverview();
  }, [activeView, loadOverview]);

  useEffect(() => {
    if (activeView === "defaulters") loadDefaulters();
  }, [activeView, loadDefaulters]);

  useEffect(() => {
    if (showAddPlan) loadStudentsWithoutPlan();
  }, [showAddPlan, loadStudentsWithoutPlan]);

  const stats = overviewStats;

  const openAddPlan = (studentId?: number) => {
    setAddPlanStudentId(studentId ?? null);
    setShowAddPlan(true);
  };

  return (
    <>
      <TopBar title="Fees" />

      <PageContent>
      {loadingClasses ? (
        <ListSkeleton count={4} />
      ) : classes.length === 0 ? (
        <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--ink-500)", fontSize: "14px" }}>
          Add classes in Settings before managing fees.
        </div>
      ) : (
        <>
          <ClassFilterTabs
            classes={classes}
            selectedClass={selectedClass}
            onSelect={setSelectedClass}
          />

          <ViewToggle
            view={activeView}
            onChange={setActiveView}
            defaulterCount={defaulterTotal}
          />

          {activeView === "overview" && (
            <>
              {!loadingOverview && (
                <div className="vt-tab-toolbar">
                  <p className="vt-tab-count">
                    {overviewTotal} student{overviewTotal !== 1 ? "s" : ""}
                  </p>
                  <TabAddButton label="Add plan" onClick={() => openAddPlan()} />
                </div>
              )}

              {!loadingOverview && summaries.some((item) => item.has_plan) && (
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <SummaryPill label="Collected" value={formatInr(stats.collected)} tone="success" />
                  <SummaryPill label="Pending" value={formatInr(stats.pending)} tone="brand" />
                  <SummaryPill label="Overdue" value={formatInr(stats.overdue)} tone="error" />
                </div>
              )}

              {loadingOverview ? (
                <ListSkeleton count={4} />
              ) : summaries.length === 0 ? (
                <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--ink-500)", fontSize: "14px" }}>
                  No students in this class.
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {summaries.map((summary) => (
                      <StudentFeeRow
                        key={summary.student_id}
                        summary={summary}
                        onOpen={() => setDetailStudent({ id: summary.student_id, name: summary.student_name })}
                        onAddPlan={() => openAddPlan(summary.student_id)}
                      />
                    ))}
                  </div>
                  <Pagination
                    page={overviewPage}
                    totalPages={overviewTotalPages}
                    total={overviewTotal}
                    onPageChange={setOverviewPage}
                    loading={loadingOverview}
                  />
                </>
              )}
            </>
          )}

          {activeView === "defaulters" && (
            <div style={{ paddingBottom: 24 }}>
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--error-bg)",
                  border: "1px solid var(--error-border)",
                  marginBottom: 16,
                }}
              >
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px", color: "var(--ink-900)", marginBottom: 4 }}>
                  Overdue fees
                </p>
                <p style={{ fontSize: "13px", color: "var(--ink-500)", lineHeight: 1.5 }}>
                  Students with unpaid installments due today or earlier. Tap Remind to WhatsApp the parent.
                </p>
              </div>

              {loadingDefaulters ? (
                <ListSkeleton count={3} />
              ) : defaulters.length === 0 ? (
                <div
                  style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    background: "var(--surface-0)",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "#ecfdf5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6 9 17l-5-5" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "15px", color: "var(--ink-900)", marginBottom: 6 }}>
                    All fees on track
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--ink-500)", lineHeight: 1.5 }}>
                    No overdue installments for the selected class.
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <p style={{ fontSize: "12px", color: "var(--ink-400)" }}>
                      {defaulterTotal} defaulter{defaulterTotal !== 1 ? "s" : ""}
                    </p>
                    {defaulters.map((defaulter) => (
                      <DefaulterRow key={`${defaulter.student_id}-${defaulter.installment_id}`} defaulter={defaulter} />
                    ))}
                  </div>
                  <Pagination
                    page={defaulterPage}
                    totalPages={defaulterTotalPages}
                    total={defaulterTotal}
                    onPageChange={setDefaulterPage}
                    loading={loadingDefaulters}
                  />
                </>
              )}
            </div>
          )}
        </>
      )}
      </PageContent>

      <FeeDetailSheet
        open={!!detailStudent}
        studentId={detailStudent?.id ?? null}
        studentName={detailStudent?.name}
        onClose={() => setDetailStudent(null)}
        onUpdated={refreshAll}
        onShowToast={(message, type) => showToast(message, type ?? "success")}
      />

      <AddFeePlanSheet
        open={showAddPlan}
        onClose={() => {
          setShowAddPlan(false);
          setAddPlanStudentId(null);
        }}
        students={
          addPlanStudentId
            ? studentsWithoutPlan.filter((item) => item.id === addPlanStudentId)
            : studentsWithoutPlan
        }
        preselectedStudentId={addPlanStudentId}
        onSuccess={refreshAll}
        onShowToast={(message, type) => showToast(message, type ?? "success")}
      />
    </>
  );
}
