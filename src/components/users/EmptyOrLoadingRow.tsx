
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface EmptyOrLoadingRowProps {
  loading: boolean;
  colSpan: number;
  emptyMessage?: string;
}

const EmptyOrLoadingRow = ({
  loading,
  colSpan,
  emptyMessage = "No users found"
}: EmptyOrLoadingRowProps) => {
  if (loading) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="text-center py-10">
          <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading user permissions...</span>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center py-10 text-muted-foreground">
        {emptyMessage}
      </TableCell>
    </TableRow>
  );
};

export default EmptyOrLoadingRow;
