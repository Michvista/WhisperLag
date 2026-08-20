"use client";

import { Footer } from "./Footer";
import { MobileNav, Sidebar } from "./Sidebar";
import { useAuth } from "@/lib/useAuth";

/**
 * Authenticated app shell. Shows a loader while auth resolves, then renders
 * the role-aware nav (sidebar on desktop, top bar on mobile) beside content.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready } = useAuth();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Sidebar />
      <MobileNav />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <main className="w-full flex-1 px-margin-mobile pb-12 pt-28 lg:px-margin-desktop lg:pt-12">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}