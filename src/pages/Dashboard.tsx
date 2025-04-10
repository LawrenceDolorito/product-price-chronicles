
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package, DollarSign, History, Users, Barcode } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

type ProductWithPrice = {
  prodcode: string;
  description: string;
  unit: string;
  current_price: number | null;
};

type ProductCategory = {
  unit: string;
  count: number;
  avgPrice: number;
};

type PriceChange = {
  prodcode: string;
  description: string;
  oldPrice: number;
  newPrice: number;
  date: string;
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductWithPrice[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [recentPriceChanges, setRecentPriceChanges] = useState<PriceChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    avgPrice: 0,
    categoriesCount: 0
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products with current price
        const { data: productsData, error: productsError } = await supabase
          .rpc('get_products_with_current_price') as {
            data: ProductWithPrice[] | null;
            error: Error | null;
          };

        if (productsError) throw productsError;
        
        const products = productsData || [];
        setProducts(products);
        
        // Calculate statistics
        if (products.length > 0) {
          // Total products
          const totalProducts = products.length;
          
          // Average price
          const productsWithPrice = products.filter(p => p.current_price !== null);
          const avgPrice = productsWithPrice.length > 0 
            ? productsWithPrice.reduce((sum, p) => sum + (p.current_price || 0), 0) / productsWithPrice.length
            : 0;
            
          // Categories
          const uniqueUnits = Array.from(new Set(products.map(p => p.unit).filter(Boolean)));
          
          // Prepare category data for chart
          const categoryData = uniqueUnits.map(unit => {
            const productsInCategory = products.filter(p => p.unit === unit);
            const categoryAvgPrice = productsInCategory
              .filter(p => p.current_price !== null)
              .reduce((sum, p) => sum + (p.current_price || 0), 0) / 
              productsInCategory.filter(p => p.current_price !== null).length || 0;
              
            return {
              unit: unit || 'Unknown',
              count: productsInCategory.length,
              avgPrice: parseFloat(categoryAvgPrice.toFixed(2))
            };
          });
          
          setStats({
            totalProducts,
            avgPrice,
            categoriesCount: uniqueUnits.length
          });
          
          setCategories(categoryData);
        }
        
        // Fetch recent price changes - normally would come from the database
        // Using more realistic mock data for now
        const currentDate = new Date();
        setRecentPriceChanges([
          { 
            prodcode: 'P1001', 
            description: 'Organic Apples', 
            oldPrice: 10.99, 
            newPrice: 12.99, 
            date: new Date(currentDate.setDate(currentDate.getDate() - 1)).toISOString().split('T')[0] 
          },
          { 
            prodcode: 'P1002', 
            description: 'Free Range Eggs', 
            oldPrice: 25.50, 
            newPrice: 22.99, 
            date: new Date(currentDate.setDate(currentDate.getDate() - 2)).toISOString().split('T')[0] 
          },
          { 
            prodcode: 'P1003', 
            description: 'Whole Grain Bread', 
            oldPrice: 5.99, 
            newPrice: 7.50, 
            date: new Date(currentDate.setDate(currentDate.getDate() - 3)).toISOString().split('T')[0] 
          },
          { 
            prodcode: 'P1004', 
            description: 'Organic Milk', 
            oldPrice: 8.75, 
            newPrice: 9.25, 
            date: new Date(currentDate.setDate(currentDate.getDate() - 4)).toISOString().split('T')[0] 
          },
        ]);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Loading dashboard data...</span>
          </div>
        </main>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            <p>{error}</p>
            <Button onClick={() => navigate(0)} className="mt-2">Retry</Button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your product inventory and statistics
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Package className="mr-2 h-5 w-5 text-primary" />
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalProducts}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Across {stats.categoriesCount} categories
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <DollarSign className="mr-2 h-5 w-5 text-primary" />
                Average Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${stats.avgPrice.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Based on products with pricing
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Barcode className="mr-2 h-5 w-5 text-primary" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.categoriesCount}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Distinct product units
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Category Chart and Recent Price Changes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Products by Category</CardTitle>
              <CardDescription>
                Distribution of products across different units
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartContainer
                  config={{
                    count: { label: "Product Count" },
                    avgPrice: { label: "Avg Price ($)" },
                  }}
                >
                  <BarChart 
                    width={500} 
                    height={300} 
                    data={categories}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="unit" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" name="Product Count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="avgPrice" name="Avg Price ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="mr-2 h-5 w-5" />
                Recent Price Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPriceChanges.map((change, index) => (
                  <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{change.description}</p>
                        <p className="text-sm text-muted-foreground">{change.prodcode}</p>
                      </div>
                      <div className="text-right">
                        <p className={
                          change.newPrice > change.oldPrice 
                            ? "text-red-600 font-medium" 
                            : "text-green-600 font-medium"
                        }>
                          {change.newPrice > change.oldPrice ? "↑" : "↓"} ${change.newPrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          was ${change.oldPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{change.date}</p>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate("/reports")}
              >
                View All Price History
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-md shadow-md">
        <p className="font-medium">{`${payload[0].payload.unit}`}</p>
        <p className="text-sm">{`Products: ${payload[0].value}`}</p>
        <p className="text-sm">{`Avg Price: $${payload[1].value}`}</p>
      </div>
    );
  }
  return null;
};

export default Dashboard;
