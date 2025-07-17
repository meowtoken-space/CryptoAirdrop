import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
  daily_volume?: number;
  freeze_authority?: string;
  mint_authority?: string;
}

interface SwapRoute {
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  marketInfos: Array<{
    id: string;
    label: string;
    inputMint: string;
    outputMint: string;
    notEnoughLiquidity: boolean;
    inAmount: string;
    outAmount: string;
    priceImpactPct: number;
    lpFee: {
      amount: string;
      mint: string;
      pct: number;
    };
    platformFee: {
      amount: string;
      mint: string;
      pct: number;
    };
  }>;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
}

interface JupiterSwapProps {
  wallet?: {
    publicKey: PublicKey;
    signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>;
    signAllTransactions: (transactions: (Transaction | VersionedTransaction)[]) => Promise<(Transaction | VersionedTransaction)[]>;
  };
  connection?: Connection;
  onSwapSuccess?: (signature: string) => void;
  onSwapError?: (error: string) => void;
}

const JupiterSwap: React.FC<JupiterSwapProps> = ({
  wallet,
  connection,
  onSwapSuccess,
  onSwapError
}) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [routes, setRoutes] = useState<SwapRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<SwapRoute | null>(null);
  const [slippage, setSlippage] = useState(0.5); // 0.5%
  const [showTokenSelector, setShowTokenSelector] = useState<'from' | 'to' | null>(null);
  const [tokenSearch, setTokenSearch] = useState('');
  const [priceImpact, setPriceImpact] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const JUPITER_API_URL = 'https://quote-api.jup.ag/v6';
  const POPULAR_TOKENS = [
    'So11111111111111111111111111111111111111112', // SOL
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
    'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', // mSOL
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
    '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', // WIF
  ];

  // Load popular tokens on mount
  useEffect(() => {
    loadTokenList();
  }, []);

  // Load token list from Jupiter API
  const loadTokenList = async () => {
    try {
      const response = await fetch(`${JUPITER_API_URL}/tokens`);
      const tokenList = await response.json();
      
      // Filter and sort tokens
      const filteredTokens = tokenList
        .filter((token: Token) => 
          POPULAR_TOKENS.includes(token.address) || 
          token.daily_volume > 10000 ||
          token.tags?.includes('verified')
        )
        .sort((a: Token, b: Token) => {
          // Prioritize popular tokens
          const aPopular = POPULAR_TOKENS.includes(a.address);
          const bPopular = POPULAR_TOKENS.includes(b.address);
          if (aPopular && !bPopular) return -1;
          if (!aPopular && bPopular) return 1;
          
          // Then sort by volume
          return (b.daily_volume || 0) - (a.daily_volume || 0);
        })
        .slice(0, 100); // Limit to top 100 tokens

      setTokens(filteredTokens);

      // Set default tokens (SOL and USDC)
      const solToken = filteredTokens.find(t => t.symbol === 'SOL');
      const usdcToken = filteredTokens.find(t => t.symbol === 'USDC');
      
      if (solToken) setFromToken(solToken);
      if (usdcToken) setToToken(usdcToken);

    } catch (err) {
      console.error('Error loading token list:', err);
      setError('Failed to load token list');
    }
  };

  // Get quote from Jupiter
  const getQuote = useCallback(async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
      setRoutes([]);
      setSelectedRoute(null);
      setToAmount('');
      setPriceImpact(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const amount = Math.floor(parseFloat(fromAmount) * Math.pow(10, fromToken.decimals));
      
      const params = new URLSearchParams({
        inputMint: fromToken.address,
        outputMint: toToken.address,
        amount: amount.toString(),
        slippageBps: Math.floor(slippage * 100).toString(),
        feeBps: '0',
        maxAccounts: '64'
      });

      const response = await fetch(`${JUPITER_API_URL}/quote?${params}`);
      
      if (!response.ok) {
        throw new Error(`Quote API error: ${response.status}`);
      }

      const quoteResponse = await response.json();
      
      if (quoteResponse.error) {
        throw new Error(quoteResponse.error);
      }

      const routes = Array.isArray(quoteResponse) ? quoteResponse : [quoteResponse];
      setRoutes(routes);
      
      if (routes.length > 0) {
        const bestRoute = routes[0];
        setSelectedRoute(bestRoute);
        
        const outAmount = parseFloat(bestRoute.outAmount) / Math.pow(10, toToken.decimals);
        setToAmount(outAmount.toFixed(6));
        setPriceImpact(bestRoute.priceImpactPct);
      }

    } catch (err: any) {
      console.error('Quote error:', err);
      setError(err.message || 'Failed to get quote');
      setRoutes([]);
      setSelectedRoute(null);
      setToAmount('');
      setPriceImpact(null);
    } finally {
      setLoading(false);
    }
  }, [fromToken, toToken, fromAmount, slippage]);

  // Debounced quote fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      getQuote();
    }, 500);

    return () => clearTimeout(timer);
  }, [getQuote]);

  // Execute swap
  const executeSwap = async () => {
    if (!wallet || !connection || !selectedRoute) {
      setError('Wallet not connected or no route selected');
      return;
    }

    setSwapping(true);
    setError(null);

    try {
      // Get swap transaction from Jupiter
      const swapResponse = await fetch(`${JUPITER_API_URL}/swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse: selectedRoute,
          userPublicKey: wallet.publicKey.toString(),
          wrapAndUnwrapSol: true,
          useSharedAccounts: true,
          feeAccount: undefined,
          trackingAccount: undefined,
          computeUnitPriceMicroLamports: 'auto',
          prioritizationFeeLamports: 'auto',
          asLegacyTransaction: false,
          useTokenLedger: false,
          destinationTokenAccount: undefined,
        }),
      });

      if (!swapResponse.ok) {
        throw new Error(`Swap API error: ${swapResponse.status}`);
      }

      const { swapTransaction } = await swapResponse.json();
      
      // Deserialize the transaction
      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      // Sign and send transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3,
      });

      // Confirm transaction
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      onSwapSuccess?.(signature);
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      setRoutes([]);
      setSelectedRoute(null);
      setPriceImpact(null);

    } catch (err: any) {
      console.error('Swap error:', err);
      const errorMessage = err.message || 'Swap failed';
      setError(errorMessage);
      onSwapError?.(errorMessage);
    } finally {
      setSwapping(false);
    }
  };

  // Swap tokens
  const swapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount('');
  };

  // Filter tokens for search
  const filteredTokens = tokens.filter(token =>
    token.symbol.toLowerCase().includes(tokenSearch.toLowerCase()) ||
    token.name.toLowerCase().includes(tokenSearch.toLowerCase())
  );

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  // Get price impact color
  const getPriceImpactColor = (impact: number) => {
    if (impact < 0.1) return 'text-green-400';
    if (impact < 1) return 'text-yellow-400';
    if (impact < 3) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        className="bg-black/40 backdrop-blur-lg border border-cyan-400/30 rounded-3xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">🪐 Jupiter Swap</h2>
          <p className="text-gray-400">Best prices across Solana</p>
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

        {/* From Token */}
        <div className="mb-4">
          <div className="text-gray-400 text-sm mb-2">From</div>
          <div className="bg-gray-800/50 border border-gray-600/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <motion.button
                className="flex items-center space-x-2 bg-gray-700/50 rounded-lg px-3 py-2 hover:bg-gray-700/70 transition-all"
                onClick={() => setShowTokenSelector('from')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-lg">{fromToken?.symbol || 'Select'}</div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>
              
              <input
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="bg-transparent text-right text-xl font-bold text-white placeholder-gray-500 outline-none flex-1 ml-4"
              />
            </div>
            
            {fromToken && (
              <div className="text-xs text-gray-400">
                {fromToken.name}
              </div>
            )}
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center mb-4">
          <motion.button
            className="bg-purple-500/20 border border-purple-400/30 rounded-full p-2 hover:bg-purple-500/30 transition-all"
            onClick={swapTokens}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </motion.button>
        </div>

        {/* To Token */}
        <div className="mb-6">
          <div className="text-gray-400 text-sm mb-2">To</div>
          <div className="bg-gray-800/50 border border-gray-600/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <motion.button
                className="flex items-center space-x-2 bg-gray-700/50 rounded-lg px-3 py-2 hover:bg-gray-700/70 transition-all"
                onClick={() => setShowTokenSelector('to')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-lg">{toToken?.symbol || 'Select'}</div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>
              
              <div className="text-right text-xl font-bold text-white flex-1 ml-4">
                {loading ? (
                  <div className="flex justify-end">
                    <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  toAmount || '0.00'
                )}
              </div>
            </div>
            
            {toToken && (
              <div className="text-xs text-gray-400">
                {toToken.name}
              </div>
            )}
          </div>
        </div>

        {/* Price Impact & Route Info */}
        {selectedRoute && priceImpact !== null && (
          <motion.div
            className="bg-gray-800/30 border border-gray-600/30 rounded-xl p-4 mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">Price Impact</span>
              <span className={`text-sm font-bold ${getPriceImpactColor(priceImpact)}`}>
                {priceImpact.toFixed(2)}%
              </span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">Slippage</span>
              <span className="text-white text-sm">{slippage}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Route</span>
              <span className="text-white text-sm">
                {selectedRoute.marketInfos.length} hop{selectedRoute.marketInfos.length > 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>
        )}

        {/* Slippage Settings */}
        <div className="mb-6">
          <div className="text-gray-400 text-sm mb-2">Slippage Tolerance</div>
          <div className="flex space-x-2">
            {[0.1, 0.5, 1.0].map((value) => (
              <motion.button
                key={value}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                  slippage === value
                    ? 'bg-cyan-400/20 border border-cyan-400/30 text-cyan-400'
                    : 'bg-gray-700/50 border border-gray-600/30 text-gray-400 hover:bg-gray-700/70'
                }`}
                onClick={() => setSlippage(value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {value}%
              </motion.button>
            ))}
            
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="50"
              value={slippage}
              onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
              className="bg-gray-700/50 border border-gray-600/30 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 w-20"
            />
          </div>
        </div>

        {/* Swap Button */}
        <motion.button
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            !wallet
              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
              : !selectedRoute
              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
              : swapping
              ? 'bg-orange-500/50 text-orange-300'
              : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-500 hover:to-blue-600'
          }`}
          onClick={executeSwap}
          disabled={!wallet || !selectedRoute || swapping}
          whileHover={wallet && selectedRoute && !swapping ? { scale: 1.02 } : {}}
          whileTap={wallet && selectedRoute && !swapping ? { scale: 0.98 } : {}}
        >
          {!wallet ? (
            'Connect Wallet'
          ) : swapping ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-orange-300 border-t-transparent rounded-full animate-spin"></div>
              <span>Swapping...</span>
            </div>
          ) : !selectedRoute ? (
            'Enter Amount'
          ) : (
            'Swap'
          )}
        </motion.button>
      </motion.div>

      {/* Token Selector Modal */}
      <AnimatePresence>
        {showTokenSelector && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTokenSelector(null)}
          >
            <motion.div
              className="bg-black/80 backdrop-blur-lg border border-cyan-400/30 rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-hidden"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white">Select Token</h3>
              </div>

              <input
                type="text"
                placeholder="Search tokens..."
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-cyan-400/50 mb-4"
              />

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredTokens.map((token) => (
                  <motion.button
                    key={token.address}
                    className="w-full p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-xl transition-all text-left"
                    onClick={() => {
                      if (showTokenSelector === 'from') {
                        setFromToken(token);
                      } else {
                        setToToken(token);
                      }
                      setShowTokenSelector(null);
                      setTokenSearch('');
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-bold">{token.symbol}</div>
                        <div className="text-gray-400 text-sm">{token.name}</div>
                      </div>
                      {token.daily_volume && (
                        <div className="text-gray-400 text-xs">
                          Vol: ${formatNumber(token.daily_volume)}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-4 text-center">
                <motion.button
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={() => {
                    setShowTokenSelector(null);
                    setTokenSearch('');
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JupiterSwap;

