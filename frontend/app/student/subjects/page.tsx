"use client";

import { useEffect, useState } from "react";
import { studentTrackerService, type Subject } from "@/services/studentTrackerService";
import { getErrorMessage } from "@/services/authService";
import { TopBar } from "@/components/layout/TopBar";
import { PageContent } from "@/components/layout/PageContent";

const MAX = 10;

function fmtH(h: number) {
  if (h === 0) return "0h";
  if (h < 1) return `${Math.round(h * 60)}m`;
  const w = Math.floor(h); const m = Math.round((h - w) * 60);
  return m > 0 ? `${w}h ${m}m` : `${w}h`;
}

// ── Palette (vibrant accents, matches stats + session pages) ──────────────────
const PALETTE = [
  { accent: "#7c3aed", light: "#f5f3ff", muted: "#ddd6fe", grad: "135deg, #7c3aed, #a855f7" },
  { accent: "#f97316", light: "#fff7ed", muted: "#fed7aa", grad: "135deg, #f97316, #fb923c" },
  { accent: "#10b981", light: "#ecfdf5", muted: "#a7f3d0", grad: "135deg, #10b981, #34d399" },
  { accent: "#e11d48", light: "#fff1f2", muted: "#fecdd3", grad: "135deg, #e11d48, #f43f5e" },
  { accent: "#0891b2", light: "#ecfeff", muted: "#a5f3fc", grad: "135deg, #0891b2, #06b6d4" },
  { accent: "#f59e0b", light: "#fffbeb", muted: "#fde68a", grad: "135deg, #d97706, #f59e0b" },
  { accent: "#ec4899", light: "#fdf2f8", muted: "#fbcfe8", grad: "135deg, #ec4899, #f472b6" },
  { accent: "#14b8a6", light: "#f0fdfa", muted: "#99f6e4", grad: "135deg, #0f766e, #14b8a6" },
  { accent: "#8b5cf6", light: "#f5f3ff", muted: "#ddd6fe", grad: "135deg, #6d28d9, #8b5cf6" },
  { accent: "#16a34a", light: "#f0fdf4", muted: "#bbf7d0", grad: "135deg, #15803d, #16a34a" },
];
const pal = (i: number) => PALETTE[i % PALETTE.length];

// ── Icon lookup — matches by partial keyword ───────────────────────────────────
const ICON_MAP: [string, string][] = [
  ["math",       "📐"], ["algebra",   "📐"], ["calculus",  "📐"], ["trigono",  "📐"], ["arithm",   "📐"],
  ["physics",    "⚛️"],
  ["chemistry",  "🧪"], ["chem",      "🧪"],
  ["biology",    "🧬"], ["bio",       "🧬"], ["botany",   "🧬"],  ["zoology",  "🧬"],
  ["history",    "📜"], ["civics",    "📜"], ["political","📜"],
  ["geography",  "🌍"], ["environ",   "🌍"],
  ["computer",   "💻"], ["coding",    "💻"], ["program",  "💻"],
  ["english",    "📝"], ["literature","📝"],["grammar",  "📝"],  ["essay",    "📝"],
  ["econom",     "📊"], ["account",  "📊"],  ["commerce", "📊"],  ["finance",  "📊"],
  ["hindi",      "🗣️"], ["marathi",  "🗣️"], ["language", "🗣️"],  ["french",  "🗣️"], ["german",   "🗣️"],
  ["science",    "🔬"],
  ["art",        "🎨"], ["drawing",  "🎨"],  ["design",   "🎨"],
  ["music",      "🎵"], ["guitar",   "🎵"],  ["vocal",    "🎵"],
  ["sport",      "⚽"], ["physical", "🏃"],
  ["sanskrit",   "🕉️"],
  ["psychology", "🧠"], ["sociol",   "🧠"],
];
export function iconFor(name: string): string {
  const lower = name.toLowerCase();
  for (const [kw, icon] of ICON_MAP) { if (lower.includes(kw)) return icon; }
  return "📚";
}

// ── Preset subjects shown as a quick-pick grid ────────────────────────────────
const PRESETS = [
  { name: "Mathematics", icon: "📐" },
  { name: "Physics",     icon: "⚛️" },
  { name: "Chemistry",   icon: "🧪" },
  { name: "Biology",     icon: "🧬" },
  { name: "Science",     icon: "🔬" },
  { name: "English",     icon: "📝" },
  { name: "Geography",   icon: "🌍" },
  { name: "History",     icon: "📜" },
  { name: "Marathi",     icon: "🗣️" },
];

