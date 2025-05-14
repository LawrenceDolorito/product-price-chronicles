
import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_EMAIL } from "@/constants/admin";
import UserSearchInput from "@/components/users/UserSearchInput";
import UserListHeader from "@/components/users/UserListHeader";
import UserTable from "@/components/users/UserTable";
import { useUsers } from "@/hooks/useUsers";
import { toast } from "sonner";

const AdminUserManagement = () => {
  const { 
    users,
    filteredUsers,
    loading,
    searchQuery,
    setSearchQuery,
    fetchUsers,
    handleRoleChange 
  } = useUsers();
  const { user, profile, isAuthenticated } = useAuth();

  console.log("AdminUserManagement - Current user:", user?.email);
  console.log("AdminUserManagement - Admin email:", ADMIN_EMAIL);
  console.log("AdminUserManagement - Is admin?", user?.email === ADMIN_EMAIL);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const onRoleChange = (userId: string, newRole: string) => {
    // Only allow the admin to change roles
    if (user?.email !== ADMIN_EMAIL) {
      toast.error("Only admins can change user roles");
      return;
    }
    
    handleRoleChange(userId, newRole);
  };

  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <UserListHeader isAdmin={isAdmin} />
        <UserSearchInput 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        <UserTable 
          users={filteredUsers} 
          loading={loading} 
          isAdmin={isAdmin}
          currentUserId={user?.id}
          onRoleChange={onRoleChange}
        />
      </main>
    </div>
  );
};

export default AdminUserManagement;
