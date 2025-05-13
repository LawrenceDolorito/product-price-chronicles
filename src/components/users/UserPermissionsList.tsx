
import React from "react";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

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

interface UserPermissionsListProps {
  users: UserPermissionRow[];
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
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead colSpan={2}>User access</TableHead>
            <TableHead>Delete Product</TableHead>
            <TableHead>Add Product</TableHead>
            <TableHead>Edit Price History</TableHead>
            <TableHead>Delete Price History</TableHead>
            <TableHead>Add Price History</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10">
                <div className="flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading user permissions...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.first_name || user.last_name ? 
                    `${user.first_name} ${user.last_name}` : 
                    user.email.split('@')[0]}
                </TableCell>
                <TableCell className="font-medium">Edit Product</TableCell>
                <TableCell>
                  {user.email === adminEmail || user.role === 'admin' ? (
                    <span className="font-medium text-green-600">YES</span>
                  ) : isAdmin ? (
                    <div className="flex items-center">
                      <span className="font-medium mr-2">
                        {user.edit_product ? "YES" : "NO"}
                      </span>
                      <Switch
                        checked={user.edit_product}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(user.id, "product", "can_edit", checked)
                        }
                      />
                    </div>
                  ) : (
                    <span className="font-medium">
                      {user.edit_product ? "YES" : "NO"}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {user.email === adminEmail || user.role === 'admin' ? (
                    <span className="font-medium text-green-600">YES</span>
                  ) : isAdmin ? (
                    <div className="flex items-center">
                      <span className="font-medium mr-2">
                        {user.delete_product ? "YES" : "NO"}
                      </span>
                      <Switch
                        checked={user.delete_product}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(user.id, "product", "can_delete", checked)
                        }
                      />
                    </div>
                  ) : (
                    <span className="font-medium">
                      {user.delete_product ? "YES" : "NO"}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {user.email === adminEmail || user.role === 'admin' ? (
                    <span className="font-medium text-green-600">YES</span>
                  ) : isAdmin ? (
                    <div className="flex items-center">
                      <span className="font-medium mr-2">
                        {user.add_product ? "YES" : "NO"}
                      </span>
                      <Switch
                        checked={user.add_product}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(user.id, "product", "can_add", checked)
                        }
                      />
                    </div>
                  ) : (
                    <span className="font-medium">
                      {user.add_product ? "YES" : "NO"}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {user.email === adminEmail || user.role === 'admin' ? (
                    <span className="font-medium text-green-600">YES</span>
                  ) : isAdmin ? (
                    <div className="flex items-center">
                      <span className="font-medium mr-2">
                        {user.edit_pricehist ? "YES" : "NO"}
                      </span>
                      <Switch
                        checked={user.edit_pricehist}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(user.id, "pricehist", "can_edit", checked)
                        }
                      />
                    </div>
                  ) : (
                    <span className="font-medium">
                      {user.edit_pricehist ? "YES" : "NO"}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {user.email === adminEmail || user.role === 'admin' ? (
                    <span className="font-medium text-green-600">YES</span>
                  ) : isAdmin ? (
                    <div className="flex items-center">
                      <span className="font-medium mr-2">
                        {user.delete_pricehist ? "YES" : "NO"}
                      </span>
                      <Switch
                        checked={user.delete_pricehist}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(user.id, "pricehist", "can_delete", checked)
                        }
                      />
                    </div>
                  ) : (
                    <span className="font-medium">
                      {user.delete_pricehist ? "YES" : "NO"}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {user.email === adminEmail || user.role === 'admin' ? (
                    <span className="font-medium text-green-600">YES</span>
                  ) : isAdmin ? (
                    <div className="flex items-center">
                      <span className="font-medium mr-2">
                        {user.add_pricehist ? "YES" : "NO"}
                      </span>
                      <Switch
                        checked={user.add_pricehist}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(user.id, "pricehist", "can_add", checked)
                        }
                      />
                    </div>
                  ) : (
                    <span className="font-medium">
                      {user.add_pricehist ? "YES" : "NO"}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserPermissionsList;
