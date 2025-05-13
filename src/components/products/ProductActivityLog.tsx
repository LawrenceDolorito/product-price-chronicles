
import React from "react";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ProductActivity = {
  product: string;
  action: string;
  user: string;
  timestamp: string;
  id: string;
};

interface ProductActivityLogProps {
  activityLoading: boolean;
  productActivity: ProductActivity[];
  isAdmin: boolean;
  handleRecover: (productId: string) => void;
}

const ProductActivityLog = ({
  activityLoading,
  productActivity,
  isAdmin,
  handleRecover
}: ProductActivityLogProps) => {
  return (
    <Card className="mb-8">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Product Activity Log</CardTitle>
        <CardDescription>
          Real-time log of product status changes and actions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activityLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2">Loading activity...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : productActivity.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No product activity found
                </TableCell>
              </TableRow>
            ) : (
              productActivity.map((activity) => (
                <TableRow key={`${activity.id}-${activity.timestamp}`}>
                  <TableCell>{activity.product}</TableCell>
                  <TableCell>{activity.action}</TableCell>
                  <TableCell>{activity.timestamp}</TableCell>
                  <TableCell>
                    {activity.action !== "RECOVERED" && isAdmin && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRecover(activity.id)}
                      >
                        Recover
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProductActivityLog;
