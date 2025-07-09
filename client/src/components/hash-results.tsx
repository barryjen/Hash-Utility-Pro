import { Code, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface HashResultsProps {
  hashResults: Record<string, string>;
}

export default function HashResults({ hashResults }: HashResultsProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Success",
        description: "Hash copied to clipboard!",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    });
  };

  const hashEntries = Object.entries(hashResults);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Code className="mr-2 h-5 w-5 text-green-600" />
          Hash Results
        </h2>
      </div>
      <div className="p-6 space-y-4">
        {hashEntries.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Code className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>Generate hashes to see results here</p>
          </div>
        ) : (
          hashEntries.map(([hashType, hash]) => (
            <div key={hashType} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700 bg-gray-200 px-2 py-1 rounded text-sm">
                  {hashType.toUpperCase()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => copyToClipboard(hash)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-white rounded p-3 border border-gray-200">
                <code className="font-mono text-sm break-all text-gray-800">
                  {hash}
                </code>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
