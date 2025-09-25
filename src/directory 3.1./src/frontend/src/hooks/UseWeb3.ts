import { useAccount, useNetwork, usePublicClient } from 'wagmi';
import { getAddress, isAddress } from 'ethers/address';
import { useQuery } from '@tanstack/react-query'; // Using React Query for data fetching/caching

interface UseWeb3Result {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  networkName?: string;
  publicClient: ReturnType<typeof usePublicClient>;
  resolveEnsAddress: (name: string) => Promise<string | null>;
  versoriumxEnsAddress: string | null;
  isLoadingEns: boolean;
  ensError: Error | null;
}

const VERSORIUMX_ENS_NAME = 'versoriumx.eth';

export const useWeb3 = (): UseWeb3Result => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();

  const networkName = chain?.name;
  const chainId = chain?.id;

  const resolveEnsAddress = async (name: string): Promise<string | null> => {
    if (!publicClient || !name) return null;
    try {
      const resolvedAddress = await publicClient.getEnsAddress({ name });
      return resolvedAddress ? getAddress(resolvedAddress) : null; // Ensure checksum address
    } catch (err) {
      console.error(`Error resolving ENS name ${name}:`, err);
      return null;
    }
  };

  // Use React Query to manage fetching and caching of versoriumx.eth address
  const { data: versoriumxEnsAddress, isLoading: isLoadingEns, error: ensError } = useQuery<string | null, Error>(
    ['versoriumxEnsAddress', publicClient?.chain.id], // Query key includes chain ID
    () => resolveEnsAddress(VERSORIUMX_ENS_NAME),
    {
      enabled: !!publicClient, // Only run if publicClient is available
      staleTime: 1000 * 60 * 60, // Cache for 1 hour
      cacheTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
      onError: (err) => console.error("Failed to resolve versoriumx.eth ENS:", err)
    }
  );

  return {
    isConnected,
    address,
    chainId,
    networkName,
    publicClient,
    resolveEnsAddress,
    versoriumxEnsAddress,
    isLoadingEns,
    ensError,
  };
};
