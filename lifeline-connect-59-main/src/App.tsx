import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import VictimDashboard from "./pages/victim/VictimDashboard";
import VictimRequestPage from "./pages/victim/VictimRequestPage";
import VictimMyRequestsPage from "./pages/victim/VictimMyRequestsPage";
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import VolunteerRequestsPage from "./pages/volunteer/VolunteerRequestsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, profile, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) return <Navigate to="/" replace />;
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Victim Routes */}
      <Route path="/victim" element={<ProtectedRoute allowedRoles={['victim']}><VictimDashboard /></ProtectedRoute>} />
      <Route path="/victim/request" element={<ProtectedRoute allowedRoles={['victim']}><VictimRequestPage /></ProtectedRoute>} />
      <Route path="/victim/my-requests" element={<ProtectedRoute allowedRoles={['victim']}><VictimMyRequestsPage /></ProtectedRoute>} />
      
      {/* Volunteer Routes */}
      <Route path="/volunteer" element={<ProtectedRoute allowedRoles={['volunteer']}><VolunteerDashboard /></ProtectedRoute>} />
      <Route path="/volunteer/requests" element={<ProtectedRoute allowedRoles={['volunteer']}><VolunteerRequestsPage /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
