
import { Button } from "@/components/ui/button";
import { Pencil, History, Trash2, RefreshCcw } from "lucide-react";

interface ProductTableActionsProps {
  onShowPriceHistory: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onRestore?: (e: React.MouseEvent) => void;
  canEdit: boolean;
  canDelete: boolean;
  isAdmin: boolean;
  showRestore?: boolean;
}

const ProductTableActions = ({ 
  onShowPriceHistory, 
  onEdit, 
  onDelete,
  onRestore,
  canEdit,
  canDelete,
  isAdmin,
  showRestore
}: ProductTableActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onShowPriceHistory}
      >
        <History size={16} />
        <span className="hidden sm:inline ml-1">Price History</span>
      </Button>
      {canEdit && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onEdit}
        >
          <Pencil size={16} />
          <span className="hidden sm:inline ml-1">Edit</span>
        </Button>
      )}
      {canDelete && !showRestore && (
        <Button 
          variant="outline" 
          size="sm"
          className="text-red-500 hover:text-red-700"
          onClick={onDelete}
        >
          <Trash2 size={16} />
          <span className="hidden sm:inline ml-1">Delete</span>
        </Button>
      )}
      {showRestore && onRestore && (
        <Button 
          variant="outline" 
          size="sm"
          className="text-amber-500 hover:text-amber-700"
          onClick={onRestore}
        >
          <RefreshCcw size={16} />
          <span className="hidden sm:inline ml-1">Restore</span>
        </Button>
      )}
    </div>
  );
};

export default ProductTableActions;
