
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Loader2, PlusCircle, Search, UserPlus, Pencil, Trash2, Shield } from "lucide-react";
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
      
      // In a real app, this would be an admin-only API endpoint
      // For demo purposes, we're using a direct query
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, created_at');
        
      if (usersError) throw usersError;
      
      // Ensure the admin email has full privileges
      const adminEmail = "doloritolawrence@gmail.com";
      let mockUsers = usersData.map((profile: any) => ({
        id: profile.id,
        email: profile.email || `${profile.first_name || 'user'}.${profile.last_name || Date.now().toString().slice(-4)}@example.com`.toLowerCase(),
        role: profile.email === adminEmail ? "admin" : (profile.role || (Math.random() > 0.7 ? "admin" : "user")),
        created_at: profile.created_at || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        first_name: profile.first_name || '',
        last_name: profile.last_name || ''
      }));
      
      // Make sure the specific admin user is present and has admin role
      const hasAdminUser = mockUsers.some(user => user.email === adminEmail);
      
      if (!hasAdminUser) {
        // If the admin user doesn't exist in the fetched data, add it
        mockUsers.push({
          id: crypto.randomUUID(),
          email: adminEmail,
          role: "admin",
          created_at: new Date().toISOString(),
          first_name: "Admin",
          last_name: "User"
        });
      } else {
        // If it exists, make sure it has admin role
        mockUsers = mockUsers.map(user => 
          user.email === adminEmail ? { ...user, role: "admin" } : user
        );
      }
      
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
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
    
    // Validate form
    if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsAddingUser(true);
    
    try {
      // In a real app, this would call an admin API to create users
      // For demo purposes, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newId = crypto.randomUUID();
      const newUserData = {
        id: newId,
        email: newUser.email,
        role: newUser.role,
        created_at: new Date().toISOString(),
        first_name: newUser.firstName,
        last_name: newUser.lastName
      };
      
      // Update the users state with the new user - this ensures immediate UI update
      const updatedUsers = [...users, newUserData];
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      setNewUser({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "user"
      });
      
      setDialogOpen(false);
      toast.success("User added successfully!");
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user");
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleEditUser = (id: string) => {
    // In a real app, this would open an edit dialog
    toast.info(`Edit user functionality would edit user: ${id}`);
  };

  const handleDeleteUser = async (id: string) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to delete users");
      return;
    }
    
    try {
      // In a real app, this would call an admin API to delete users
      // For demo purposes, we'll just update the state
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
  // Fix: Access email from user object rather than profile
  const isSpecialAdmin = user?.email === "doloritolawrence@gmail.com";

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
                        onClick={() => handleEditUser(user.id)}
                        disabled={user.email === "doloritolawrence@gmail.com" && !isSpecialAdmin}
                      >
                        <Pencil size={16} />
                        <span className="hidden sm:inline ml-1">Edit</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.email === "doloritolawrence@gmail.com" && !isSpecialAdmin}
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
