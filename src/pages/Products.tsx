
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import ProductTable from "@/components/ProductTable";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">
              View all products and their current prices
            </p>
          </div>
          
          <Button className="flex items-center gap-2 mt-4 md:mt-0">
            <PlusCircle size={16} />
            <span>Add Product</span>
          </Button>
        </div>
        
        <div className="relative mb-6">
          <div className="flex gap-2 max-w-md">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
        </div>
        
        <ProductTable searchQuery={searchQuery} />
      </main>
    </div>
  );
};

export default Products;
