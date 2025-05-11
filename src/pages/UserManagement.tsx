import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Loader2, Search, Users, UserPlus, Pencil, Trash2, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

type User = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  first_name: string;
  last_name: string;
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "user"
  });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isAuthenticated, profile, user } = useAuth();
  const navigate = useNavigate();

  // Check if current user is admin - strictly check both role and email
  const isAdmin = profile?.role === 'admin' && (user?.email === "doloritolawrence@gmail.com" || false);

  // Redirect non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to view this page');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Redirect blocked users
  useEffect(() => {
    if (isAuthenticated && profile?.role === 'blocked') {
      toast.error('Your account has been blocked. Please contact an administrator.');
      navigate('/login');
    }
  }, [isAuthenticated, profile, navigate]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) => 
        user.email.toLowerCase().includes(query) || 
        (user.first_name && user.first_name.toLowerCase().includes(query)) ||
        (user.last_name && user.last_name.toLowerCase().includes(query))
    );
    
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all users from auth.users (this would be done via an admin API in a real app)
      // For now, we'll use the profiles table which is synced with auth
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) throw profilesError;
      
      // Ensure the admin email has full privileges
      const adminEmail = "doloritolawrence@gmail.com";
      
      // Get user emails from auth (in real app, would need admin access)
      // For this demo, we'll use a workaround to link profiles to emails
      let processedUsers = profilesData.map((profile: any) => {
        // For the admin user, use the known email
        const isAdmin = profile.role === 'admin';
        const email = isAdmin && profile.id === user?.id 
          ? adminEmail 
          : profile.email || `${profile.first_name || 'user'}.${profile.last_name || profile.id.slice(-4)}@example.com`.toLowerCase();
          
        return {
          id: profile.id,
          email: email,
          role: profile.role || "user",
          created_at: profile.created_at || new Date().toISOString(),
          first_name: profile.first_name || '',
          last_name: profile.last_name || ''
        };
      });
      
      // Make sure the admin user exists and has admin role
      const hasAdminUser = processedUsers.some(user => user.email === adminEmail);
      
      if (!hasAdminUser && user?.email === adminEmail) {
        // If the admin user doesn't exist in the fetched data but is the current user, add it
        processedUsers.push({
          id: user.id,
          email: adminEmail,
          role: "admin",
          created_at: new Date().toISOString(),
          first_name: "Admin",
          last_name: "User"
        });
      } else {
        // If it exists, make sure it has admin role
        processedUsers = processedUsers.map(user => 
          user.email === adminEmail ? { ...user, role: "admin" } : user
        );
      }
      
      setUsers(processedUsers);
      setFilteredUsers(processedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleSelectChange = (value: string) => {
    setNewUser({ ...newUser, role: value });
  };

  const handleAddUser = async () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to add users");
      return;
    }
    
    // Only admin can add users
    if (!isAdmin) {
      toast.error("You don't have permission to add users");
      return;
    }
    
    setIsAddingUser(true);
    
    try {
      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            first_name: newUser.firstName,
            last_name: newUser.lastName,
          }
        }
      });
      
      if (authError) throw authError;
      
      // Create or update the profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            first_name: newUser.firstName,
            last_name: newUser.lastName,
            role: newUser.role
          });
          
        if (profileError) throw profileError;
        
        // Add the new user to the local state for immediate UI update
        const newUserData = {
          id: authData.user.id,
          email: newUser.email,
          role: newUser.role,
          created_at: new Date().toISOString(),
          first_name: newUser.firstName,
          last_name: newUser.lastName
        };
        
        // Update the users state with the new user
        setUsers(prevUsers => [...prevUsers, newUserData]);
        setFilteredUsers(prevUsers => [...prevUsers, newUserData]);
      }
      
      setNewUser({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "user"
      });
      
      setDialogOpen(false);
      toast.success("User added successfully!");
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast.error(`Failed to add user: ${error.message || 'Unknown error'}`);
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleEditUser = async (id: string, newRole: string) => {
    if (!isAuthenticated || !isAdmin) {
      toast.error("You must be an admin to edit users");
      return;
    }
    
    try {
      // Update the user role in the database
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      const updatedUsers = users.map(user => 
        user.id === id ? { ...user, role: newRole } : user
      );
      
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      toast.success("User role updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user role");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!isAuthenticated || !isAdmin) {
      toast.error("You must be an admin to delete users");
      return;
    }
    
    // Prevent deletion of the special admin user
    const targetUser = users.find(user => user.id === id);
    if (targetUser?.email === "doloritolawrence@gmail.com") {
      toast.error("Cannot delete the administrator account");
      return;
    }
    
    try {
      // In a real app with proper permissions, you would use admin APIs to delete the user
      // For now, we'll just remove from the profiles table
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state by removing the deleted user
      const updatedUsers = users.filter(user => user.id !== id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  // Check if the current user is the specified admin
  const isSpecialAdmin = user?.email === "doloritolawrence@gmail.com";

  // Simple view for non-admin users - just show names
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Users Directory</h1>
            <p className="text-gray-600 mt-1">
              View all users in the system
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Users className="h-5 w-5 mr-2 text-primary" />
                <h2 className="text-lg font-medium">User List</h2>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ul className="space-y-2">
                  {filteredUsers.map((user) => (
                    <li key={user.id} className="py-2 border-b border-gray-100 last:border-0">
                      {user.first_name} {user.last_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Full admin view with all features
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">
              Manage user accounts and access rights
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 mt-4 md:mt-0">
                <UserPlus size={16} />
                <span>Add User</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with specified access rights.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="text-right">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={newUser.firstName}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={newUser.lastName}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleAddUser}
                  disabled={isAddingUser}
                >
                  {isAddingUser ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : "Add User"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="relative mb-6">
          <div className="flex gap-2 max-w-md">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableCaption>List of all system users and their roles</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Loading users...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    {searchQuery ? "No users found matching your search" : "No users found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Shield className={`mr-2 h-4 w-4 ${user.role === 'admin' ? 'text-primary' : 'text-gray-400'}`} />
                        <span className="capitalize">{user.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditUser(user.id, user.role === 'admin' ? 'user' : 'admin')}
                        disabled={user.email === "doloritolawrence@gmail.com" && !isSpecialAdmin}
                      >
                        <Pencil size={16} />
                        <span className="hidden sm:inline ml-1">
                          {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                        </span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.email === "doloritolawrence@gmail.com" || user.id === profile?.id}
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline ml-1">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;
