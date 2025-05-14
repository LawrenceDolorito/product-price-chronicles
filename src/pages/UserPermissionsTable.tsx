import React from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Shield, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import UserSearchBar from "@/components/users/UserSearchBar";
import UserPermissionsList from "@/components/users/UserPermissionsList";
import ProductActivityLog from "@/components/products/ProductActivityLog";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useProductActivity } from "@/hooks/useProductActivity";

// Define admin email constant
const ADMIN_EMAIL = "doloritolawrence@gmail.com";

const UserPermissionsTable = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.email === ADMIN_EMAIL;
  
  const {
    filteredUsers,
    searchQuery,
    setSearchQuery,
    loading,
    handlePermissionChange,
    seedReferenceUsers,
    createViewOnlyUser
  } = useUserPermissions();

  const {
    productActivity,
    activityLoading,
    handleRecover
  } = useProductActivity();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage User</h1>
            <p className="text-gray-600 mt-1">
              Manage user permissions for product and price history tables
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            {isAdmin && (
              <>
                <Button
                  variant="outline"
                  onClick={createViewOnlyUser}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Create View-Only User
                </Button>
                <Button
                  variant="secondary"
                  onClick={seedReferenceUsers}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Add Reference Users
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={() => navigate('/admin/user-management')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to User Management
            </Button>
          </div>
        </div>
        
        {/* Search Bar Component */}
        <UserSearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        
        {/* User Permissions List Component */}
        <UserPermissionsList
          users={filteredUsers}
          loading={loading}
          isAdmin={isAdmin}
          adminEmail={ADMIN_EMAIL}
          handlePermissionChange={handlePermissionChange}
        />
        
        {/* Product Activity Log Component */}
        <ProductActivityLog 
          activityLoading={activityLoading}
          productActivity={productActivity}
          isAdmin={isAdmin}
          handleRecover={handleRecover}
        />
      </main>
    </div>
  );
};

export default UserPermissionsTable;
