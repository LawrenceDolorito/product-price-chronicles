
import React, { useState, useEffect } from "react";
import { supabase, checkDatabaseConnection } from "@/integrations/supabase/client";
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
import { Loader2, Pencil, Trash2, History, AlertCircle, Database } from "lucide-react";
import { toast } from "sonner";
import PriceHistoryDialog from "./PriceHistoryDialog";

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
        const { connected, error } = await checkDatabaseConnection();
        setConnectionStatus(connected);
        if (!connected) {
          console.error("Database connection failed:", error);
          setError("Cannot connect to the database. Please check your connection.");
        }
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
        
        console.log("Fetching products from Supabase...");
        
        // Direct query to products and pricehist to diagnose issues
        const productQuery = await supabase.from('product').select('*');
        console.log("Raw products query result:", productQuery);

        const priceHistQuery = await supabase.from('pricehist').select('*');
        console.log("Raw price history query result:", priceHistQuery);
        
        // Now try the function
        const { data, error } = await supabase
          .rpc('get_products_with_current_price');

        if (error) {
          console.error("Error fetching products:", error);
          throw error;
        }

        console.log("Products fetched:", data);
        
        // If data is empty, show a notice but don't treat as error
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

  // Filter products based on search query
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

  const handleEdit = (e: React.MouseEvent, prodcode: string) => {
    e.stopPropagation();
    navigate(`/product/${prodcode}`);
  };

  const handleDelete = (e: React.MouseEvent, prodcode: string) => {
    e.stopPropagation();
    // This is just a placeholder - in a real app you would delete the product
    toast.info(`Delete functionality would remove product: ${prodcode}`);
  };

  const handleRowClick = (prodcode: string) => {
    setSelectedProduct(prodcode);
    setIsPriceHistoryOpen(true);
  };

  const handlePriceHistoryClose = () => {
    setIsPriceHistoryOpen(false);
    setSelectedProduct(null);
  };

  const handleShowPriceHistory = (e: React.MouseEvent, prodcode: string) => {
    e.stopPropagation();
    setSelectedProduct(prodcode);
    setIsPriceHistoryOpen(true);
  };

  const handleAddDummyData = async () => {
    try {
      setLoading(true);
      
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
      
      // Refresh the product list
      const { data, error } = await supabase.rpc('get_products_with_current_price');
      
      if (error) throw error;
      
      setProducts(data || []);
      setFilteredProducts(data || []);
      
    } catch (err) {
      console.error("Error adding sample data:", err);
      toast.error("Failed to add sample data");
    } finally {
      setLoading(false);
    }
  };

  if (connectionStatus === false) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        <AlertCircle className="h-6 w-6 mb-2" />
        <p className="font-semibold">Database connection error</p>
        <p className="text-sm">Cannot connect to the Supabase database</p>
        <Button onClick={() => navigate(0)} className="mt-2">Retry</Button>
      </div>
    );
  }

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
        <AlertCircle className="h-6 w-6 mb-2" />
        <p className="font-semibold">Error loading products</p>
        <p className="text-sm">{error}</p>
        <Button onClick={() => navigate(0)} className="mt-2">Retry</Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Products</h2>
        
        {products.length === 0 && (
          <Button onClick={handleAddDummyData} disabled={loading}>
            <Database className="mr-2 h-4 w-4" />
            Add Sample Data
          </Button>
        )}
      </div>

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
                    "No products found in the database. Use the 'Add Sample Data' button to add some example products."}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow 
                  key={product.prodcode} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleRowClick(product.prodcode)}
                >
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
                      onClick={(e) => handleShowPriceHistory(e, product.prodcode)}
                    >
                      <History size={16} />
                      <span className="hidden sm:inline ml-1">Price History</span>
                    </Button>
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

      <PriceHistoryDialog 
        isOpen={isPriceHistoryOpen}
        onClose={handlePriceHistoryClose}
        productCode={selectedProduct}
      />
    </>
  );
};

export default ProductTable;
