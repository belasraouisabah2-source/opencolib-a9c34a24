import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Services from "./pages/Services";
import Beneficiaires from "./pages/Beneficiaires";
import Employes from "./pages/Employes";
import Planning from "./pages/Planning";
import ControleHeures from "./pages/ControleHeures";
import Facturation from "./pages/Facturation";
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
            <Route path="/services" element={<Services />} />
            <Route path="/beneficiaires" element={<Beneficiaires />} />
            <Route path="/employes" element={<Employes />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/controle-heures" element={<ControleHeures />} />
            <Route path="/facturation" element={<Facturation />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
