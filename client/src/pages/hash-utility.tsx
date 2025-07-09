import { useState } from "react";
import { Shield, HelpCircle, Github, Book, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import HashGenerator from "@/components/hash-generator";
import HashResults from "@/components/hash-results";
import HashLookup from "@/components/hash-lookup";
import HashComparison from "@/components/hash-comparison";

export default function HashUtility() {
  const [hashResults, setHashResults] = useState<Record<string, string>>({});
  const [lookupResult, setLookupResult] = useState<{
    found: boolean;
    originalValue: string | null;
  } | null>(null);
  const [isLookupLoading, setIsLookupLoading] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--hash-bg-light)' }}>
      {/* Header */}
      <header className="shadow-lg" style={{ backgroundColor: 'var(--hash-primary)' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="text-2xl" style={{ color: 'var(--hash-accent)' }} />
              <h1 className="text-2xl font-bold text-white">Hash Utility</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-white/75">Cryptographic Hash Generator & Analyzer</span>
              <Button 
                className="transition-colors"
                style={{ 
                  backgroundColor: 'var(--hash-accent)',
                  color: 'white'
                }}
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Help
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
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
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div 
                className="text-white p-4 rounded-t-xl"
                style={{ backgroundColor: 'var(--hash-warning)' }}
              >
                <h2 className="text-xl font-semibold flex items-center">
                  <i className="fas fa-search-plus mr-2"></i>Lookup Results
                </h2>
              </div>
              <div className="p-6">
                {lookupResult?.found ? (
                  <div 
                    className="border rounded-lg p-4 mb-4"
                    style={{ 
                      borderColor: 'var(--hash-success)',
                      backgroundColor: 'hsl(134, 44%, 95%)'
                    }}
                  >
                    <div className="flex items-center mb-2">
                      <ShieldCheck 
                        className="mr-2"
                        style={{ color: 'var(--hash-success)' }}
                      />
                      <span 
                        className="font-medium"
                        style={{ color: 'var(--hash-success)' }}
                      >
                        Hash Found!
                      </span>
                    </div>
                    <div 
                      className="rounded p-3 border border-gray-600"
                      style={{ backgroundColor: 'var(--hash-terminal-dark)' }}
                    >
                      <div 
                        className="font-mono text-sm mb-1"
                        style={{ color: 'var(--hash-accent)' }}
                      >
                        Original:
                      </div>
                      <code 
                        className="font-mono text-sm"
                        style={{ color: 'var(--hash-terminal-green)' }}
                      >
                        {lookupResult.originalValue}
                      </code>
                    </div>
                  </div>
                ) : lookupResult?.found === false ? (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center">
                      <i 
                        className="fas fa-exclamation-triangle mr-2"
                        style={{ color: 'var(--hash-warning)' }}
                      ></i>
                      <span className="text-gray-600">No matches found in hash databases</span>
                    </div>
                  </div>
                ) : isLookupLoading ? (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center">
                      <div 
                        className="animate-spin rounded-full h-6 w-6 border-b-2 mr-3"
                        style={{ borderColor: 'var(--hash-accent)' }}
                      ></div>
                      <span className="text-gray-600">Searching hash databases...</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div 
                        className="h-2 rounded-full w-3/4 transition-all duration-300"
                        style={{ backgroundColor: 'var(--hash-accent)' }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Enter a hash above to search for its original value
                  </div>
                )}
              </div>
            </div>
            <HashComparison />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 mt-12" style={{ backgroundColor: 'var(--hash-primary)' }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-white/75">© 2024 Hash Utility. Secure cryptographic tools for developers.</p>
            </div>
            <div className="flex items-center space-x-6">
              <a 
                href="#" 
                className="text-sm text-white/75 hover:text-white transition-colors flex items-center"
                style={{ '--tw-text-opacity': '0.75' }}
              >
                <Shield className="mr-1 h-4 w-4" />Security
              </a>
              <a 
                href="#" 
                className="text-sm text-white/75 hover:text-white transition-colors flex items-center"
              >
                <Book className="mr-1 h-4 w-4" />Documentation
              </a>
              <a 
                href="#" 
                className="text-sm text-white/75 hover:text-white transition-colors flex items-center"
              >
                <Github className="mr-1 h-4 w-4" />GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
