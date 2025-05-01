
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
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);
        
      if (error) throw error;
      
      onRoleChange(role);
      toast.success(`User role updated to ${role}`);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user role");
    } finally {
      setIsUpdating(false);
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
          <SelectItem value="blocked">Blocked</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserRoleSelector;
