import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { SupabaseRealtimePayload } from "@/types/types";
import UserSearchBar from "@/components/users/UserSearchBar";
import UserPermissionsList from "@/components/users/UserPermissionsList";
import ProductActivityLog from "@/components/products/ProductActivityLog";

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

    // Set up a subscription for real-time updates to product table changes
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

    // Set up a subscription for real-time updates to profiles table changes
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log("Profiles change detected:", payload);
          fetchUsersWithPermissions(); // Refresh users when profiles change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productChannel);
      supabase.removeChannel(profilesChannel);
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
        .order('stamp', { ascending: false })
        .limit(20); // Limiting to 20 most recent records

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

  const seedReferenceUsers = async () => {
    try {
      // Check if we already have some test users
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .in('email', ['testuser1@example.com', 'testuser2@example.com', 'testuser3@example.com']);
        
      if (checkError) throw checkError;
      
      // If we already have these test users, don't add them again
      if (existingUsers && existingUsers.length >= 3) {
        console.log('Reference users already exist');
        return;
      }
      
      // Otherwise, create our sample users
      const sampleUsers = [
        {
          id: crypto.randomUUID(),
          first_name: "John",
          last_name: "Doe",
          email: "testuser1@example.com",
          role: "user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          first_name: "Jane",
          last_name: "Smith",
          email: "testuser2@example.com",
          role: "user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          first_name: "Alex",
          last_name: "Johnson",
          email: "testuser3@example.com",
          role: "user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      // Insert the sample users
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(sampleUsers);
        
      if (insertError) throw insertError;
      
      toast.success("Reference users added successfully");
      fetchUsersWithPermissions();
    } catch (error) {
      console.error("Error adding reference users:", error);
      toast.error("Failed to add reference users");
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
            {isAdmin && (
              <Button
                variant="secondary"
                onClick={seedReferenceUsers}
                className="flex items-center gap-2"
              >
                Add Reference Users
              </Button>
            )}
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
        
        {/* Search Bar Component */}
        <UserSearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        
        {/* User Permissions List Component */}
        <UserPermissionsList
          users={filteredUsers}
          loading={loading}
          isAdmin={isAdmin}
          adminEmail={ADMIN_EMAIL}
          handlePermissionChange={handlePermissionChange}
        />
        
        {/* Product Activity Log Component */}
        <ProductActivityLog 
          activityLoading={activityLoading}
          productActivity={productActivity}
          isAdmin={isAdmin}
          handleRecover={handleRecover}
        />
      </main>
    </div>
  );
};

export default UserPermissionsTable;
