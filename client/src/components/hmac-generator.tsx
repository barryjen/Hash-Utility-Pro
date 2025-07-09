import { useState } from "react";
import { Key, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface HMACResult {
  hmac: string;
  algorithm: string;
  message: string;
  keyLength: number;
}

export default function HMACGenerator() {
  const [message, setMessage] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [algorithm, setAlgorithm] = useState("sha256");
  const [showKey, setShowKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<HMACResult | null>(null);
  const { toast } = useToast();

  const algorithms = [
    { value: "sha1", label: "SHA-1" },
    { value: "sha256", label: "SHA-256" },
    { value: "sha512", label: "SHA-512" },
    { value: "md5", label: "MD5" }
  ];

  const generateHMAC = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    if (!secretKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a secret key",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiRequest('POST', '/api/hash/hmac', {
        message,
        key: secretKey,
        algorithm
      });
      
      const data = await response.json();
      setResult(data);
      
      toast({
        title: "Success",
        description: "HMAC generated successfully!",
      });
    } catch (error) {
      console.error("HMAC generation failed:", error);
      toast({
        title: "Error",
        description: "Failed to generate HMAC",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Success",
        description: "HMAC copied to clipboard!",
      });
    });
  };

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSecretKey(result);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="mr-2 h-5 w-5 text-blue-600" />
            HMAC Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Message Input */}
          <div>
            <Label className="block font-medium mb-2 text-gray-700">
              Message
            </Label>
            <Textarea
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm h-32 resize-none"
              placeholder="Enter message to authenticate..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Secret Key Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="font-medium text-gray-700">
                Secret Key
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={generateRandomKey}
                className="text-xs"
              >
                Generate Random Key
              </Button>
            </div>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-10"
                placeholder="Enter secret key..."
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Algorithm Selection */}
          <div>
            <Label className="block font-medium mb-2 text-gray-700">
              Algorithm
            </Label>
            <Select value={algorithm} onValueChange={setAlgorithm}>
              <SelectTrigger className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {algorithms.map((alg) => (
                  <SelectItem key={alg.value} value={alg.value}>
                    {alg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={generateHMAC}
            disabled={isGenerating}
          >
            <Key className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate HMAC'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>HMAC Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Badge variant="secondary">{result.algorithm.toUpperCase()}</Badge>
                <Badge variant="outline">Key Length: {result.keyLength}</Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(result.hmac)}
              >
                Copy HMAC
              </Button>
            </div>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="font-medium text-sm mb-2 text-gray-600">HMAC:</div>
              <code className="font-mono text-sm bg-white p-3 rounded border block break-all">
                {result.hmac}
              </code>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Message:</span>
                <div className="mt-1 p-2 bg-gray-100 rounded text-xs">
                  {result.message}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Algorithm:</span>
                <div className="mt-1 p-2 bg-gray-100 rounded text-xs">
                  {result.algorithm.toUpperCase()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}