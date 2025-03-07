import { AlertCircle } from "lucide-react";
import { Button } from "./button";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center">
      <div className="flex justify-center mb-2">
        <AlertCircle className="h-10 w-10 text-red-400" />
      </div>
      <h4 className="text-lg font-medium text-red-400 mb-2">Ocorreu um erro</h4>
      <p className="text-red-300 mb-4">{message}</p>
      {onRetry && (
        <Button 
          onClick={onRetry}
          variant="outline"
          className="border-red-400 text-red-400 hover:bg-red-500/20"
        >
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
