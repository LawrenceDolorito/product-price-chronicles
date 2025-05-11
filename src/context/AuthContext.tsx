
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: string;
  email?: string; // Keep email as optional since it's not in the database table
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the admin email as a constant to ensure consistency
const ADMIN_EMAIL = "doloritolawrence@gmail.com";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        
        if (session?.user) {
          // Use setTimeout to avoid potential deadlocks with Supabase auth
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user ID:", userId);
      // Remove email from the select query since it doesn't exist in the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, role')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      
      if (data) {
        // Check if the user is our special admin user by email
        const isSpecialAdmin = user?.email === ADMIN_EMAIL;
        console.log("User email:", user?.email);
        console.log("Is special admin?", isSpecialAdmin);
        console.log("Current role from DB:", data.role);
        
        // Add email from the auth user data instead of from profiles table
        const profileWithEmail: Profile = {
          ...data,
          email: user?.email
        };
        
        // Special case: If user is doloritolawrence@gmail.com, ensure they have admin role
        if (isSpecialAdmin) {
          console.log(`Setting admin role for ${ADMIN_EMAIL}`);
          
          if (data.role !== 'admin') {
            console.log("Updating role to admin in database");
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', userId);
              
            if (updateError) {
              console.error("Error updating profile to admin:", updateError);
            }
          }
          
          // Always set admin role in the frontend
          console.log("Setting profile with admin role in the app state");
          setProfile({ ...profileWithEmail, role: 'admin' });
        } else {
          // For all other users, ensure they are NOT admins
          if (data.role === 'admin' && user?.email !== ADMIN_EMAIL) {
            console.log("Correcting non-admin user with admin role:", user?.email);
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ role: 'user' })
              .eq('id', userId);
              
            if (updateError) {
              console.error("Error updating profile from admin to user:", updateError);
            }
            
            // Set user role in the frontend
            setProfile({ ...profileWithEmail, role: 'user' });
          } else {
            // Use the role from the database
            console.log("Setting normal user profile:", profileWithEmail);
            setProfile(profileWithEmail);
          }
        }
        
        // Check if user is blocked and log them out
        if (data.role === 'blocked') {
          toast.error("Your account has been blocked. Please contact an administrator.");
          setTimeout(() => {
            logout();
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (!email || !password) {
        toast.error("Please enter email and password");
        return false;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        toast.error(error.message);
        return false;
      }

      console.log("Login successful for:", email);
      console.log("Admin email is:", ADMIN_EMAIL);
      console.log("Is admin login?", email === ADMIN_EMAIL);

      // Special case for ADMIN_EMAIL
      if (data.user && data.user.email === ADMIN_EMAIL) {
        // Check if profile exists first
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
          
        if (!profileError && profileData) {
          // If profile exists but role is not admin, update it
          if (profileData.role !== 'admin') {
            console.log(`Updating ${email} to admin role in database`);
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', data.user.id);
              
            if (updateError) {
              console.error("Error updating admin role:", updateError);
            } else {
              console.log(`Admin role updated for ${ADMIN_EMAIL}`);
            }
          }
        } else {
          // If profile doesn't exist, create it with admin role
          console.log(`Creating new admin profile for ${email}`);
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              first_name: "Admin",
              last_name: "User",
              role: 'admin'
            });
            
          if (insertError) {
            console.error("Error creating admin profile:", insertError);
          } else {
            console.log(`Admin profile created for ${ADMIN_EMAIL}`);
          }
        }
      } else if (data.user) {
        // For non-admin users, make sure they don't have admin role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
          
        if (!profileError && profileData && profileData.role === 'admin' && data.user.email !== ADMIN_EMAIL) {
          // If a non-admin email has admin role, update it to user
          console.log(`Removing admin privileges from ${data.user.email}`);
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'user' })
            .eq('id', data.user.id);
            
          if (updateError) {
            console.error("Error updating non-admin user role:", updateError);
          } else {
            console.log(`User role corrected for ${data.user.email}`);
          }
        }
      }

      // Check if the user is blocked (for all users)
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
          
        if (!profileError && profile && profile.role === 'blocked') {
          toast.error("Your account has been blocked. Please contact an administrator.");
          await supabase.auth.signOut();
          return false;
        }
      }

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

  const signup = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (!email || !password) {
        toast.error("Please fill in all required fields");
        return false;
      }

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });
      
      if (error) {
        console.error("Signup error:", error);
        toast.error(error.message);
        return false;
      }
      
      // The profile is created automatically by the database trigger
      // we created, so no need to create it here

      toast.success("Account created successfully! Please check your email to verify your account.");
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Registration failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
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
