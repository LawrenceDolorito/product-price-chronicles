
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProductDetail from "./pages/ProductDetail";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import AdminUserManagement from "./pages/AdminUserManagement";
import UserPermissionsTable from "./pages/UserPermissionsTable";
import NotFound from "./pages/NotFound";

// Define admin email constant
const ADMIN_EMAIL = "doloritolawrence@gmail.com";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Admin route component - STRICT admin check with email and role_key
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading, profile, user } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  console.log("Admin route check - Email:", user?.email);
  console.log("Admin route check - Role:", profile?.role);
  console.log("Admin route check - Role key:", profile?.role_key);
  console.log("Admin route check - Expected admin email:", ADMIN_EMAIL);
  console.log("Admin route check - Is admin?", profile?.role === 'admin' && profile?.role_key === 'admin' && user?.email === ADMIN_EMAIL);
  
  // Strict admin check - both role, role_key AND email must match
  if (profile?.role !== 'admin' || profile?.role_key !== 'admin' || user?.email !== ADMIN_EMAIL) {
    console.log("Admin access denied - redirecting to dashboard");
    return <Navigate to="/dashboard" />;
  }
  
  console.log("Admin access granted");
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/products" 
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/product/:id" 
        element={
          <ProtectedRoute>
            <ProductDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/user-management" 
        element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/user-management" 
        element={
          <AdminRoute>
            <AdminUserManagement />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/user-permissions" 
        element={
          <AdminRoute>
            <UserPermissionsTable />
          </AdminRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
