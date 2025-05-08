
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
      can_add: false,
      can_edit: false,
      can_delete: false
    };
  };

  const productPermissions = getTablePermission('product');
  const priceHistPermissions = getTablePermission('pricehist');
  
  // Admin or blocked users' permissions can't be modified
  const isDisabled = userRole === 'blocked' || userRole === 'admin';
  
  // Helper function to render Yes/No based on permission value
  const renderYesNo = (hasPermission: boolean) => {
    if (userRole === 'admin') return <span className="font-medium text-green-600">YES</span>;
    
    return hasPermission ? 
      <span className="font-medium text-green-600">YES</span> : 
      <span className="font-medium text-red-600">NO</span>;
  };
  
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
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm">Edit Products</span>
                    <div className="flex items-center">
                      {renderYesNo(productPermissions.can_edit)}
                      {!isDisabled && isAdmin && (
                        <div className="ml-2">
                          <PermissionToggle
                            userId={userId}
                            tableName="product"
                            permissionType="can_edit"
                            defaultValue={productPermissions.can_edit}
                            label=""
                            disabled={isDisabled || !isAdmin}
                            showLabel={false}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm">Delete Products</span>
                    <div className="flex items-center">
                      {renderYesNo(productPermissions.can_delete)}
                      {!isDisabled && isAdmin && (
                        <div className="ml-2">
                          <PermissionToggle
                            userId={userId}
                            tableName="product"
                            permissionType="can_delete"
                            defaultValue={productPermissions.can_delete}
                            label=""
                            disabled={isDisabled || !isAdmin}
                            showLabel={false}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm">Add Products</span>
                    <div className="flex items-center">
                      {renderYesNo(productPermissions.can_add)}
                      {!isDisabled && isAdmin && (
                        <div className="ml-2">
                          <PermissionToggle
                            userId={userId}
                            tableName="product"
                            permissionType="can_add"
                            defaultValue={productPermissions.can_add}
                            label=""
                            disabled={isDisabled || !isAdmin}
                            showLabel={false}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                  <DatabaseIcon className="h-4 w-4 mr-2" /> 
                  Price History Table
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm">Edit Price History</span>
                    <div className="flex items-center">
                      {renderYesNo(priceHistPermissions.can_edit)}
                      {!isDisabled && isAdmin && (
                        <div className="ml-2">
                          <PermissionToggle
                            userId={userId}
                            tableName="pricehist"
                            permissionType="can_edit"
                            defaultValue={priceHistPermissions.can_edit}
                            label=""
                            disabled={isDisabled || !isAdmin}
                            showLabel={false}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm">Delete Price History</span>
                    <div className="flex items-center">
                      {renderYesNo(priceHistPermissions.can_delete)}
                      {!isDisabled && isAdmin && (
                        <div className="ml-2">
                          <PermissionToggle
                            userId={userId}
                            tableName="pricehist"
                            permissionType="can_delete"
                            defaultValue={priceHistPermissions.can_delete}
                            label=""
                            disabled={isDisabled || !isAdmin}
                            showLabel={false}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm">Add Price History</span>
                    <div className="flex items-center">
                      {renderYesNo(priceHistPermissions.can_add)}
                      {!isDisabled && isAdmin && (
                        <div className="ml-2">
                          <PermissionToggle
                            userId={userId}
                            tableName="pricehist"
                            permissionType="can_add"
                            defaultValue={priceHistPermissions.can_add}
                            label=""
                            disabled={isDisabled || !isAdmin}
                            showLabel={false}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default UserPermissionCard;
