
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

const UserPermissionsTableHeader = () => {
  return (
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
  );
};

export default UserPermissionsTableHeader;
