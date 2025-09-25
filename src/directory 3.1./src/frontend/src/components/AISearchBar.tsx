import React, { useState, useCallback } from 'react';
import axios from 'axios';

interface SearchResult {
  title: string;
  snippet: string;
  source: string;
  url?: string;
  cid?: string;
}

const AISearchBar: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // This URL will be populated from VITE_AI_BACKEND_API_URL in .env (or mcp.json config)
  const aiBackendApiUrl = import.meta.env.VITE_AI_BACKEND_API_URL;
  const aiBackendApiKey = import.meta.env.VITE_AI_BACKEND_API_KEY; // For simple API key auth

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await axios.post<{ results: SearchResult[] }>(
        `${aiBackendApiUrl}/search`,
        { query },
        {
          headers: {
            'X-API-Key': aiBackendApiKey, // Simple API key authentication
            'Content-Type': 'application/json',
          },
        }
      );
      setResults(response.data.results);
    } catch (err) {
      console.error("AI Search API error:", err);
      setError(`Failed to perform search: ${err.message || String(err)}. Check console for details.`);
    } finally {
      setIsLoading(false);
    }
  }, [query, aiBackendApiUrl, aiBackendApiKey]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-versoriumx-light-blue">AI-Powered Search</h2>
      
      <div className="flex space-x-3 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search on-chain data, IPFS metadata, and more..."
          className="flex-grow p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-versoriumx-blue"
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          className="px-6 py-3 bg-versoriumx-blue hover:bg-versoriumx-light-blue text-white font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-900 text-red-300 rounded-md border border-red-700">
          <p className="font-bold">Error:</p>
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3 text-versoriumx-light-blue">Search Results:</h3>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="p-4 bg-gray-700 rounded-md">
                <h4 className="text-lg font-semibold text-versoriumx-light-blue">{result.title}</h4>
                <p className="text-gray-300 text-sm mt-1">{result.snippet}</p>
                <p className="text-gray-400 text-xs mt-2">Source: {result.source}</p>
                {result.url && (
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-versoriumx-blue hover:underline text-sm block mt-1">
                    View Source
                  </a>
                )}
                {result.cid && (
                  <span className="text-gray-500 text-xs block mt-1">CID: {result.cid}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {results.length === 0 && !isLoading && !error && query.trim() && (
        <div className="mt-6 text-gray-500 text-center">No results found.</div>
      )}
    </div>
  );
};

export default AISearchBar;
