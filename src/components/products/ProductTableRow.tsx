
import { TableCell, TableRow } from "@/components/ui/table";
import ProductTableActions from "./ProductTableActions";

interface ProductTableRowProps {
  product: {
    prodcode: string;
    description: string | null;
    unit: string | null;
    current_price: number | null;
    status?: string | null;
    stamp?: string | null;
  };
  onRowClick: () => void;
  onShowPriceHistory: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onRestore?: (e: React.MouseEvent) => void;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    isAdmin: boolean;
  };
}

const ProductTableRow = ({ 
  product, 
  onRowClick,
  onShowPriceHistory,
  onEdit,
  onDelete,
  onRestore,
  permissions
}: ProductTableRowProps) => {
  const { canEdit, canDelete, isAdmin } = permissions;
  
  const getStatusBadge = () => {
    if (!product.status || !isAdmin) return null;
    
    const badgeClasses = {
      added: "bg-green-100 text-green-800",
      edited: "bg-blue-100 text-blue-800",
      deleted: "bg-red-100 text-red-800",
      restored: "bg-amber-100 text-amber-800"
    };
    
    const className = `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeClasses[product.status as keyof typeof badgeClasses] || "bg-gray-100 text-gray-800"}`;
    
    return (
      <span className={className}>
        {product.status}
      </span>
    );
  };

  const rowClasses = product.status === 'deleted' ? 'opacity-50' : '';

  return (
    <TableRow 
      className={`cursor-pointer hover:bg-gray-50 ${rowClasses}`}
      onClick={onRowClick}
    >
      <TableCell>
        {product.prodcode}
        {isAdmin && product.status && (
          <div className="mt-1">
            {getStatusBadge()}
          </div>
        )}
      </TableCell>
      <TableCell>{product.description || "—"}</TableCell>
      <TableCell>{product.unit || "—"}</TableCell>
      <TableCell className="text-right">
        {product.current_price !== null
          ? `$${product.current_price.toFixed(2)}`
          : "—"}
      </TableCell>
      <TableCell className="text-right">
        <ProductTableActions 
          onShowPriceHistory={onShowPriceHistory}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore && isAdmin && product.status === 'deleted' ? onRestore : undefined}
          canEdit={canEdit}
          canDelete={canDelete}
          isAdmin={isAdmin}
          showRestore={isAdmin && product.status === 'deleted'}
        />
      </TableCell>
    </TableRow>
  );
};

export default ProductTableRow;
