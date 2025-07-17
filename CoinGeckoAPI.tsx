import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

interface TrendingCoin {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
}

interface GlobalData {
  active_cryptocurrencies: number;
  upcoming_icos: number;
  ongoing_icos: number;
  ended_icos: number;
  markets: number;
  total_market_cap: { [key: string]: number };
  total_volume: { [key: string]: number };
  market_cap_percentage: { [key: string]: number };
  market_cap_change_percentage_24h_usd: number;
  updated_at: number;
}

interface CoinGeckoAPIProps {
  apiKey?: string;
  showTrending?: boolean;
  showGlobal?: boolean;
  showTopCoins?: boolean;
  maxCoins?: number;
  refreshInterval?: number;
  className?: string;
}

const CoinGeckoAPI: React.FC<CoinGeckoAPIProps> = ({
  apiKey,
  showTrending = true,
  showGlobal = true,
  showTopCoins = true,
  maxCoins = 10,
  refreshInterval = 60000, // 1 minute
  className = ''
}) => {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([]);
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const BASE_URL = 'https://api.coingecko.com/api/v3';
  const DEMO_URL = 'https://api.coingecko.com/api/v3'; // Free tier

  // Headers for API requests
  const getHeaders = () => {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['x-cg-demo-api-key'] = apiKey;
    }
    
    return headers;
  };

  // Fetch top coins data
  const fetchTopCoins = useCallback(async () => {
    try {
      const url = `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${maxCoins}&page=1&sparkline=true&price_change_percentage=24h`;
      
      const response = await fetch(url, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CoinData[] = await response.json();
      setCoins(data);
    } catch (err: any) {
      console.error('Error fetching top coins:', err);
      setError(err.message || 'Failed to fetch top coins');
    }
  }, [maxCoins, apiKey]);

  // Fetch trending coins
  const fetchTrendingCoins = useCallback(async () => {
    try {
      const url = `${BASE_URL}/search/trending`;
      
      const response = await fetch(url, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTrendingCoins(data.coins || []);
    } catch (err: any) {
      console.error('Error fetching trending coins:', err);
      // Don't set error for trending as it's not critical
    }
  }, [apiKey]);

  // Fetch global market data
  const fetchGlobalData = useCallback(async () => {
    try {
      const url = `${BASE_URL}/global`;
      
      const response = await fetch(url, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGlobalData(data.data);
    } catch (err: any) {
      console.error('Error fetching global data:', err);
      // Don't set error for global data as it's not critical
    }
  }, [apiKey]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const promises = [];
      
      if (showTopCoins) promises.push(fetchTopCoins());
      if (showTrending) promises.push(fetchTrendingCoins());
      if (showGlobal) promises.push(fetchGlobalData());

      await Promise.all(promises);
      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [showTopCoins, showTrending, showGlobal, fetchTopCoins, fetchTrendingCoins, fetchGlobalData]);

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Auto-refresh data
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchAllData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchAllData, refreshInterval]);

  // Format currency
  const formatCurrency = (value: number, decimals: number = 2) => {
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(decimals)}T`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(decimals)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(decimals)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(decimals)}K`;
    } else {
      return `$${value.toFixed(decimals)}`;
    }
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    const formatted = value.toFixed(2);
    return value >= 0 ? `+${formatted}%` : `${formatted}%`;
  };

  // Get percentage color
  const getPercentageColor = (value: number) => {
    return value >= 0 ? 'text-green-400' : 'text-red-400';
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  // Show coin details
  const showCoinDetails = (coin: CoinData) => {
    setSelectedCoin(coin);
    setShowDetails(true);
  };

  if (loading && coins.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white">Loading market data...</div>
        </div>
      </div>
    );
  }

  if (error && coins.length === 0) {
    return (
      <div className={`p-6 ${className}`}>
        <motion.div
          className="bg-red-500/10 border border-red-400/30 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-red-400 font-bold mb-2">Error Loading Data</div>
          <div className="text-red-300 text-sm mb-4">{error}</div>
          <motion.button
            className="bg-red-500/20 border border-red-400/30 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all"
            onClick={fetchAllData}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retry
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Global Market Stats */}
      {showGlobal && globalData && (
        <motion.div
          className="bg-black/40 backdrop-blur-lg border border-cyan-400/30 rounded-3xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-white mb-2">🌍 Global Market</h2>
            <div className="text-gray-400 text-sm">
              {lastUpdate && `Last updated: ${lastUpdate.toLocaleTimeString()}`}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-gray-400 text-sm">Total Market Cap</div>
              <div className="text-white font-bold text-lg">
                {formatCurrency(globalData.total_market_cap.usd)}
              </div>
              <div className={`text-sm ${getPercentageColor(globalData.market_cap_change_percentage_24h_usd)}`}>
                {formatPercentage(globalData.market_cap_change_percentage_24h_usd)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-gray-400 text-sm">24h Volume</div>
              <div className="text-white font-bold text-lg">
                {formatCurrency(globalData.total_volume.usd)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-gray-400 text-sm">BTC Dominance</div>
              <div className="text-white font-bold text-lg">
                {globalData.market_cap_percentage.btc?.toFixed(1)}%
              </div>
            </div>

            <div className="text-center">
              <div className="text-gray-400 text-sm">Active Coins</div>
              <div className="text-white font-bold text-lg">
                {formatNumber(globalData.active_cryptocurrencies)}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Trending Coins */}
      {showTrending && trendingCoins.length > 0 && (
        <motion.div
          className="bg-black/40 backdrop-blur-lg border border-purple-400/30 rounded-3xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-white mb-2">🔥 Trending</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {trendingCoins.slice(0, 5).map((coin, index) => (
              <motion.div
                key={coin.id}
                className="bg-purple-500/10 border border-purple-400/20 rounded-xl p-3 text-center hover:bg-purple-500/20 transition-all cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img src={coin.small} alt={coin.name} className="w-8 h-8 mx-auto mb-2" />
                <div className="text-white font-bold text-sm">{coin.symbol.toUpperCase()}</div>
                <div className="text-gray-400 text-xs">#{coin.market_cap_rank}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Top Coins */}
      {showTopCoins && coins.length > 0 && (
        <motion.div
          className="bg-black/40 backdrop-blur-lg border border-green-400/30 rounded-3xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">💰 Top Cryptocurrencies</h3>
            
            <motion.button
              className="bg-green-500/20 border border-green-400/30 text-green-400 px-3 py-1 rounded-lg hover:bg-green-500/30 transition-all"
              onClick={fetchAllData}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Refresh'
              )}
            </motion.button>
          </div>

          <div className="space-y-3">
            {coins.map((coin, index) => (
              <motion.div
                key={coin.id}
                className="bg-gray-800/30 border border-gray-600/30 rounded-xl p-4 hover:bg-gray-800/50 transition-all cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => showCoinDetails(coin)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-400 text-sm w-8">#{coin.market_cap_rank}</div>
                    <img src={coin.image} alt={coin.name} className="w-8 h-8" />
                    <div>
                      <div className="text-white font-bold">{coin.symbol.toUpperCase()}</div>
                      <div className="text-gray-400 text-sm">{coin.name}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-white font-bold">
                      ${coin.current_price.toFixed(coin.current_price < 1 ? 6 : 2)}
                    </div>
                    <div className={`text-sm ${getPercentageColor(coin.price_change_percentage_24h)}`}>
                      {formatPercentage(coin.price_change_percentage_24h)}
                    </div>
                  </div>

                  <div className="text-right hidden md:block">
                    <div className="text-gray-400 text-sm">Market Cap</div>
                    <div className="text-white font-bold">
                      {formatCurrency(coin.market_cap)}
                    </div>
                  </div>

                  <div className="text-right hidden lg:block">
                    <div className="text-gray-400 text-sm">Volume 24h</div>
                    <div className="text-white font-bold">
                      {formatCurrency(coin.total_volume)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Coin Details Modal */}
      <AnimatePresence>
        {showDetails && selectedCoin && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              className="bg-black/80 backdrop-blur-lg border border-cyan-400/30 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <img src={selectedCoin.image} alt={selectedCoin.name} className="w-12 h-12" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedCoin.name}</h2>
                    <div className="text-gray-400">{selectedCoin.symbol.toUpperCase()}</div>
                  </div>
                </div>
                
                <motion.button
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowDetails(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-gray-400 text-sm">Current Price</div>
                    <div className="text-white font-bold text-2xl">
                      ${selectedCoin.current_price.toFixed(selectedCoin.current_price < 1 ? 6 : 2)}
                    </div>
                    <div className={`text-sm ${getPercentageColor(selectedCoin.price_change_percentage_24h)}`}>
                      {formatPercentage(selectedCoin.price_change_percentage_24h)} (24h)
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-400 text-sm">Market Cap Rank</div>
                    <div className="text-white font-bold">#{selectedCoin.market_cap_rank}</div>
                  </div>

                  <div>
                    <div className="text-gray-400 text-sm">Market Cap</div>
                    <div className="text-white font-bold">{formatCurrency(selectedCoin.market_cap)}</div>
                  </div>

                  <div>
                    <div className="text-gray-400 text-sm">24h Volume</div>
                    <div className="text-white font-bold">{formatCurrency(selectedCoin.total_volume)}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-gray-400 text-sm">24h High / Low</div>
                    <div className="text-white font-bold">
                      ${selectedCoin.high_24h.toFixed(2)} / ${selectedCoin.low_24h.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-400 text-sm">All Time High</div>
                    <div className="text-white font-bold">${selectedCoin.ath.toFixed(2)}</div>
                    <div className="text-red-400 text-sm">
                      {formatPercentage(selectedCoin.ath_change_percentage)} from ATH
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-400 text-sm">Circulating Supply</div>
                    <div className="text-white font-bold">
                      {formatNumber(selectedCoin.circulating_supply)} {selectedCoin.symbol.toUpperCase()}
                    </div>
                  </div>

                  {selectedCoin.max_supply && (
                    <div>
                      <div className="text-gray-400 text-sm">Max Supply</div>
                      <div className="text-white font-bold">
                        {formatNumber(selectedCoin.max_supply)} {selectedCoin.symbol.toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoinGeckoAPI;

