
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import PropertyManagement from "./pages/PropertyManagement";
import VehicleManagement from "./pages/VehicleManagement";
import BookingManagement from "./pages/BookingManagement";
import CommissionEarnings from "./pages/CommissionEarnings";
import NotFound from "./pages/NotFound";
import FarmsPage from "./pages/FarmsPage"
import FarmCommssions from "./pages/FarmCommssions"

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/properties" element={<PropertyManagement />} />
          <Route path="/vehicles" element={<VehicleManagement />} />
          <Route path="/bookings" element={<BookingManagement />} />
          <Route path="/commission" element={<CommissionEarnings />} />
          <Route path="/farms" element={<FarmsPage />} />
          <Route path="/farmCommssions" element={<FarmCommssions />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
