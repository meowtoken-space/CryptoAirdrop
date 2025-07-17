import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';

interface WalletAdapter {
  name: string;
  icon: string;
  url: string;
  readyState: 'Installed' | 'NotDetected' | 'Loadable' | 'Unsupported';
}

interface ConnectedWallet {
  adapter: WalletAdapter;
  publicKey: PublicKey;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
}

interface SolanaWalletProps {
  onWalletConnect?: (wallet: ConnectedWallet) => void;
  onWalletDisconnect?: () => void;
  className?: string;
}

const SolanaWallet: React.FC<SolanaWalletProps> = ({
  onWalletConnect,
  onWalletDisconnect,
  className = ''
}) => {
  const [wallets, setWallets] = useState<WalletAdapter[]>([]);
  const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Solana RPC endpoints
  const RPC_ENDPOINTS = [
    'https://api.mainnet-beta.solana.com',
    'https://solana-api.projectserum.com',
    'https://rpc.ankr.com/solana',
    'https://api.devnet.solana.com' // Fallback to devnet
  ];

  // Initialize connection
  useEffect(() => {
    const initConnection = async () => {
      for (const endpoint of RPC_ENDPOINTS) {
        try {
          const conn = new Connection(endpoint, 'confirmed');
          await conn.getVersion(); // Test connection
          setConnection(conn);
          console.log(`Connected to Solana RPC: ${endpoint}`);
          break;
        } catch (err) {
          console.warn(`Failed to connect to ${endpoint}:`, err);
        }
      }
    };

    initConnection();
  }, []);

  // Detect available wallets
  useEffect(() => {
    const detectWallets = () => {
      const detectedWallets: WalletAdapter[] = [];

      // Phantom Wallet
      if (typeof window !== 'undefined' && (window as any).phantom?.solana) {
        detectedWallets.push({
          name: 'Phantom',
          icon: '👻',
          url: 'https://phantom.app/',
          readyState: 'Installed'
        });
      } else {
        detectedWallets.push({
          name: 'Phantom',
          icon: '👻',
          url: 'https://phantom.app/',
          readyState: 'NotDetected'
        });
      }

      // Solflare Wallet
      if (typeof window !== 'undefined' && (window as any).solflare) {
        detectedWallets.push({
          name: 'Solflare',
          icon: '🔥',
          url: 'https://solflare.com/',
          readyState: 'Installed'
        });
      } else {
        detectedWallets.push({
          name: 'Solflare',
          icon: '🔥',
          url: 'https://solflare.com/',
          readyState: 'NotDetected'
        });
      }

      // Backpack Wallet
      if (typeof window !== 'undefined' && (window as any).backpack) {
        detectedWallets.push({
          name: 'Backpack',
          icon: '🎒',
          url: 'https://backpack.app/',
          readyState: 'Installed'
        });
      } else {
        detectedWallets.push({
          name: 'Backpack',
          icon: '🎒',
          url: 'https://backpack.app/',
          readyState: 'NotDetected'
        });
      }

      // Sollet Wallet
      if (typeof window !== 'undefined' && (window as any).sollet) {
        detectedWallets.push({
          name: 'Sollet',
          icon: '💼',
          url: 'https://www.sollet.io/',
          readyState: 'Installed'
        });
      } else {
        detectedWallets.push({
          name: 'Sollet',
          icon: '💼',
          url: 'https://www.sollet.io/',
          readyState: 'NotDetected'
        });
      }

      setWallets(detectedWallets);
    };

    detectWallets();

    // Re-detect wallets when window loads
    if (typeof window !== 'undefined') {
      window.addEventListener('load', detectWallets);
      return () => window.removeEventListener('load', detectWallets);
    }
  }, []);

  // Get wallet balance
  const getBalance = useCallback(async (publicKey: PublicKey) => {
    if (!connection) return null;

    try {
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (err) {
      console.error('Error fetching balance:', err);
      return null;
    }
  }, [connection]);

  // Connect to wallet
  const connectWallet = async (walletAdapter: WalletAdapter) => {
    if (walletAdapter.readyState !== 'Installed') {
      window.open(walletAdapter.url, '_blank');
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      let provider: any = null;

      switch (walletAdapter.name) {
        case 'Phantom':
          provider = (window as any).phantom?.solana;
          break;
        case 'Solflare':
          provider = (window as any).solflare;
          break;
        case 'Backpack':
          provider = (window as any).backpack;
          break;
        case 'Sollet':
          provider = (window as any).sollet;
          break;
      }

      if (!provider) {
        throw new Error(`${walletAdapter.name} wallet not found`);
      }

      const response = await provider.connect();
      const publicKey = new PublicKey(response.publicKey.toString());

      const wallet: ConnectedWallet = {
        adapter: walletAdapter,
        publicKey,
        connected: true,
        connecting: false,
        disconnecting: false
      };

      setConnectedWallet(wallet);
      setShowWalletModal(false);

      // Get balance
      const walletBalance = await getBalance(publicKey);
      setBalance(walletBalance);

      // Setup event listeners
      provider.on('disconnect', () => {
        handleDisconnect();
      });

      provider.on('accountChanged', (publicKey: PublicKey) => {
        if (publicKey) {
          setConnectedWallet(prev => prev ? { ...prev, publicKey } : null);
          getBalance(publicKey).then(setBalance);
        } else {
          handleDisconnect();
        }
      });

      onWalletConnect?.(wallet);

    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect wallet
  const handleDisconnect = async () => {
    if (!connectedWallet) return;

    try {
      const provider = getWalletProvider(connectedWallet.adapter.name);
      if (provider && provider.disconnect) {
        await provider.disconnect();
      }
    } catch (err) {
      console.error('Disconnect error:', err);
    }

    setConnectedWallet(null);
    setBalance(null);
    onWalletDisconnect?.();
  };

  // Get wallet provider
  const getWalletProvider = (walletName: string) => {
    switch (walletName) {
      case 'Phantom':
        return (window as any).phantom?.solana;
      case 'Solflare':
        return (window as any).solflare;
      case 'Backpack':
        return (window as any).backpack;
      case 'Sollet':
        return (window as any).sollet;
      default:
        return null;
    }
  };

  // Auto-reconnect on page load
  useEffect(() => {
    const autoConnect = async () => {
      const installedWallets = wallets.filter(w => w.readyState === 'Installed');
      
      for (const wallet of installedWallets) {
        try {
          const provider = getWalletProvider(wallet.name);
          if (provider && provider.isConnected) {
            const publicKey = new PublicKey(provider.publicKey.toString());
            
            const connectedWallet: ConnectedWallet = {
              adapter: wallet,
              publicKey,
              connected: true,
              connecting: false,
              disconnecting: false
            };

            setConnectedWallet(connectedWallet);
            const walletBalance = await getBalance(publicKey);
            setBalance(walletBalance);
            onWalletConnect?.(connectedWallet);
            break;
          }
        } catch (err) {
          console.log(`Auto-connect failed for ${wallet.name}:`, err);
        }
      }
    };

    if (wallets.length > 0 && !connectedWallet) {
      autoConnect();
    }
  }, [wallets, connectedWallet, getBalance, onWalletConnect]);

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Format balance
  const formatBalance = (balance: number) => {
    return balance.toFixed(4);
  };

  if (connectedWallet) {
    return (
      <motion.div
        className={`bg-black/40 backdrop-blur-lg border border-green-400/30 rounded-xl p-4 ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{connectedWallet.adapter.icon}</div>
            <div>
              <div className="text-white font-bold text-sm">
                {connectedWallet.adapter.name}
              </div>
              <div className="text-gray-400 text-xs">
                {formatAddress(connectedWallet.publicKey.toString())}
              </div>
              {balance !== null && (
                <div className="text-green-400 text-xs">
                  {formatBalance(balance)} SOL
                </div>
              )}
            </div>
          </div>
          
          <motion.button
            className="bg-red-500/20 border border-red-400/30 text-red-400 px-3 py-1 rounded-lg text-sm hover:bg-red-500/30 transition-all"
            onClick={handleDisconnect}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Disconnect
          </motion.button>
        </div>

        <div className="mt-3 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-xs">Connected</span>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.button
        className={`bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all ${className}`}
        onClick={() => setShowWalletModal(true)}
        disabled={connecting}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {connecting ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </div>
        ) : (
          'Connect Wallet'
        )}
      </motion.button>

      {/* Wallet Selection Modal */}
      <AnimatePresence>
        {showWalletModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowWalletModal(false)}
          >
            <motion.div
              className="bg-black/80 backdrop-blur-lg border border-cyan-400/30 rounded-3xl p-8 max-w-md w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
                <p className="text-gray-400">Choose your preferred Solana wallet</p>
              </div>

              {error && (
                <motion.div
                  className="bg-red-500/10 border border-red-400/30 rounded-xl p-3 mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="text-red-400 text-sm">{error}</div>
                </motion.div>
              )}

              <div className="space-y-3">
                {wallets.map((wallet, index) => (
                  <motion.button
                    key={wallet.name}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                      wallet.readyState === 'Installed'
                        ? 'border-green-400/30 bg-green-400/10 hover:bg-green-400/20 text-white'
                        : 'border-gray-600/30 bg-gray-600/10 hover:bg-gray-600/20 text-gray-400'
                    }`}
                    onClick={() => connectWallet(wallet)}
                    disabled={connecting}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{wallet.icon}</div>
                      <div className="text-left">
                        <div className="font-bold">{wallet.name}</div>
                        <div className="text-xs opacity-70">
                          {wallet.readyState === 'Installed' ? 'Detected' : 'Not Installed'}
                        </div>
                      </div>
                    </div>
                    
                    {wallet.readyState === 'Installed' ? (
                      <div className="text-green-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 text-center">
                <motion.button
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowWalletModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  New to Solana? Get a wallet to get started.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SolanaWallet;

