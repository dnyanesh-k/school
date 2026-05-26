"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ErrorMsg } from "@/components/ui/ErrorMsg";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/common/BottomSheet";
import { ItemCard } from "@/components/common/ItemCard";
import { classService } from "@/services/classService";
import { testService, type Test, type CreateTestPayload } from "@/services/testService";
import { subjectService, type Subject } from "@/services/subjectService";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Class {
    id: number;
    name: string;
    created_at?: string;
}

interface FieldError {
    [key: string]: string;
}

type TabType = "classes" | "subjects" | "tests";

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ type, onAdd }: { type: string; onAdd: () => void }) {
    const messages: { [key: string]: { title: string; desc: string } } = {
        classes: {
            title: "No classes yet",
            desc: "Add your first class to get started. You'll need at least one class before adding students.",
        },
        subjects: {
            title: "No subjects yet",
            desc: "Create subjects for a class so tests can be mapped to the right syllabus.",
        },
        tests: {
            title: "No tests yet",
            desc: "Create your first test to start tracking student performance.",
        },
    };

    const msg = messages[type] || messages.classes;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 24px",
                textAlign: "center",
                gap: 12,
            }}
        >
            <div
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "var(--brand-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 4,
                }}
            >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
                        fill="var(--brand-primary)"
                    />
                </svg>
            </div>
            <p
                style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "16px",
                    color: "var(--ink-900)",
                }}
            >
                {msg.title}
            </p>
            <p
                style={{
                    fontSize: "14px",
                    color: "var(--ink-500)",
                    lineHeight: 1.5,
                    maxWidth: 280,
                }}
            >
                {msg.desc}
            </p>
            <Button
                variant="primary"
                onClick={onAdd}
                fullWidth={false}
                flex={0}
                // @ts-ignore
                style={{ marginTop: 12, padding: "0 24px" }}
            >
                {type === "classes"
                    ? "Add Class"
                    : type === "subjects"
                        ? "Add Subject"
                        : type === "subject"
                            ? "Add Subject"
                            : "Add Test"}
            </Button>
        </div>
    );
}

