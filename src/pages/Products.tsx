
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Filter, Sliders } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductTable from "@/components/ProductTable";

const Products = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">
              Manage your product catalog and inventory
            </p>
          </div>
          
          <Button 
            onClick={() => navigate("/product/new")}
            className="flex items-center"
          >
            <Plus className="mr-2 h-5 w-5" /> Add Product
          </Button>
        </div>
        
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search by product code or description..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="w-full md:w-48">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="EA">Each (EA)</SelectItem>
                    <SelectItem value="KG">Kilogram (KG)</SelectItem>
                    <SelectItem value="CS">Case (CS)</SelectItem>
                    <SelectItem value="OZ">Ounce (OZ)</SelectItem>
                    <SelectItem value="BX">Box (BX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-48">
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Code: A to Z</SelectItem>
                    <SelectItem value="desc">Code: Z to A</SelectItem>
                    <SelectItem value="priceAsc">Price: Low to High</SelectItem>
                    <SelectItem value="priceDesc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center mt-4 gap-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <Filter className="mr-1 h-4 w-4" /> Filters
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <Sliders className="mr-1 h-4 w-4" /> Advanced
              </Button>
              <Button variant="ghost" size="sm" className="ml-auto">
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <ProductTable searchQuery={searchQuery} />
      </main>
    </div>
  );
};

export default Products;
