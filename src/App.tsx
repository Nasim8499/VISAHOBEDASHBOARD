import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/layout/AppLayout";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/new" element={<NewBusinessWizard />} />
            <Route path="/workspace/:id" element={<WorkspaceDetail />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<Meetings />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/brand-builder" element={<BrandBuilder />} />
            <Route path="/logo-maker" element={<LogoMaker />} />
            <Route path="/website-builder" element={<WebsiteBuilder />} />
            <Route path="/post-designer" element={<PostDesigner />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/brand-kit" element={<BrandKit />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/files" element={<Documents />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/automation" element={<Automation />} />
            <Route path="/ai" element={<AIAssistant />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/team" element={<Team />} />
            <Route path="/activity" element={<ActivityLogs />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/portal/:id" element={<ClientPortal />} />
            <Route path="/more" element={<More />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
