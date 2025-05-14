
import React from "react";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { User } from "@/types/users";
import UserRoleTag from "@/components/users/UserRoleTag";
import UserRoleSelector from "@/components/users/UserRoleSelector";
import UserPermissionCard from "@/components/users/UserPermissionCard";
import { ADMIN_EMAIL } from "@/constants/admin";

interface UserTableProps {
  users: User[];
  loading: boolean;
  isAdmin: boolean;
  currentUserId?: string;
  onRoleChange: (userId: string, newRole: string) => void;
}

const UserTable = ({ 
  users, 
  loading, 
  isAdmin, 
  currentUserId,
  onRoleChange 
}: UserTableProps) => {
  const isCurrentUser = (userId: string) => {
    return currentUserId === userId;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>List of all system users and their roles</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Permissions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10">
                <div className="flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading users...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className="group">
                <TableCell>
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user.email.split('@')[0]
                  }
                  {isCurrentUser(user.id) && (
                    <span className="ml-2 text-xs text-gray-500">(You)</span>
                  )}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <UserRoleTag role={user.role} />
                    <UserRoleSelector
                      userId={user.id}
                      currentRole={user.role}
                      isCurrentUser={isCurrentUser(user.id)}
                      isAdmin={isAdmin}
                      onRoleChange={(newRole) => onRoleChange(user.id, newRole)}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="w-1/3">
                  <UserPermissionCard
                    userId={user.id}
                    userRole={user.role}
                    permissions={user.permissions}
                    isAdmin={isAdmin}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
