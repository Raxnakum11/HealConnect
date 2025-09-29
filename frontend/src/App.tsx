import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { HomePage } from "@/components/HomePage";
import { PatientDashboard } from "@/components/PatientDashboard";
import { DoctorDashboard } from "@/components/DoctorDashboard";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '20px', fontSize: '18px' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <HomePage />;
  }

  if (user?.role === 'doctor') {
    return <DoctorDashboard />;
  }

  return <PatientDashboard />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
