
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Loader2, Search, Check, X } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";

type UserPermissionRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  edit_product: boolean;
  delete_product: boolean;
  add_product: boolean;
  edit_pricehist: boolean;
  delete_pricehist: boolean;
  add_pricehist: boolean;
};

const UserPermissionsTable = () => {
  const [users, setUsers] = useState<UserPermissionRow[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserPermissionRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsersWithPermissions();
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

  const fetchUsersWithPermissions = async () => {
    try {
      setLoading(true);
      
      // First get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role');
        
      if (profilesError) throw profilesError;
      
      // Get permissions for all users
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('*');
        
      if (permissionsError) throw permissionsError;
      
      // Combine all data
      const usersWithPermissions = profilesData.map((profile: any) => {
        // Find permissions for this user
        const productPermissions = permissionsData.find(
          (p: any) => p.user_id === profile.id && p.table_name === 'product'
        ) || { can_add: true, can_edit: true, can_delete: true };
        
        const pricehistPermissions = permissionsData.find(
          (p: any) => p.user_id === profile.id && p.table_name === 'pricehist'
        ) || { can_add: true, can_edit: true, can_delete: true };
        
        // Create mock email from name
        const mockEmail = profile.first_name && profile.last_name 
          ? `${profile.first_name.toLowerCase()}.${profile.last_name.toLowerCase()}@example.com`
          : `user-${profile.id.slice(0, 8)}@example.com`;
          
        // Special case for doloritoLawrence
        const email = profile.first_name === "Admin" && profile.last_name === "User" 
          ? "doloritolawrence@gmail.com" 
          : mockEmail;
        
        return {
          id: profile.id,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: email,
          role: profile.role || 'user',
          edit_product: productPermissions.can_edit,
          delete_product: productPermissions.can_delete,
          add_product: productPermissions.can_add,
          edit_pricehist: pricehistPermissions.can_edit,
          delete_pricehist: pricehistPermissions.can_delete,
          add_pricehist: pricehistPermissions.can_add
        };
      });
      
      setUsers(usersWithPermissions);
      setFilteredUsers(usersWithPermissions);
    } catch (error) {
      console.error("Error fetching users with permissions:", error);
      toast.error("Failed to load user permissions");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (
    userId: string, 
    table: 'product' | 'pricehist', 
    permission: 'can_add' | 'can_edit' | 'can_delete',
    value: boolean
  ) => {
    try {
      // Check if this is the special admin - don't allow changes
      const user = users.find(u => u.id === userId);
      if (user?.email === "doloritolawrence@gmail.com") {
        toast.error("Cannot modify permissions for the main administrator");
        return;
      }
      
      // Find if a permission record already exists
      const { data: existingPermission } = await supabase
        .from('user_permissions')
        .select('id')
        .eq('user_id', userId)
        .eq('table_name', table)
        .single();
        
      if (existingPermission) {
        // Update existing permission
        await supabase
          .from('user_permissions')
          .update({ [permission]: value })
          .eq('id', existingPermission.id);
      } else {
        // Create new permission record
        await supabase
          .from('user_permissions')
          .insert({
            user_id: userId,
            table_name: table,
            [permission]: value
          });
      }
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === userId) {
            const permKey = `${permission.replace('can_', '')}_${table}` as keyof UserPermissionRow;
            return { ...user, [permKey]: value };
          }
          return user;
        })
      );
      
      setFilteredUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === userId) {
            const permKey = `${permission.replace('can_', '')}_${table}` as keyof UserPermissionRow;
            return { ...user, [permKey]: value };
          }
          return user;
        })
      );
      
      toast.success("Permission updated successfully");
    } catch (error) {
      console.error("Error updating permission:", error);
      toast.error("Failed to update permission");
    }
  };

  const isSpecialAdmin = profile?.role === 'admin';
  const isAdminUser = (email: string) => email === "doloritolawrence@gmail.com";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Permissions</h1>
            <p className="text-gray-600 mt-1">
              Manage user permissions for product and price history tables
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/user-management')}
            >
              Back to User Management
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
            <TableCaption>User permissions for system tables</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Edit Product</TableHead>
                <TableHead>Delete Product</TableHead>
                <TableHead>Add Product</TableHead>
                <TableHead>Edit Price History</TableHead>
                <TableHead>Delete Price History</TableHead>
                <TableHead>Add Price History</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Loading user permissions...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    {searchQuery ? "No users found matching your search" : "No users found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        {isAdminUser(user.email) && (
                          <div className="text-xs text-primary font-medium mt-1">
                            Administrator
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {isAdminUser(user.email) || user.role === 'admin' ? (
                        <span className="font-medium text-green-600">YES</span>
                      ) : user.edit_product ? (
                        <div className="flex items-center">
                          <span className="font-medium text-green-600 mr-2">YES</span>
                          {isSpecialAdmin && (
                            <Switch 
                              checked={user.edit_product}
                              onCheckedChange={(checked) => {
                                handlePermissionChange(user.id, 'product', 'can_edit', checked);
                              }}
                              disabled={!isSpecialAdmin}
                              size="sm"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="font-medium text-red-600 mr-2">NO</span>
                          {isSpecialAdmin && (
                            <Switch
                              checked={user.edit_product}
                              onCheckedChange={(checked) => {
                                handlePermissionChange(user.id, 'product', 'can_edit', checked);
                              }}
                              disabled={!isSpecialAdmin}
                              size="sm"
                            />
                          )}
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {isAdminUser(user.email) || user.role === 'admin' ? (
                        <span className="font-medium text-green-600">YES</span>
                      ) : user.delete_product ? (
                        <div className="flex items-center">
                          <span className="font-medium text-green-600 mr-2">YES</span>
                          {isSpecialAdmin && (
                            <Switch
                              checked={user.delete_product}
                              onCheckedChange={(checked) => {
                                handlePermissionChange(user.id, 'product', 'can_delete', checked);
                              }}
                              disabled={!isSpecialAdmin}
                              size="sm"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="font-medium text-red-600 mr-2">NO</span>
                          {isSpecialAdmin && (
                            <Switch
                              checked={user.delete_product}
                              onCheckedChange={(checked) => {
                                handlePermissionChange(user.id, 'product', 'can_delete', checked);
                              }}
                              disabled={!isSpecialAdmin}
                              size="sm"
                            />
                          )}
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {isAdminUser(user.email) || user.role === 'admin' ? (
                        <span className="font-medium text-green-600">YES</span>
                      ) : user.add_product ? (
                        <div className="flex items-center">
                          <span className="font-medium text-green-600 mr-2">YES</span>
                          {isSpecialAdmin && (
                            <Switch
                              checked={user.add_product}
                              onCheckedChange={(checked) => {
                                handlePermissionChange(user.id, 'product', 'can_add', checked);
                              }}
                              disabled={!isSpecialAdmin}
                              size="sm"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="font-medium text-red-600 mr-2">NO</span>
                          {isSpecialAdmin && (
                            <Switch
                              checked={user.add_product}
                              onCheckedChange={(checked) => {
                                handlePermissionChange(user.id, 'product', 'can_add', checked);
                              }}
                              disabled={!isSpecialAdmin}
                              size="sm"
                            />
                          )}
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {isAdminUser(user.email) || user.role === 'admin' ? (
                        <span className="font-medium text-green-600">YES</span>
                      ) : user.edit_pricehist ? (
                        <div className="flex items-center">
                          <span className="font-medium text-green-600 mr-2">YES</span>
                          {isSpecialAdmin && (
                            <Switch
                              checked={user.edit_pricehist}
                              onCheckedChange={(checked) => {
                                handlePermissionChange(user.id, 'pricehist', 'can_edit', checked);
                              }}
                              disabled={!isSpecialAdmin}
                              size="sm"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="font-medium text-red-600 mr-2">NO</span>
                          {isSpecialAdmin && (
                            <Switch
                              checked={user.edit_pricehist}
                              onCheckedChange={(checked) => {
                                handlePermissionChange(user.id, 'pricehist', 'can_edit', checked);
                              }}
                              disabled={!isSpecialAdmin}
                              size="sm"
                            />
                          )}
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {isAdminUser(user.email) || user.role === 'admin' ? (
                        <span className="font-medium text-green-600">YES</span>
                      ) : user.delete_pricehist ? (
                        <div className="flex items-center">
                          <span className="font-medium text-green-600 mr-2">YES</span>
                          {isSpecialAdmin && (
                            <Switch
                              checked={user.delete_pricehist}
                              onCheckedChange={(checked) => {
                                handlePermissionChange(user.id, 'pricehist', 'can_delete', checked);
                              }}
                              disabled={!isSpecialAdmin}
                              size="sm"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="font-medium text-red-600 mr-2">NO</span>
                          {isSpecialAdmin && (
                            <Switch
                              checked={user.delete_pricehist}
                              onCheckedChange={(checked) => {
                                handlePermissionChange(user.id, 'pricehist', 'can_delete', checked);
                              }}
                              disabled={!isSpecialAdmin}
                              size="sm"
                            />
                          )}
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {isAdminUser(user.email) || user.role === 'admin' ? (
                        <span className="font-medium text-green-600">YES</span>
                      ) : user.add_pricehist ? (
                        <div className="flex items-center">
                          <span className="font-medium text-green-600 mr-2">YES</span>
                          {isSpecialAdmin && (
                            <Switch
                              checked={user.add_pricehist}
                              onCheckedChange={(checked) => {
                                handlePermissionChange(user.id, 'pricehist', 'can_add', checked);
                              }}
                              disabled={!isSpecialAdmin}
                              size="sm"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="font-medium text-red-600 mr-2">NO</span>
                          {isSpecialAdmin && (
                            <Switch
                              checked={user.add_pricehist}
                              onCheckedChange={(checked) => {
                                handlePermissionChange(user.id, 'pricehist', 'can_add', checked);
                              }}
                              disabled={!isSpecialAdmin}
                              size="sm"
                            />
                          )}
                        </div>
                      )}
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

export default UserPermissionsTable;
