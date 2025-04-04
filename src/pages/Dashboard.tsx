
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2 } from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

type ProductWithPrice = {
  prodcode: string;
  description: string;
  unit: string;
  current_price: number | null;
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [products, setProducts] = useState<ProductWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
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
  
  // Get unique units from products for filtering
  const units = Array.from(
    new Set(products.map((product) => product.unit).filter(Boolean))
  );
  
  // Filter products based on search term and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (product.prodcode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all"
      ? true
      : product.unit === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Inventory</h1>
            <p className="text-gray-600 mt-1">
              Manage your product catalog and track prices
            </p>
          </div>
        </div>
        
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search products by code or description..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="w-full md:w-48">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Units" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Loading products...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            <p>{error}</p>
            <Button onClick={() => navigate(0)} className="mt-2">Retry</Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableCaption>
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </TableCaption>
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
                      <Filter className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-lg font-medium text-gray-900">No products found</p>
                      <p className="mt-1 text-gray-500">
                        Try adjusting your search or filter to find what you're looking for.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.prodcode} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/product/${product.prodcode}`)}>
                      <TableCell className="font-medium">{product.prodcode}</TableCell>
                      <TableCell>{product.description || "—"}</TableCell>
                      <TableCell>{product.unit || "—"}</TableCell>
                      <TableCell className="text-right">
                        {product.current_price !== null
                          ? `$${product.current_price.toFixed(2)}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.prodcode}`);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
