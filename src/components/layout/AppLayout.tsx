import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import { BottomNav } from "./BottomNav";
import { WorkspaceProvider } from "@/context/WorkspaceContext";

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  return (
    <WorkspaceProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Desktop sidebar */}
        <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
          <Sidebar />
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 animate-slide-in-right">
              <Sidebar onClose={() => setOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <TopHeader onOpenSidebar={() => setOpen(true)} />
          <main className="flex-1 pb-24 lg:pb-10">
            <Outlet />
          </main>
        </div>

        <BottomNav />
      </div>
    </WorkspaceProvider>
  );
}
