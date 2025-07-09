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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div 
        className="text-white p-4 rounded-t-xl"
        style={{ backgroundColor: 'var(--hash-success)' }}
      >
        <h2 className="text-xl font-semibold flex items-center">
          <Code className="mr-2 h-5 w-5" />
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
            <div key={hashType} className="border border-gray-200 rounded-lg p-4" style={{ backgroundColor: 'var(--hash-terminal-dark)' }}>
              <div className="flex items-center justify-between mb-2">
                <span 
                  className="font-mono font-medium"
                  style={{ color: 'var(--hash-accent)' }}
                >
                  {hashType.toUpperCase()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={() => copyToClipboard(hash)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-black rounded p-3 border border-gray-600">
                <code 
                  className="font-mono text-sm break-all"
                  style={{ color: 'var(--hash-terminal-green)' }}
                >
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
