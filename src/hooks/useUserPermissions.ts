
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPermissionRow, SupabaseRealtimePayload } from "@/types/userPermissions";
import { fetchUsersWithPermissions } from "@/services/userProfileService";
import { updatePermission } from "@/services/permissionService";
import { createViewOnlyUser as createViewOnlyUserService, seedReferenceUsers as seedReferenceUsersService } from "@/services/userCreationService";

export type { UserPermissionRow };

export function useUserPermissions() {
  const [users, setUsers] = useState<UserPermissionRow[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserPermissionRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadUsersWithPermissions = async () => {
    setLoading(true);
    const { data } = await fetchUsersWithPermissions();
    setUsers(data);
    setFilteredUsers(data);
    setLoading(false);
  };

  const handlePermissionChange = async (
    userId: string, 
    table: 'product' | 'pricehist', 
    permission: 'can_add' | 'can_edit' | 'can_delete',
    value: boolean
  ) => {
    const result = await updatePermission(userId, table, permission, value);
    
    if (result.success) {
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
    }
  };

  const createViewOnlyUser = async () => {
    const result = await createViewOnlyUserService();
    if (result.success) {
      loadUsersWithPermissions();
      return { viewerEmail: result.viewerEmail, viewerPassword: result.viewerPassword };
    }
    return null;
  };

  const seedReferenceUsers = async () => {
    const result = await seedReferenceUsersService();
    if (result.success) {
      loadUsersWithPermissions();
    }
  };

  useEffect(() => {
    loadUsersWithPermissions();
    
    // Set up a subscription for real-time updates to profiles table changes
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload: SupabaseRealtimePayload) => {
          console.log("Profiles change detected:", payload);
          loadUsersWithPermissions(); // Refresh users when profiles change
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
