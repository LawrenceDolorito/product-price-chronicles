
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Package, User, LogOut, BarChart2, Users, Shield } from "lucide-react";

// Define admin email constant
const ADMIN_EMAIL = "doloritolawrence@gmail.com";

const Navbar: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Strict admin check - role, role_key and email must all match
  const isAdmin = profile?.role === 'admin' && 
                 profile?.role_key === 'admin' && 
                 user?.email === ADMIN_EMAIL;
  
  console.log("Navbar - User email:", user?.email);
  console.log("Navbar - User role:", profile?.role);
  console.log("Navbar - User role_key:", profile?.role_key);
  console.log("Navbar - Admin email:", ADMIN_EMAIL);
  console.log("Navbar - Admin check result:", isAdmin);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <a 
            href="/" 
            className="font-bold text-xl text-primary flex items-center"
          >
            <Package className="mr-2" />
            Product Manager
          </a>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden md:inline text-sm text-gray-600">
                Hello, {profile?.first_name || user.email?.split('@')[0]}
                {isAdmin && (
                  <span className="ml-2 text-xs font-medium text-primary">(Admin)</span>
                )}
              </span>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="ghost"
                size="sm"
                className="text-gray-600"
              >
                Dashboard
              </Button>
              <Button
                onClick={() => navigate("/products")}
                variant="ghost"
                size="sm"
                className="text-gray-600"
              >
                Products
              </Button>
              <Button
                onClick={() => navigate("/reports")}
                variant="ghost"
                size="sm"
                className="text-gray-600"
              >
                <BarChart2 size={18} className="mr-2" /> Reports
              </Button>
              <Button
                onClick={() => navigate("/user-management")}
                variant="ghost"
                size="sm"
                className="text-gray-600"
              >
                <Users size={18} className="mr-2" /> Users
              </Button>
              {/* Make Manage Users tab visible to all users */}
              <Button
                onClick={() => navigate("/admin/user-management")}
                variant="ghost"
                size="sm"
                className="text-gray-600"
              >
                <Shield size={18} className="mr-2" /> Manage Users
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-gray-600"
              >
                <LogOut size={18} className="mr-2" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => navigate("/login")}
                variant="ghost" 
                size="sm"
                className="text-gray-600"
              >
                <User size={18} className="mr-2" /> Login
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
