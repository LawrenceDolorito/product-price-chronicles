
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "@/components/ui/sonner";

type User = {
  id: string;
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Mock login for demonstration
      // In a real app, you would make an API call here
      
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // For demo purposes, any email and password will work
      // except empty strings
      if (!email || !password) {
        toast.error("Please enter email and password");
        setIsLoading(false);
        return false;
      }

      const newUser = {
        id: "user-1",
        email,
        name: email.split("@")[0],
      };

      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(newUser));
      toast.success("Login successful!");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Mock signup for demonstration
      // In a real app, you would make an API call here
      
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // For demo purposes, any email and password will work
      // except empty strings
      if (!name || !email || !password) {
        toast.error("Please fill in all fields");
        setIsLoading(false);
        return false;
      }

      const newUser = {
        id: "user-" + Date.now().toString(),
        email,
        name,
      };

      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(newUser));
      toast.success("Account created successfully!");
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Registration failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
