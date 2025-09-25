import React from 'react';
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { InjectedConnector } from 'wagmi/connectors/injected';

const WalletConnectButton: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-gray-800 rounded-lg">
        <span className="text-green-400">Connected:</span>
        <span className="font-mono text-sm">
          {ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
        </span>
        <button
          onClick={() => disconnect()}
          className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      {connectors.map((connector) => (
        <button
          disabled={!connector.ready || isLoading}
          key={connector.id}
          onClick={() => connect({ connector })}
          className="px-4 py-2 bg-versoriumx-blue hover:bg-versoriumx-light-blue text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {connector.name === 'MetaMask' ? 'MetaMask' :
           connector.name === 'WalletConnect' ? 'WalletConnect' :
           'Injected'}
          {isLoading && connector.id === pendingConnector?.id && ' (connecting)'}
        </button>
      ))}
      {error && <div className="text-red-500 text-sm mt-1">{error.message}</div>}
    </div>
  );
};

export default WalletConnectButton;
