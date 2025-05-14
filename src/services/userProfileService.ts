
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPermissionRow } from "@/types/userPermissions";

export async function fetchUsersWithPermissions() {
  try {
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
    
    return { data: usersWithPermissions, error: null };
  } catch (error) {
    console.error("Error fetching users with permissions:", error);
    toast.error("Failed to load user permissions");
    return { data: [], error };
  }
}
