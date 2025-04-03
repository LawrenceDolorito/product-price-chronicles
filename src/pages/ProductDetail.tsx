
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import PriceChart from "@/components/PriceChart";
import { getProductById } from "@/data/sampleData";
import { Product } from "@/types/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Share2, ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      const foundProduct = getProductById(id);
      if (foundProduct) {
        setProduct(foundProduct);
      }
      setIsLoading(false);
    }
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
  
  if (!product) {
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
    name, 
    description, 
    currentPrice, 
    currency, 
    imageUrl, 
    category, 
    priceHistory, 
    lowestPrice, 
    highestPrice 
  } = product;
  
  const previousPrice = priceHistory.length > 1 
    ? priceHistory[priceHistory.length - 2].price 
    : currentPrice;
    
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = ((priceChange / previousPrice) * 100).toFixed(1);
  
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            <div className="flex flex-col">
              <div className="bg-gray-100 rounded-lg overflow-hidden h-80">
                <img 
                  src={imageUrl} 
                  alt={name} 
                  className="w-full h-full object-contain p-4"
                />
              </div>
              
              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Price History</h2>
                <PriceChart
                  priceHistory={priceHistory}
                  lowestPrice={lowestPrice}
                  highestPrice={highestPrice}
                  currency={currency}
                />
              </div>
            </div>
            
            <div>
              <Badge className="mb-2">{category}</Badge>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{name}</h1>
              
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-3xl font-bold text-primary">{currency}{currentPrice}</span>
                {!isPriceUnchanged && (
                  <span className={`text-sm font-medium ${isPriceDown ? 'text-green-600' : 'text-red-600'}`}>
                    {isPriceDown ? <ArrowDown size={18} className="inline mr-1" /> : <ArrowUp size={18} className="inline mr-1" />}
                    {Math.abs(Number(priceChangePercent))}% since last check
                  </span>
                )}
                {isPriceUnchanged && (
                  <span className="text-sm font-medium text-gray-500">
                    <Minus size={18} className="inline mr-1" /> Unchanged
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                <span>All-time low: {currency}{lowestPrice}</span>
                <span>•</span>
                <span>All-time high: {currency}{highestPrice}</span>
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
                <p className="text-gray-600">{description}</p>
              </div>
              
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Price Analysis</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Current vs. Average</span>
                    <span className={`font-medium ${currentPrice < (lowestPrice + highestPrice) / 2 ? 'text-green-600' : 'text-red-600'}`}>
                      {currentPrice < (lowestPrice + highestPrice) / 2 ? 'Below average' : 'Above average'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Price Volatility</span>
                    <span className="font-medium">
                      {(highestPrice - lowestPrice) / highestPrice > 0.2 ? 'High' : 'Low'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Buy Recommendation</span>
                    <span className={`font-medium ${currentPrice - lowestPrice < (highestPrice - lowestPrice) * 0.2 ? 'text-green-600' : 'text-amber-600'}`}>
                      {currentPrice - lowestPrice < (highestPrice - lowestPrice) * 0.2 ? 'Good time to buy' : 'Wait for a price drop'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
