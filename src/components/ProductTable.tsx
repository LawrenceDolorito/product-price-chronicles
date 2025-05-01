
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { toast } from "sonner";
import PriceHistoryDialog from "./PriceHistoryDialog";
import DatabaseConnectionError from "./products/DatabaseConnectionError";
import LoadingState from "./products/LoadingState";
import ProductTableRow from "./products/ProductTableRow";
import { useAuth } from "@/context/AuthContext";

type ProductWithPrice = {
  prodcode: string;
  description: string;
  unit: string;
  current_price: number | null;
  status?: string;
  stamp?: string;
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
  const { profile } = useAuth();

  // Extract user permissions
  const userRole = profile?.role || 'user';
  const isAdmin = userRole === 'admin';
  const isBlocked = userRole === 'blocked';
  
  // State for table permissions
  const [productPermissions, setProductPermissions] = useState({
    canAdd: !isBlocked,
    canEdit: !isBlocked,
    canDelete: !isBlocked
  });
  const [priceHistPermissions, setPriceHistPermissions] = useState({
    canAdd: !isBlocked,
    canEdit: !isBlocked,
    canDelete: !isBlocked
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log("Checking database connection...");
        
        const { connected, error } = await checkDatabaseConnection();
        
        if (!connected) {
          console.error("Database connection error:", error);
          setConnectionStatus(false);
          setError("Cannot connect to the database. Please check your connection.");
          return;
        }
        
        console.log("Database connection successful");
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
    const fetchUserPermissions = async () => {
      if (!profile || isBlocked) return;

      try {
        const { data: productPerms, error: productError } = await supabase
          .from('user_permissions')
          .select('can_add, can_edit, can_delete')
          .eq('user_id', profile.id)
          .eq('table_name', 'product')
          .single();
          
        if (!productError && productPerms) {
          setProductPermissions({
            canAdd: isAdmin ? true : productPerms.can_add,
            canEdit: isAdmin ? true : productPerms.can_edit,
            canDelete: isAdmin ? true : productPerms.can_delete
          });
        }

        const { data: pricePerms, error: priceError } = await supabase
          .from('user_permissions')
          .select('can_add, can_edit, can_delete')
          .eq('user_id', profile.id)
          .eq('table_name', 'pricehist')
          .single();
          
        if (!priceError && pricePerms) {
          setPriceHistPermissions({
            canAdd: isAdmin ? true : pricePerms.can_add,
            canEdit: isAdmin ? true : pricePerms.can_edit,
            canDelete: isAdmin ? true : pricePerms.can_delete
          });
        }
      } catch (err) {
        console.error("Error fetching user permissions:", err);
      }
    };

    fetchUserPermissions();
  }, [profile, isAdmin, isBlocked]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .rpc('get_products_with_current_price');
        
        const { data, error } = await query;

        if (error) throw error;
        
        if (!data || data.length === 0) {
          console.log("No products found in database");
          toast.info("No products found in the database. You might need to add some products first.");
        }
        
        // If admin, fetch status and stamp information
        if (isAdmin) {
          const { data: productData, error: productError } = await supabase
            .from('product')
            .select('prodcode, status, stamp');
            
          if (!productError && productData) {
            // Merge product data with status and stamp
            const productsWithStatus = data.map((product: ProductWithPrice) => {
              const productInfo = productData.find(p => p.prodcode === product.prodcode);
              return {
                ...product,
                status: productInfo?.status || null,
                stamp: productInfo?.stamp || null
              };
            });
            setProducts(productsWithStatus || []);
            setFilteredProducts(productsWithStatus || []);
            return;
          }
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
  }, [connectionStatus, isAdmin]);

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
      
      const currentDate = new Date();
      const timestamp = currentDate.toISOString();
      
      const { error: productError } = await supabase
        .from('product')
        .insert([
          { prodcode: 'PROD001', description: 'Office Chair', unit: 'each', status: 'added', stamp: timestamp },
          { prodcode: 'PROD002', description: 'Desk Lamp', unit: 'each', status: 'added', stamp: timestamp },
          { prodcode: 'PROD003', description: 'Notebook', unit: 'dozen', status: 'added', stamp: timestamp }
        ]);
      
      if (productError) throw productError;
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { error: priceError } = await supabase
        .from('pricehist')
        .insert([
          { 
            prodcode: 'PROD001', 
            effdate: today.toISOString().split('T')[0], 
            unitprice: 149.99,
            status: 'added', 
            stamp: timestamp 
          },
          { 
            prodcode: 'PROD002', 
            effdate: today.toISOString().split('T')[0], 
            unitprice: 35.50,
            status: 'added', 
            stamp: timestamp 
          },
          { 
            prodcode: 'PROD003', 
            effdate: today.toISOString().split('T')[0], 
            unitprice: 12.99,
            status: 'added', 
            stamp: timestamp 
          },
          { 
            prodcode: 'PROD001', 
            effdate: yesterday.toISOString().split('T')[0], 
            unitprice: 159.99,
            status: 'added', 
            stamp: timestamp 
          },
          { 
            prodcode: 'PROD002', 
            effdate: yesterday.toISOString().split('T')[0], 
            unitprice: 32.75,
            status: 'added', 
            stamp: timestamp 
          }
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

  const handleRestoreProduct = async (prodcode: string) => {
    try {
      const timestamp = new Date().toISOString();
      
      const { error } = await supabase
        .from('product')
        .update({ 
          status: 'restored',
          stamp: timestamp
        })
        .eq('prodcode', prodcode);
        
      if (error) throw error;
      
      // Update the product in the state
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.prodcode === prodcode 
            ? { ...product, status: 'restored', stamp: timestamp } 
            : product
        )
      );
      setFilteredProducts(prevProducts => 
        prevProducts.map(product => 
          product.prodcode === prodcode 
            ? { ...product, status: 'restored', stamp: timestamp } 
            : product
        )
      );
      
      toast.success(`Product ${prodcode} has been restored`);
    } catch (err) {
      console.error("Error restoring product:", err);
      toast.error("Failed to restore product. Please try again.");
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
                    "No products found in the database. Use the 'Add Sample Data' button to add some products."}
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
                    if (isAdmin) {
                      // Update status instead of actual delete for admins
                      const timestamp = new Date().toISOString();
                      supabase
                        .from('product')
                        .update({ 
                          status: 'deleted',
                          stamp: timestamp 
                        })
                        .eq('prodcode', product.prodcode)
                        .then(({ error }) => {
                          if (error) {
                            console.error("Error marking product as deleted:", error);
                            toast.error(`Failed to delete product ${product.prodcode}`);
                            return;
                          }
                          
                          // Update product in state
                          setProducts(prev => 
                            prev.map(p => 
                              p.prodcode === product.prodcode 
                                ? { ...p, status: 'deleted', stamp: timestamp } 
                                : p
                            )
                          );
                          setFilteredProducts(prev => 
                            prev.map(p => 
                              p.prodcode === product.prodcode 
                                ? { ...p, status: 'deleted', stamp: timestamp } 
                                : p
                            )
                          );
                          
                          toast.success(`Product ${product.prodcode} has been deleted`);
                        });
                    } else {
                      toast.info(`Delete functionality would remove product: ${product.prodcode}`);
                    }
                  }}
                  onRestore={(e) => {
                    e.stopPropagation();
                    handleRestoreProduct(product.prodcode);
                  }}
                  permissions={{
                    canEdit: productPermissions.canEdit,
                    canDelete: productPermissions.canDelete,
                    isAdmin
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
        permissions={{
          canAdd: priceHistPermissions.canAdd,
          canEdit: priceHistPermissions.canEdit,
          canDelete: priceHistPermissions.canDelete,
          isAdmin
        }}
      />
    </>
  );
};

export default ProductTable;
