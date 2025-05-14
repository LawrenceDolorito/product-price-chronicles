
import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserListHeaderProps {
  isAdmin: boolean;
}

const UserListHeader = ({ isAdmin }: UserListHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">
          Manage user accounts, roles, and permissions
        </p>
        {!isAdmin && (
          <p className="text-orange-500 mt-2">
            Note: Only administrators can modify user roles and permissions
          </p>
        )}
      </div>
      <div className="mt-4 md:mt-0">
        <Button
          variant="default"
          onClick={() => navigate('/admin/user-permissions')}
          className="flex items-center gap-2"
        >
          <ExternalLink size={16} />
          Manage Table Permissions
        </Button>
      </div>
    </div>
  );
};

export default UserListHeader;
