
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DatabaseConnectionErrorProps {
  onRetry: () => void;
  onAddSampleData: () => void;
  loading: boolean;
}

const DatabaseConnectionError = ({ onRetry, onAddSampleData, loading }: DatabaseConnectionErrorProps) => {
  return (
    <div className="p-8 bg-red-50 text-red-600 rounded-lg border border-red-200 flex flex-col items-center text-center max-w-2xl mx-auto my-8">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="font-semibold text-xl mb-2">Database Connection Error</h3>
      <p className="mb-4">Could not connect to the Supabase database. This might be due to network issues or database configuration problems.</p>
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Button onClick={onRetry}>
          Retry Connection
        </Button>
        <Button 
          variant="outline" 
          onClick={onAddSampleData}
          disabled={loading}
        >
          Add Sample Data
        </Button>
      </div>
    </div>
  );
};

export default DatabaseConnectionError;
