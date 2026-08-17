import { Footer } from "./Footer";
import { SideNav } from "./SideNav";
import { TopNav } from "./TopNav";

/**
 * Layout for authenticated app screens: fixed top nav, desktop side nav,
 * and the shared footer.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <SideNav />
      <main className="w-full flex-1 px-margin-mobile pb-16 pt-24 md:ml-64 md:px-margin-desktop">
        {children}
      </main>
      <Footer />
    </div>
  );
}