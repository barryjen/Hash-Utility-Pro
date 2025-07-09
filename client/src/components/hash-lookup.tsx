import { useState } from "react";
import { Search, Key, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface HashLookupProps {
  onLookupResult: (result: { found: boolean; originalValue: string | null }) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function HashLookup({ onLookupResult, isLoading, setIsLoading }: HashLookupProps) {
  const [lookupHash, setLookupHash] = useState("");
  const [hashType, setHashType] = useState("auto-detect");
  const { toast } = useToast();

  const handleLookup = async () => {
    if (!lookupHash.trim()) {
      toast({
        title: "Error",
        description: "Please enter a hash to lookup",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/hash/lookup', {
        hash: lookupHash,
        hashType: hashType
      });
      
      const data = await response.json();
      onLookupResult({
        found: data.found,
        originalValue: data.originalValue
      });
      
      if (data.found) {
        toast({
          title: "Success",
          description: "Hash found in database!",
        });
      } else {
        toast({
          title: "Info",
          description: "Hash not found in database",
        });
      }
    } catch (error) {
      console.error("Hash lookup failed:", error);
      toast({
        title: "Error",
        description: "Failed to lookup hash",
        variant: "destructive",
      });
      onLookupResult({ found: false, originalValue: null });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div 
        className="text-white p-4 rounded-t-xl"
        style={{ backgroundColor: 'var(--hash-warning)' }}
      >
        <h2 className="text-xl font-semibold flex items-center">
          <Search className="mr-2 h-5 w-5" />
          Hash Lookup & Decryption
        </h2>
      </div>
      <div className="p-6">
        <div className="mb-4">
          <Label className="block font-medium mb-2 flex items-center" style={{ color: 'var(--hash-secondary)' }}>
            <Key className="mr-2 h-4 w-4" />
            Hash to Decrypt
          </Label>
          <Input 
            type="text" 
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:border-2 font-mono text-sm"
            style={{ 
              '--tw-ring-color': 'var(--hash-warning)',
              '--tw-border-color': 'var(--hash-warning)'
            }}
            placeholder="Enter hash to lookup..."
            value={lookupHash}
            onChange={(e) => setLookupHash(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <Label className="block font-medium mb-2" style={{ color: 'var(--hash-secondary)' }}>
            Hash Type
          </Label>
          <Select value={hashType} onValueChange={setHashType}>
            <SelectTrigger className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:border-2 font-mono text-sm">
              <SelectValue placeholder="Select hash type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto-detect">Auto-detect</SelectItem>
              <SelectItem value="md5">MD5</SelectItem>
              <SelectItem value="sha1">SHA-1</SelectItem>
              <SelectItem value="sha256">SHA-256</SelectItem>
              <SelectItem value="sha512">SHA-512</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          className="w-full font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center text-white"
          style={{ backgroundColor: 'var(--hash-warning)' }}
          onClick={handleLookup}
          disabled={isLoading}
        >
          <Unlock className="mr-2 h-4 w-4" />
          {isLoading ? 'Searching...' : 'Attempt Decryption'}
        </Button>
      </div>
    </div>
  );
}
