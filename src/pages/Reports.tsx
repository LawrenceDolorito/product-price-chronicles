
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FileSpreadsheet, DownloadCloud, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Reports = () => {
  const [isGeneratingMasterList, setIsGeneratingMasterList] = useState(false);
  const [isGeneratingPriceHistory, setIsGeneratingPriceHistory] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleGenerateMasterList = async () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to generate reports");
      return;
    }

    setIsGeneratingMasterList(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get all products with current prices
      const { data, error } = await supabase
        .rpc('get_products_with_current_price');
        
      if (error) throw error;
      
      // Generate CSV content
      const csvContent = [
        ['Product Code', 'Description', 'Unit', 'Current Price'],
        ...data.map(product => [
          product.prodcode,
          product.description || '',
          product.unit || '',
          product.current_price || '0'
        ])
      ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `product-master-list-${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Master list generated successfully!");
    } catch (error) {
      console.error("Error generating master list:", error);
      toast.error("Failed to generate master list");
    } finally {
      setIsGeneratingMasterList(false);
    }
  };

  const handleGeneratePriceHistoryList = async () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to generate reports");
      return;
    }
    
    setIsGeneratingPriceHistory(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get all price history entries
      const { data, error } = await supabase
        .from('pricehist')
        .select(`
          prodcode,
          effdate,
          unitprice,
          product(description)
        `)
        .order('prodcode')
        .order('effdate', { ascending: false });
        
      if (error) throw error;
      
      // Generate CSV content
      const csvContent = [
        ['Product Code', 'Description', 'Effective Date', 'Unit Price'],
        ...data.map(item => [
          item.prodcode,
          item.product?.description || '',
          item.effdate,
          item.unitprice || '0'
        ])
      ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `price-history-list-${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Price history list generated successfully!");
    } catch (error) {
      console.error("Error generating price history list:", error);
      toast.error("Failed to generate price history list");
    } finally {
      setIsGeneratingPriceHistory(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Generate Reports</h1>
          <p className="text-gray-600 mt-1">
            Generate and download product reports
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Product Master List
              </CardTitle>
              <CardDescription>
                Generate a complete list of all products with their current prices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                This report includes all product codes, descriptions, units, and current prices in CSV format.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerateMasterList} 
                disabled={isGeneratingMasterList}
                className="w-full"
              >
                {isGeneratingMasterList ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    Generate Master List
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileSpreadsheet className="mr-2 h-5 w-5" />
                Price History List
              </CardTitle>
              <CardDescription>
                Generate a historical record of all product price changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                This report includes all product price changes with effective dates in CSV format.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGeneratePriceHistoryList} 
                disabled={isGeneratingPriceHistory}
                className="w-full"
              >
                {isGeneratingPriceHistory ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    Generate Price History List
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Reports;
