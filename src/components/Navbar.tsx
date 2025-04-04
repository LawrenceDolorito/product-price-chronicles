
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Package, User, LogOut } from "lucide-react";

const Navbar: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

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
                Products Table
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
