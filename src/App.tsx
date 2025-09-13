
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


// Import new auth components
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

const queryClient = new QueryClient();



// Logout component for the header
const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
  
  return (
    <button 
      onClick={logout}
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
      }}
    >
      Logout
    </button>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename="/">
            <ProtectedRoute>
              <LogoutButton />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/properties" element={<PropertyManagement />} />
                <Route path="/vehicles" element={<VehicleManagement />} />
                <Route path="/bookings" element={<BookingManagement />} />
                <Route path="/commission" element={<CommissionEarnings />} />
                <Route path="/farms" element={<FarmsPage />} />
                <Route path="/farmCommissions" element={<FarmCommssions />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ProtectedRoute>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;