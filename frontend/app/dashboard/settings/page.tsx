"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { TabAddButton } from "@/components/layout/TabAddButton";
import { PageContent } from "@/components/layout/PageContent";
import { Pagination } from "@/components/common/Pagination";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DateInput } from "@/components/ui/DateInput";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/common/BottomSheet";
import { ItemCard } from "@/components/common/ItemCard";
import { useToast } from "@/hooks/useToast";
import { classService } from "@/services/classService";
import { testService, type Test, type CreateTestPayload } from "@/services/testService";
import { subjectService, type Subject } from "@/services/subjectService";
import { TeamTab } from "@/components/settings/TeamTab";
import { SettingsTabIcon } from "@/components/settings/SettingsTabIcon";
import { TestListItem } from "@/components/settings/TestListItem";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Class {
    id: number;
    name: string;
    created_at?: string;
}

interface FieldError {
    [key: string]: string;
}

type TabType = "classes" | "subjects" | "tests" | "team";

const TAB_QUERY_VALUES: TabType[] = ["classes", "subjects", "tests", "team"];

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ type }: { type: string }) {
    const messages: { [key: string]: { title: string; desc: string } } = {
        classes: {
            title: "No classes yet",
            desc: "Use Add class above to create your first class.",
        },
        subjects: {
            title: "No subjects yet",
            desc: "Use Add subject above to create subjects for this class.",
        },
        tests: {
            title: "No tests yet",
            desc: "Use Add test above to schedule your first exam.",
        },
    };

    const msg = messages[type] || messages.classes;

    return (
        <div className="vt-empty animate-fadeUp">
            <p className="vt-empty-title">{msg.title}</p>
            <p className="vt-empty-desc">{msg.desc}</p>
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
    onShowToast,
}: {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    type: "class" | "subject" | "test";
    editing: any;
    classes?: Class[];
    subjects?: Subject[];
    onClassChange?: (classId: number) => void;
    onShowToast?: (message: string) => void;
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
                    onShowToast?.("Class updated successfully");
                } else {
                    await classService.create({ name: form.name.trim() });
                    onShowToast?.("Class added successfully");
                }
            } else if (type === "subject") {
                const payload = { name: form.name.trim() };

                if (editing) {
                    await subjectService.update(editing.id, payload);
                    onShowToast?.("Subject updated successfully");
                } else {
                    await subjectService.create(Number(form.class_id), payload);
                    onShowToast?.("Subject added successfully");
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
                    onShowToast?.("Test updated successfully");
                } else {
                    await testService.create(payload);
                    onShowToast?.("Test added successfully");
                }
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            setApiError(error?.response?.data?.message || "Failed to save. Please try again.");
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
                <div className="vt-sheet-actions">
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
                <FormField
                    label="Class Name"
                    required
                    error={errors.name}
                    hint='Examples: Class 1, Grade 9, Section A'
                >
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
                </FormField>
            )}

            {type === "subject" && (
                <>
                    <FormField label="Class" required error={errors.class_id}>
                        <Select
                            value={String(form.class_id ?? "")}
                            onChange={(value) => {
                                setForm((prev: any) => ({ ...prev, class_id: value }));
                                setErrors((prev) => ({ ...prev, class_id: "" }));
                            }}
                            placeholder="Select class"
                            error={errors.class_id}
                            options={(classes ?? []).map((c) => ({
                                value: String(c.id),
                                label: c.name,
                            }))}
                        />
                    </FormField>

                    <FormField label="Subject Name" required error={errors.name}>
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
                    </FormField>
                </>
            )}

            {type === "test" && (
                <>
                    <FormField label="Test Name" required error={errors.title}>
                        <Input
                            placeholder="e.g., Half Yearly, Math Mid Term"
                            value={form.title}
                            onChange={(value) => {
                                setForm((prev: any) => ({ ...prev, title: value }));
                                setErrors((prev) => ({ ...prev, title: "" }));
                            }}
                            error={errors.title}
                        />
                    </FormField>

                    <FormField label="Test Number" required error={errors.test_number}>
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
                    </FormField>

                    <FormField label="Class" required error={errors.class_id}>
                        <Select
                            value={String(form.class_id ?? "")}
                            onChange={(value) => {
                                setForm((prev: any) => ({ ...prev, class_id: value, subject_id: "" }));
                                setErrors((prev) => ({ ...prev, class_id: "", subject_id: "" }));
                                onClassChange?.(Number(value));
                            }}
                            placeholder="Select class"
                            error={errors.class_id}
                            options={(classes ?? []).map((c) => ({
                                value: String(c.id),
                                label: c.name,
                            }))}
                        />
                    </FormField>

                    <FormField
                        label="Subject"
                        required
                        error={errors.subject_id}
                        hint={
                            form.class_id && !subjects?.length
                                ? "No subjects for this class. Add one under the Subjects tab first."
                                : undefined
                        }
                    >
                        <Select
                            value={String(form.subject_id ?? "")}
                            onChange={(value) => {
                                setForm((prev: any) => ({ ...prev, subject_id: value }));
                                setErrors((prev) => ({ ...prev, subject_id: "" }));
                            }}
                            placeholder="Select subject"
                            error={errors.subject_id}
                            disabled={!form.class_id}
                            options={(subjects ?? []).map((subject) => ({
                                value: String(subject.id),
                                label: subject.name,
                            }))}
                        />
                    </FormField>

                    <FormField label="Scheduled Date" required error={errors.scheduled_date}>
                        <DateInput
                            value={form.scheduled_date}
                            onChange={(value) => {
                                setForm((prev: any) => ({ ...prev, scheduled_date: value }));
                                setErrors((prev) => ({ ...prev, scheduled_date: "" }));
                            }}
                            error={errors.scheduled_date}
                        />
                    </FormField>

                    <FormField label="Total Marks" required error={errors.max_marks}>
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
                    </FormField>
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
function SettingsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<TabType>("classes");
    const [classes, setClasses] = useState<Class[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [subjectClassId, setSubjectClassId] = useState<number | null>(null);
    const [tests, setTests] = useState<Test[]>([]);
    const [testsPage, setTestsPage] = useState(1);
    const [testsTotalPages, setTestsTotalPages] = useState(1);
    const [testsTotal, setTestsTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showSheet, setShowSheet] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && TAB_QUERY_VALUES.includes(tab as TabType)) {
            setActiveTab(tab as TabType);
        }
    }, [searchParams]);

    // Fetch classes
    const fetchClasses = async () => {
        try {
            const data = await classService.list();
            setClasses(data);
        } catch (error) {
            showToast("Could not load classes. Please refresh.", "error");
        }
    };

    // Fetch subjects for a class
    const fetchSubjects = async (classId: number) => {
        try {
            const data = await subjectService.listForClass(classId);
            setSubjects(data);
        } catch (error) {
            setSubjects([]);
            showToast("Could not load subjects. Please refresh.", "error");
        }
    };

    // Fetch tests (paginated)
    const fetchTests = async (page = 1) => {
        try {
            const data = await testService.list(page, DEFAULT_PAGE_SIZE);
            setTests(data.items);
            setTestsTotalPages(data.total_pages);
            setTestsTotal(data.total);
        } catch (error) {
            showToast("Could not load tests. Please refresh.", "error");
        }
    };

    useEffect(() => {
        let cancelled = false;

        (async () => {
            if (activeTab === "team") {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                if (activeTab === "classes") {
                    await fetchClasses();
                    return;
                }

                let classList = classes;
                if (!classList.length) {
                    const data = await classService.list();
                    if (cancelled) return;
                    setClasses(data);
                    classList = data;
                }

                if (activeTab === "subjects") {
                    if (classList.length) {
                        const classId = subjectClassId ?? classList[0].id;
                        setSubjectClassId(classId);
                        await fetchSubjects(classId);
                    }
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [activeTab]);

    useEffect(() => {
        if (activeTab !== "tests") return;

        let cancelled = false;
        setLoading(true);

        (async () => {
            try {
                await fetchTests(testsPage);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [activeTab, testsPage]);

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
        showToast("Class deleted successfully", "success");
    };

    const handleDeleteSubject = (id: number) => {
        setSubjects((prev) => prev.filter((subject) => subject.id !== id));
        showToast("Subject deleted successfully", "success");
    };

    const handleDeleteTest = (id: number) => {
        setTests((prev) => prev.filter((t) => t.id !== id));
        setTestsTotal((prev) => Math.max(0, prev - 1));
        showToast("Test deleted successfully", "success");
    };

    const handleSuccess = () => {
        if (activeTab === "classes") {
            fetchClasses();
        } else if (activeTab === "subjects" && subjectClassId) {
            fetchSubjects(subjectClassId);
        } else if (activeTab === "tests") {
            if (tests.length === 1 && testsPage > 1) {
                setTestsPage((prev) => prev - 1);
            } else {
                fetchTests(testsPage);
            }
        }
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        if (tab === "tests") {
            setTestsPage(1);
        }
    };

    const tabs: { id: TabType; label: string }[] = [
        { id: "classes", label: "Classes" },
        { id: "subjects", label: "Subjects" },
        { id: "tests", label: "Tests" },
        { id: "team" as TabType, label: "Team" },
    ];

    return (
        <>
            <TopBar title="Settings" />
            <PageContent>
                <div className="vt-settings-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleTabChange(tab.id)}
                            className={`vt-settings-tab${activeTab === tab.id ? " is-active" : ""}`}
                        >
                            <SettingsTabIcon tab={tab.id} active={activeTab === tab.id} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Section Header */}
                <div style={{ marginBottom: 24 }}>
                    <h3 className="vt-greeting-title" style={{ fontSize: "18px", marginBottom: 6 }}>
                        {activeTab === "classes"
                            ? "Classes"
                            : activeTab === "subjects"
                                ? "Subjects"
                                : activeTab === "team"
                                    ? "Team"
                                : "Tests"}
                    </h3>
                    <p className="vt-section-subtitle" style={{ marginBottom: 0 }}>
                        {activeTab === "classes"
                            ? "Manage all classes in your institute."
                            : activeTab === "subjects"
                                ? "Organize subjects by class so tests map to the right curriculum."
                                : activeTab === "team"
                                    ? "Add teacher accounts with their own login. Each teacher can work independently."
                                : "Create tests, enter scores, and manage your exam schedule."}
                    </p>
                </div>

                {/* Loading state */}
                {loading && <ListSkeleton count={4} />}

                {/* Team Tab */}
                {activeTab === "team" && (
                    <TeamTab onShowToast={(message, type) => showToast(message, type ?? "success")} />
                )}

                {/* Classes Tab */}
                {!loading && activeTab === "classes" && (
                    <>
                        <div className="vt-tab-toolbar">
                            <p className="vt-tab-count">
                                {classes.length} class{classes.length !== 1 ? "es" : ""}
                            </p>
                            <TabAddButton label="Add class" onClick={handleAdd} />
                        </div>
                        {classes.length === 0 && <EmptyState type="classes" />}

                        {classes.length > 0 && (
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
                        )}
                    </>
                )}

                {/* Subjects Tab */}
                {!loading && activeTab === "subjects" && (
                    <>
                        <div className="vt-tab-toolbar">
                            <p className="vt-tab-count">
                                {subjects.length} subject{subjects.length !== 1 ? "s" : ""}
                            </p>
                            <TabAddButton label="Add subject" onClick={handleAdd} />
                        </div>
                        {subjects.length === 0 && <EmptyState type="subjects" />}

                        {subjects.length > 0 && (
                            <>
                                <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                                    <span style={{ fontSize: "12px", color: "var(--ink-400)", flexShrink: 0 }}>
                                        Filter subjects by class
                                    </span>
                                    <div className="vt-inline-select">
                                        <Select
                                            value={String(subjectClassId ?? "")}
                                            onChange={(value) => {
                                                const classId = Number(value);
                                                setSubjectClassId(classId);
                                                fetchSubjects(classId);
                                            }}
                                            placeholder="Select class"
                                            options={classes.map((c) => ({
                                                value: String(c.id),
                                                label: c.name,
                                            }))}
                                        />
                                    </div>
                                </div>
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
                        <div className="vt-tab-toolbar">
                            <p className="vt-tab-count">
                                {testsTotal} test{testsTotal !== 1 ? "s" : ""}
                            </p>
                            <TabAddButton label="Add test" onClick={handleAdd} />
                        </div>
                        {tests.length === 0 && <EmptyState type="tests" />}

                        {tests.length > 0 && (
                            <>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {tests.map((test) => (
                                        <TestListItem
                                            key={test.id}
                                            test={test}
                                            onEdit={() => handleEdit(test)}
                                            onDelete={async (onSuccess) => {
                                                await testService.delete(test.id);
                                                handleDeleteTest(test.id);
                                                onSuccess();
                                            }}
                                            onEnterScores={() => router.push(`/dashboard/tests/${test.id}/scores`)}
                                        />
                                    ))}
                                </div>
                                <Pagination
                                    page={testsPage}
                                    totalPages={testsTotalPages}
                                    total={testsTotal}
                                    onPageChange={setTestsPage}
                                    loading={loading}
                                />
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
                    onShowToast={(message) => showToast(message, "success")}
                />

            </PageContent>
        </>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<ListSkeleton count={4} />}>
            <SettingsPageContent />
        </Suspense>
    );
}
