
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserPlus, Mail, Lock, User2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

const Login = () => {
  const { login, signup, logout, isLoading, isAuthenticated, profile } = useAuth();
  const navigate = useNavigate();
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginAttempt, setLoginAttempt] = useState(false);
  
  // Signup form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupAttempt, setSignupAttempt] = useState(false);

  // Helper function to handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Redirect if already authenticated and not blocked
  useEffect(() => {
    if (isAuthenticated && profile) {
      if (profile.role === 'blocked') {
        // Stay on login page with blocked message
      } else if (profile.role === 'admin') {
        // Admin goes to admin panel
        navigate("/admin/user-management");
      } else {
        // Regular users go to dashboard
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, profile, navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginAttempt(true);
    
    try {
      const success = await login(loginEmail, loginPassword);
      if (success) {
        // Login will trigger the useEffect above which will handle redirection
        // based on user role
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your credentials and try again.");
    } finally {
      setLoginAttempt(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupAttempt(true);
    
    try {
      if (signupPassword !== signupConfirmPassword) {
        toast.error("Passwords do not match");
        setSignupAttempt(false);
        return;
      }
      
      const success = await signup(signupEmail, signupPassword, firstName, lastName);
      if (success) {
        // Reset form after successful signup
        setSignupEmail("");
        setSignupPassword("");
        setSignupConfirmPassword("");
        setFirstName("");
        setLastName("");
        toast.success("Account created! You can now log in.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Registration failed. Please try again later.");
    } finally {
      setSignupAttempt(false);
    }
  };
  
  const switchToSignup = () => {
    const signupTab = document.querySelector('[data-value="signup"]') as HTMLElement;
    if (signupTab) signupTab.click();
  };

  const switchToLogin = () => {
    const loginTab = document.querySelector('[data-value="login"]') as HTMLElement;
    if (loginTab) loginTab.click();
  };
  
  // Show blocked user message if authenticated but blocked
  if (isAuthenticated && profile?.role === 'blocked') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="bg-red-50">
            <div className="flex items-center justify-center text-red-600 mb-3">
              <AlertCircle size={40} />
            </div>
            <CardTitle className="text-center text-red-700">Account Blocked</CardTitle>
            <CardDescription className="text-center text-red-600">
              Your account has been blocked by an administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-center text-gray-700 mb-6">
              If you believe this is an error, please contact the system administrator for assistance.
            </p>
            <Button 
              className="w-full" 
              onClick={handleLogout}
              variant="default"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Removing the duplicate handleLogout function that was here
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 auth-container">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">Product Management System</h1>
          <p className="mt-2 text-gray-600">ChatGemini's Product Manager</p>
        </div>
        
        <Card className="w-full bg-white shadow-xl">
          <Tabs defaultValue="login">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center justify-center">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center justify-center">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading || loginAttempt}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading || loginAttempt}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || loginAttempt}
                  >
                    {(isLoading || loginAttempt) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                  
                  <div className="text-sm text-center text-gray-500">
                    <span>Don't have an account? </span>
                    <button 
                      type="button"
                      onClick={switchToSignup}
                      className="text-primary hover:underline focus:outline-none"
                      disabled={isLoading || loginAttempt}
                    >
                      Sign up
                    </button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <div className="relative">
                        <User2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                          id="first-name"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="pl-10"
                          required
                          disabled={isLoading || signupAttempt}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        disabled={isLoading || signupAttempt}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading || signupAttempt}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading || signupAttempt}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading || signupAttempt}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || signupAttempt}
                  >
                    {(isLoading || signupAttempt) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                  
                  <div className="text-sm text-center text-gray-500">
                    <span>Already have an account? </span>
                    <button 
                      type="button"
                      onClick={switchToLogin}
                      className="text-primary hover:underline focus:outline-none"
                      disabled={isLoading || signupAttempt}
                    >
                      Log in
                    </button>
                  </div>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
          
          <CardFooter className="flex flex-col space-y-2 mt-4">
            <div className="text-sm text-gray-500 text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </div>
            
            {/* Supabase Authentication Note */}
            <div className="flex items-center justify-center text-xs text-amber-700 bg-amber-50 p-2 rounded-md">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>For testing, verify email confirmation is turned off in Supabase.</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
