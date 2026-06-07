"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { PageContent } from "@/components/layout/PageContent";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/services/authService";
import { testService, type Test, type TestScore } from "@/services/testService";

interface ScoreDraft {
  marks: string;
  remarks: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TestScoresPage() {
  const params = useParams<{ id: string }>();
  const testId = Number(params.id);
  const router = useRouter();
  const { showToast } = useToast();

  const [test, setTest] = useState<Test | null>(null);
  const [scores, setScores] = useState<TestScore[]>([]);
  const [drafts, setDrafts] = useState<Record<number, ScoreDraft>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!testId || Number.isNaN(testId)) return;
    setLoading(true);
    setError("");
    try {
      const [testData, scoreRows] = await Promise.all([
        testService.getById(testId),
        testService.getScores(testId),
      ]);

      if (!testData) {
        setError("Test not found");
        return;
      }

      setTest(testData);
      setScores(scoreRows);
      setSaved(testData.is_published);

      const initialDrafts: Record<number, ScoreDraft> = {};
      for (const row of scoreRows) {
        initialDrafts[row.student_id] = {
          marks: row.marks_obtained != null ? String(row.marks_obtained) : "",
          remarks: row.remarks ?? "",
        };
      }
      setDrafts(initialDrafts);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load scores"));
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const anyFilled = useMemo(() => {
    if (scores.length === 0) return false;
    return scores.some((row) => {
      const marks = drafts[row.student_id]?.marks?.trim();
      return marks !== "" && !Number.isNaN(Number(marks));
    });
  }, [scores, drafts]);

  const hasInvalidMarks = useMemo(() => {
    if (!test) return false;
    return scores.some((row) => {
      const raw = drafts[row.student_id]?.marks?.trim();
      if (!raw) return false;
      const n = Number(raw);
      return Number.isNaN(n) || n < 0 || n > test.total_marks;
    });
  }, [scores, drafts, test]);

  const updateDraft = (studentId: number, field: keyof ScoreDraft, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [studentId]: {
        marks: prev[studentId]?.marks ?? "",
        remarks: prev[studentId]?.remarks ?? "",
        [field]: value,
      },
    }));
  };

  const submitScores = async () => {
    if (!test || !anyFilled || hasInvalidMarks) return;

    setSaving(true);
    try {
      // Only submit rows that have marks entered
      const payload = scores
        .filter((row) => drafts[row.student_id]?.marks?.trim() !== "")
        .map((row) => ({
          student_id: row.student_id,
          marks_obtained: Number(drafts[row.student_id].marks),
          remarks: drafts[row.student_id]?.remarks?.trim() ?? "",
        }));

      const response = await testService.submitScores(testId, payload);
      setTest(response.test);
      setSaved(true);
      showToast("Scores saved successfully", "success");
      await loadData();
    } catch (err) {
      showToast(getErrorMessage(err, "Could not save scores"), "error");
    } finally {
      setSaving(false);
    }
  };

  const title = test ? `${test.title}` : "Test scores";

  return (
    <>
      <TopBar title={title} />

      <PageContent style={{ paddingBottom: 96 }}>
        <button
          type="button"
          onClick={() => router.push("/dashboard/settings?tab=tests")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: "none",
            background: "none",
            color: "var(--brand-primary)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
            marginBottom: 16,
          }}
        >
          ← Back to Settings
        </button>

        {loading && (
          <p style={{ fontSize: "14px", color: "var(--ink-500)", textAlign: "center", padding: "24px 0" }}>
            Loading students…
          </p>
        )}

        {!loading && error && (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "var(--radius-md)",
              background: "var(--error-bg)",
              border: "1px solid var(--error-border)",
              color: "var(--error)",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {!loading && test && !error && (
          <>
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "var(--radius-md)",
                background: "var(--brand-accent)",
                border: "1px solid var(--brand-200)",
                marginBottom: 16,
              }}
            >
              <p style={{ fontSize: "13px", color: "var(--ink-700)", marginBottom: 4 }}>
                {test.class_name} • {test.subject}
              </p>
              <p style={{ fontSize: "12px", color: "var(--ink-500)" }}>
                Max marks: {test.total_marks} • {scores.length} students
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {scores.map((row) => {
                const draft = drafts[row.student_id] ?? { marks: "", remarks: "" };
                const marksNum = draft.marks.trim() === "" ? null : Number(draft.marks);
                const showWhatsApp = saved && marksNum != null && !Number.isNaN(marksNum);
                const isInvalid = marksNum !== null && !Number.isNaN(marksNum) && test != null && (marksNum < 0 || marksNum > test.total_marks);
                const isEnteredAndSaved = saved && row.marks_obtained != null;

                return (
                  <div
                    key={row.student_id}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "var(--radius-md)",
                      border: `1px solid ${isInvalid ? "var(--error-border)" : "var(--ink-200)"}`,
                      background: isEnteredAndSaved ? "var(--ink-50)" : "var(--surface-0)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: "var(--brand-accent)",
                          color: "var(--brand-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: "13px",
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(row.student_name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: "14px", color: "var(--ink-900)" }}>{row.student_name}</p>
                        <p style={{ fontSize: "12px", color: "var(--ink-500)" }}>Roll {row.roll_number || "—"}</p>
                      </div>
                      {isEnteredAndSaved ? (
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p style={{ fontWeight: 800, fontSize: "18px", color: "var(--brand-primary)", fontFamily: "var(--font-display)", lineHeight: 1 }}>
                            {row.marks_obtained}
                          </p>
                          <p style={{ fontSize: "11px", color: "var(--ink-400)", marginTop: 2 }}>/ {test?.total_marks}</p>
                        </div>
                      ) : (
                        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                          <input
                            type="number"
                            inputMode="numeric"
                            placeholder="—"
                            value={draft.marks}
                            min={0}
                            max={test?.total_marks}
                            onChange={(e) => updateDraft(row.student_id, "marks", e.target.value)}
                            style={{
                              width: 80,
                              height: 44,
                              borderRadius: "var(--radius-md)",
                              border: `1.5px solid ${isInvalid ? "var(--error)" : "var(--ink-300)"}`,
                              background: "var(--surface-1)",
                              color: "var(--ink-900)",
                              fontSize: 18,
                              fontWeight: 700,
                              fontFamily: "var(--font-display)",
                              textAlign: "center",
                              padding: "0 8px",
                              outline: "none",
                              MozAppearance: "textfield",
                            } as React.CSSProperties}
                          />
                          <p style={{ fontSize: 10, color: isInvalid ? "var(--error)" : "var(--ink-400)", fontWeight: 600 }}>
                            {isInvalid ? `Max ${test?.total_marks}` : `/ ${test?.total_marks}`}
                          </p>
                        </div>
                      )}
                    </div>

                    {showWhatsApp && (
                      <a
                        href={testService.buildWhatsAppUrl(
                          row.parent_phone,
                          row.student_name,
                          test.title,
                          marksNum,
                          test.total_marks,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 12px",
                          borderRadius: "var(--radius-sm)",
                          background: "#dcfce7",
                          color: "#15803d",
                          fontSize: "12px",
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        WhatsApp parent
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </PageContent>

      {!loading && test && scores.length > 0 && (
        <div className="vt-scores-save">
          {hasInvalidMarks && (
            <p style={{ fontSize: 12, color: "var(--error)", fontWeight: 600, textAlign: "center", marginBottom: 8 }}>
              Some marks exceed the maximum of {test.total_marks}
            </p>
          )}
          <Button onClick={submitScores} disabled={!anyFilled || hasInvalidMarks || saving} loading={saving} fullWidth>
            Save scores
          </Button>
        </div>
      )}
    </>
  );
}
