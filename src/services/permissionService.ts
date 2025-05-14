
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function updatePermission(
  userId: string, 
  table: 'product' | 'pricehist', 
  permission: 'can_add' | 'can_edit' | 'can_delete',
  value: boolean
) {
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
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating permission:", error);
    toast.error("Failed to update permission");
    return { success: false, error };
  }
}
