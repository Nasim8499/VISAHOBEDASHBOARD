import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { BottomNav } from "./BottomNav";

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Auto-scroll to top whenever the route changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  return (
    <WorkspaceProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sidebar — always default on lg+, drawer on mobile */}
        <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
          <Sidebar />
        </div>

        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm lg:hidden"
                onClick={() => setOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", stiffness: 280, damping: 30 }}
                className="fixed inset-y-0 left-0 z-50 lg:hidden"
              >
                <Sidebar onClose={() => setOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <TopHeader onOpenSidebar={() => setOpen(true)} />
          <main className="flex-1 pb-28 lg:pb-10">
            {/* Enter-only fade so switching sidebar tabs doesn't flash an empty
                gap between the old page exiting and the new page entering. */}
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="page-enter"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
