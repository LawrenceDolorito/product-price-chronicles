
import { AlertCircle, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DatabaseConnectionErrorProps {
  onRetry: () => void;
  onAddSampleData: () => void;
  loading: boolean;
}

const DatabaseConnectionError = ({ onRetry, onAddSampleData, loading }: DatabaseConnectionErrorProps) => {
  return (
    <div className="p-6 bg-red-50 text-red-600 rounded-lg border border-red-200">
      <div className="flex items-center mb-4">
        <AlertCircle className="h-6 w-6 mr-2" />
        <h3 className="font-semibold text-lg">Database Connection Error</h3>
      </div>
      <p className="mb-3">Cannot connect to the Supabase database. This might be due to:</p>
      <ul className="list-disc pl-5 mb-4 space-y-1">
        <li>Network connectivity issues</li>
        <li>Database configuration problems</li>
        <li>Temporary Supabase service disruption</li>
      </ul>
      <Button onClick={onRetry} className="mb-2 w-full sm:w-auto">
        Retry Connection
      </Button>
      <div className="mt-4 p-3 bg-white rounded border border-red-100 text-sm text-gray-600">
        <p className="font-medium mb-1">Troubleshooting tip:</p>
        <p>If this problem persists, try adding some sample data to your database using the button below.</p>
        <Button 
          variant="outline" 
          className="mt-2 w-full"
          onClick={onAddSampleData} 
          disabled={loading}
        >
          <Database className="mr-2 h-4 w-4" />
          Initialize Sample Data
        </Button>
      </div>
    </div>
  );
};

export default DatabaseConnectionError;
