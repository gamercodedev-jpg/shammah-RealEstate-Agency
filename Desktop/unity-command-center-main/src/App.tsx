import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import USSDReport from "./pages/USSDReport";
import AdminLogin from "./pages/AdminLogin";
import DashboardLayout from "./pages/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import CasesPage from "./pages/dashboard/CasesPage";
import MapPage from "./pages/dashboard/MapPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import RespondersPage from "./pages/dashboard/RespondersPage";
import AlertsPage from "./pages/dashboard/AlertsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import ArticlesPage from "./pages/ArticlesPage";
import PunishmentsPage from "./pages/PunishmentsPage";
import SafeReportMobile from "./pages/SafeReportMobile";
import ProfessionalLanding from "./pages/ProfessionalLanding";
import AdvancedDashboard from "./components/AdvancedDashboard";
import EnhancedReportingForm from "./components/EnhancedReportingForm";
import EmergencyContactsPage from "./pages/EmergencyContactsPage";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/professional" element={<ProfessionalLanding />} />
            <Route path="/advanced" element={<AdvancedDashboard />} />
            <Route path="/enhanced-report" element={<EnhancedReportingForm />} />
            <Route path="/report" element={<USSDReport />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/punishments" element={<PunishmentsPage />} />
            <Route path="/contacts" element={<EmergencyContactsPage />} />
            <Route path="/mobile" element={<SafeReportMobile />} />
            <Route path="/resources" element={<SafeReportMobile />} />
            <Route path="/emergency" element={<SafeReportMobile />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="cases" element={<CasesPage />} />
              <Route path="map" element={<MapPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="responders" element={<RespondersPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
