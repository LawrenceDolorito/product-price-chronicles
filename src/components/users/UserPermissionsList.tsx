
import React from "react";
import { Table, TableBody, TableCaption } from "@/components/ui/table";
import UserPermissionsTableHeader from "./UserPermissionsTableHeader";
import EmptyOrLoadingRow from "./EmptyOrLoadingRow";
import UserPermissionRow from "./UserPermissionRow";
import { UserPermissionRow as UserPermissionRowType } from "@/hooks/useUserPermissions";

interface UserPermissionsListProps {
  users: UserPermissionRowType[];
  loading: boolean;
  isAdmin: boolean;
  adminEmail: string;
  handlePermissionChange: (
    userId: string, 
    table: 'product' | 'pricehist', 
    permission: 'can_add' | 'can_edit' | 'can_delete', 
    value: boolean
  ) => void;
}

const UserPermissionsList = ({
  users,
  loading,
  isAdmin,
  adminEmail,
  handlePermissionChange
}: UserPermissionsListProps) => {
  return (
    <div className="rounded-md border mb-8">
      <Table>
        <TableCaption>User access permissions</TableCaption>
        <UserPermissionsTableHeader />
        <TableBody>
          {loading || users.length === 0 ? (
            <EmptyOrLoadingRow 
              loading={loading} 
              colSpan={8} 
            />
          ) : (
            users.map((user) => (
              <UserPermissionRow
                key={user.id}
                user={user}
                isAdmin={isAdmin}
                adminEmail={adminEmail}
                handlePermissionChange={handlePermissionChange}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserPermissionsList;
