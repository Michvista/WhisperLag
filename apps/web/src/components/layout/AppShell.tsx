"use client";

import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { useAuth } from "@/lib/useAuth";

/**
 * Authenticated app shell. Shows a loader while auth resolves, then renders
 * the role-aware nav (sidebar on desktop, bottom nav on mobile for students)
 * beside content.
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
      <MobileBottomNav />
      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Extra bottom padding on mobile for the bottom nav bar */}
        <main className="w-full flex-1 px-margin-mobile pb-20 pt-6 lg:px-margin-desktop lg:pt-12">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}