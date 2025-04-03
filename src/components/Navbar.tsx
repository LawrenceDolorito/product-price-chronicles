
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, User, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";

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
            <ShoppingCart className="mr-2" />
            PriceTracker
          </a>
        </div>
        
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary"
            />
          </div>
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
                Products
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
