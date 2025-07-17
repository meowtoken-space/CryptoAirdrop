import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  requirement: number;
  unlocked: boolean;
  icon: string;
}

interface PowerUp {
  id: string;
  name: string;
  multiplier: number;
  duration: number;
  cost: number;
  icon: string;
  color: string;
}

const MeowClicker: React.FC = () => {
  const [points, setPoints] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [maxEnergy] = useState(100);
  const [clickMultiplier, setClickMultiplier] = useState(1);
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: '1', title: 'First Click', description: 'Click your first meow!', requirement: 1, unlocked: false, icon: '🐱' },
    { id: '2', title: 'Meow Master', description: 'Reach 100 points', requirement: 100, unlocked: false, icon: '👑' },
    { id: '3', title: 'Energy Saver', description: 'Maintain full energy for 30 seconds', requirement: 30, unlocked: false, icon: '⚡' },
    { id: '4', title: 'Click Storm', description: 'Click 50 times in 10 seconds', requirement: 50, unlocked: false, icon: '🌪️' },
    { id: '5', title: 'Millionaire Cat', description: 'Reach 1000 points', requirement: 1000, unlocked: false, icon: '💎' },
  ]);
  
  const [powerUps] = useState<PowerUp[]>([
    { id: '1', name: '2x Multiplier', multiplier: 2, duration: 30, cost: 50, icon: '⚡', color: '#FFE118' },
    { id: '2', name: '5x Multiplier', multiplier: 5, duration: 15, cost: 150, icon: '🔥', color: '#FF6B6B' },
    { id: '3', name: '10x Multiplier', multiplier: 10, duration: 10, cost: 300, icon: '💫', color: '#9A45FC' },
  ]);

  const [activePowerUp, setActivePowerUp] = useState<PowerUp | null>(null);
  const [powerUpTimeLeft, setPowerUpTimeLeft] = useState(0);
  const [clickAnimations, setClickAnimations] = useState<Array<{ id: number; x: number; y: number; points: number }>>([]);
  const [streak, setStreak] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [clicksInLast10Seconds, setClicksInLast10Seconds] = useState<number[]>([]);

  // Energy regeneration
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => Math.min(prev + 1, maxEnergy));
    }, 1000);
    return () => clearInterval(interval);
  }, [maxEnergy]);

  // Power-up timer
  useEffect(() => {
    if (powerUpTimeLeft > 0) {
      const timer = setTimeout(() => {
        setPowerUpTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (activePowerUp) {
      setActivePowerUp(null);
      setClickMultiplier(1);
    }
  }, [powerUpTimeLeft, activePowerUp]);

  // Achievement checker
  useEffect(() => {
    setAchievements(prev => prev.map(achievement => {
      if (!achievement.unlocked) {
        let shouldUnlock = false;
        switch (achievement.id) {
          case '1':
            shouldUnlock = totalClicks >= achievement.requirement;
            break;
          case '2':
            shouldUnlock = points >= achievement.requirement;
            break;
          case '5':
            shouldUnlock = points >= achievement.requirement;
            break;
          case '4':
            shouldUnlock = clicksInLast10Seconds.length >= achievement.requirement;
            break;
        }
        if (shouldUnlock) {
          showAchievementNotification(achievement);
          return { ...achievement, unlocked: true };
        }
      }
      return achievement;
    }));
  }, [points, totalClicks, clicksInLast10Seconds]);

  // Track clicks in last 10 seconds
  useEffect(() => {
    const now = Date.now();
    setClicksInLast10Seconds(prev => 
      prev.filter(clickTime => now - clickTime < 10000)
    );
  }, [totalClicks]);

  const showAchievementNotification = (achievement: Achievement) => {
    // Achievement notification logic would go here
    console.log(`Achievement unlocked: ${achievement.title}`);
  };

  const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (energy < 5) return;

    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;
    
    // Update streak
    if (timeSinceLastClick < 2000) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(1);
    }

    setLastClickTime(now);
    setTotalClicks(prev => prev + 1);
    setClicksInLast10Seconds(prev => [...prev, now]);

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const basePoints = Math.max(1, Math.floor(streak / 5) + 1);
    const finalPoints = basePoints * clickMultiplier * (activePowerUp?.multiplier || 1);
    
    setPoints(prev => prev + finalPoints);
    setEnergy(prev => Math.max(0, prev - 5));

    // Add click animation
    const animationId = Date.now() + Math.random();
    setClickAnimations(prev => [...prev, { id: animationId, x, y, points: finalPoints }]);

    // Remove animation after 1 second
    setTimeout(() => {
      setClickAnimations(prev => prev.filter(anim => anim.id !== animationId));
    }, 1000);
  }, [energy, streak, lastClickTime, clickMultiplier, activePowerUp]);

  const buyPowerUp = (powerUp: PowerUp) => {
    if (points >= powerUp.cost && !activePowerUp) {
      setPoints(prev => prev - powerUp.cost);
      setActivePowerUp(powerUp);
      setClickMultiplier(powerUp.multiplier);
      setPowerUpTimeLeft(powerUp.duration);
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
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-400/20 to-purple-600/20 animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-yellow-400/10 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Points Display */}
          <motion.div 
            className="bg-black/40 backdrop-blur-lg border border-cyan-400/30 rounded-2xl p-6 text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-cyan-400 text-sm font-medium mb-2">MEOW POINTS</div>
            <div className="text-4xl font-bold text-white mb-2">{points.toLocaleString()}</div>
            <div className="text-yellow-400 text-sm">Streak: {streak}x</div>
          </motion.div>

          {/* Energy Bar */}
          <motion.div 
            className="bg-black/40 backdrop-blur-lg border border-green-400/30 rounded-2xl p-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-green-400 text-sm font-medium mb-2">ENERGY</div>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
              <motion.div 
                className="bg-gradient-to-r from-green-400 to-cyan-400 h-4 rounded-full relative overflow-hidden"
                style={{ width: `${(energy / maxEnergy) * 100}%` }}
                animate={{ width: `${(energy / maxEnergy) * 100}%` }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </motion.div>
            </div>
            <div className="text-white text-sm">{energy}/{maxEnergy}</div>
          </motion.div>

          {/* Active Power-up */}
          <motion.div 
            className="bg-black/40 backdrop-blur-lg border border-purple-400/30 rounded-2xl p-6 text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-purple-400 text-sm font-medium mb-2">POWER-UP</div>
            {activePowerUp ? (
              <>
                <div className="text-2xl mb-1">{activePowerUp.icon}</div>
                <div className="text-white text-sm">{activePowerUp.name}</div>
                <div className="text-yellow-400 text-sm">{formatTime(powerUpTimeLeft)}</div>
              </>
            ) : (
              <div className="text-gray-400 text-sm">None Active</div>
            )}
          </motion.div>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Click Area */}
          <div className="lg:col-span-2">
            <motion.div
              className="relative bg-black/40 backdrop-blur-lg border border-cyan-400/30 rounded-3xl p-8 text-center cursor-pointer select-none overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClick}
              style={{ minHeight: '400px' }}
            >
              {/* Click Animations */}
              <AnimatePresence>
                {clickAnimations.map((anim) => (
                  <motion.div
                    key={anim.id}
                    className="absolute pointer-events-none text-yellow-400 font-bold text-2xl"
                    style={{ left: anim.x, top: anim.y }}
                    initial={{ opacity: 1, scale: 1, y: 0 }}
                    animate={{ opacity: 0, scale: 1.5, y: -50 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                  >
                    +{anim.points}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Main Cat */}
              <motion.div
                className="text-9xl mb-4 inline-block"
                animate={{ 
                  rotate: [0, -5, 5, 0],
                  scale: energy < 5 ? 0.8 : 1
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity },
                  scale: { duration: 0.3 }
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                🐱
              </motion.div>

              <div className="text-white text-xl mb-4">
                {energy < 5 ? "😴 Cat is tired..." : "Click the Cyber Cat!"}
              </div>

              {clickMultiplier > 1 && (
                <motion.div
                  className="text-yellow-400 text-lg font-bold"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {clickMultiplier}x MULTIPLIER ACTIVE!
                </motion.div>
              )}

              {/* Particle Effects */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Power-ups */}
            <motion.div
              className="bg-black/40 backdrop-blur-lg border border-purple-400/30 rounded-2xl p-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-purple-400 text-lg font-bold mb-4">POWER-UPS</h3>
              <div className="space-y-3">
                {powerUps.map((powerUp) => (
                  <motion.button
                    key={powerUp.id}
                    className={`w-full p-3 rounded-xl border transition-all ${
                      points >= powerUp.cost && !activePowerUp
                        ? 'border-green-400/50 bg-green-400/10 hover:bg-green-400/20 text-white'
                        : 'border-gray-600/50 bg-gray-600/10 text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={() => buyPowerUp(powerUp)}
                    disabled={points < powerUp.cost || !!activePowerUp}
                    whileHover={points >= powerUp.cost && !activePowerUp ? { scale: 1.05 } : {}}
                    whileTap={points >= powerUp.cost && !activePowerUp ? { scale: 0.95 } : {}}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{powerUp.icon}</span>
                        <div className="text-left">
                          <div className="text-sm font-medium">{powerUp.name}</div>
                          <div className="text-xs opacity-70">{powerUp.duration}s</div>
                        </div>
                      </div>
                      <div className="text-yellow-400 font-bold">{powerUp.cost}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              className="bg-black/40 backdrop-blur-lg border border-yellow-400/30 rounded-2xl p-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-yellow-400 text-lg font-bold mb-4">ACHIEVEMENTS</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    className={`p-3 rounded-xl border ${
                      achievement.unlocked
                        ? 'border-green-400/50 bg-green-400/10'
                        : 'border-gray-600/50 bg-gray-600/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${
                          achievement.unlocked ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          {achievement.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {achievement.description}
                        </div>
                      </div>
                      {achievement.unlocked && (
                        <motion.div
                          className="text-green-400"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          ✓
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeowClicker;

