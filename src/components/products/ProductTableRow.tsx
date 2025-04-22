
import { TableCell, TableRow } from "@/components/ui/table";
import ProductTableActions from "./ProductTableActions";

interface ProductTableRowProps {
  product: {
    prodcode: string;
    description: string | null;
    unit: string | null;
    current_price: number | null;
  };
  onRowClick: () => void;
  onShowPriceHistory: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ProductTableRow = ({ 
  product, 
  onRowClick,
  onShowPriceHistory,
  onEdit,
  onDelete
}: ProductTableRowProps) => {
  return (
    <TableRow 
      className="cursor-pointer hover:bg-gray-50"
      onClick={onRowClick}
    >
      <TableCell>{product.prodcode}</TableCell>
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
        />
      </TableCell>
    </TableRow>
  );
};

export default ProductTableRow;
