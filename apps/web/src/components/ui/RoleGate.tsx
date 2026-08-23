"use client";

import { useAuth } from "@/lib/useAuth";
import { atLeast, type Role } from "@whisperlag/shared";

/**
 * Client-side role gate. Mirrors the API's RBAC so users never see a page
 * whose data they cannot access. Renders an access-denied panel when the
 * signed-in role is below `minRole`.
 */
export function RoleGate({ minRole, children }: { minRole: Role; children: React.ReactNode }) {
  const { role, ready } = useAuth();

  if (!ready) return null;
  if (!role || !atLeast(role as Role, minRole)) {
    return (
      <div className="flex flex-col items-start gap-4 py-16">
        <span className="material-symbols-outlined text-3xl text-error">lock</span>
        <h2 className="font-display text-headline-md font-semibold text-onSurface">
          You don&apos;t have access to this area
        </h2>
        <p className="font-body-md text-body-md text-onSurfaceVariant">
          This view is restricted to {minRole.toLowerCase()} accounts. If you
          believe this is a mistake, contact the Quality Assurance &amp; SERVICOM Unit.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}