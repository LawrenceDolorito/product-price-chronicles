
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Plus, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

type PriceHistoryItem = {
  prodcode: string;
  effdate: string;
  unitprice: number;
};

type ProductInfo = {
  prodcode: string;
  description: string | null;
  unit: string | null;
};

interface PriceHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productCode: string | null;
}

const formSchema = z.object({
  effdate: z.date({
    required_error: "Effective date is required",
  }),
  unitprice: z.coerce
    .number()
    .positive("Price must be a positive number")
    .multipleOf(0.01, "Price can have at most 2 decimal places"),
});

const PriceHistoryDialog: React.FC<PriceHistoryDialogProps> = ({
  isOpen,
  onClose,
  productCode,
}) => {
  const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<PriceHistoryItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      effdate: new Date(),
      unitprice: 0,
    },
  });

  // Fetch product information and price history
  useEffect(() => {
    if (isOpen && productCode) {
      fetchProductInfo();
      fetchPriceHistory();
    }
  }, [isOpen, productCode]);

  const fetchProductInfo = async () => {
    if (!productCode) return;

    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching product info for:", productCode);
      
      const { data, error } = await supabase
        .from("product")
        .select("prodcode, description, unit")
        .eq("prodcode", productCode)
        .single();

      if (error) {
        console.error("Error fetching product info:", error);
        throw error;
      }
      
      console.log("Product info fetched:", data);
      setProductInfo(data);
    } catch (error) {
      console.error("Error fetching product info:", error);
      setError("Failed to fetch product information");
      toast.error("Failed to fetch product information");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPriceHistory = async () => {
    if (!productCode) return;

    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching price history for:", productCode);
      
      const { data, error } = await supabase
        .from("pricehist")
        .select("prodcode, effdate, unitprice")
        .eq("prodcode", productCode)
        .order("effdate", { ascending: false });

      if (error) {
        console.error("Error fetching price history:", error);
        throw error;
      }
      
      console.log("Price history fetched:", data);
      setPriceHistory(data || []);
    } catch (error) {
      console.error("Error fetching price history:", error);
      setError("Failed to fetch price history");
      toast.error("Failed to fetch price history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    form.reset({
      effdate: new Date(),
      unitprice: 0,
    });
    setIsEditing(false);
    setCurrentItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: PriceHistoryItem) => {
    form.reset({
      effdate: new Date(item.effdate),
      unitprice: item.unitprice,
    });
    setIsEditing(true);
    setCurrentItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (date: string) => {
    if (!productCode) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("pricehist")
        .delete()
        .eq("prodcode", productCode)
        .eq("effdate", date);
        
      if (error) throw error;
      
      toast.success("Price history entry deleted successfully");
      await fetchPriceHistory();
    } catch (error) {
      console.error("Error deleting price history:", error);
      toast.error("Failed to delete price history entry");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!productCode) return;
    
    try {
      setIsLoading(true);
      const formattedDate = format(values.effdate, "yyyy-MM-dd");
      
      if (isEditing && currentItem) {
        // Delete the old record first (since effdate is part of the primary key)
        const { error: deleteError } = await supabase
          .from("pricehist")
          .delete()
          .eq("prodcode", productCode)
          .eq("effdate", currentItem.effdate);
          
        if (deleteError) throw deleteError;
      }
      
      // Insert the new record
      const { error } = await supabase
        .from("pricehist")
        .insert({
          prodcode: productCode,
          effdate: formattedDate,
          unitprice: values.unitprice,
        });
        
      if (error) throw error;
      
      toast.success(`Price history ${isEditing ? "updated" : "added"} successfully`);
      await fetchPriceHistory();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving price history:", error);
      toast.error(`Failed to ${isEditing ? "update" : "add"} price history`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  // If loading, show a loading state
  if (isLoading && !productInfo && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading product information...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If there's an error, show an error state
  if (error && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex flex-col items-center justify-center h-40">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-red-500 font-semibold">{error}</p>
            <Button onClick={() => { fetchProductInfo(); fetchPriceHistory(); }} className="mt-4">
              Retry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Price History</DialogTitle>
          </DialogHeader>
          
          {productInfo && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <span className="font-medium">Product Code</span>
                <p>{productInfo.prodcode}</p>
              </div>
              <div>
                <span className="font-medium">Description</span>
                <p>{productInfo.description || "—"}</p>
              </div>
              <div>
                <span className="font-medium">Unit</span>
                <p>{productInfo.unit || "—"}</p>
              </div>
            </div>
          )}
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Effectivity Date</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No price history found
                    </TableCell>
                  </TableRow>
                ) : (
                  priceHistory.map((item) => (
                    <TableRow key={item.effdate}>
                      <TableCell>{format(new Date(item.effdate), "yyyy-MM-dd")}</TableCell>
                      <TableCell>${item.unitprice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil size={16} />
                            <span className="ml-1">Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleDelete(item.effdate)}
                          >
                            <Trash2 size={16} />
                            <span className="ml-1">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button onClick={handleAddNew}>
              <Plus size={16} className="mr-1" />
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Dialog for Add/Edit */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Price" : "Add New Price"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="effdate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Effectivity Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="unitprice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          className="pl-7"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PriceHistoryDialog;
