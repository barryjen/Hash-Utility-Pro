import { useState, useRef } from "react";
import { Settings, Keyboard, Upload, Play, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface HashGeneratorProps {
  onHashGenerated: (hashes: Record<string, string>) => void;
}

const hashTypes = [
  { id: 'md5', label: 'MD5' },
  { id: 'sha1', label: 'SHA-1' },
  { id: 'sha256', label: 'SHA-256' },
  { id: 'sha512', label: 'SHA-512' },
  { id: 'bcrypt', label: 'bcrypt' },
];

export default function HashGenerator({ onHashGenerated }: HashGeneratorProps) {
  const [inputText, setInputText] = useState("");
  const [selectedHashTypes, setSelectedHashTypes] = useState<string[]>(['md5', 'sha1', 'sha256', 'sha512']);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleHashTypeChange = (hashType: string, checked: boolean) => {
    if (checked) {
      setSelectedHashTypes([...selectedHashTypes, hashType]);
    } else {
      setSelectedHashTypes(selectedHashTypes.filter(type => type !== hashType));
    }
  };

  const generateHashes = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to hash",
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

    setIsGenerating(true);
    try {
      const response = await apiRequest('POST', '/api/hash/generate', {
        inputText,
        hashTypes: selectedHashTypes
      });
      
      const data = await response.json();
      onHashGenerated(data.hashResults);
      
      toast({
        title: "Success",
        description: "Hashes generated successfully!",
      });
    } catch (error) {
      console.error("Hash generation failed:", error);
      toast({
        title: "Error",
        description: "Failed to generate hashes",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (selectedHashTypes.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one hash type",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('hashTypes', JSON.stringify(selectedHashTypes));

      const response = await fetch('/api/hash/generate-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate file hashes');
      }

      const data = await response.json();
      onHashGenerated(data.hashResults);
      
      toast({
        title: "Success",
        description: `File "${file.name}" hashed successfully!`,
      });
    } catch (error) {
      console.error("File hash generation failed:", error);
      toast({
        title: "Error",
        description: "Failed to generate file hashes",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      const fakeEvent = {
        target: { files: [file] }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(fakeEvent);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div 
        className="text-white p-4 rounded-t-xl"
        style={{ backgroundColor: 'var(--hash-primary)' }}
      >
        <h2 className="text-xl font-semibold flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Hash Generator
        </h2>
      </div>
      <div className="p-6">
        {/* Text Input */}
        <div className="mb-6">
          <Label className="block font-medium mb-2 flex items-center" style={{ color: 'var(--hash-secondary)' }}>
            <Keyboard className="mr-2 h-4 w-4" />
            Text Input
          </Label>
          <Textarea 
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:border-2 font-mono text-sm h-32 resize-none"
            style={{ 
              '--tw-ring-color': 'var(--hash-accent)',
              '--tw-border-color': 'var(--hash-accent)'
            }}
            placeholder="Enter text to hash..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <Label className="block font-medium mb-2 flex items-center" style={{ color: 'var(--hash-secondary)' }}>
            <Upload className="mr-2 h-4 w-4" />
            File Upload
          </Label>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">Drag and drop a file here, or click to browse</p>
            <p className="text-sm text-gray-400">Supports: TXT, PDF, DOC, ZIP, etc.</p>
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* Hash Type Selection */}
        <div className="mb-6">
          <Label className="block font-medium mb-2 flex items-center" style={{ color: 'var(--hash-secondary)' }}>
            <List className="mr-2 h-4 w-4" />
            Hash Types
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {hashTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <Checkbox
                  id={type.id}
                  checked={selectedHashTypes.includes(type.id)}
                  onCheckedChange={(checked) => handleHashTypeChange(type.id, checked as boolean)}
                />
                <Label 
                  htmlFor={type.id}
                  className="font-mono text-sm cursor-pointer"
                >
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          className="w-full font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center text-white"
          style={{ backgroundColor: 'var(--hash-accent)' }}
          onClick={generateHashes}
          disabled={isGenerating}
        >
          <Play className="mr-2 h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Generate Hashes'}
        </Button>
      </div>
    </div>
  );
}
