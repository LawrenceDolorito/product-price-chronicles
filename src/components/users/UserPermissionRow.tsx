
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import UserPermissionCell from "./UserPermissionCell";

type UserPermissionRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  edit_product: boolean;
  delete_product: boolean;
  add_product: boolean;
  edit_pricehist: boolean;
  delete_pricehist: boolean;
  add_pricehist: boolean;
};

interface UserPermissionRowProps {
  user: UserPermissionRow;
  isAdmin: boolean;
  adminEmail: string;
  handlePermissionChange: (
    userId: string, 
    table: 'product' | 'pricehist', 
    permission: 'can_add' | 'can_edit' | 'can_delete', 
    value: boolean
  ) => void;
}

const UserPermissionRow = ({
  user,
  isAdmin,
  adminEmail,
  handlePermissionChange
}: UserPermissionRowProps) => {
  return (
    <TableRow key={user.id}>
      <TableCell>
        {user.first_name || user.last_name ? 
          `${user.first_name} ${user.last_name}` : 
          user.email.split('@')[0]}
      </TableCell>
      <TableCell className="font-medium">Edit Product</TableCell>
      <TableCell>
        <UserPermissionCell
          isAdmin={isAdmin}
          isAdminUser={false}
          adminEmail={adminEmail}
          userEmail={user.email}
          userRole={user.role}
          permissionValue={user.edit_product}
          onPermissionChange={(checked) => 
            handlePermissionChange(user.id, "product", "can_edit", checked)
          }
        />
      </TableCell>
      <TableCell>
        <UserPermissionCell
          isAdmin={isAdmin}
          isAdminUser={false}
          adminEmail={adminEmail}
          userEmail={user.email}
          userRole={user.role}
          permissionValue={user.delete_product}
          onPermissionChange={(checked) => 
            handlePermissionChange(user.id, "product", "can_delete", checked)
          }
        />
      </TableCell>
      <TableCell>
        <UserPermissionCell
          isAdmin={isAdmin}
          isAdminUser={false}
          adminEmail={adminEmail}
          userEmail={user.email}
          userRole={user.role}
          permissionValue={user.add_product}
          onPermissionChange={(checked) => 
            handlePermissionChange(user.id, "product", "can_add", checked)
          }
        />
      </TableCell>
      <TableCell>
        <UserPermissionCell
          isAdmin={isAdmin}
          isAdminUser={false}
          adminEmail={adminEmail}
          userEmail={user.email}
          userRole={user.role}
          permissionValue={user.edit_pricehist}
          onPermissionChange={(checked) => 
            handlePermissionChange(user.id, "pricehist", "can_edit", checked)
          }
        />
      </TableCell>
      <TableCell>
        <UserPermissionCell
          isAdmin={isAdmin}
          isAdminUser={false}
          adminEmail={adminEmail}
          userEmail={user.email}
          userRole={user.role}
          permissionValue={user.delete_pricehist}
          onPermissionChange={(checked) => 
            handlePermissionChange(user.id, "pricehist", "can_delete", checked)
          }
        />
      </TableCell>
      <TableCell>
        <UserPermissionCell
          isAdmin={isAdmin}
          isAdminUser={false}
          adminEmail={adminEmail}
          userEmail={user.email}
          userRole={user.role}
          permissionValue={user.add_pricehist}
          onPermissionChange={(checked) => 
            handlePermissionChange(user.id, "pricehist", "can_add", checked)
          }
        />
      </TableCell>
    </TableRow>
  );
};

export default UserPermissionRow;
