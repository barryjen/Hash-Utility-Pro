import { useState } from "react";
import { Equal, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function HashComparison() {
  const [hash1, setHash1] = useState("");
  const [hash2, setHash2] = useState("");
  const [comparison, setComparison] = useState<boolean | null>(null);
  const { toast } = useToast();

  const compareHashes = async () => {
    if (!hash1.trim() || !hash2.trim()) {
      toast({
        title: "Error",
        description: "Please enter both hashes to compare",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/hash/compare', {
        hash1: hash1,
        hash2: hash2
      });
      
      const data = await response.json();
      setComparison(data.match);
      
      toast({
        title: "Comparison Complete",
        description: data.match ? "Hashes match!" : "Hashes do not match",
      });
    } catch (error) {
      console.error("Hash comparison failed:", error);
      toast({
        title: "Error",
        description: "Failed to compare hashes",
        variant: "destructive",
      });
    }
  };

  // Auto-compare when both hashes are entered
  const handleHashChange = (value: string, hashNumber: 1 | 2) => {
    if (hashNumber === 1) {
      setHash1(value);
    } else {
      setHash2(value);
    }
    
    // Auto-compare when both hashes have content
    if ((hashNumber === 1 && value.trim() && hash2.trim()) || 
        (hashNumber === 2 && value.trim() && hash1.trim())) {
      setTimeout(() => {
        compareHashes();
      }, 300);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div 
        className="text-white p-4 rounded-t-xl"
        style={{ backgroundColor: 'var(--hash-secondary)' }}
      >
        <h2 className="text-xl font-semibold flex items-center">
          <Equal className="mr-2 h-5 w-5" />
          Hash Comparison
        </h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <Label className="block font-medium mb-2" style={{ color: 'var(--hash-secondary)' }}>
              Hash 1
            </Label>
            <Input 
              type="text" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-2 font-mono text-sm"
              style={{ 
                '--tw-ring-color': 'var(--hash-accent)',
                '--tw-border-color': 'var(--hash-accent)'
              }}
              placeholder="Enter first hash..."
              value={hash1}
              onChange={(e) => handleHashChange(e.target.value, 1)}
            />
          </div>
          <div>
            <Label className="block font-medium mb-2" style={{ color: 'var(--hash-secondary)' }}>
              Hash 2
            </Label>
            <Input 
              type="text" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-2 font-mono text-sm"
              style={{ 
                '--tw-ring-color': 'var(--hash-accent)',
                '--tw-border-color': 'var(--hash-accent)'
              }}
              placeholder="Enter second hash..."
              value={hash2}
              onChange={(e) => handleHashChange(e.target.value, 2)}
            />
          </div>
          
          {comparison !== null && (
            <div 
              className={`flex items-center justify-center p-4 rounded-lg border ${
                comparison 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              {comparison ? (
                <>
                  <Check 
                    className="text-xl mr-2"
                    style={{ color: 'var(--hash-success)' }}
                  />
                  <span 
                    className="font-medium"
                    style={{ color: 'var(--hash-success)' }}
                  >
                    Hashes Match!
                  </span>
                </>
              ) : (
                <>
                  <X className="text-red-500 text-xl mr-2" />
                  <span className="text-red-500 font-medium">
                    Hashes Do Not Match
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
