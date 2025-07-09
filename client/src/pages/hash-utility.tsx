import { useState } from "react";
import { Shield, HelpCircle, Hash, History, Layers, Lock, Search, CheckCircle, X, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HashGenerator from "@/components/hash-generator";
import HashResults from "@/components/hash-results";
import HashLookup from "@/components/hash-lookup";
import HashComparison from "@/components/hash-comparison";
import HistoryDashboard from "@/components/history-dashboard";
import BatchProcessor from "@/components/batch-processor";
import HMACGenerator from "@/components/hmac-generator";
import HashValidator from "@/components/hash-validator";
import BatchHashDecoder from "@/components/batch-hash-decoder";

export default function HashUtility() {
  const [hashResults, setHashResults] = useState<Record<string, string>>({});
  const [lookupResult, setLookupResult] = useState<{
    found: boolean;
    originalValue: string | null;
  } | null>(null);
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("generator");

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--hash-bg-light)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hash Utility Pro</h1>
                <p className="text-sm text-gray-600">Comprehensive Cryptographic Hash Toolkit</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                v2.0
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="generator" className="flex items-center space-x-2">
              <Hash className="h-4 w-4" />
              <span>Generator</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center space-x-2">
              <Layers className="h-4 w-4" />
              <span>Batch</span>
            </TabsTrigger>
            <TabsTrigger value="decoder" className="flex items-center space-x-2">
              <Unlock className="h-4 w-4" />
              <span>Decoder</span>
            </TabsTrigger>
            <TabsTrigger value="hmac" className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>HMAC</span>
            </TabsTrigger>
            <TabsTrigger value="validator" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Validator</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Compare</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <HashGenerator 
                  onHashGenerated={setHashResults}
                />
                <HashLookup 
                  onLookupResult={setLookupResult}
                  isLoading={isLookupLoading}
                  setIsLoading={setIsLookupLoading}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <HashResults hashResults={hashResults} />
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Search className="mr-2 h-5 w-5 text-yellow-600" />
                      Lookup Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lookupResult?.found ? (
                      <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-700">
                            Hash Found!
                          </span>
                        </div>
                        <div className="rounded p-3 border border-gray-200 bg-white">
                          <div className="font-medium text-sm mb-1 text-gray-600">
                            Original:
                          </div>
                          <code className="font-mono text-sm text-gray-800">
                            {lookupResult.originalValue}
                          </code>
                        </div>
                      </div>
                    ) : lookupResult?.found === false ? (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center">
                          <X className="mr-2 h-5 w-5 text-yellow-600" />
                          <span className="text-gray-600">No matches found in hash databases</span>
                        </div>
                      </div>
                    ) : isLookupLoading ? (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-3"></div>
                          <span className="text-gray-600">Searching hash databases...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        Enter a hash above to search for its original value
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <HistoryDashboard />
          </TabsContent>

          <TabsContent value="batch">
            <BatchProcessor />
          </TabsContent>

          <TabsContent value="decoder">
            <BatchHashDecoder />
          </TabsContent>

          <TabsContent value="hmac">
            <HMACGenerator />
          </TabsContent>

          <TabsContent value="validator">
            <HashValidator />
          </TabsContent>

          <TabsContent value="comparison">
            <HashComparison />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="py-8 mt-12 bg-gray-100 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center items-center">
            <div>
              <p className="text-sm text-gray-600">© 2025 Hash Utility Pro</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}