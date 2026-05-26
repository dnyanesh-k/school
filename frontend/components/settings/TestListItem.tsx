"use client";

import type { Test } from "@/services/testService";
import { ItemCard } from "@/components/common/ItemCard";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function scoreStatus(test: Test) {
  const isPast = test.scheduled_date < todayIso();
  if (test.is_published) return { label: "Scores saved", color: "var(--success)" };
  if (isPast) return { label: "Enter scores", color: "var(--warning)" };
  return { label: "Scheduled", color: "var(--brand-primary)" };
}

interface TestListItemProps {
  test: Test;
  onEdit: () => void;
  onDelete: (onSuccess: () => void) => Promise<void>;
  onEnterScores: () => void;
}

export function TestListItem({ test, onEdit, onDelete, onEnterScores }: TestListItemProps) {
  const status = scoreStatus(test);
  const title = test.title || test.name;

  return (
    <div>
      <ItemCard
        icon="📝"
        title={title}
        subtitle={`${test.class_name ?? "Class"} • ${test.subject ?? "Subject"}`}
        description={`Test #${test.test_number} · Max ${test.total_marks} marks · ${new Date(test.scheduled_date).toLocaleDateString("en-IN")}`}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "0 16px 12px",
          marginTop: -6,
        }}
      >
        <span style={{ fontSize: "12px", fontWeight: 600, color: status.color }}>{status.label}</span>
        <button type="button" className="vt-test-scores-link" onClick={onEnterScores}>
          {test.is_published ? "View scores" : "Enter scores"}
        </button>
      </div>
    </div>
  );
}
