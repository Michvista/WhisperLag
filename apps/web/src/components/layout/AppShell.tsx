import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";

/**
 * Authenticated app layout: a sidebar-only navigation rail with the content
 * beside it — deliberately one navigation pattern (per design direction).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Sidebar />
      <div className="flex min-h-screen flex-col pl-64">
        <main className="w-full flex-1 px-margin-desktop py-12">{children}</main>
        <Footer />
      </div>
    </div>
  );
}