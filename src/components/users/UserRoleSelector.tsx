
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface UserRoleSelectorProps {
  userId: string;
  currentRole: string;
  isCurrentUser: boolean;
  isAdmin: boolean;
  onRoleChange: (newRole: string) => void;
}

const UserRoleSelector = ({ 
  userId, 
  currentRole,
  isCurrentUser,
  isAdmin,
  onRoleChange
}: UserRoleSelectorProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleChange = async (role: string) => {
    setIsUpdating(true);
    try {
      // Update both role and role_key
      const { error } = await supabase
        .from("profiles")
        .update({ role: role, role_key: role })
        .eq("id", userId);
        
      if (error) throw error;
      
      // Now update the user permissions based on role
      if (role === 'viewer') {
        // For viewer role: remove all permissions
        await updateUserPermissions(userId, 'product', false, false, false);
        await updateUserPermissions(userId, 'pricehist', false, false, false);
      } else if (role === 'user') {
        // For regular user role: set default permissions
        await updateUserPermissions(userId, 'product', true, true, false);
        await updateUserPermissions(userId, 'pricehist', true, false, false);
      }
      
      onRoleChange(role);
      toast.success(`User role updated to ${role}`);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user role");
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Helper function to update user permissions
  const updateUserPermissions = async (
    userId: string, 
    tableName: string, 
    canAdd: boolean, 
    canEdit: boolean, 
    canDelete: boolean
  ) => {
    // Check if permission record exists
    const { data: existingPermission } = await supabase
      .from("user_permissions")
      .select("id")
      .eq("user_id", userId)
      .eq("table_name", tableName)
      .single();
      
    if (existingPermission) {
      // Update existing permission
      await supabase
        .from("user_permissions")
        .update({ 
          can_add: canAdd, 
          can_edit: canEdit, 
          can_delete: canDelete,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingPermission.id);
    } else {
      // Create new permission record
      await supabase
        .from("user_permissions")
        .insert({
          user_id: userId,
          table_name: tableName,
          can_add: canAdd,
          can_edit: canEdit,
          can_delete: canDelete
        });
    }
  };

  return (
    <div className="relative min-w-[140px]">
      {isUpdating && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      <Select 
        value={currentRole} 
        onValueChange={handleRoleChange}
        disabled={!isAdmin || isCurrentUser || isUpdating}
      >
        <SelectTrigger className={isUpdating ? 'opacity-50' : ''}>
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="viewer">Viewer</SelectItem>
          <SelectItem value="blocked">Blocked</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserRoleSelector;
