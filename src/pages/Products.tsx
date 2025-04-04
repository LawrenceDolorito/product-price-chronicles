
import React from "react";
import Navbar from "@/components/Navbar";
import ProductTable from "@/components/ProductTable";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Products = () => {
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
        
        <ProductTable />
      </main>
    </div>
  );
};

export default Products;
