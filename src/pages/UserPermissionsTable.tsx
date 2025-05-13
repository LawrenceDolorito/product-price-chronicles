
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Loader2, Search, ArrowLeft } from "lucide-react";
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

// Define admin email constant
const ADMIN_EMAIL = "doloritolawrence@gmail.com";

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

type ProductActivity = {
  product: string;
  action: string;
  user: string;
  timestamp: string;
  id: string;
};

const UserPermissionsTable = () => {
  const [users, setUsers] = useState<UserPermissionRow[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserPermissionRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [productActivity, setProductActivity] = useState<ProductActivity[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    fetchUsersWithPermissions();
    fetchProductActivity();

    // Set up a subscription for real-time updates to product status changes
    const productChannel = supabase
      .channel('product-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product' },
        (payload) => {
          console.log("Product change detected:", payload);
          fetchProductActivity(); // Refresh activity log when products change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productChannel);
    };
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

  const fetchProductActivity = async () => {
    setActivityLoading(true);
    try {
      // Fetch products with status changes
      const { data: productsData, error: productsError } = await supabase
        .from('product')
        .select('prodcode, description, status, stamp')
        .not('status', 'is', null)
        .order('stamp', { ascending: false });

      if (productsError) throw productsError;
      
      // Transform into activity entries
      const activities: ProductActivity[] = productsData.map((product: any) => ({
        id: product.prodcode,
        product: product.description || product.prodcode,
        action: product.status || 'UNKNOWN',
        user: 'System', // We'll update this when we have actual user info
        timestamp: new Date(product.stamp).toLocaleString(),
      }));
      
      setProductActivity(activities);
    } catch (error) {
      console.error("Error fetching product activity:", error);
      toast.error("Failed to load product activity");
    } finally {
      setActivityLoading(false);
    }
  };

  const fetchUsersWithPermissions = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles from Supabase
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) throw profilesError;
      
      // Get permissions for all users
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('*');
        
      if (permissionsError) throw permissionsError;
      
      // Combine profiles with permissions
      const usersWithPermissions = profilesData.map((profile: any) => {
        // Find permissions for product table
        const productPermissions = permissionsData.find(
          (p: any) => p.user_id === profile.id && p.table_name === 'product'
        ) || { can_add: false, can_edit: false, can_delete: false };
        
        // Find permissions for pricehist table
        const pricehistPermissions = permissionsData.find(
          (p: any) => p.user_id === profile.id && p.table_name === 'pricehist'
        ) || { can_add: false, can_edit: false, can_delete: false };
        
        return {
          id: profile.id,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || `user-${profile.id.slice(0, 8)}@example.com`,
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
    // Only allow admin to modify permissions
    if (user?.email !== ADMIN_EMAIL) {
      toast.error("Only admins can modify permissions");
      return;
    }
    
    try {
      // Check if this is the special admin - don't allow changes
      const selectedUser = users.find(u => u.id === userId);
      if (selectedUser?.email === ADMIN_EMAIL) {
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

  const handleRecover = async (productId: string) => {
    try {
      await supabase
        .from('product')
        .update({ 
          status: 'RECOVERED',
          stamp: new Date().toISOString()
        })
        .eq('prodcode', productId);
      
      toast.success("Product recovered successfully");
      fetchProductActivity();
    } catch (error) {
      console.error("Error recovering product:", error);
      toast.error("Failed to recover product");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage User</h1>
            <p className="text-gray-600 mt-1">
              Manage user permissions for product and price history tables
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/user-management')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
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
        
        {/* User Permissions Table */}
        <div className="rounded-md border mb-8">
          <Table>
            <TableCaption>User access permissions</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead colSpan={2}>User access</TableHead>
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
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Loading user permissions...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    {searchQuery ? "No users found matching your search" : "No users found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell className="font-medium">Edit Product</TableCell>
                    <TableCell>
                      {user.email === ADMIN_EMAIL || user.role === 'admin' ? (
                        <span className="font-medium text-green-600">YES</span>
                      ) : isAdmin ? (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">
                            {user.edit_product ? "YES" : "NO"}
                          </span>
                          <Switch
                            checked={user.edit_product}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(user.id, "product", "can_edit", checked)
                            }
                          />
                        </div>
                      ) : (
                        <span className="font-medium">
                          {user.edit_product ? "YES" : "NO"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.email === ADMIN_EMAIL || user.role === 'admin' ? (
                        <span className="font-medium text-green-600">YES</span>
                      ) : isAdmin ? (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">
                            {user.delete_product ? "YES" : "NO"}
                          </span>
                          <Switch
                            checked={user.delete_product}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(user.id, "product", "can_delete", checked)
                            }
                          />
                        </div>
                      ) : (
                        <span className="font-medium">
                          {user.delete_product ? "YES" : "NO"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.email === ADMIN_EMAIL || user.role === 'admin' ? (
                        <span className="font-medium text-green-600">YES</span>
                      ) : isAdmin ? (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">
                            {user.add_product ? "YES" : "NO"}
                          </span>
                          <Switch
                            checked={user.add_product}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(user.id, "product", "can_add", checked)
                            }
                          />
                        </div>
                      ) : (
                        <span className="font-medium">
                          {user.add_product ? "YES" : "NO"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.email === ADMIN_EMAIL || user.role === 'admin' ? (
                        <span className="font-medium text-green-600">YES</span>
                      ) : isAdmin ? (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">
                            {user.edit_pricehist ? "YES" : "NO"}
                          </span>
                          <Switch
                            checked={user.edit_pricehist}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(user.id, "pricehist", "can_edit", checked)
                            }
                          />
                        </div>
                      ) : (
                        <span className="font-medium">
                          {user.edit_pricehist ? "YES" : "NO"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.email === ADMIN_EMAIL || user.role === 'admin' ? (
                        <span className="font-medium text-green-600">YES</span>
                      ) : isAdmin ? (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">
                            {user.delete_pricehist ? "YES" : "NO"}
                          </span>
                          <Switch
                            checked={user.delete_pricehist}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(user.id, "pricehist", "can_delete", checked)
                            }
                          />
                        </div>
                      ) : (
                        <span className="font-medium">
                          {user.delete_pricehist ? "YES" : "NO"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.email === ADMIN_EMAIL || user.role === 'admin' ? (
                        <span className="font-medium text-green-600">YES</span>
                      ) : isAdmin ? (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">
                            {user.add_pricehist ? "YES" : "NO"}
                          </span>
                          <Switch
                            checked={user.add_pricehist}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(user.id, "pricehist", "can_add", checked)
                            }
                          />
                        </div>
                      ) : (
                        <span className="font-medium">
                          {user.add_pricehist ? "YES" : "NO"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Product Activity Log */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Status (Hidden to users)</TableHead>
                  <TableHead>Stamp (hidden to users)</TableHead>
                  <TableHead>Recover</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2">Loading activity...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : productActivity.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      No product activity found
                    </TableCell>
                  </TableRow>
                ) : (
                  productActivity.map((activity) => (
                    <TableRow key={`${activity.id}-${activity.timestamp}`}>
                      <TableCell>{activity.product}</TableCell>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell>{activity.user} - {activity.timestamp}</TableCell>
                      <TableCell>
                        {activity.action !== "RECOVERED" && isAdmin && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRecover(activity.id)}
                          >
                            Recover
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserPermissionsTable;
