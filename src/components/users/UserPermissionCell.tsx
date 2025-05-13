
import React from "react";
import { Switch } from "@/components/ui/switch";

interface UserPermissionCellProps {
  isAdmin: boolean;
  isAdminUser: boolean;
  adminEmail: string;
  userEmail: string;
  userRole: string;
  permissionValue: boolean;
  onPermissionChange: (checked: boolean) => void;
}

const UserPermissionCell = ({
  isAdmin,
  isAdminUser,
  adminEmail,
  userEmail,
  userRole,
  permissionValue,
  onPermissionChange,
}: UserPermissionCellProps) => {
  // Admin users always have permissions
  if (userEmail === adminEmail || userRole === 'admin') {
    return <span className="font-medium text-green-600">YES</span>;
  }

  // Admin can change permissions
  if (isAdmin) {
    return (
      <div className="flex items-center">
        <span className="font-medium mr-2">
          {permissionValue ? "YES" : "NO"}
        </span>
        <Switch
          checked={permissionValue}
          onCheckedChange={onPermissionChange}
        />
      </div>
    );
  }

  // Non-admin can only view permissions
  return (
    <span className="font-medium">
      {permissionValue ? "YES" : "NO"}
    </span>
  );
};

export default UserPermissionCell;