interface EditState { id: number; name: string; daily_target_hours: string }

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add state
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addHours, setAddHours] = useState("1");
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState("");
  const [addMode, setAddMode] = useState<"pick" | "custom">("pick");

  // Edit state
  const [editing, setEditing] = useState<EditState | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    studentTrackerService.getSubjects()
      .then(setSubjects)
      .catch(err => setError(getErrorMessage(err, "Failed to load subjects")))
      .finally(() => setLoading(false));
  }, []);

  const validate = (name: string, hours: string) => {
    if (!name.trim()) return "Subject name is required";
    const h = parseFloat(hours);
    if (isNaN(h) || h <= 0 || h > 24) return "Enter a daily target between 0.5 and 24";
    return null;
  };

  const handleAdd = async (nameOverride?: string) => {
    const name = nameOverride ?? addName;
    const err = validate(name, addHours);
    if (err) { setAddError(err); return; }
    setAddBusy(true); setAddError("");
    try {
      const s = await studentTrackerService.createSubject(name.trim(), parseFloat(addHours));
      setSubjects(p => [...p, s]);
      resetAdd();
    } catch (e) { setAddError(getErrorMessage(e, "Failed to add subject")); }
    finally { setAddBusy(false); }
  };

  const handlePresetPick = (preset: { name: string }) => {
    setAddName(preset.name);
    setAddMode("custom"); // move to confirm step
  };

  const resetAdd = () => {
    setShowAdd(false); setAddName(""); setAddHours("1");
    setAddError(""); setAddMode("pick");
  };

  const handleEditSave = async () => {
    if (!editing) return;
    const err = validate(editing.name, editing.daily_target_hours);
    if (err) { setEditError(err); return; }
    setEditBusy(true); setEditError("");
    try {
      const s = await studentTrackerService.updateSubject(editing.id, editing.name.trim(), parseFloat(editing.daily_target_hours));
      setSubjects(p => p.map(x => x.id === s.id ? s : x));
      setEditing(null);
    } catch (e) { setEditError(getErrorMessage(e, "Failed to update")); }
    finally { setEditBusy(false); }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await studentTrackerService.deleteSubject(id);
      setSubjects(p => p.filter(s => s.id !== id));
    } catch (e) { setError(getErrorMessage(e, "Failed to delete")); }
    finally { setDeletingId(null); }
  };

  // Filter out already-added subjects from presets
  const existingNames = new Set(subjects.map(s => s.name.toLowerCase()));
  const availablePresets = PRESETS.filter(p => !existingNames.has(p.name.toLowerCase()));
  const canAdd = subjects.length < MAX;

  return (
    <>
      <TopBar title="Subjects" />
      <PageContent>
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map(i => <div key={i} style={{ height: 76, borderRadius: 16, background: "var(--ink-100)", animation: "pulse 1.5s ease-in-out infinite" }} />)}
          </div>
        )}

        {!loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* ─── Header ─── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--ink-900)" }}>My Subjects</p>
                  <span style={{
                    padding: "2px 9px", borderRadius: 99,
                    background: subjects.length >= MAX ? "#fef2f2" : "var(--brand-accent)",
                    color: subjects.length >= MAX ? "var(--error)" : "var(--brand-primary)",
                    fontSize: 12, fontWeight: 700,
                    border: `1px solid ${subjects.length >= MAX ? "#fecaca" : "var(--brand-200)"}`,
                  }}>
                    {subjects.length}/{MAX}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 2 }}>Daily study targets per subject</p>
              </div>
              {canAdd && !showAdd && (
                <button type="button" onClick={() => setShowAdd(true)} style={{
                  padding: "9px 18px", borderRadius: 99, flexShrink: 0,
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  border: "none", cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(124,58,237,0.32)",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add
                </button>
              )}
            </div>

            {error && <div style={{ padding: "10px 14px", background: "var(--error-bg)", border: "1px solid var(--error-border)", borderRadius: 10, color: "var(--error)", fontSize: 13 }}>{error}</div>}

            {/* ─── Add card ─── */}
            {showAdd && (
              <div style={{ background: "var(--surface-0)", borderRadius: 18, padding: 18, boxShadow: "var(--shadow-card)", border: "2px solid #ddd6fe" }}>

                {/* Step indicator */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink-900)" }}>
                    {addMode === "pick" ? "Pick a subject" : "Set daily target"}
                  </p>
                  {addMode === "custom" && addName && (
                    <button type="button" onClick={() => { setAddMode("pick"); setAddName(""); }} style={{ fontSize: 12, color: "var(--brand-primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                      ← Back
                    </button>
                  )}
                </div>

                {/* Step 1: preset grid or custom input */}
                {addMode === "pick" && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                      {availablePresets.map(preset => (
                        <button key={preset.name} type="button" onClick={() => handlePresetPick(preset)} style={{
                          padding: "12px 6px",
                          borderRadius: 12,
                          border: "1.5px solid var(--ink-200)",
                          background: "var(--surface-1)",
                          cursor: "pointer",
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                          transition: "all 0.15s ease",
                        }}>
                          <span style={{ fontSize: 22 }}>{preset.icon}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-700)", textAlign: "center", lineHeight: 1.3 }}>
                            {preset.name.replace("Computer Science", "CS")}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{ flex: 1, height: 1, background: "var(--ink-200)" }} />
                      <span style={{ fontSize: 13, color: "var(--ink-400)", fontWeight: 500 }}>or type your own</span>
                      <div style={{ flex: 1, height: 1, background: "var(--ink-200)" }} />
                    </div>

                    <input
                      placeholder="e.g. Sanskrit, Psychology, Music…"
                      value={addName}
                      onChange={e => setAddName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && addName.trim()) setAddMode("custom"); }}
                      style={{
                        width: "100%", boxSizing: "border-box",
                        padding: "11px 14px", borderRadius: 10,
                        border: "1.5px solid var(--ink-200)",
                        fontSize: 14, background: "var(--surface-shell)",
                        color: "var(--ink-900)", outline: "none", fontFamily: "inherit",
                      }}
                    />
                    {addName.trim() && (
                      <button type="button" onClick={() => setAddMode("custom")} style={{
                        marginTop: 10, width: "100%", padding: "11px",
                        borderRadius: 10, border: "none",
                        background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                        color: "#fff", fontWeight: 700, fontSize: 14,
                        cursor: "pointer", fontFamily: "inherit",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      }}>
                        <span style={{ fontSize: 20 }}>{iconFor(addName)}</span> Use &ldquo;{addName}&rdquo;
                      </button>
                    )}
                  </>
                )}

                {/* Step 2: confirm name + set hours */}
                {addMode === "custom" && (
                  <>
                    {/* Subject preview */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--surface-1)", borderRadius: 12, marginBottom: 16 }}>
                      <span style={{ fontSize: 28 }}>{iconFor(addName)}</span>
                      <div>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink-900)" }}>{addName}</p>
                        <p style={{ fontSize: 13, color: "var(--ink-400)", marginTop: 1 }}>Tap back to change subject</p>
                      </div>
                    </div>

                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-600)", marginBottom: 6, letterSpacing: "0.04em" }}>
                      DAILY TARGET (HOURS)
                    </label>

                    {/* Hour quick-pick buttons */}
                    {(() => {
                      const QUICK = ["0.5","1","1.5","2","2.5","3","3.5","4"];
                      const customVal = !QUICK.includes(addHours) ? addHours : "";
                      const customParsed = parseFloat(customVal);
                      return (
                        <>
                          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                            {[["0.5","30m"],["1","1h"],["1.5","1h 30m"],["2","2h"],["2.5","2h 30m"],["3","3h"],["3.5","3h 30m"],["4","4h"]].map(([val, label]) => (
                              <button key={val} type="button" onClick={() => setAddHours(val)} style={{
                                padding: "7px 14px", borderRadius: 8,
                                border: `2px solid ${addHours === val ? "#7c3aed" : "var(--ink-200)"}`,
                                background: addHours === val ? "#f5f3ff" : "var(--surface-1)",
                                color: addHours === val ? "#7c3aed" : "var(--ink-700)",
                                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                                transition: "all 0.12s ease",
                              }}>
                                {label}
                              </button>
                            ))}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                            <input
                              type="number" min="0.5" max="24" step="0.5"
                              placeholder="Or enter hours (e.g. 5)"
                              value={customVal}
                              onChange={e => setAddHours(e.target.value)}
                              style={{
                                flex: 1, padding: "9px 12px", borderRadius: 8,
                                border: customVal ? "1.5px solid #7c3aed" : "1.5px solid var(--ink-200)",
                                fontSize: 13, background: "var(--surface-shell)",
                                color: "var(--ink-900)", outline: "none", fontFamily: "inherit",
                              }}
                            />
                            {customVal && !isNaN(customParsed) && customParsed > 0 && (
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed", whiteSpace: "nowrap" }}>
                                = {fmtH(customParsed)}
                              </span>
                            )}
                          </div>
                        </>
                      );
                    })()}

                    {addError && <p style={{ fontSize: 12, color: "var(--error)", padding: "7px 10px", background: "var(--error-bg)", borderRadius: 8, marginBottom: 10 }}>{addError}</p>}

                    <div style={{ display: "flex", gap: 10 }}>
                      <button type="button" onClick={() => handleAdd()} disabled={addBusy} style={{
                        flex: 1, padding: "13px",
                        borderRadius: 10, border: "none",
                        background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                        color: "#fff", fontWeight: 700, fontSize: 14,
                        cursor: addBusy ? "not-allowed" : "pointer",
                        opacity: addBusy ? 0.7 : 1,
                        boxShadow: "0 4px 12px rgba(124,58,237,0.28)", fontFamily: "inherit",
                      }}>
                        {addBusy ? "Saving…" : "Save Subject"}
                      </button>
                      <button type="button" onClick={resetAdd} style={{
                        padding: "13px 16px", borderRadius: 10,
                        border: "1.5px solid var(--ink-200)", background: "transparent",
                        color: "var(--ink-600)", fontWeight: 600, fontSize: 14,
                        cursor: "pointer", fontFamily: "inherit",
                      }}>
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ─── Empty state ─── */}
            {subjects.length === 0 && !showAdd && (
              <div style={{ padding: "52px 24px", textAlign: "center", background: "var(--surface-0)", borderRadius: 20, boxShadow: "var(--shadow-card)" }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>📚</div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--ink-900)", marginBottom: 8 }}>No subjects yet</p>
                <p style={{ fontSize: 13, color: "var(--ink-500)", lineHeight: 1.6, maxWidth: 240, margin: "0 auto 20px" }}>
                  Add up to 10 subjects with a daily study target.
                </p>
                <button type="button" onClick={() => setShowAdd(true)} style={{
                  padding: "12px 28px", borderRadius: 99,
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  border: "none", cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(124,58,237,0.32)", fontFamily: "inherit",
                }}>
                  + Add first subject
                </button>
              </div>
            )}

            {/* ─── Subject list ─── */}
            {subjects.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {subjects.map((subj, i) => {
                  const p = pal(i);
                  const isEditing  = editing?.id === subj.id;
                  const isDeleting = deletingId === subj.id;
                  const icon = iconFor(subj.name);

                  return (
                    <div key={subj.id} style={{
                      background: "var(--surface-0)", borderRadius: 16,
                      boxShadow: isEditing ? `0 4px 20px ${p.accent}22` : "var(--shadow-sm)",
                      border: `1.5px solid ${isEditing ? p.accent : "var(--ink-100)"}`,
                      overflow: "hidden",
                      opacity: isDeleting ? 0.45 : 1,
                      transition: "opacity 0.2s, box-shadow 0.2s, border-color 0.2s",
                    }}>
                      <div style={{ height: 3, background: `linear-gradient(${p.grad})` }} />

                      {isEditing ? (
                        <div style={{ padding: 16 }}>
                          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: p.accent, marginBottom: 14 }}>Edit Subject</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div>
                              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--ink-500)", marginBottom: 5, letterSpacing: "0.05em" }}>SUBJECT NAME</label>
                              <input value={editing.name}
                                onChange={e => setEditing(prev => prev ? { ...prev, name: e.target.value } : prev)}
                                autoFocus
                                style={{ width: "100%", boxSizing: "border-box", padding: "11px 13px", borderRadius: 10, border: `1.5px solid ${p.muted}`, fontSize: 14, background: p.light, color: "var(--ink-900)", outline: "none", fontFamily: "inherit" }} />
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--ink-500)", marginBottom: 5, letterSpacing: "0.05em" }}>DAILY TARGET</label>
                              {(() => {
                                const QUICK = ["0.5","1","1.5","2","2.5","3","3.5","4"];
                                const customVal = !QUICK.includes(editing.daily_target_hours) ? editing.daily_target_hours : "";
                                const customParsed = parseFloat(customVal);
                                return (
                                  <>
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                                      {[["0.5","30m"],["1","1h"],["1.5","1h 30m"],["2","2h"],["2.5","2h 30m"],["3","3h"],["3.5","3h 30m"],["4","4h"]].map(([val, label]) => (
                                        <button key={val} type="button" onClick={() => setEditing(prev => prev ? { ...prev, daily_target_hours: val } : prev)} style={{
                                          padding: "7px 14px", borderRadius: 8,
                                          border: `2px solid ${editing.daily_target_hours === val ? p.accent : "var(--ink-200)"}`,
                                          background: editing.daily_target_hours === val ? p.light : "var(--surface-1)",
                                          color: editing.daily_target_hours === val ? p.accent : "var(--ink-700)",
                                          fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                                        }}>{label}</button>
                                      ))}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                      <input type="number" min="0.5" max="24" step="0.5" placeholder="Or enter hours (e.g. 5)"
                                        value={customVal}
                                        onChange={e => setEditing(prev => prev ? { ...prev, daily_target_hours: e.target.value } : prev)}
                                        style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: customVal ? `1.5px solid ${p.accent}` : "1.5px solid var(--ink-200)", fontSize: 13, background: "var(--surface-shell)", color: "var(--ink-900)", outline: "none", fontFamily: "inherit" }} />
                                      {customVal && !isNaN(customParsed) && customParsed > 0 && (
                                        <span style={{ fontSize: 13, fontWeight: 700, color: p.accent, whiteSpace: "nowrap" }}>= {fmtH(customParsed)}</span>
                                      )}
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                            {editError && <p style={{ fontSize: 12, color: "var(--error)", padding: "7px 10px", background: "var(--error-bg)", borderRadius: 8 }}>{editError}</p>}
                            <div style={{ display: "flex", gap: 8 }}>
                              <button type="button" onClick={handleEditSave} disabled={editBusy} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: `linear-gradient(${p.grad})`, color: "#fff", fontWeight: 700, fontSize: 13, cursor: editBusy ? "not-allowed" : "pointer", opacity: editBusy ? 0.7 : 1, fontFamily: "inherit" }}>
                                {editBusy ? "Saving…" : "Save"}
                              </button>
                              <button type="button" onClick={() => { setEditing(null); setEditError(""); }} style={{ padding: "11px 16px", borderRadius: 10, border: "1.5px solid var(--ink-200)", background: "transparent", color: "var(--ink-600)", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
                          {/* Subject icon */}
                          <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: p.light, border: `2px solid ${p.muted}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                            {icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink-900)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {subj.name}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                              <span style={{ padding: "2px 8px", borderRadius: 99, background: p.light, color: p.accent, fontSize: 13, fontWeight: 700, border: `1px solid ${p.muted}` }}>
                                {fmtH(subj.daily_target_hours)}/day
                              </span>
                              <span style={{ fontSize: 13, color: "var(--ink-400)" }}>· {fmtH(subj.daily_target_hours * 7)}/week</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                            <button type="button" onClick={() => setEditing({ id: subj.id, name: subj.name, daily_target_hours: String(subj.daily_target_hours) })}
                              style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid var(--ink-200)", background: "var(--surface-1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}
                              title="Edit">✏️</button>
                            <button type="button" onClick={() => handleDelete(subj.id)} disabled={isDeleting}
                              style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid #fecaca", background: "#fef2f2", cursor: isDeleting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, opacity: isDeleting ? 0.5 : 1 }}
                              title="Delete">🗑️</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dashed add button when list has items */}
            {subjects.length > 0 && canAdd && !showAdd && (
              <button type="button" onClick={() => setShowAdd(true)} style={{
                width: "100%", padding: "14px", borderRadius: 14,
                border: "2px dashed var(--ink-300)", background: "transparent",
                color: "var(--ink-400)", fontSize: 14, fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.15s ease", fontFamily: "inherit", marginBottom: 8,
              }}>
                <span style={{ fontSize: 18 }}>+</span> Add another subject
              </button>
            )}
          </div>
        )}
      </PageContent>
    </>
  );
}
