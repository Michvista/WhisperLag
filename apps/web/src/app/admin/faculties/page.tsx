"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/ui/RoleGate";
import { ROLES } from "@whisperlag/shared";
import { ErrorBlock, LoadingBlock } from "@/components/ui/States";
import { Icon } from "@/components/ui/Icon";
import { api, getToken } from "@/lib/api";
import { toast } from "@/lib/toast";

interface DepartmentItem {
  id: string;
  name: string;
  courseCount: number;
  whisperCount: number;
}

interface HeadItem {
  id: string;
  name: string;
  email: string;
  departmentName?: string;
}

interface FacultyData {
  name: string;
  departments: DepartmentItem[];
  heads: HeadItem[];
  totalCourses: number;
  totalWhispers: number;
}

export default function AdminFacultiesPage() {
  const [faculties, setFaculties] = useState<FacultyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditFacultyModalOpen, setIsEditFacultyModalOpen] = useState(false);
  const [isHeadModalOpen, setIsHeadModalOpen] = useState(false);
  const [activeFaculty, setActiveFaculty] = useState<FacultyData | null>(null);
  const [activeHead, setActiveHead] = useState<HeadItem | null>(null);

  // Form states for adding faculty
  const [newFacultyName, setNewFacultyName] = useState("");
  const [newDepartmentNames, setNewDepartmentNames] = useState("");
  const [newHeadName, setNewHeadName] = useState("");
  const [newHeadEmail, setNewHeadEmail] = useState("");
  const [savingFaculty, setSavingFaculty] = useState(false);

  // Form state for editing faculty name
  const [editNameValue, setEditNameValue] = useState("");

  // Form state for editing / appointing head
  const [headNameValue, setHeadNameValue] = useState("");
  const [headEmailValue, setHeadEmailValue] = useState("");
  const [resetPasswordCheck, setResetPasswordCheck] = useState(false);

  // Inline add department input per faculty
  const [addDeptInput, setAddDeptInput] = useState<Record<string, string>>({});
  const [addingDeptFor, setAddingDeptFor] = useState<string | null>(null);

  async function loadFaculties() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<FacultyData[]>("/departments/faculties", {
        token: getToken(),
        cache: "no-store",
      });
      setFaculties(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load faculties");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFaculties();
  }, []);

  async function handleCreateFaculty(e: React.FormEvent) {
    e.preventDefault();
    if (!newFacultyName.trim()) {
      toast("Faculty name is required", "error");
      return;
    }

    setSavingFaculty(true);
    try {
      const deptArray = newDepartmentNames
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean);

      await api("/departments/faculties", {
        method: "POST",
        body: JSON.stringify({
          name: newFacultyName.trim(),
          departmentNames: deptArray.length > 0 ? deptArray : undefined,
          headName: newHeadName.trim() || undefined,
          headEmail: newHeadEmail.trim().toLowerCase() || undefined,
          headPassword: "password123",
        }),
        token: getToken(),
      });

      toast(`Faculty "${newFacultyName.trim()}" created successfully with default password password123.`);
      setIsAddModalOpen(false);
      setNewFacultyName("");
      setNewDepartmentNames("");
      setNewHeadName("");
      setNewHeadEmail("");
      await loadFaculties();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to create faculty", "error");
    } finally {
      setSavingFaculty(false);
    }
  }

  async function handleUpdateFacultyName(e: React.FormEvent) {
    e.preventDefault();
    if (!activeFaculty || !editNameValue.trim()) return;

    try {
      await api(`/departments/faculties/${encodeURIComponent(activeFaculty.name)}`, {
        method: "PATCH",
        body: JSON.stringify({ newName: editNameValue.trim() }),
        token: getToken(),
      });
      toast(`Faculty renamed to "${editNameValue.trim()}".`);
      setIsEditFacultyModalOpen(false);
      await loadFaculties();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to rename faculty", "error");
    }
  }

  async function handleSaveHead(e: React.FormEvent) {
    e.preventDefault();
    if (!activeFaculty) return;
    if (!headNameValue.trim() || !headEmailValue.trim()) {
      toast("Both name and email are required for faculty head", "error");
      return;
    }

    try {
      await api(`/departments/faculties/${encodeURIComponent(activeFaculty.name)}`, {
        method: "PATCH",
        body: JSON.stringify({
          headId: activeHead?.id || undefined,
          headName: headNameValue.trim(),
          headEmail: headEmailValue.trim().toLowerCase(),
          resetHeadPassword: resetPasswordCheck,
        }),
        token: getToken(),
      });

      toast(
        activeHead
          ? `Updated ${headNameValue.trim()}'s profile${resetPasswordCheck ? " and reset password to password123" : ""}.`
          : `Appointed ${headNameValue.trim()} as faculty lead (password: password123).`,
      );
      setIsHeadModalOpen(false);
      await loadFaculties();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save head profile", "error");
    }
  }

  async function handleResetPassword(headId: string, headName: string) {
    if (!confirm(`Reset ${headName}'s password to "password123"?`)) return;

    try {
      await api("/departments/faculties/reset-head-password", {
        method: "POST",
        body: JSON.stringify({ userId: headId }),
        token: getToken(),
      });
      toast(`Password for ${headName} successfully reset to "password123".`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to reset password", "error");
    }
  }

  async function handleDeleteFaculty(facultyName: string) {
    if (
      !confirm(
        `Are you sure you want to delete or unlink the Faculty of ${facultyName}? Member departments will be preserved as unassigned.`,
      )
    ) {
      return;
    }

    try {
      await api(`/departments/faculties/${encodeURIComponent(facultyName)}`, {
        method: "DELETE",
        token: getToken(),
      });
      toast(`Faculty "${facultyName}" deleted.`);
      await loadFaculties();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete faculty", "error");
    }
  }

  async function handleAddDepartment(facultyName: string) {
    const dName = (addDeptInput[facultyName] ?? "").trim();
    if (!dName) return;

    setAddingDeptFor(facultyName);
    try {
      await api(`/departments/faculties/${encodeURIComponent(facultyName)}`, {
        method: "PATCH",
        body: JSON.stringify({ addDepartmentName: dName }),
        token: getToken(),
      });
      toast(`Added department "${dName}" to Faculty of ${facultyName}.`);
      setAddDeptInput((prev) => ({ ...prev, [facultyName]: "" }));
      await loadFaculties();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to add department", "error");
    } finally {
      setAddingDeptFor(null);
    }
  }

  async function handleRemoveDepartment(facultyName: string, deptId: string, deptName: string) {
    if (!confirm(`Remove "${deptName}" from ${facultyName}?`)) return;

    try {
      await api(`/departments/faculties/${encodeURIComponent(facultyName)}`, {
        method: "PATCH",
        body: JSON.stringify({ removeDepartmentId: deptId }),
        token: getToken(),
      });
      toast(`Removed "${deptName}" from ${facultyName}.`);
      await loadFaculties();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to remove department", "error");
    }
  }

  const filteredFaculties = faculties.filter((f) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.departments.some((d) => d.name.toLowerCase().includes(q)) ||
      f.heads.some((h) => h.name.toLowerCase().includes(q) || h.email.toLowerCase().includes(q))
    );
  });

  return (
    <RoleGate minRole={ROLES.ADMIN}>
      <AppShell>
        <div className="py-6 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href="/admin"
                  className="text-xs font-semibold text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Icon name="arrow_back" size={14} /> Command Center
                </Link>
                <span className="text-xs text-text-soft">/</span>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Governance
                </span>
              </div>
              <h1 className="font-montserrat text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                Faculty &amp; Academic Heads
              </h1>
              <p className="mt-1 text-xs text-text-secondary">
                Configure UNILAG faculties, departments, and appointed faculty leads (Deans &amp; HODs) with default login credentials.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary-green px-4 py-2 text-xs font-semibold"
            >
              <Icon name="add" size={15} /> + Add New Faculty
            </button>
          </div>

          {/* Search & Overview Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs font-semibold text-navy shadow-xs">
                {faculties.length} Total Faculties
              </span>
              <span className="rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary shadow-xs">
                {faculties.reduce((sum, f) => sum + f.departments.length, 0)} Departments
              </span>
              <span className="rounded-lg border border-green-tint bg-green-tint px-3 py-1.5 text-xs font-bold text-primary shadow-xs">
                Default Password: password123
              </span>
            </div>

            <div className="relative w-full sm:w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-soft">
                <Icon name="search" size={14} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search faculties, depts, heads…"
                className="w-full rounded-lg border border-border-subtle bg-white py-1.5 pl-8 pr-3 text-xs text-navy placeholder-text-soft outline-none focus:border-primary shadow-xs"
              />
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <LoadingBlock label="Loading faculty directory…" />
          ) : error ? (
            <ErrorBlock message={error} onRetry={loadFaculties} />
          ) : filteredFaculties.length === 0 ? (
            <div className="rounded-xl border border-border-subtle bg-white p-12 text-center shadow-card">
              <Icon name="school" size={32} className="mx-auto text-text-soft mb-2" />
              <h3 className="font-montserrat text-sm font-bold text-navy">No faculties found</h3>
              <p className="mt-1 text-xs text-text-secondary">
                {search ? "No faculty matches your search criteria." : "Get started by adding your first faculty."}
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn-primary-green mt-4 inline-flex px-4 py-2 text-xs font-semibold"
              >
                + Add New Faculty
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredFaculties.map((fac) => {
                const primaryHead = fac.heads[0];
                return (
                  <div
                    key={fac.name}
                    className="rounded-xl border border-border-subtle bg-white p-6 shadow-card space-y-5 transition-all hover:border-slate-300"
                  >
                    {/* Faculty Title Bar */}
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-subtle pb-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2 className="font-montserrat text-lg font-bold text-navy">
                            Faculty of {fac.name}
                          </h2>
                          <span className="rounded-full bg-green-tint px-2.5 py-0.5 text-[10.5px] font-bold text-primary">
                            {fac.departments.length} {fac.departments.length === 1 ? "dept" : "depts"}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-text-secondary">
                          {fac.totalCourses} registered courses · {fac.totalWhispers} student whispers
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveFaculty(fac);
                            setEditNameValue(fac.name);
                            setIsEditFacultyModalOpen(true);
                          }}
                          className="rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-slate-50 hover:text-navy transition-colors"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleDeleteFaculty(fac.name)}
                          className="rounded-lg border border-red-100 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left: Appointed Faculty Head (5 cols) */}
                      <div className="rounded-lg border border-border-subtle bg-slate-50/60 p-4 space-y-3 lg:col-span-5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-text-soft">
                            Faculty Head / Lead
                          </span>
                          {primaryHead && (
                            <span className="rounded bg-green-tint px-2 py-0.5 text-[10px] font-bold text-primary">
                              Active Lead
                            </span>
                          )}
                        </div>

                        {primaryHead ? (
                          <div className="space-y-2">
                            <div>
                              <p className="font-montserrat text-sm font-bold text-navy">
                                {primaryHead.name}
                              </p>
                              <p className="text-xs font-mono text-text-secondary mt-0.5">
                                {primaryHead.email}
                              </p>
                              {primaryHead.departmentName && (
                                <p className="text-[11px] text-text-soft mt-0.5">
                                  HOD, {primaryHead.departmentName}
                                </p>
                              )}
                            </div>

                            <div className="rounded-md border border-slate-200 bg-white p-2.5 space-y-1.5">
                              <div className="flex items-center justify-between text-[10.5px]">
                                <span className="font-bold text-text-secondary">Password:</span>
                                <span className="font-mono font-bold text-primary bg-green-tint px-1.5 py-0.5 rounded">
                                  password123
                                </span>
                              </div>
                              <p className="text-[10px] text-text-soft">
                                Default demonstration password for testing logins.
                              </p>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => handleResetPassword(primaryHead.id, primaryHead.name)}
                                className="flex-1 rounded-md border border-border-subtle bg-white py-1.5 text-center text-[11px] font-semibold text-navy hover:bg-slate-50 transition-colors"
                              >
                                Reset Password
                              </button>
                              <button
                                onClick={() => {
                                  setActiveFaculty(fac);
                                  setActiveHead(primaryHead);
                                  setHeadNameValue(primaryHead.name);
                                  setHeadEmailValue(primaryHead.email);
                                  setResetPasswordCheck(false);
                                  setIsHeadModalOpen(true);
                                }}
                                className="flex-1 btn-primary-green py-1.5 text-center text-[11px] font-semibold"
                              >
                                Edit Profile
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="py-4 text-center space-y-2">
                            <p className="text-xs text-text-secondary font-medium">
                              No designated lead account for this faculty.
                            </p>
                            <button
                              onClick={() => {
                                setActiveFaculty(fac);
                                setActiveHead(null);
                                setHeadNameValue("");
                                setHeadEmailValue("");
                                setResetPasswordCheck(false);
                                setIsHeadModalOpen(true);
                              }}
                              className="btn-primary-green px-3 py-1.5 text-xs font-semibold inline-flex"
                            >
                              + Appoint Head (password123)
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Right: Member Departments (7 cols) */}
                      <div className="space-y-3 lg:col-span-7">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-text-soft">
                            Member Departments ({fac.departments.length})
                          </span>
                        </div>

                        {fac.departments.length === 0 ? (
                          <p className="text-xs text-text-secondary">
                            No departments added yet under this faculty.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {fac.departments.map((dept) => (
                              <div
                                key={dept.id}
                                className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs shadow-2xs"
                              >
                                <span className="font-semibold text-navy">{dept.name}</span>
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-text-soft">
                                  {dept.courseCount} {dept.courseCount === 1 ? "course" : "courses"}
                                </span>
                                <button
                                  onClick={() => handleRemoveDepartment(fac.name, dept.id, dept.name)}
                                  title="Unlink department"
                                  className="text-text-soft hover:text-red-600 transition-colors ml-1"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Inline Add Department */}
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            value={addDeptInput[fac.name] ?? ""}
                            onChange={(e) =>
                              setAddDeptInput((prev) => ({ ...prev, [fac.name]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                void handleAddDepartment(fac.name);
                              }
                            }}
                            placeholder="Add department name (e.g. Pharmacology)…"
                            className="flex-1 rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs text-navy placeholder-text-soft outline-none focus:border-primary shadow-xs"
                          />
                          <button
                            onClick={() => void handleAddDepartment(fac.name)}
                            disabled={addingDeptFor === fac.name || !(addDeptInput[fac.name] ?? "").trim()}
                            className="rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-xs"
                          >
                            {addingDeptFor === fac.name ? "Adding…" : "+ Add"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal: Add New Faculty */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="relative w-full max-w-lg rounded-2xl border border-border-subtle bg-white p-6 shadow-2xl my-8">
              <div className="flex items-start justify-between border-b border-border-subtle pb-4">
                <div>
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-primary">
                    Academic Organization
                  </span>
                  <h2 className="mt-0.5 font-montserrat text-lg font-bold text-navy">
                    Create New Faculty
                  </h2>
                  <p className="text-xs text-text-secondary">
                    Register a university faculty along with member departments and an initial lead.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg p-1 text-text-soft hover:bg-slate-100 hover:text-navy"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateFaculty} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-navy mb-1">
                    Faculty Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newFacultyName}
                    onChange={(e) => setNewFacultyName(e.target.value)}
                    placeholder="e.g. Environmental Sciences"
                    required
                    className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-xs font-semibold text-navy placeholder-text-soft outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy mb-1">
                    Initial Departments (Optional)
                  </label>
                  <input
                    type="text"
                    value={newDepartmentNames}
                    onChange={(e) => setNewDepartmentNames(e.target.value)}
                    placeholder="Comma-separated (e.g. Architecture, Building, Estate Management)"
                    className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-xs text-navy placeholder-text-soft outline-none focus:border-primary"
                  />
                  <p className="text-[10.5px] text-text-soft mt-1">
                    Departments can also be added later individually.
                  </p>
                </div>

                <div className="rounded-lg border border-border-subtle bg-slate-50/70 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy">Appointed Faculty Head (Dean / Lead)</span>
                    <span className="rounded bg-green-tint px-2 py-0.5 text-[9.5px] font-bold text-primary">
                      Default: password123
                    </span>
                  </div>

                  <div>
                    <label className="block font-medium text-text-secondary mb-1">Head Full Name</label>
                    <input
                      type="text"
                      value={newHeadName}
                      onChange={(e) => setNewHeadName(e.target.value)}
                      placeholder="e.g. Prof. Babatunde Lawal"
                      className="w-full rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs text-navy placeholder-text-soft outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-text-secondary mb-1">Official Email</label>
                    <input
                      type="email"
                      value={newHeadEmail}
                      onChange={(e) => setNewHeadEmail(e.target.value)}
                      placeholder="e.g. faculty.environment@whisperlag.test"
                      className="w-full rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs text-navy placeholder-text-soft outline-none focus:border-primary"
                    />
                  </div>

                  <p className="text-[10px] text-text-soft leading-relaxed">
                    This user account will be created with role <strong>FACULTY</strong> and can immediately log into the Faculty Portal using <strong>password123</strong>.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-lg border border-border-subtle bg-white px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingFaculty}
                    className="btn-primary-green px-5 py-2 text-xs font-semibold disabled:opacity-50"
                  >
                    {savingFaculty ? "Creating…" : "Create Faculty"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Faculty Name */}
        {isEditFacultyModalOpen && activeFaculty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-xs p-4">
            <div className="relative w-full max-w-md rounded-2xl border border-border-subtle bg-white p-6 shadow-2xl">
              <h2 className="font-montserrat text-base font-bold text-navy mb-3">
                Rename Faculty
              </h2>
              <form onSubmit={handleUpdateFacultyName} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-navy mb-1">Faculty Name</label>
                  <input
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    required
                    className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-xs font-semibold text-navy outline-none focus:border-primary"
                  />
                  <p className="text-[10.5px] text-text-soft mt-1">
                    Updates the faculty name across all associated departments and course listings.
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditFacultyModalOpen(false)}
                    className="rounded-lg border border-border-subtle bg-white px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary-green px-5 py-2 text-xs font-semibold">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit / Appoint Head */}
        {isHeadModalOpen && activeFaculty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-xs p-4">
            <div className="relative w-full max-w-md rounded-2xl border border-border-subtle bg-white p-6 shadow-2xl">
              <h2 className="font-montserrat text-base font-bold text-navy mb-1">
                {activeHead ? `Edit Head: ${activeFaculty.name}` : `Appoint Lead: ${activeFaculty.name}`}
              </h2>
              <p className="text-xs text-text-secondary mb-4">
                Configure the primary academic lead for this faculty.
              </p>

              <form onSubmit={handleSaveHead} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-navy mb-1">Full Name</label>
                  <input
                    type="text"
                    value={headNameValue}
                    onChange={(e) => setHeadNameValue(e.target.value)}
                    placeholder="e.g. Prof. Chuka Mba"
                    required
                    className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-xs font-semibold text-navy outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy mb-1">Official Login Email</label>
                  <input
                    type="email"
                    value={headEmailValue}
                    onChange={(e) => setHeadEmailValue(e.target.value)}
                    placeholder="e.g. faculty.clinicalsciences@whisperlag.test"
                    required
                    className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-xs font-mono text-navy outline-none focus:border-primary"
                  />
                </div>

                <div className="rounded-lg border border-border-subtle bg-slate-50 p-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-navy">
                    <input
                      type="checkbox"
                      checked={resetPasswordCheck}
                      onChange={(e) => setResetPasswordCheck(e.target.checked)}
                      className="rounded accent-primary"
                    />
                    <span>Reset / Set password to: <strong>password123</strong></span>
                  </label>
                  <p className="text-[10px] text-text-soft mt-1">
                    Enables easy access during demonstration and verification.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsHeadModalOpen(false)}
                    className="rounded-lg border border-border-subtle bg-white px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary-green px-5 py-2 text-xs font-semibold">
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AppShell>
    </RoleGate>
  );
}
