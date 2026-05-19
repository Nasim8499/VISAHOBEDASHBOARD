import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import RouteBoundary from "@/components/RouteBoundary";
import SplashScreen from "@/components/SplashScreen";
import AppLayout from "./components/layout/AppLayout";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import NewBusinessWizard from "./pages/NewBusinessWizard";
import WorkspaceDetail from "./pages/WorkspaceDetail";
import BrandBuilder from "./pages/BrandBuilder";
import LogoMaker from "./pages/LogoMaker";
import PostDesigner from "./pages/PostDesigner";
import WebsiteBuilder from "./pages/WebsiteBuilder";
import Documents from "./pages/Documents";
import Chat from "./pages/Chat";
import Meetings from "./pages/Meetings";
import Tasks from "./pages/Tasks";
import Approvals from "./pages/Approvals";
import ClientPortal from "./pages/ClientPortal";
import AIAssistant from "./pages/AIAssistant";
import Automation from "./pages/Automation";
import Reports from "./pages/Reports";
import Team from "./pages/Team";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import ActivityLogs from "./pages/ActivityLogs";
import Projects from "./pages/Projects";
import More from "./pages/More";
import Templates from "./pages/Templates";
import BrandKit from "./pages/BrandKit";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Clients land on portal; staff land on dashboard
function HomeRedirect() {
  const { role } = useAuth();
  if (role === "client") return <Navigate to="/portal" replace />;
  return <Dashboard />;
}

function AnimatedRoutes() {
  const location = useLocation();
  const { loading } = useAuth();
  const reduce = useReducedMotion();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Minimum 900ms so the splash doesn't flash
    const min = setTimeout(() => {
      if (!loading) setShowSplash(false);
    }, 900);
    return () => clearTimeout(min);
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setShowSplash(false), 900);
      return () => clearTimeout(t);
    }
  }, [loading]);

  const variants = reduce
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
      };

  return (
    <>
      <AnimatePresence>{showSplash && <SplashScreen key="splash" />}</AnimatePresence>
      <Routes location={location}>
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<RouteBoundary name="dashboard"><HomeRedirect /></RouteBoundary>} />
          <Route path="/clients" element={<ProtectedRoute allow={["super_admin", "employee"]}><RouteBoundary name="clients"><Clients /></RouteBoundary></ProtectedRoute>} />
          <Route path="/clients/new" element={<ProtectedRoute allow={["super_admin", "employee"]}><RouteBoundary name="clients-new"><NewBusinessWizard /></RouteBoundary></ProtectedRoute>} />
          <Route path="/workspace/:id" element={<ProtectedRoute allow={["super_admin", "employee"]}><RouteBoundary name="workspace"><WorkspaceDetail /></RouteBoundary></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute allow={["super_admin", "employee"]}><Projects /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute allow={["super_admin", "employee"]}><Tasks /></ProtectedRoute>} />
          <Route path="/calendar" element={<Meetings />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/brand-builder" element={<ProtectedRoute allow={["super_admin", "employee"]}><BrandBuilder /></ProtectedRoute>} />
          <Route path="/logo-maker" element={<ProtectedRoute allow={["super_admin", "employee"]}><LogoMaker /></ProtectedRoute>} />
          <Route path="/website-builder" element={<ProtectedRoute allow={["super_admin", "employee"]}><WebsiteBuilder /></ProtectedRoute>} />
          <Route path="/post-designer" element={<ProtectedRoute allow={["super_admin", "employee"]}><PostDesigner /></ProtectedRoute>} />
          <Route path="/templates" element={<ProtectedRoute allow={["super_admin", "employee"]}><Templates /></ProtectedRoute>} />
          <Route path="/brand-kit" element={<BrandKit />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/files" element={<Documents />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/automation" element={<ProtectedRoute allow={["super_admin", "employee"]}><Automation /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute allow={["super_admin", "employee"]}><AIAssistant /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute allow={["super_admin"]}><Reports /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute allow={["super_admin"]}><Team /></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute allow={["super_admin", "employee"]}><ActivityLogs /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute allow={["super_admin"]}><Billing /></ProtectedRoute>} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/portal" element={<ClientPortal />} />
          <Route path="/portal/:id" element={<ClientPortal />} />
          <Route path="/more" element={<More />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
