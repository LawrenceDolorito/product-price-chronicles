
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserPermissionRow = {
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

export function useUserPermissions() {
  const [users, setUsers] = useState<UserPermissionRow[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserPermissionRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

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

  const createViewOnlyUser = async () => {
    try {
      // Generate a unique username for the view-only user
      const timestamp = new Date().getTime();
      const viewerEmail = `viewer${timestamp}@example.com`;
      const viewerPassword = `Viewer${timestamp}!`;
      
      // 1. First create a user profile
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(),
          first_name: "View-Only",
          last_name: "User",
          email: viewerEmail,
          role: "viewer",
          role_key: "viewer",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
        
      if (userError) throw userError;
      
      const newUserId = userData[0].id;
      
      // 2. Create no-permissions for product table
      await supabase
        .from('user_permissions')
        .insert({
          user_id: newUserId,
          table_name: "product",
          can_add: false,
          can_edit: false,
          can_delete: false
        });
      
      // 3. Create no-permissions for pricehist table
      await supabase
        .from('user_permissions')
        .insert({
          user_id: newUserId,
          table_name: "pricehist",
          can_add: false,
          can_edit: false,
          can_delete: false
        });
      
      toast.success(`View-only user created successfully!`, {
        description: `Email: ${viewerEmail} | Password: ${viewerPassword}`,
        duration: 10000
      });
      
      // Refresh user list
      fetchUsersWithPermissions();
      
      return { viewerEmail, viewerPassword };
    } catch (error) {
      console.error("Error creating view-only user:", error);
      toast.error("Failed to create view-only user");
      return null;
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

  const handlePermissionChange = async (
    userId: string, 
    table: 'product' | 'pricehist', 
    permission: 'can_add' | 'can_edit' | 'can_delete',
    value: boolean
  ) => {
    try {
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

  useEffect(() => {
    fetchUsersWithPermissions();
    
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

  return {
    users,
    filteredUsers,
    searchQuery,
    setSearchQuery,
    loading,
    handlePermissionChange,
    seedReferenceUsers,
    createViewOnlyUser
  };
}
