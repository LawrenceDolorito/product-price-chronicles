
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type ProductWithPrice = {
  prodcode: string;
  description: string;
  unit: string;
  current_price: number | null;
};

const ProductTable = () => {
  const [products, setProducts] = useState<ProductWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // This query gets all products with their latest price from pricehist
        // Use type assertion to work around the TypeScript error
        const { data, error } = await supabase
          .rpc('get_products_with_current_price') as {
            data: ProductWithPrice[] | null;
            error: Error | null;
          };

        if (error) {
          throw error;
        }

        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleEdit = (e: React.MouseEvent, prodcode: string) => {
    e.stopPropagation();
    navigate(`/product/${prodcode}`);
    // In a real app, you might want to navigate to an edit form
    // navigate(`/products/edit/${prodcode}`);
  };

  const handleDelete = (e: React.MouseEvent, prodcode: string) => {
    e.stopPropagation();
    // This is just a placeholder - in a real app you would delete the product
    toast.info(`Delete functionality would remove product: ${prodcode}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        <p>{error}</p>
        <Button onClick={() => navigate(0)} className="mt-2">Retry</Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>List of all products with current prices</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Product Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="text-right">Current Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                No products found
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.prodcode}>
                <TableCell>{product.prodcode}</TableCell>
                <TableCell>{product.description || "—"}</TableCell>
                <TableCell>{product.unit || "—"}</TableCell>
                <TableCell className="text-right">
                  {product.current_price !== null
                    ? `$${product.current_price.toFixed(2)}`
                    : "—"}
                </TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => handleEdit(e, product.prodcode)}
                  >
                    <Pencil size={16} />
                    <span className="hidden sm:inline ml-1">Edit</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={(e) => handleDelete(e, product.prodcode)}
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline ml-1">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;
