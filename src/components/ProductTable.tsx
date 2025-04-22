
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
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PriceHistoryDialog from "./PriceHistoryDialog";
import DatabaseConnectionError from "./products/DatabaseConnectionError";
import LoadingState from "./products/LoadingState";
import ProductTableRow from "./products/ProductTableRow";

type ProductWithPrice = {
  prodcode: string;
  description: string;
  unit: string;
  current_price: number | null;
};

interface ProductTableProps {
  searchQuery?: string;
}

const ProductTable = ({ searchQuery = "" }: ProductTableProps) => {
  const [products, setProducts] = useState<ProductWithPrice[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isPriceHistoryOpen, setIsPriceHistoryOpen] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log("Checking database connection...");
        const { data, error } = await supabase
          .rpc('get_products_with_current_price', {}, { count: 'exact', head: true });
        
        if (error) {
          console.error("Database connection error:", error);
          setConnectionStatus(false);
          setError("Cannot connect to the database. Please check your connection.");
          return;
        }
        
        console.log("RPC connection successful");
        setConnectionStatus(true);
      } catch (err) {
        console.error("Connection check error:", err);
        setConnectionStatus(false);
        setError("Failed to check database connection");
      }
    };

    checkConnection();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .rpc('get_products_with_current_price');

        if (error) throw error;
        
        if (!data || data.length === 0) {
          console.log("No products found in database");
          toast.info("No products found in the database. You might need to add some products first.");
        }
        
        setProducts(data || []);
        setFilteredProducts(data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (connectionStatus) {
      fetchProducts();
    }
  }, [connectionStatus]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = products.filter(
      (product) => 
        product.prodcode.toLowerCase().includes(query) || 
        (product.description && product.description.toLowerCase().includes(query))
    );
    
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const handleAddDummyData = async () => {
    try {
      setLoading(true);
      toast.info("Adding sample product data...");
      
      // Add some sample product data
      const { error: productError } = await supabase
        .from('product')
        .insert([
          { prodcode: 'PROD001', description: 'Office Chair', unit: 'each' },
          { prodcode: 'PROD002', description: 'Desk Lamp', unit: 'each' },
          { prodcode: 'PROD003', description: 'Notebook', unit: 'dozen' }
        ]);
      
      if (productError) throw productError;
      
      // Add price history for these products
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { error: priceError } = await supabase
        .from('pricehist')
        .insert([
          { prodcode: 'PROD001', effdate: today.toISOString().split('T')[0], unitprice: 149.99 },
          { prodcode: 'PROD002', effdate: today.toISOString().split('T')[0], unitprice: 35.50 },
          { prodcode: 'PROD003', effdate: today.toISOString().split('T')[0], unitprice: 12.99 },
          { prodcode: 'PROD001', effdate: yesterday.toISOString().split('T')[0], unitprice: 159.99 },
          { prodcode: 'PROD002', effdate: yesterday.toISOString().split('T')[0], unitprice: 32.75 }
        ]);
        
      if (priceError) throw priceError;
      
      toast.success("Sample data added successfully!");
      navigate(0);
    } catch (err) {
      console.error("Error adding sample data:", err);
      toast.error("Failed to add sample data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (connectionStatus === false) {
    return (
      <DatabaseConnectionError 
        onRetry={() => navigate(0)}
        onAddSampleData={handleAddDummyData}
        loading={loading}
      />
    );
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
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
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  {searchQuery ? 
                    "No products found matching your search" : 
                    "No products found in the database. Use the 'Add Product' button to add some products."}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <ProductTableRow
                  key={product.prodcode}
                  product={product}
                  onRowClick={() => {
                    setSelectedProduct(product.prodcode);
                    setIsPriceHistoryOpen(true);
                  }}
                  onShowPriceHistory={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(product.prodcode);
                    setIsPriceHistoryOpen(true);
                  }}
                  onEdit={(e) => {
                    e.stopPropagation();
                    navigate(`/product/${product.prodcode}`);
                  }}
                  onDelete={(e) => {
                    e.stopPropagation();
                    toast.info(`Delete functionality would remove product: ${product.prodcode}`);
                  }}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PriceHistoryDialog 
        isOpen={isPriceHistoryOpen}
        onClose={() => {
          setIsPriceHistoryOpen(false);
          setSelectedProduct(null);
        }}
        productCode={selectedProduct}
      />
    </>
  );
};

export default ProductTable;
