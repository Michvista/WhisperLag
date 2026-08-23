import { describe, it, expect } from "vitest";
import {
  ROLES,
  ROLE_PERMISSIONS,
  PERMISSIONS,
  can,
  atLeast,
  type Role,
  type Permission,
} from "../src/roles.js";

describe("RBAC role -> permission matrix", () => {
  it("defines every role with a permission list", () => {
    const roles = Object.values(ROLES);
    expect(roles.length).toBeGreaterThan(0);
    for (const role of roles) {
      expect(Array.isArray(ROLE_PERMISSIONS[role])).toBe(true);
    }
  });

  it("gives ADMIN every permission in the system", () => {
    const allPermissions = Object.values(PERMISSIONS) as Permission[];
    for (const permission of allPermissions) {
      expect(can(ROLES.ADMIN, permission), `${permission} should be admin-capable`).toBe(true);
    }
  });

  it("keeps sensitive capabilities away from STUDENT", () => {
    const sensitive = [
      PERMISSIONS.VIEW_WHISPER_META,
      PERMISSIONS.VIEW_EVALUATION_AGGREGATES,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.MANAGE_USERS,
      PERMISSIONS.VIEW_INSIGHTS,
      PERMISSIONS.IMPORT_SIS,
      PERMISSIONS.SEND_MESSAGE,
      PERMISSIONS.VIEW_MESSAGES,
      PERMISSIONS.GENERATE_REPORT,
    ];
    for (const permission of sensitive) {
      expect(can(ROLES.STUDENT, permission), `student should NOT have ${permission}`).toBe(false);
    }
  });

  it("allows STUDENT to participate (whisper, evaluate, respond to surveys)", () => {
    expect(can(ROLES.STUDENT, PERMISSIONS.SUBMIT_WHISPER)).toBe(true);
    expect(can(ROLES.STUDENT, PERMISSIONS.SUBMIT_EVALUATION)).toBe(true);
    expect(can(ROLES.STUDENT, PERMISSIONS.RESPOND_SURVEY)).toBe(true);
  });

  it("allows FACULTY aggregates and collaboration, but not admin powers", () => {
    expect(can(ROLES.FACULTY, PERMISSIONS.VIEW_EVALUATION_AGGREGATES)).toBe(true);
    expect(can(ROLES.FACULTY, PERMISSIONS.VIEW_REPORTS)).toBe(true);
    expect(can(ROLES.FACULTY, PERMISSIONS.SEND_MESSAGE)).toBe(true);
    expect(can(ROLES.FACULTY, PERMISSIONS.MANAGE_USERS)).toBe(false);
    expect(can(ROLES.FACULTY, PERMISSIONS.VIEW_INSIGHTS)).toBe(false);
    expect(can(ROLES.FACULTY, PERMISSIONS.IMPORT_SIS)).toBe(false);
  });

  it("guards AI insights and SIS import as ADMIN-only", () => {
    expect(can(ROLES.ADMIN, PERMISSIONS.VIEW_INSIGHTS)).toBe(true);
    expect(can(ROLES.ADMIN, PERMISSIONS.IMPORT_SIS)).toBe(true);
    expect(can(ROLES.FACULTY, PERMISSIONS.VIEW_INSIGHTS)).toBe(false);
    expect(can(ROLES.STUDENT, PERMISSIONS.VIEW_INSIGHTS)).toBe(false);
  });
});

describe("privilege ordering", () => {
  it("orders roles by privilege", () => {
    expect(atLeast(ROLES.ADMIN, ROLES.FACULTY)).toBe(true);
    expect(atLeast(ROLES.FACULTY, ROLES.STUDENT)).toBe(true);
    expect(atLeast(ROLES.STUDENT, ROLES.ADMIN)).toBe(false);
    expect(atLeast(ROLES.ADMIN, ROLES.ADMIN)).toBe(true);
  });
});