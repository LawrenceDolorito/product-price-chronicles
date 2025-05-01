
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PermissionToggle from "./PermissionToggle";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, DatabaseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Permission {
  id?: string;
  table_name: string;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface UserPermissionCardProps {
  userId: string;
  userRole: string;
  permissions: Permission[];
  isAdmin: boolean;
}

const UserPermissionCard = ({ 
  userId, 
  userRole,
  permissions,
  isAdmin
}: UserPermissionCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get permissions for each table
  const getTablePermission = (tableName: string): Permission => {
    return permissions.find(p => p.table_name === tableName) || {
      table_name: tableName,
      can_add: true,
      can_edit: true,
      can_delete: true
    };
  };

  const productPermissions = getTablePermission('product');
  const priceHistPermissions = getTablePermission('pricehist');
  
  const isDisabled = userRole === 'blocked' || userRole === 'admin';
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full"
    >
      <Card className="w-full">
        <CardHeader className="py-3">
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex w-full items-center justify-between p-0 h-auto"
            >
              <CardTitle className="text-md">Permissions</CardTitle>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isOpen ? "transform rotate-180" : ""
                }`}
              />
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                  <DatabaseIcon className="h-4 w-4 mr-2" /> 
                  Products Table
                </div>
                <PermissionToggle
                  userId={userId}
                  tableName="product"
                  permissionType="can_add"
                  defaultValue={productPermissions.can_add}
                  label="Add Products"
                  disabled={isDisabled || !isAdmin}
                />
                <PermissionToggle
                  userId={userId}
                  tableName="product"
                  permissionType="can_edit"
                  defaultValue={productPermissions.can_edit}
                  label="Edit Products"
                  disabled={isDisabled || !isAdmin}
                />
                <PermissionToggle
                  userId={userId}
                  tableName="product"
                  permissionType="can_delete"
                  defaultValue={productPermissions.can_delete}
                  label="Delete Products"
                  disabled={isDisabled || !isAdmin}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                  <DatabaseIcon className="h-4 w-4 mr-2" /> 
                  Price History Table
                </div>
                <PermissionToggle
                  userId={userId}
                  tableName="pricehist"
                  permissionType="can_add"
                  defaultValue={priceHistPermissions.can_add}
                  label="Add Price History"
                  disabled={isDisabled || !isAdmin}
                />
                <PermissionToggle
                  userId={userId}
                  tableName="pricehist"
                  permissionType="can_edit"
                  defaultValue={priceHistPermissions.can_edit}
                  label="Edit Price History"
                  disabled={isDisabled || !isAdmin}
                />
                <PermissionToggle
                  userId={userId}
                  tableName="pricehist"
                  permissionType="can_delete"
                  defaultValue={priceHistPermissions.can_delete}
                  label="Delete Price History"
                  disabled={isDisabled || !isAdmin}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default UserPermissionCard;
