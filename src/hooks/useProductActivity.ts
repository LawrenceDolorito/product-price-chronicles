
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ProductActivity = {
  product: string;
  action: string;
  user: string;
  timestamp: string;
  id: string;
};

export function useProductActivity() {
  const [productActivity, setProductActivity] = useState<ProductActivity[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const fetchProductActivity = async () => {
    setActivityLoading(true);
    try {
      // Fetch products with status changes
      const { data: productsData, error: productsError } = await supabase
        .from('product')
        .select('prodcode, description, status, stamp')
        .not('status', 'is', null)
        .order('stamp', { ascending: false })
        .limit(20); // Limiting to 20 most recent records

      if (productsError) throw productsError;
      
      // Transform into activity entries
      const activities: ProductActivity[] = productsData.map((product: any) => ({
        id: product.prodcode,
        product: product.description || product.prodcode,
        action: product.status || 'UNKNOWN',
        user: 'System', // We'll update this when we have actual user info
        timestamp: new Date(product.stamp).toLocaleString(),
      }));
      
      setProductActivity(activities);
    } catch (error) {
      console.error("Error fetching product activity:", error);
      toast.error("Failed to load product activity");
    } finally {
      setActivityLoading(false);
    }
  };

  const handleRecover = async (productId: string) => {
    try {
      await supabase
        .from('product')
        .update({ 
          status: 'RECOVERED',
          stamp: new Date().toISOString()
        })
        .eq('prodcode', productId);
      
      toast.success("Product recovered successfully");
      fetchProductActivity();
    } catch (error) {
      console.error("Error recovering product:", error);
      toast.error("Failed to recover product");
    }
  };

  useEffect(() => {
    fetchProductActivity();

    // Set up a subscription for real-time updates to product table changes
    const productChannel = supabase
      .channel('product-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product' },
        (payload) => {
          console.log("Product change detected:", payload);
          fetchProductActivity(); // Refresh activity log when products change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productChannel);
    };
  }, []);

  return {
    productActivity,
    activityLoading,
    handleRecover
  };
}
