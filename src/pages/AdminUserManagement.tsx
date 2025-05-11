
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Loader2, Search, Users, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import UserRoleTag from "@/components/users/UserRoleTag";
import UserRoleSelector from "@/components/users/UserRoleSelector";
import UserPermissionCard from "@/components/users/UserPermissionCard";

type UserPermission = {
  id: string;
  user_id: string;
  table_name: string;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
  created_at: string;
  updated_at: string;
};

type User = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  permissions: UserPermission[];
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { user, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setCurrentUserRole(profile.role);
    }
  }, [profile]);

  useEffect(() => {
    if (isAuthenticated && currentUserRole === 'blocked') {
      toast.error('Your account has been blocked. Please contact an administrator.');
      navigate('/login');
    }
  }, [isAuthenticated, currentUserRole, navigate]);

  useEffect(() => {
    if (isAuthenticated && currentUserRole && currentUserRole !== 'admin') {
      toast.error('You do not have permission to access this page');
      navigate('/dashboard');
    }
  }, [isAuthenticated, currentUserRole, navigate]);

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
      
      // First get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) throw profilesError;
      
      // Then get permissions for all users
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('*');
        
      if (permissionsError) throw permissionsError;
      
      // Combine profiles with permissions
      const usersWithPermissions = profilesData.map((profile: any) => {
        const userPermissions = permissionsData.filter(
          (p: any) => p.user_id === profile.id
        );
        
        // Default permissions to false if not found
        if (userPermissions.length === 0 && profile.role !== 'admin') {
          // For non-admin users, create default "NO" permissions
          const currentTime = new Date().toISOString();
          
          const defaultProductPermissions = {
            id: `default-product-${profile.id}`,
            user_id: profile.id,
            table_name: 'product',
            can_add: false,
            can_edit: false,
            can_delete: false,
            created_at: currentTime,
            updated_at: currentTime
          };
          
          const defaultPriceHistPermissions = {
            id: `default-pricehist-${profile.id}`,
            user_id: profile.id,
            table_name: 'pricehist',
            can_add: false,
            can_edit: false,
            can_delete: false,
            created_at: currentTime,
            updated_at: currentTime
          };
          
          userPermissions.push(defaultProductPermissions, defaultPriceHistPermissions);
        }
        
        return {
          id: profile.id,
          email: profile.email || `user-${profile.id.slice(0, 8)}@example.com`,
          role: profile.role || 'user',
          created_at: profile.created_at,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          permissions: userPermissions
        };
      });
      
      setUsers(usersWithPermissions);
      setFilteredUsers(usersWithPermissions);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    setFilteredUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const isCurrentUser = (userId: string) => {
    return user?.id === userId;
  };

  const isAdmin = currentUserRole === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">
              Manage user accounts, roles, and permissions
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              variant="default"
              onClick={() => navigate('/admin/user-permissions')}
              className="flex items-center gap-2"
            >
              <ExternalLink size={16} />
              Manage Table Permissions
            </Button>
          </div>
        </div>
        
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Search Users</CardTitle>
            <CardDescription>
              Find users by name or email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="rounded-md border">
          <Table>
            <TableCaption>List of all system users and their roles</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Permissions</TableHead>
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
                  <TableRow key={user.id} className="group">
                    <TableCell>
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : user.email.split('@')[0]
                      }
                      {isCurrentUser(user.id) && (
                        <span className="ml-2 text-xs text-gray-500">(You)</span>
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserRoleTag role={user.role} />
                        <UserRoleSelector
                          userId={user.id}
                          currentRole={user.role}
                          isCurrentUser={isCurrentUser(user.id)}
                          isAdmin={isAdmin}
                          onRoleChange={(newRole) => handleRoleChange(user.id, newRole)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="w-1/3">
                      <UserPermissionCard
                        userId={user.id}
                        userRole={user.role}
                        permissions={user.permissions}
                        isAdmin={isAdmin}
                      />
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

export default AdminUserManagement;
