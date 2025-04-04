
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import PriceChart from "@/components/PriceChart";
import { Product } from "@/types/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Share2, ArrowDown, ArrowUp, Minus, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

type ProductWithPrice = {
  prodcode: string;
  description: string;
  unit: string;
  current_price: number | null;
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [productData, setProductData] = useState<ProductWithPrice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState({ 
    totalSales: Math.floor(Math.random() * 1000), 
    monthlySales: Math.floor(Math.random() * 100)
  });
  
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .rpc('get_products_with_current_price')
            .eq('prodcode', id)
            .single();
            
          if (error) {
            console.error("Error fetching product:", error);
            setIsLoading(false);
            return;
          }
          
          setProductData(data);
        } catch (error) {
          console.error("Error in product fetch:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchProductDetails();
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="text-center">Loading product details...</div>
        </div>
      </div>
    );
  }
  
  if (!productData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2" size={18} />
            Back
          </Button>
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900">Product not found</h3>
            <p className="mt-1 text-gray-500">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/dashboard")} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  const { 
    prodcode, 
    description, 
    unit, 
    current_price 
  } = productData;
  
  // Convert to Product type for PriceChart component
  const product: Product = {
    id: prodcode,
    name: description || 'Unnamed Product',
    description: `Unit: ${unit || 'N/A'}`,
    currentPrice: current_price || 0,
    currency: "$",
    imageUrl: "",
    category: unit || 'Uncategorized',
    priceHistory: [
      { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), price: (current_price || 0) * 1.1 },
      { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), price: (current_price || 0) * 1.05 },
      { date: new Date().toISOString().slice(0, 10), price: current_price || 0 }
    ],
    lowestPrice: (current_price || 0) * 0.9,
    highestPrice: (current_price || 0) * 1.2,
  };
  
  const priceChange = (product.priceHistory[2].price - product.priceHistory[0].price);
  const priceChangePercent = ((priceChange / product.priceHistory[0].price) * 100).toFixed(1);
  
  const isPriceDown = priceChange < 0;
  const isPriceUnchanged = priceChange === 0;
  
  const handleTrackPrice = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    toast.success("Price alert set! We'll notify you when the price drops.");
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2" size={18} />
          Back
        </Button>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-2">
              <Badge className="mb-2">{product.category}</Badge>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="flex items-center text-gray-600 cursor-help">
                    <TrendingUp size={16} className="mr-1" />
                    <span className="text-sm font-medium">Sales</span>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total sales:</span>
                    <span className="font-medium">{salesData.totalSales} units</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-500">Monthly sales:</span>
                    <span className="font-medium">{salesData.monthlySales} units</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    This product is performing {salesData.monthlySales > 50 ? 'above' : 'below'} average.
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="text-sm text-gray-500 mb-4">Product Code: {prodcode}</div>
            
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl font-bold text-primary">{product.currency}{current_price}</span>
              {!isPriceUnchanged && (
                <span className={`text-sm font-medium ${isPriceDown ? 'text-green-600' : 'text-red-600'}`}>
                  {isPriceDown ? <ArrowDown size={18} className="inline mr-1" /> : <ArrowUp size={18} className="inline mr-1" />}
                  {Math.abs(Number(priceChangePercent))}% since last month
                </span>
              )}
              {isPriceUnchanged && (
                <span className="text-sm font-medium text-gray-500">
                  <Minus size={18} className="inline mr-1" /> Unchanged
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <span>All-time low: {product.currency}{product.lowestPrice.toFixed(2)}</span>
              <span>•</span>
              <span>All-time high: {product.currency}{product.highestPrice.toFixed(2)}</span>
            </div>
            
            <div className="flex gap-4 mt-6">
              <Button onClick={handleTrackPrice} className="flex-1">
                <Bell className="mr-2" size={18} />
                Track Price
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 size={18} />
              </Button>
            </div>
            
            <Separator className="my-6" />
            
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3">About this product</h2>
              <p className="text-gray-600">{product.description}</p>
              <div className="mt-4 p-2 bg-gray-50 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Unit</span>
                  <span>{unit || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Price History</h2>
              <PriceChart
                priceHistory={product.priceHistory}
                lowestPrice={product.lowestPrice}
                highestPrice={product.highestPrice}
                currency={product.currency}
              />
            </div>
            
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Price Analysis</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Current vs. Average</span>
                  <span className={`font-medium ${current_price < (product.lowestPrice + product.highestPrice) / 2 ? 'text-green-600' : 'text-red-600'}`}>
                    {current_price < (product.lowestPrice + product.highestPrice) / 2 ? 'Below average' : 'Above average'}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Price Volatility</span>
                  <span className="font-medium">
                    {(product.highestPrice - product.lowestPrice) / product.highestPrice > 0.2 ? 'High' : 'Low'}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Buy Recommendation</span>
                  <span className={`font-medium ${current_price - product.lowestPrice < (product.highestPrice - product.lowestPrice) * 0.2 ? 'text-green-600' : 'text-amber-600'}`}>
                    {current_price - product.lowestPrice < (product.highestPrice - product.lowestPrice) * 0.2 ? 'Good time to buy' : 'Wait for a price drop'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
