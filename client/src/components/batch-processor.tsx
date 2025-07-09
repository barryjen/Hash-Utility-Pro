import { useState } from "react";
import { Layers, Play, Download, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BatchResult {
  input: string;
  hashes: Record<string, string>;
  operationId: number;
}

const hashTypes = [
  { id: 'md5', label: 'MD5' },
  { id: 'sha1', label: 'SHA-1' },
  { id: 'sha256', label: 'SHA-256' },
  { id: 'sha512', label: 'SHA-512' },
  { id: 'bcrypt', label: 'bcrypt' },
];

export default function BatchProcessor() {
  const [batchInput, setBatchInput] = useState("");
  const [selectedHashTypes, setSelectedHashTypes] = useState<string[]>(['md5', 'sha256']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BatchResult[]>([]);
  const { toast } = useToast();

  const handleHashTypeChange = (hashType: string, checked: boolean) => {
    if (checked) {
      setSelectedHashTypes([...selectedHashTypes, hashType]);
    } else {
      setSelectedHashTypes(selectedHashTypes.filter(type => type !== hashType));
    }
  };

  const processBatch = async () => {
    if (!batchInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter text inputs to process",
        variant: "destructive",
      });
      return;
    }

    if (selectedHashTypes.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one hash type",
        variant: "destructive",
      });
      return;
    }

    // Split input by lines and filter out empty lines
    const inputs = batchInput.split('\n').filter(line => line.trim());
    
    if (inputs.length === 0) {
      toast({
        title: "Error",
        description: "No valid inputs found",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      const response = await apiRequest('POST', '/api/hash/batch', {
        inputs,
        hashTypes: selectedHashTypes
      });
      
      const data = await response.json();
      setResults(data.results);
      setProgress(100);
      
      toast({
        title: "Success",
        description: `Processed ${data.results.length} inputs successfully!`,
      });
    } catch (error) {
      console.error("Batch processing failed:", error);
      toast({
        title: "Error",
        description: "Failed to process batch inputs",
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
      const headers = ['Input', ...selectedHashTypes.map(type => type.toUpperCase())];
      content = headers.join(',') + '\n';
      
      results.forEach(result => {
        const row = [
          `"${result.input}"`,
          ...selectedHashTypes.map(type => result.hashes[type] || '')
        ];
        content += row.join(',') + '\n';
      });
      
      filename = `batch_hash_results_${Date.now()}.csv`;
    } else {
      content = JSON.stringify(results, null, 2);
      filename = `batch_hash_results_${Date.now()}.json`;
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

  const addSampleData = () => {
    const samples = [
      "hello",
      "world",
      "test",
      "password123",
      "sample text"
    ];
    setBatchInput(samples.join('\n'));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Layers className="mr-2 h-5 w-5 text-purple-600" />
            Batch Hash Processor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="font-medium text-gray-700">
                Input Text (one per line)
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addSampleData}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Sample Data
              </Button>
            </div>
            <Textarea
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm h-32 resize-none"
              placeholder="Enter multiple inputs, one per line..."
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
            />
          </div>

          {/* Hash Type Selection */}
          <div>
            <Label className="block font-medium mb-2 text-gray-700">
              Hash Types
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {hashTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={`batch-${type.id}`}
                    checked={selectedHashTypes.includes(type.id)}
                    onCheckedChange={(checked) => handleHashTypeChange(type.id, checked as boolean)}
                  />
                  <Label htmlFor={`batch-${type.id}`} className="text-sm font-medium cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Process Button */}
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            onClick={processBatch}
            disabled={isProcessing}
          >
            <Play className="mr-2 h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Process Batch'}
          </Button>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Processing...</span>
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
                Results ({results.length} items)
              </CardTitle>
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
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-800">
                      Input: {result.input}
                    </div>
                    <div className="flex space-x-1">
                      {Object.keys(result.hashes).map((type) => (
                        <Badge key={type} variant="secondary">
                          {type.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(result.hashes).map(([type, hash]) => (
                      <div key={type} className="text-sm">
                        <span className="font-medium text-gray-600">{type.toUpperCase()}:</span>
                        <code className="ml-2 text-xs bg-white p-1 rounded border">{hash}</code>
                      </div>
                    ))}
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