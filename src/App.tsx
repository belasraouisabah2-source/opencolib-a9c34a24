import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Services from "./pages/Services";
import Secteurs from "./pages/Secteurs";
import Beneficiaires from "./pages/Beneficiaires";
import Employes from "./pages/Employes";
import Planning from "./pages/Planning";
import PlanningBeneficiaires from "./pages/PlanningBeneficiaires";
import PlanningMulti from "./pages/PlanningMulti";
import ControleHeures from "./pages/ControleHeures";
import Facturation from "./pages/Facturation";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import AdminUsers from "./pages/AdminUsers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/services" element={<Services />} />
              <Route path="/secteurs" element={<Secteurs />} />
              <Route path="/beneficiaires" element={<Beneficiaires />} />
              <Route path="/employes" element={<Employes />} />
              <Route path="/planning" element={<Planning />} />
              <Route path="/planning-beneficiaires" element={<PlanningBeneficiaires />} />
              <Route path="/planning-multi" element={<PlanningMulti />} />
              <Route path="/controle-heures" element={<ControleHeures />} />
              <Route path="/facturation" element={<Facturation />} />
              <Route path="/admin/utilisateurs" element={<AdminUsers />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
