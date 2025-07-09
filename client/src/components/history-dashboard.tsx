import { useState, useEffect } from "react";
import { History, TrendingUp, Clock, Search, Code, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

interface HashOperation {
  id: number;
  inputText: string | null;
  fileName: string | null;
  fileSize: string | null;
  hashResults: Record<string, string> | null;
  timestamp: string;
}

interface HashLookup {
  id: number;
  hash: string;
  hashType: string;
  originalValue: string | null;
  found: string;
  timestamp: string;
}

interface HistoryData {
  operations: HashOperation[];
  lookups: HashLookup[];
  stats: {
    totalOperations: number;
    totalLookups: number;
    successfulLookups: number;
  };
}

export default function HistoryDashboard() {
  const { data: historyData, isLoading } = useQuery<HistoryData>({
    queryKey: ['/api/hash/history'],
    queryFn: getQueryFn({ on401: "throw" })
  });

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getHashTypeColor = (type: string) => {
    const colors = {
      md5: 'bg-red-100 text-red-800',
      sha1: 'bg-orange-100 text-orange-800',
      sha256: 'bg-green-100 text-green-800',
      sha512: 'bg-blue-100 text-blue-800',
      bcrypt: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600">Loading history...</span>
        </div>
      </div>
    );
  }

  if (!historyData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          No history data available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Operations</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{historyData.stats.totalOperations}</div>
            <p className="text-xs text-muted-foreground">Hash generations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lookups</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{historyData.stats.totalLookups}</div>
            <p className="text-xs text-muted-foreground">Hash searches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {historyData.stats.totalLookups > 0 
                ? Math.round((historyData.stats.successfulLookups / historyData.stats.totalLookups) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Successful lookups</p>
          </CardContent>
        </Card>
      </div>

      {/* History Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="mr-2 h-5 w-5" />
            Activity History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="operations" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="operations">Hash Operations</TabsTrigger>
              <TabsTrigger value="lookups">Hash Lookups</TabsTrigger>
            </TabsList>
            
            <TabsContent value="operations" className="mt-4">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {historyData.operations.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No hash operations yet
                  </div>
                ) : (
                  historyData.operations.map((operation) => (
                    <div key={operation.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {formatDate(operation.timestamp)}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          {operation.hashResults && Object.keys(operation.hashResults).map((type) => (
                            <Badge key={type} className={getHashTypeColor(type)}>
                              {type.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm">
                        {operation.fileName ? (
                          <div>
                            <strong>File:</strong> {operation.fileName} ({operation.fileSize} bytes)
                          </div>
                        ) : (
                          <div>
                            <strong>Text:</strong> {operation.inputText || 'N/A'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="lookups" className="mt-4">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {historyData.lookups.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No hash lookups yet
                  </div>
                ) : (
                  historyData.lookups.map((lookup) => (
                    <div key={lookup.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {formatDate(lookup.timestamp)}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getHashTypeColor(lookup.hashType)}>
                            {lookup.hashType.toUpperCase()}
                          </Badge>
                          <Badge className={lookup.found === "true" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {lookup.found === "true" ? "Found" : "Not Found"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm space-y-1">
                        <div><strong>Hash:</strong> <code className="text-xs">{lookup.hash}</code></div>
                        {lookup.found === "true" && lookup.originalValue && (
                          <div><strong>Original:</strong> {lookup.originalValue}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}