// ─── Generic Item Sheet ───────────────────────────────────────────────────────
function ItemSheet({
    open,
    onClose,
    onSuccess,
    type,
    editing,
    classes,
    subjects,
    onClassChange,
}: {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    type: "class" | "subject" | "test";
    editing: any;
    classes?: Class[];
    subjects?: Subject[];
    onClassChange?: (classId: number) => void;
}) {
    const [form, setForm] = useState<any>({});
    const [errors, setErrors] = useState<FieldError>({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    useEffect(() => {
        if (editing) {
            setForm(editing);
        } else {
            setForm(
                type === "class"
                    ? { name: "" }
                    : type === "subject"
                        ? { name: "", class_id: classes?.[0]?.id ?? "" }
                        : { title: "", test_number: "", class_id: "", subject_id: "", scheduled_date: "", max_marks: 100 }
            );
        }
        setErrors({});
        setApiError("");
    }, [editing, open, type, classes]);

    const validate = () => {
        const e: FieldError = {};

        if (type === "class") {
            if (!form.name?.trim()) {
                e.name = "Class name is required";
            } else if (form.name.trim().length < 2) {
                e.name = "Class name must be at least 2 characters";
            }
        } else if (type === "subject") {
            if (!form.class_id) e.class_id = "Class is required";
            if (!form.name?.trim()) {
                e.name = "Subject name is required";
            } else if (form.name.trim().length < 2) {
                e.name = "Subject name must be at least 2 characters";
            }
        } else if (type === "test") {
            if (!form.title?.trim()) e.title = "Test name is required";
            if (!form.test_number) e.test_number = "Test number is required";
            if (!form.class_id) e.class_id = "Class is required";
            if (!form.subject_id) e.subject_id = "Subject is required";
            if (!form.scheduled_date) e.scheduled_date = "Date is required";
            if (!form.max_marks || form.max_marks <= 0) e.max_marks = "Total marks must be greater than 0";
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async () => {
        if (!validate()) return;
        setLoading(true);
        setApiError("");

        try {
            if (type === "class") {
                if (editing) {
                    await classService.update(editing.id, { name: form.name.trim() });
                } else {
                    await classService.create({ name: form.name.trim() });
                }
            } else if (type === "subject") {
                const payload = { name: form.name.trim() };

                if (editing) {
                    await subjectService.update(editing.id, payload);
                } else {
                    await subjectService.create(Number(form.class_id), payload);
                }
            } else if (type === "test") {
                const payload: CreateTestPayload = {
                    title: form.title.trim(),
                    test_number: Number(form.test_number),
                    class_id: Number(form.class_id),
                    subject_id: Number(form.subject_id),
                    scheduled_date: form.scheduled_date,
                    max_marks: Number(form.max_marks),
                };

                if (editing) {
                    await testService.update(editing.id, payload);
                } else {
                    await testService.create(payload);
                }
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            setApiError(error?.response?.data?.detail || "Failed to save. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title={
                editing
                    ? `Edit ${type === "class" ? "Class" : type === "subject" ? "Subject" : "Test"}`
                    : `Add ${type === "class" ? "Class" : type === "subject" ? "Subject" : "Test"}`
            }
            footer={
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <Button variant="secondary" onClick={onClose} disabled={loading} fullWidth>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={submit}
                        loading={loading}
                        disabled={loading}
                        fullWidth
                    >
                        {loading
                            ? editing
                                ? "Updating..."
                                : "Adding..."
                            : editing
                                ? `Update ${type === "class" ? "Class" : type === "subject" ? "Subject" : "Test"}`
                                : `Add ${type === "class" ? "Class" : type === "subject" ? "Subject" : "Test"}`}
                    </Button>
                </div>
            }
        >
            {type === "class" && (
                <>
                    <div style={{ marginBottom: "14px" }}>
                        <Label required>Class Name</Label>
                        <Input
                            placeholder='e.g., "Class 9", "Grade 10"'
                            value={form.name}
                            onChange={(value) => {
                                setForm((prev: any) => ({ ...prev, name: value }));
                                setErrors((prev) => ({ ...prev, name: "" }));
                            }}
                            error={errors.name}
                            autoComplete="off"
                        />
                        <ErrorMsg msg={errors.name} />
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--ink-500)", marginBottom: "20px", lineHeight: 1.5 }}>
                        Enter the class name or identifier. Examples: Class 1, Grade 9, Section A, etc.
                    </p>
                </>
            )}

            {type === "subject" && (
                <>
                    <div style={{ marginBottom: "14px" }}>
                        <Label required>Class</Label>
                        <select
                            value={form.class_id}
                            onChange={(e) => {
                                setForm((prev: any) => ({ ...prev, class_id: e.target.value }));
                                setErrors((prev) => ({ ...prev, class_id: "" }));
                            }}
                            style={{
                                width: "100%",
                                height: "52px",
                                padding: "0 16px",
                                border: `1.5px solid ${errors.class_id ? "var(--error)" : "var(--ink-300)"}`,
                                borderRadius: "var(--radius-md)",
                                fontSize: "15px",
                                fontFamily: "var(--font-body)",
                                color: form.class_id ? "var(--ink-900)" : "var(--ink-500)",
                                background: "var(--surface-0)",
                                outline: "none",
                            }}
                        >
                            <option value="">Select class</option>
                            {classes?.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <ErrorMsg msg={errors.class_id} />
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <Label required>Subject Name</Label>
                        <Input
                            placeholder="e.g., Mathematics, Science"
                            value={form.name}
                            onChange={(value) => {
                                setForm((prev: any) => ({ ...prev, name: value }));
                                setErrors((prev) => ({ ...prev, name: "" }));
                            }}
                            error={errors.name}
                            autoComplete="off"
                        />
                        <ErrorMsg msg={errors.name} />
                    </div>
                </>
            )}

            {type === "test" && (
                <>
                    <div style={{ marginBottom: "14px" }}>
                        <Label required>Test Name</Label>
                        <Input
                            placeholder="e.g., Half Yearly, Math Mid Term"
                            value={form.title}
                            onChange={(value) => {
                                setForm((prev: any) => ({ ...prev, title: value }));
                                setErrors((prev) => ({ ...prev, title: "" }));
                            }}
                            error={errors.title}
                        />
                        <ErrorMsg msg={errors.title} />
                    </div>

                    <div style={{ marginBottom: "14px" }}>
                        <Label required>Test Number</Label>
                        <Input
                            type="number"
                            placeholder="1, 2, 3..."
                            value={form.test_number}
                            onChange={(value) => {
                                setForm((prev: any) => ({ ...prev, test_number: value }));
                                setErrors((prev) => ({ ...prev, test_number: "" }));
                            }}
                            error={errors.test_number}
                        />
                        <ErrorMsg msg={errors.test_number} />
                    </div>

                    <div style={{ marginBottom: "14px" }}>
                        <Label required>Class</Label>
                        <select
                            value={form.class_id}
                            onChange={(e) => {
                                const classId = Number(e.target.value);
                                setForm((prev: any) => ({ ...prev, class_id: e.target.value, subject_id: "" }));
                                setErrors((prev) => ({ ...prev, class_id: "", subject_id: "" }));
                                onClassChange?.(classId);
                            }}
                            style={{
                                width: "100%",
                                height: "52px",
                                padding: "0 16px",
                                border: `1.5px solid ${errors.class_id ? "var(--error)" : "var(--ink-300)"}`,
                                borderRadius: "var(--radius-md)",
                                fontSize: "15px",
                                fontFamily: "var(--font-body)",
                                color: form.class_id ? "var(--ink-900)" : "var(--ink-500)",
                                background: "var(--surface-0)",
                                outline: "none",
                            }}
                        >
                            <option value="">Select class</option>
                            {classes?.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <ErrorMsg msg={errors.class_id} />
                    </div>

                    <div style={{ marginBottom: "14px" }}>
                        <Label required>Subject</Label>
                        <select
                            value={form.subject_id}
                            onChange={(e) => {
                                setForm((prev: any) => ({ ...prev, subject_id: e.target.value }));
                                setErrors((prev) => ({ ...prev, subject_id: "" }));
                            }}
                            disabled={!form.class_id}
                            style={{
                                width: "100%",
                                height: "52px",
                                padding: "0 16px",
                                border: `1.5px solid ${errors.subject_id ? "var(--error)" : "var(--ink-300)"}`,
                                borderRadius: "var(--radius-md)",
                                fontSize: "15px",
                                fontFamily: "var(--font-body)",
                                color: form.subject_id ? "var(--ink-900)" : "var(--ink-500)",
                                background: "var(--surface-0)",
                                outline: "none",
                            }}
                        >
                            <option value="">Select subject</option>
                            {subjects?.map((subject) => (
                                <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                </option>
                            ))}
                        </select>
                        <ErrorMsg msg={errors.subject_id} />
                        {form.class_id && !subjects?.length && (
                            <p style={{ fontSize: "12px", color: "var(--ink-500)", marginTop: 8 }}>
                                No subjects found for this class. Add a subject first under the Subjects tab.
                            </p>
                        )}
                    </div>

                    <div style={{ marginBottom: "14px" }}>
                        <Label required>Scheduled Date</Label>
                        <Input
                            type="date"
                            placeholder=""
                            value={form.scheduled_date}
                            onChange={(value) => {
                                setForm((prev: any) => ({ ...prev, scheduled_date: value }));
                                setErrors((prev) => ({ ...prev, scheduled_date: "" }));
                            }}
                            error={errors.scheduled_date}
                        />
                        <ErrorMsg msg={errors.scheduled_date} />
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <Label required>Total Marks</Label>
                        <Input
                            type="number"
                            placeholder="100"
                            value={form.max_marks}
                            onChange={(value) => {
                                setForm((prev: any) => ({ ...prev, max_marks: value }));
                                setErrors((prev) => ({ ...prev, max_marks: "" }));
                            }}
                            error={errors.max_marks}
                        />
                        <ErrorMsg msg={errors.max_marks} />
                    </div>
                </>
            )}

            {apiError && (
                <div
                    style={{
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
                    }}
                >
                    <span>⚠</span> {apiError}
                </div>
            )}
        </BottomSheet>
    );
}

// ─── Main Settings Page ────────────────────────────────────────────────────────
export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabType>("classes");
    const [classes, setClasses] = useState<Class[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [subjectClassId, setSubjectClassId] = useState<number | null>(null);
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSheet, setShowSheet] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Fetch classes
    const fetchClasses = async () => {
        try {
            const data = await classService.list();
            setClasses(data);
        } catch (error) {
            console.error("Failed to fetch classes");
        }
    };

    // Fetch subjects for a class
    const fetchSubjects = async (classId: number) => {
        try {
            const data = await subjectService.listForClass(classId);
            setSubjects(data);
        } catch (error) {
            console.error("Failed to fetch subjects");
            setSubjects([]);
        }
    };

    // Fetch tests
    const fetchTests = async () => {
        try {
            const data = await testService.list();
            setTests(data);
        } catch (error) {
            console.error("Failed to fetch tests");
        }
    };

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            await Promise.all([fetchClasses(), fetchTests()]);
            setLoading(false);
        };
        fetch();
    }, []);

    useEffect(() => {
        if (!classes.length) return;

        if (activeTab === "subjects") {
            const classId = subjectClassId ?? classes[0].id;
            setSubjectClassId(classId);
            fetchSubjects(classId);
        }

        if (activeTab === "tests" && classes.length === 1) {
            fetchSubjects(classes[0].id);
        }
    }, [activeTab, classes]);

    const handleAdd = () => {
        setEditingItem(null);
        setShowSheet(true);
    };

    const handleEdit = async (item: any) => {
        setEditingItem(item);

        if (activeTab === "tests" && item.class_id) {
            await fetchSubjects(item.class_id);
        }

        if (activeTab === "subjects" && item.class_id) {
            setSubjectClassId(item.class_id);
            await fetchSubjects(item.class_id);
        }

        setShowSheet(true);
    };

    const handleDeleteClass = (id: number) => {
        setClasses((prev) => prev.filter((c) => c.id !== id));
    };

    const handleDeleteSubject = (id: number) => {
        setSubjects((prev) => prev.filter((subject) => subject.id !== id));
    };

    const handleDeleteTest = (id: number) => {
        setTests((prev) => prev.filter((t) => t.id !== id));
    };

    const handleSuccess = () => {
        if (activeTab === "classes") {
            fetchClasses();
        } else if (activeTab === "subjects" && subjectClassId) {
            fetchSubjects(subjectClassId);
        } else if (activeTab === "tests") {
            fetchTests();
        }
    };

    const tabs: { id: TabType; label: string; icon: string }[] = [
        { id: "classes", label: "Classes", icon: "📚" },
        { id: "subjects", label: "Subjects", icon: "🧩" },
        { id: "tests", label: "Tests", icon: "📝" },
    ];

    return (
        <>
            <style>{`
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.4; }
            }
        `}</style>

            <TopBar title="Settings" />
            <div style={{ width: "100%", boxSizing: "border-box", padding: "0 16px 24px" }}>
                {/* Add button */}
                <button
                    onClick={handleAdd}
                    style={{
                        position: "fixed",
                        top: 12,
                        right: 16,
                        zIndex: 100,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        height: 36,
                        padding: "0 14px",
                        background: "var(--brand-primary)",
                        border: "none",
                        borderRadius: "var(--radius-md)",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "white",
                        cursor: "pointer",
                        fontFamily: "var(--font-display)",
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 5v14M5 12h14"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                    </svg>
                    Add
                </button>

                {/* Tabs */}
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        marginBottom: 24,
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                    }}
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: "1 1 100px",
                                minWidth: 100,
                                padding: "12px 16px",
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                                borderBottom: activeTab === tab.id ? "2px solid var(--brand-primary)" : "2px solid transparent",
                                color: activeTab === tab.id ? "var(--brand-primary)" : "var(--ink-500)",
                                fontFamily: "var(--font-display)",
                                fontSize: "14px",
                                fontWeight: activeTab === tab.id ? 600 : 400,
                                transition: "all 0.2s",
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Section Header */}
                <div style={{ marginBottom: 24 }}>
                    <h3
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "var(--ink-900)",
                            marginBottom: 6,
                        }}
                    >
                        {activeTab === "classes"
                            ? "Classes"
                            : activeTab === "subjects"
                                ? "Subjects"
                                : "Tests"}
                    </h3>
                    <p style={{ fontSize: "14px", color: "var(--ink-600)", lineHeight: 1.5 }}>
                        {activeTab === "classes"
                            ? "Manage all classes in your institute."
                            : activeTab === "subjects"
                                ? "Organize subjects by class so tests map to the right curriculum."
                                : "Schedule and manage tests for your students."}
                    </p>
                </div>

                {/* Loading state */}
                {loading && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                style={{
                                    height: 70,
                                    borderRadius: "var(--radius-lg)",
                                    background: "var(--ink-100)",
                                    animation: "pulse 1.5s ease-in-out infinite",
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Classes Tab */}
                {!loading && activeTab === "classes" && (
                    <>
                        {classes.length === 0 && <EmptyState type="classes" onAdd={handleAdd} />}

                        {classes.length > 0 && (
                            <>
                                <p style={{ fontSize: "12px", color: "var(--ink-400)", marginBottom: 12 }}>
                                    {classes.length} class{classes.length !== 1 ? "es" : ""}
                                </p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {classes.map((classItem) => (
                                        <ItemCard
                                            key={classItem.id}
                                            icon="📚"
                                            title={classItem.name}
                                            subtitle="Ready for students"
                                            onEdit={() => handleEdit(classItem)}
                                            onDelete={async (onSuccess) => {
                                                await classService.remove(classItem.id);
                                                handleDeleteClass(classItem.id);
                                                onSuccess();
                                            }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Subjects Tab */}
                {!loading && activeTab === "subjects" && (
                    <>
                        {subjects.length === 0 && <EmptyState type="subjects" onAdd={handleAdd} />}

                        {subjects.length > 0 && (
                            <>
                                <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                                    <span style={{ fontSize: "12px", color: "var(--ink-400)" }}>
                                        Filter subjects by class
                                    </span>
                                    <select
                                        value={subjectClassId ?? ""}
                                        onChange={(e) => {
                                            const classId = Number(e.target.value);
                                            setSubjectClassId(classId);
                                            fetchSubjects(classId);
                                        }}
                                        style={{
                                            flex: "1 1 140px",
                                            minWidth: 140,
                                            maxWidth: 260,
                                            height: 42,
                                            padding: "0 14px",
                                            borderRadius: "var(--radius-md)",
                                            border: "1.5px solid var(--ink-300)",
                                            background: "var(--surface-0)",
                                            fontSize: "14px",
                                        }}
                                    >
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <p style={{ fontSize: "12px", color: "var(--ink-400)", marginBottom: 12 }}>
                                    {subjects.length} subject{subjects.length !== 1 ? "s" : ""} loaded for the selected class.
                                </p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {subjects.map((subject) => (
                                        <ItemCard
                                            key={subject.id}
                                            icon="🧩"
                                            title={subject.name}
                                            subtitle={`Class ID ${subject.class_id}`}
                                            onEdit={() => handleEdit(subject)}
                                            onDelete={async (onSuccess) => {
                                                await subjectService.remove(subject.id);
                                                handleDeleteSubject(subject.id);
                                                onSuccess();
                                            }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Tests Tab */}
                {!loading && activeTab === "tests" && (
                    <>
                        {tests.length === 0 && <EmptyState type="tests" onAdd={handleAdd} />}

                        {tests.length > 0 && (
                            <>
                                <p style={{ fontSize: "12px", color: "var(--ink-400)", marginBottom: 12 }}>
                                    {tests.length} test{tests.length !== 1 ? "s" : ""}
                                </p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {tests.map((test) => (
                                        <ItemCard
                                            key={test.id}
                                            icon="📝"
                                            title={test.name}
                                            subtitle={`${test.class_name} • ${test.subject}`}
                                            description={`Total Marks: ${test.total_marks} • ${new Date(test.scheduled_date).toLocaleDateString("en-IN")}`}
                                            onEdit={() => handleEdit(test)}
                                            onDelete={async (onSuccess) => {
                                                await testService.delete(test.id);
                                                handleDeleteTest(test.id);
                                                onSuccess();
                                            }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Item Sheet */}
                <ItemSheet
                    open={showSheet}
                    onClose={() => {
                        setShowSheet(false);
                        setEditingItem(null);
                    }}
                    onSuccess={handleSuccess}
                    type={activeTab === "classes" ? "class" : activeTab === "subjects" ? "subject" : "test"}
                    editing={editingItem}
                    classes={classes}
                    subjects={subjects}
                    onClassChange={(classId) => {
                        setSubjectClassId(classId);
                        fetchSubjects(classId);
                    }}
                />
            </div>
        </>
    );
}
