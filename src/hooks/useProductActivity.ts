
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
      
      // Get all user profiles to map IDs to names
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');
      
      // Create a map of user IDs to names
      const userMap = new Map();
      if (profilesData) {
        profilesData.forEach((profile: any) => {
          const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
          userMap.set(profile.id, name || 'Unknown User');
        });
      }
      
      // Transform into activity entries
      const activities: ProductActivity[] = productsData.map((product: any) => {
        // Try to extract user ID from status if it contains JSON
        let userId = null;
        let userName = 'System';
        let statusText = product.status || 'UNKNOWN';
        
        try {
          // Check if status might be JSON with user info
          if (product.status && (product.status.includes('{') || product.status.includes('['))) {
            const statusObj = JSON.parse(product.status);
            if (statusObj.userId) {
              userId = statusObj.userId;
              userName = userMap.get(userId) || 'Unknown User';
              statusText = statusObj.action || statusObj.status || 'UPDATED';
            }
          }
        } catch (e) {
          // Not JSON, use as is
        }
        
        return {
          id: product.prodcode,
          product: product.description || product.prodcode,
          action: statusText,
          user: userName,
          timestamp: new Date(product.stamp).toLocaleString(),
        };
      });
      
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
      // Store who performed the recovery
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      // Create a status object with user info
      const statusObject = {
        action: 'RECOVERED',
        userId: userId,
        timestamp: new Date().toISOString()
      };
      
      await supabase
        .from('product')
        .update({ 
          status: JSON.stringify(statusObject),
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
