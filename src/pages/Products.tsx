
import React from "react";
import Navbar from "@/components/Navbar";
import ProductTable from "@/components/ProductTable";

const Products = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">
            View all products and their current prices
          </p>
        </div>
        
        <ProductTable />
      </main>
    </div>
  );
};

export default Products;
