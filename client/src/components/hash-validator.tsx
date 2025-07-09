import { useState } from "react";
import { CheckCircle, XCircle, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ValidationResult {
  valid: boolean;
  detectedType: string;
  length: number;
  format: string;
}

export default function HashValidator() {
  const [hash, setHash] = useState("");
  const [expectedType, setExpectedType] = useState("auto");
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const { toast } = useToast();

  const hashTypes = [
    { value: "auto", label: "Auto-detect" },
    { value: "md5", label: "MD5" },
    { value: "sha1", label: "SHA-1" },
    { value: "sha256", label: "SHA-256" },
    { value: "sha512", label: "SHA-512" },
    { value: "bcrypt", label: "bcrypt" }
  ];

  const validateHash = async () => {
    if (!hash.trim()) {
      toast({
        title: "Error",
        description: "Please enter a hash to validate",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    try {
      const response = await apiRequest('POST', '/api/hash/validate', {
        hash: hash.trim(),
        type: expectedType === "auto" ? undefined : expectedType
      });
      
      const data = await response.json();
      setResult(data);
      
      toast({
        title: data.valid ? "Valid Hash" : "Invalid Hash",
        description: data.valid 
          ? `Detected as ${data.detectedType.toUpperCase()}`
          : "Hash format is invalid",
        variant: data.valid ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Hash validation failed:", error);
      toast({
        title: "Error",
        description: "Failed to validate hash",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getValidationIcon = () => {
    if (!result) return null;
    
    if (result.valid) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getValidationColor = () => {
    if (!result) return "bg-gray-50";
    return result.valid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200";
  };

  const getHashTypeInfo = (type: string) => {
    const info = {
      md5: { length: 32, description: "MD5 hash (128-bit)" },
      sha1: { length: 40, description: "SHA-1 hash (160-bit)" },
      sha256: { length: 64, description: "SHA-256 hash (256-bit)" },
      sha512: { length: 128, description: "SHA-512 hash (512-bit)" },
      bcrypt: { length: 60, description: "bcrypt hash with salt" },
      unknown: { length: 0, description: "Unknown hash type" }
    };
    return info[type as keyof typeof info] || info.unknown;
  };

  const addSampleHash = (type: string) => {
    const samples = {
      md5: "5d41402abc4b2a76b9719d911017c592",
      sha1: "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d",
      sha256: "2cf24dba4f21d4288091c98c9e04b621efdc4fb8a04a1f3fff1fa07e998e86f7f",
      sha512: "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043",
      bcrypt: "$2a$10$N9qo8uLOickgx2ZMRZoMye.jKbQK1CfSrFoqo4C2i3OoVmPqWDlSS"
    };
    setHash(samples[type as keyof typeof samples] || "");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5 text-green-600" />
            Hash Validator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hash Input */}
          <div>
            <Label className="block font-medium mb-2 text-gray-700">
              Hash to Validate
            </Label>
            <Input
              type="text"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              placeholder="Enter hash to validate..."
              value={hash}
              onChange={(e) => setHash(e.target.value)}
            />
          </div>

          {/* Expected Type Selection */}
          <div>
            <Label className="block font-medium mb-2 text-gray-700">
              Expected Type
            </Label>
            <Select value={expectedType} onValueChange={setExpectedType}>
              <SelectTrigger className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hashTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sample Hash Buttons */}
          <div>
            <Label className="block font-medium mb-2 text-gray-700">
              Sample Hashes
            </Label>
            <div className="flex flex-wrap gap-2">
              {["md5", "sha1", "sha256", "sha512", "bcrypt"].map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => addSampleHash(type)}
                  className="text-xs"
                >
                  {type.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Validate Button */}
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={validateHash}
            disabled={isValidating}
          >
            <Search className="mr-2 h-4 w-4" />
            {isValidating ? 'Validating...' : 'Validate Hash'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {getValidationIcon()}
              <span className="ml-2">Validation Result</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`border rounded-lg p-4 ${getValidationColor()}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getValidationIcon()}
                  <span className="font-medium">
                    {result.valid ? "Valid Hash" : "Invalid Hash"}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Badge variant={result.valid ? "default" : "destructive"}>
                    {result.format.toUpperCase()}
                  </Badge>
                  {result.valid && (
                    <Badge variant="secondary">
                      {result.detectedType.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Detected Type:</span>
                  <div className="mt-1">
                    {result.detectedType === "unknown" ? (
                      <span className="text-red-600">Unknown</span>
                    ) : (
                      <span className="text-green-600">{result.detectedType.toUpperCase()}</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Length:</span>
                  <div className="mt-1">
                    {result.length} characters
                  </div>
                </div>
              </div>

              {result.valid && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-700">Hash Information</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {getHashTypeInfo(result.detectedType).description}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Expected length: {getHashTypeInfo(result.detectedType).length} characters
                  </div>
                </div>
              )}

              {!result.valid && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <div className="flex items-center mb-2">
                    <XCircle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="font-medium text-gray-700">Validation Issues</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    The provided hash does not match any known hash format patterns.
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}