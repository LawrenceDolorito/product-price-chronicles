
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface PermissionToggleProps {
  userId: string;
  tableName: string;
  permissionType: "can_add" | "can_edit" | "can_delete";
  defaultValue: boolean;
  label: string;
  disabled?: boolean;
  showLabel?: boolean;
}

const PermissionToggle = ({
  userId,
  tableName,
  permissionType,
  defaultValue,
  label,
  disabled = false,
  showLabel = true
}: PermissionToggleProps) => {
  const [value, setValue] = useState(defaultValue);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (checked: boolean) => {
    if (disabled) return;
    
    setIsUpdating(true);
    try {
      // Check if a permission record exists for this user and table
      const { data: existingPermission } = await supabase
        .from("user_permissions")
        .select("id")
        .eq("user_id", userId)
        .eq("table_name", tableName)
        .single();
      
      if (existingPermission) {
        // Update existing permission
        const { error } = await supabase
          .from("user_permissions")
          .update({ 
            [permissionType]: checked,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingPermission.id);
          
        if (error) throw error;
      } else {
        // Create new permission record
        const { error } = await supabase
          .from("user_permissions")
          .insert({
            user_id: userId,
            table_name: tableName,
            [permissionType]: checked
          });
          
        if (error) throw error;
      }
      
      setValue(checked);
      toast.success(`${label || 'Permission'} ${checked ? 'granted' : 'revoked'}`);
    } catch (error) {
      console.error("Error updating permission:", error);
      toast.error(`Failed to update ${label.toLowerCase() || 'permission'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id={`${userId}-${tableName}-${permissionType}`}
        checked={value}
        onCheckedChange={handleToggle}
        disabled={disabled || isUpdating}
        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
      />
      {showLabel && label && (
        <Label 
          htmlFor={`${userId}-${tableName}-${permissionType}`}
          className={disabled ? "text-gray-400" : ""}
        >
          {isUpdating ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Updating...
            </span>
          ) : label}
        </Label>
      )}
    </div>
  );
};

export default PermissionToggle;
