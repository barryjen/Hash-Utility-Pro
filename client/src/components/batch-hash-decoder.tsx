import { useState } from "react";
import { Search, Play, Download, Trash2, Plus, CheckCircle, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BatchLookupResult {
  hash: string;
  hashType: string;
  found: boolean;
  originalValue: string | null;
  lookupId: number;
}

export default function BatchHashDecoder() {
  const [hashInput, setHashInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BatchLookupResult[]>([]);
  const { toast } = useToast();

  const processHashes = async () => {
    if (!hashInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter hash values to decode",
        variant: "destructive",
      });
      return;
    }

    // Split input by lines and filter out empty lines
    const hashes = hashInput.split('\n').filter(line => line.trim());
    
    if (hashes.length === 0) {
      toast({
        title: "Error",
        description: "No valid hashes found",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await apiRequest('POST', '/api/hash/batch-lookup', {
        hashes
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      const data = await response.json();
      setResults(data.results);
      
      const foundCount = data.results.filter((r: BatchLookupResult) => r.found).length;
      
      toast({
        title: "Processing Complete",
        description: `Found ${foundCount} of ${data.results.length} hashes successfully!`,
      });
    } catch (error) {
      console.error("Batch hash lookup failed:", error);
      toast({
        title: "Error",
        description: "Failed to process hash lookups",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const exportResults = (format: 'csv' | 'json') => {
    if (results.length === 0) {
      toast({
        title: "Error",
        description: "No results to export",
        variant: "destructive",
      });
      return;
    }

    let content = '';
    let filename = '';

    if (format === 'csv') {
      const headers = ['Hash', 'Type', 'Found', 'Original Value'];
      content = headers.join(',') + '\n';
      
      results.forEach(result => {
        const row = [
          `"${result.hash}"`,
          result.hashType,
          result.found ? 'Yes' : 'No',
          result.originalValue ? `"${result.originalValue}"` : 'N/A'
        ];
        content += row.join(',') + '\n';
      });
      
      filename = `batch_hash_lookup_results_${Date.now()}.csv`;
    } else {
      content = JSON.stringify(results, null, 2);
      filename = `batch_hash_lookup_results_${Date.now()}.json`;
    }

    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearResults = () => {
    setResults([]);
    setProgress(0);
  };

  const addSampleHashes = () => {
    const samples = [
      "5d41402abc4b2a76b9719d911017c592", // hello (MD5)
      "098f6bcd4621d373cade4e832627b4f6", // test (MD5)
      "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d", // hello (SHA1)
      "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3", // test (SHA1)
      "2cf24dba4f21d4288091c98c9e04b6216b9b4bfd7d2d76ed9c46b4b3b86f5ee3", // hello (SHA256)
      "827ccb0eea8a706c4c34a16891f84e7b", // 12345 (MD5)
      "5f4dcc3b5aa765d61d8327deb882cf99", // password (MD5)
      "202cb962ac59075b964b07152d234b70" // 123 (MD5)
    ];
    setHashInput(samples.join('\n'));
  };

  const getSuccessRate = () => {
    if (results.length === 0) return 0;
    const foundCount = results.filter(r => r.found).length;
    return Math.round((foundCount / results.length) * 100);
  };

  const getHashTypeColor = (type: string) => {
    const colors = {
      md5: 'bg-red-100 text-red-800',
      sha1: 'bg-orange-100 text-orange-800',
      sha256: 'bg-green-100 text-green-800',
      sha512: 'bg-blue-100 text-blue-800',
      unknown: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.unknown;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5 text-blue-600" />
            Batch Hash Decoder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Enter multiple hash values (one per line) to attempt decryption. Supports MD5, SHA-1, SHA-256, and SHA-512 hashes.
            </AlertDescription>
          </Alert>

          {/* Input Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="font-medium text-gray-700">
                Hash Values (one per line)
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addSampleHashes}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Sample Hashes
              </Button>
            </div>
            <Textarea
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm h-40 resize-none font-mono"
              placeholder="Enter hash values, one per line...&#10;5d41402abc4b2a76b9719d911017c592&#10;098f6bcd4621d373cade4e832627b4f6&#10;aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
            />
          </div>

          {/* Process Button */}
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={processHashes}
            disabled={isProcessing}
          >
            <Play className="mr-2 h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Decode Hashes'}
          </Button>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Processing hashes...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                Results ({results.length} hashes processed)
              </CardTitle>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {getSuccessRate()}% Success Rate
                </Badge>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportResults('csv')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportResults('json')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearResults}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className={`border rounded-lg p-4 ${result.found ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      {result.found ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="font-medium text-sm">
                        {result.found ? 'Found' : 'Not Found'}
                      </span>
                    </div>
                    <Badge className={getHashTypeColor(result.hashType)}>
                      {result.hashType.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Hash:</span>
                      <code className="ml-2 text-xs bg-white p-1 rounded border font-mono">
                        {result.hash}
                      </code>
                    </div>
                    
                    {result.found && result.originalValue && (
                      <div className="border-t pt-2">
                        <span className="font-medium text-gray-600">Original Value:</span>
                        <div className="mt-1 p-2 bg-white rounded border">
                          <code className="font-mono text-sm text-green-700">
                            {result.originalValue}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}