
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from '@/types/users';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

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
          role_key: profile.role_key || 'user',
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
    loading,
    searchQuery,
    setSearchQuery,
    fetchUsers,
    handleRoleChange
  };
}
