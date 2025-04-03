
import React from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "@/types/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { id, name, imageUrl, currentPrice, currency, priceHistory } = product;
  
  const previousPrice = priceHistory.length > 1 
    ? priceHistory[priceHistory.length - 2].price 
    : currentPrice;
  
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = ((priceChange / previousPrice) * 100).toFixed(1);
  
  const isPriceDown = priceChange < 0;
  const isPriceUnchanged = priceChange === 0;
  
  const handleClick = () => {
    navigate(`/product/${id}`);
  };
  
  return (
    <Card 
      className="overflow-hidden h-full hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="h-48 overflow-hidden relative">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {isPriceDown && (
          <Badge className="absolute top-2 right-2 bg-green-500">
            {priceChangePercent}% Off
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2 mb-2">{name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold">{currency}{currentPrice}</span>
          {!isPriceUnchanged && (
            <span className={`text-sm ${isPriceDown ? 'text-green-600' : 'text-red-600'}`}>
              {isPriceDown ? <ArrowDown size={16} className="inline" /> : <ArrowUp size={16} className="inline" />}
              {Math.abs(Number(priceChangePercent))}%
            </span>
          )}
          {isPriceUnchanged && (
            <span className="text-sm text-gray-500">
              <Minus size={16} className="inline" /> Unchanged
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-0 flex justify-between text-sm text-gray-500">
        <span>Lowest: {currency}{product.lowestPrice}</span>
        <span>Highest: {currency}{product.highestPrice}</span>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
