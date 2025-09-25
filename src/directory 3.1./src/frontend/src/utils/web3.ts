import { PublicClient } from 'wagmi';
import { getAddress } from 'ethers/address';
import axios from 'axios';

// --- ENS Resolution Utility (if not using wagmi's useEnsName directly) ---
export const resolveEnsAddressUtil = async (publicClient: PublicClient, name: string): Promise<string | null> => {
  if (!publicClient || !name) return null;
  try {
    const resolvedAddress = await publicClient.getEnsAddress({ name });
    return resolvedAddress ? getAddress(resolvedAddress) : null;
  } catch (err) {
    console.error(`Error resolving ENS name ${name}:`, err);
    return null;
  }
};

// --- Mock/Placeholder for Vyper Compiler API Call ---
// In a real scenario, this would call an API endpoint on your AI backend or
// a dedicated compilation service that internally uses Hardhat.
export const compileVyperCode = async (code: string): Promise<{ abi: any[]; bytecode: string }> => {
  console.log("Attempting to compile Vyper code (mock API call)...");
  // This would typically hit your AI backend or a dedicated compiler service API
  // const apiUrl = import.meta.env.VITE_VYPER_COMPILER_API_URL || 'http://localhost:8000/compile-vyper';
  // const response = await axios.post(apiUrl, { code });
  // return response.data;

  // Mocking an async compilation process
  return new Promise((resolve) => {
    setTimeout(() => {
      if (code.includes('def get_number() -> uint256:') && code.includes('return 42')) {
        resolve({
          abi: [
            {
              "stateMutability": "pure",
              "type": "function",
              "name": "get_number",
              "inputs": [],
              "outputs": [
                {
                  "name": "",
                  "type": "uint256"
                }
              ]
            }
          ],
          bytecode: "0x6080604052348015600f575f80fd5b5060..." // Mock bytecode
        });
      } else {
        throw new Error("Mock compilation failed: Syntax error or unimplemented feature.");
      }
    }, 2000); // Simulate network delay
  });
};

// --- IPFS Utility (if needed client-side for retrieval) ---
// This would utilize the project's IPFS gateway defined in project.config.json
const projectIpfsGateway = 'https://versoriumx.mypinata.cloud/ipfs/'; // Or get from config

export const getIpfsContent = async <T>(cid: string): Promise<T | null> => {
  try {
    const response = await axios.get(`${projectIpfsGateway}${cid}`);
    return response.data as T;
  } catch (error) {
    console.error(`Error fetching IPFS content for CID ${cid}:`, error);
    return null;
  }
};
