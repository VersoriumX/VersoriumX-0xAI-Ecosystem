import React, { useState, useCallback } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { compileVyperCode } from '../utils/web3'; // This would call a Hardhat script or API

const VyperEditor: React.FC = () => {
  const [code, setCode] = useState<string>(`# @version ^0.3.10
# @title SimpleStorage.vy

@external
@pure
def get_number() -> uint256:
    return 42

@external
def set_number(new_number: uint256):
    # This contract currently has no storage,
    # so set_number would not actually store anything.
    # It's here for demonstration.
    pass
`);
  const [compiledOutput, setCompiledOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setCompiledOutput('');
    try {
      // In a real app, this would hit an API endpoint that triggers the Hardhat Vyper compiler
      // For now, it's a mock. The actual implementation would be in src/utils/web3.ts
      const result = await compileVyperCode(code);
      setCompiledOutput(JSON.stringify(result, null, 2));
    } catch (err) {
      setError(`Compilation failed: ${err.message || String(err)}`);
      setCompiledOutput('');
    } finally {
      setIsLoading(false);
    }
  }, [code]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-versoriumx-light-blue">Vyper Editor & Compiler</h2>
      
      <div className="mb-4">
        <label htmlFor="vyper-code" className="block text-gray-400 text-sm font-bold mb-2">
          Vyper Contract Code:
        </label>
        <textarea
          id="vyper-code"
          className="w-full h-80 p-4 font-mono text-sm bg-gray-900 border border-gray-700 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-versoriumx-blue"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
        />
      </div>

      <button
        onClick={handleCompile}
        disabled={isLoading}
        className="px-6 py-3 bg-versoriumx-blue hover:bg-versoriumx-light-blue text-white font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Compiling...' : 'Compile Vyper'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-900 text-red-300 rounded-md border border-red-700">
          <p className="font-bold">Error:</p>
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {compiledOutput && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3 text-versoriumx-light-blue">Compiled Output (ABI & Bytecode):</h3>
          <SyntaxHighlighter language="json" style={vs2015} customStyle={{ padding: '1rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
            {compiledOutput}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
};

export default VyperEditor;
