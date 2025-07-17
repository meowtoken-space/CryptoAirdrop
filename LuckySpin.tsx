import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpinResult {
  id: string;
  label: string;
  points: number;
  probability: number;
  color: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface SpinStats {
  totalSpins: number;
  totalPointsWon: number;
  bestSpin: number;
  spinsToday: number;
  lastSpinTime: number;
}

const LuckySpin: React.FC = () => {
  const [spinResults] = useState<SpinResult[]>([
    { id: '1', label: '10 Points', points: 10, probability: 30, color: '#10B981', icon: '💰', rarity: 'common' },
    { id: '2', label: '25 Points', points: 25, probability: 25, color: '#3B82F6', icon: '💎', rarity: 'common' },
    { id: '3', label: '50 Points', points: 50, probability: 20, color: '#8B5CF6', icon: '⭐', rarity: 'rare' },
    { id: '4', label: '100 Points', points: 100, probability: 15, color: '#F59E0B', icon: '🔥', rarity: 'rare' },
    { id: '5', label: '250 Points', points: 250, probability: 7, color: '#EF4444', icon: '💫', rarity: 'epic' },
    { id: '6', label: '500 Points', points: 500, probability: 2.5, color: '#EC4899', icon: '🌟', rarity: 'epic' },
    { id: '7', label: '1000 Points', points: 1000, probability: 0.4, color: '#F97316', icon: '👑', rarity: 'legendary' },
    { id: '8', label: 'JACKPOT!', points: 5000, probability: 0.1, color: '#FBBF24', icon: '🎰', rarity: 'legendary' },
  ]);

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [spinCost] = useState(50);
  const [userPoints, setUserPoints] = useState(1000);
  const [stats, setStats] = useState<SpinStats>({
    totalSpins: 0,
    totalPointsWon: 0,
    bestSpin: 0,
    spinsToday: 0,
    lastSpinTime: 0
  });
  const [canSpin, setCanSpin] = useState(true);
  const [cooldownTime, setCooldownTime] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => {
        setCooldownTime(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanSpin(true);
    }
  }, [cooldownTime]);

  const getRandomResult = (): SpinResult => {
    const random = Math.random() * 100;
    let cumulativeProbability = 0;
    
    for (const result of spinResults) {
      cumulativeProbability += result.probability;
      if (random <= cumulativeProbability) {
        return result;
      }
    }
    
    return spinResults[0]; // Fallback
  };

  const spin = () => {
    if (!canSpin || isSpinning || userPoints < spinCost) return;

    setIsSpinning(true);
    setShowResult(false);
    setCanSpin(false);
    
    // Deduct spin cost
    setUserPoints(prev => prev - spinCost);
    
    // Get random result
    const spinResult = getRandomResult();
    
    // Calculate rotation (multiple full rotations + final position)
    const segmentAngle = 360 / spinResults.length;
    const resultIndex = spinResults.findIndex(r => r.id === spinResult.id);
    const finalAngle = resultIndex * segmentAngle;
    const totalRotation = rotation + 1440 + (360 - finalAngle); // 4 full rotations + final position
    
    setRotation(totalRotation);
    
    // Show result after animation
    setTimeout(() => {
      setResult(spinResult);
      setUserPoints(prev => prev + spinResult.points);
      setShowResult(true);
      setIsSpinning(false);
      
      // Update stats
      setStats(prev => ({
        totalSpins: prev.totalSpins + 1,
        totalPointsWon: prev.totalPointsWon + spinResult.points,
        bestSpin: Math.max(prev.bestSpin, spinResult.points),
        spinsToday: prev.spinsToday + 1,
        lastSpinTime: Date.now()
      }));
      
      // Start cooldown
      setCooldownTime(30); // 30 second cooldown
    }, 3000);
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-lg shadow-green-400/20';
      case 'rare': return 'shadow-lg shadow-blue-400/30';
      case 'epic': return 'shadow-lg shadow-purple-400/40';
      case 'legendary': return 'shadow-lg shadow-yellow-400/50';
      default: return '';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-yellow-400/10 to-orange-600/10 animate-pulse"></div>
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* User Points */}
          <motion.div 
            className="bg-black/40 backdrop-blur-lg border border-green-400/30 rounded-2xl p-6 text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-green-400 text-sm font-medium mb-2">YOUR POINTS</div>
            <div className="text-3xl font-bold text-white">{userPoints.toLocaleString()}</div>
          </motion.div>

          {/* Spin Cost */}
          <motion.div 
            className="bg-black/40 backdrop-blur-lg border border-orange-400/30 rounded-2xl p-6 text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-orange-400 text-sm font-medium mb-2">SPIN COST</div>
            <div className="text-3xl font-bold text-white">{spinCost}</div>
          </motion.div>

          {/* Total Spins */}
          <motion.div 
            className="bg-black/40 backdrop-blur-lg border border-blue-400/30 rounded-2xl p-6 text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-blue-400 text-sm font-medium mb-2">TOTAL SPINS</div>
            <div className="text-3xl font-bold text-white">{stats.totalSpins}</div>
          </motion.div>

          {/* Best Win */}
          <motion.div 
            className="bg-black/40 backdrop-blur-lg border border-yellow-400/30 rounded-2xl p-6 text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-yellow-400 text-sm font-medium mb-2">BEST WIN</div>
            <div className="text-3xl font-bold text-white">{stats.bestSpin}</div>
          </motion.div>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Spin Wheel */}
          <div className="lg:col-span-2 flex flex-col items-center">
            <motion.div
              className="relative w-80 h-80 mb-8"
              whileHover={{ scale: 1.02 }}
            >
              {/* Wheel Container */}
              <div className="relative w-full h-full">
                {/* Wheel */}
                <motion.div
                  className="w-full h-full rounded-full border-8 border-cyan-400/50 relative overflow-hidden"
                  style={{ 
                    background: 'conic-gradient(from 0deg, #10B981 0deg 45deg, #3B82F6 45deg 90deg, #8B5CF6 90deg 135deg, #F59E0B 135deg 180deg, #EF4444 180deg 225deg, #EC4899 225deg 270deg, #F97316 270deg 315deg, #FBBF24 315deg 360deg)',
                    transform: `rotate(${rotation}deg)`
                  }}
                  animate={{ rotate: rotation }}
                  transition={{ duration: 3, ease: "easeOut" }}
                >
                  {/* Segments */}
                  {spinResults.map((result, index) => {
                    const angle = (360 / spinResults.length) * index;
                    return (
                      <div
                        key={result.id}
                        className="absolute w-full h-full flex items-center justify-center"
                        style={{
                          transform: `rotate(${angle}deg)`,
                          transformOrigin: 'center'
                        }}
                      >
                        <div 
                          className="text-white font-bold text-sm text-center"
                          style={{ 
                            transform: `translateY(-120px) rotate(${-angle}deg)`,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                          }}
                        >
                          <div className="text-2xl mb-1">{result.icon}</div>
                          <div className="text-xs">{result.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>

                {/* Center Hub */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full border-4 border-white flex items-center justify-center">
                  <motion.div
                    className="text-2xl"
                    animate={{ rotate: isSpinning ? 360 : 0 }}
                    transition={{ duration: 0.5, repeat: isSpinning ? Infinity : 0 }}
                  >
                    🎰
                  </motion.div>
                </div>

                {/* Pointer */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400"></div>
                </div>
              </div>
            </motion.div>

            {/* Spin Button */}
            <motion.button
              className={`px-12 py-4 rounded-2xl font-bold text-xl transition-all ${
                canSpin && !isSpinning && userPoints >= spinCost
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-lg hover:shadow-yellow-400/30'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
              onClick={spin}
              disabled={!canSpin || isSpinning || userPoints < spinCost}
              whileHover={canSpin && !isSpinning && userPoints >= spinCost ? { scale: 1.05 } : {}}
              whileTap={canSpin && !isSpinning && userPoints >= spinCost ? { scale: 0.95 } : {}}
            >
              {isSpinning ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  🎰
                </motion.div>
              ) : !canSpin ? (
                `Cooldown: ${formatTime(cooldownTime)}`
              ) : userPoints < spinCost ? (
                'Not Enough Points'
              ) : (
                'SPIN THE WHEEL!'
              )}
            </motion.button>

            {userPoints < spinCost && (
              <div className="text-red-400 text-sm mt-2">
                Need {spinCost - userPoints} more points to spin
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Prize Table */}
            <motion.div
              className="bg-black/40 backdrop-blur-lg border border-cyan-400/30 rounded-2xl p-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-cyan-400 text-lg font-bold mb-4">PRIZE TABLE</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {spinResults.map((result) => (
                  <div
                    key={result.id}
                    className={`p-3 rounded-xl border ${getRarityGlow(result.rarity)}`}
                    style={{ borderColor: result.color + '50', backgroundColor: result.color + '10' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{result.icon}</span>
                        <div>
                          <div className="text-white text-sm font-medium">{result.label}</div>
                          <div className="text-xs" style={{ color: result.color }}>
                            {result.probability}% chance
                          </div>
                        </div>
                      </div>
                      <div className="text-white font-bold">{result.points}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Statistics */}
            <motion.div
              className="bg-black/40 backdrop-blur-lg border border-purple-400/30 rounded-2xl p-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-purple-400 text-lg font-bold mb-4">STATISTICS</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Won:</span>
                  <span className="text-green-400 font-bold">{stats.totalPointsWon}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Spins Today:</span>
                  <span className="text-blue-400 font-bold">{stats.spinsToday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Win Rate:</span>
                  <span className="text-yellow-400 font-bold">
                    {stats.totalSpins > 0 ? Math.round((stats.totalPointsWon / (stats.totalSpins * spinCost)) * 100) : 0}%
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Result Modal */}
        <AnimatePresence>
          {showResult && result && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResult(false)}
            >
              <motion.div
                className={`bg-black/80 backdrop-blur-lg border-2 rounded-3xl p-8 text-center max-w-md mx-4 ${getRarityGlow(result.rarity)}`}
                style={{ borderColor: result.color }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {result.icon}
                </motion.div>
                
                <h2 className="text-3xl font-bold text-white mb-2">{result.label}</h2>
                <div className="text-xl mb-4" style={{ color: result.color }}>
                  +{result.points} Points!
                </div>
                
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold mb-6`} style={{ 
                  backgroundColor: result.color + '20',
                  color: result.color,
                  border: `1px solid ${result.color}50`
                }}>
                  {result.rarity.toUpperCase()}
                </div>
                
                <motion.button
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 px-6 rounded-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowResult(false)}
                >
                  Continue
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LuckySpin;

