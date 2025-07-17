import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Fighter {
  id: string;
  name: string;
  icon: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  level: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  abilities: Ability[];
}

interface Ability {
  id: string;
  name: string;
  damage: number;
  cost: number;
  cooldown: number;
  currentCooldown: number;
  type: 'attack' | 'defense' | 'heal' | 'special';
  description: string;
  icon: string;
}

interface BattleStats {
  wins: number;
  losses: number;
  totalBattles: number;
  winStreak: number;
  bestStreak: number;
  totalDamageDealt: number;
  totalPointsEarned: number;
}

const BattleArena: React.FC = () => {
  const [fighters] = useState<Fighter[]>([
    {
      id: '1',
      name: 'Cyber Cat',
      icon: '🐱',
      hp: 100,
      maxHp: 100,
      attack: 25,
      defense: 15,
      speed: 20,
      level: 1,
      rarity: 'common',
      abilities: [
        { id: '1', name: 'Claw Strike', damage: 20, cost: 0, cooldown: 0, currentCooldown: 0, type: 'attack', description: 'Basic claw attack', icon: '🐾' },
        { id: '2', name: 'Pounce', damage: 35, cost: 10, cooldown: 2, currentCooldown: 0, type: 'attack', description: 'Powerful leap attack', icon: '💨' },
        { id: '3', name: 'Purr Heal', damage: -25, cost: 15, cooldown: 3, currentCooldown: 0, type: 'heal', description: 'Healing purr', icon: '💚' }
      ]
    },
    {
      id: '2',
      name: 'Crypto Dragon',
      icon: '🐉',
      hp: 150,
      maxHp: 150,
      attack: 35,
      defense: 20,
      speed: 15,
      level: 2,
      rarity: 'rare',
      abilities: [
        { id: '1', name: 'Fire Breath', damage: 30, cost: 0, cooldown: 0, currentCooldown: 0, type: 'attack', description: 'Scorching fire breath', icon: '🔥' },
        { id: '2', name: 'Wing Slam', damage: 45, cost: 12, cooldown: 2, currentCooldown: 0, type: 'attack', description: 'Powerful wing attack', icon: '🌪️' },
        { id: '3', name: 'Scale Shield', damage: 0, cost: 20, cooldown: 4, currentCooldown: 0, type: 'defense', description: 'Defensive scales', icon: '🛡️' }
      ]
    },
    {
      id: '3',
      name: 'Neon Wolf',
      icon: '🐺',
      hp: 120,
      maxHp: 120,
      attack: 30,
      defense: 18,
      speed: 25,
      level: 2,
      rarity: 'rare',
      abilities: [
        { id: '1', name: 'Bite', damage: 25, cost: 0, cooldown: 0, currentCooldown: 0, type: 'attack', description: 'Sharp bite attack', icon: '🦷' },
        { id: '2', name: 'Howl', damage: 40, cost: 15, cooldown: 3, currentCooldown: 0, type: 'special', description: 'Intimidating howl', icon: '🌙' },
        { id: '3', name: 'Pack Hunt', damage: 50, cost: 25, cooldown: 4, currentCooldown: 0, type: 'attack', description: 'Coordinated attack', icon: '⚡' }
      ]
    },
    {
      id: '4',
      name: 'Quantum Phoenix',
      icon: '🔥',
      hp: 200,
      maxHp: 200,
      attack: 40,
      defense: 25,
      speed: 30,
      level: 3,
      rarity: 'epic',
      abilities: [
        { id: '1', name: 'Flame Strike', damage: 35, cost: 0, cooldown: 0, currentCooldown: 0, type: 'attack', description: 'Burning flame attack', icon: '🔥' },
        { id: '2', name: 'Phoenix Dive', damage: 60, cost: 20, cooldown: 3, currentCooldown: 0, type: 'attack', description: 'Devastating dive attack', icon: '💫' },
        { id: '3', name: 'Rebirth', damage: -50, cost: 30, cooldown: 5, currentCooldown: 0, type: 'heal', description: 'Phoenix resurrection', icon: '✨' }
      ]
    }
  ]);

  const [playerFighter, setPlayerFighter] = useState<Fighter | null>(null);
  const [enemyFighter, setEnemyFighter] = useState<Fighter | null>(null);
  const [battleActive, setBattleActive] = useState(false);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [playerEnergy, setPlayerEnergy] = useState(50);
  const [maxEnergy] = useState(50);
  const [stats, setStats] = useState<BattleStats>({
    wins: 0,
    losses: 0,
    totalBattles: 0,
    winStreak: 0,
    bestStreak: 0,
    totalDamageDealt: 0,
    totalPointsEarned: 0
  });
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [selectedAbility, setSelectedAbility] = useState<Ability | null>(null);

  // Energy regeneration
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerEnergy(prev => Math.min(prev + 2, maxEnergy));
    }, 1000);
    return () => clearInterval(interval);
  }, [maxEnergy]);

  // Cooldown management
  useEffect(() => {
    if (playerFighter) {
      const updatedFighter = { ...playerFighter };
      updatedFighter.abilities = updatedFighter.abilities.map(ability => ({
        ...ability,
        currentCooldown: Math.max(0, ability.currentCooldown - 1)
      }));
      setPlayerFighter(updatedFighter);
    }
  }, [playerTurn]);

  const selectFighter = (fighter: Fighter) => {
    const newFighter = { 
      ...fighter, 
      hp: fighter.maxHp,
      abilities: fighter.abilities.map(a => ({ ...a, currentCooldown: 0 }))
    };
    setPlayerFighter(newFighter);
  };

  const startBattle = () => {
    if (!playerFighter) return;

    // Select random enemy
    const availableEnemies = fighters.filter(f => f.id !== playerFighter.id);
    const randomEnemy = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
    const enemy = { 
      ...randomEnemy, 
      hp: randomEnemy.maxHp,
      abilities: randomEnemy.abilities.map(a => ({ ...a, currentCooldown: 0 }))
    };
    
    setEnemyFighter(enemy);
    setBattleActive(true);
    setPlayerTurn(true);
    setBattleLog([`Battle started! ${playerFighter.name} vs ${enemy.name}`]);
    setBattleResult(null);
    setShowResult(false);
    setPlayerEnergy(maxEnergy);
  };

  const useAbility = (ability: Ability) => {
    if (!playerFighter || !enemyFighter || !playerTurn || !battleActive) return;
    if (ability.currentCooldown > 0 || playerEnergy < ability.cost) return;

    // Deduct energy
    setPlayerEnergy(prev => prev - ability.cost);

    // Apply ability effect
    let damage = ability.damage;
    let newLog = [...battleLog];

    if (ability.type === 'heal') {
      const healAmount = Math.abs(damage);
      const newHp = Math.min(playerFighter.hp + healAmount, playerFighter.maxHp);
      setPlayerFighter(prev => prev ? { ...prev, hp: newHp } : null);
      newLog.push(`${playerFighter.name} used ${ability.name} and healed ${healAmount} HP!`);
    } else {
      // Calculate damage with defense
      const finalDamage = Math.max(1, damage - enemyFighter.defense);
      const newEnemyHp = Math.max(0, enemyFighter.hp - finalDamage);
      setEnemyFighter(prev => prev ? { ...prev, hp: newEnemyHp } : null);
      newLog.push(`${playerFighter.name} used ${ability.name} and dealt ${finalDamage} damage!`);
      
      setStats(prev => ({
        ...prev,
        totalDamageDealt: prev.totalDamageDealt + finalDamage
      }));

      // Check if enemy is defeated
      if (newEnemyHp <= 0) {
        newLog.push(`${enemyFighter.name} is defeated! You win!`);
        setBattleResult('win');
        endBattle(true);
        setBattleLog(newLog);
        return;
      }
    }

    // Set ability cooldown
    setPlayerFighter(prev => {
      if (!prev) return null;
      const updatedAbilities = prev.abilities.map(a => 
        a.id === ability.id ? { ...a, currentCooldown: a.cooldown } : a
      );
      return { ...prev, abilities: updatedAbilities };
    });

    setBattleLog(newLog);
    setPlayerTurn(false);

    // Enemy turn after delay
    setTimeout(() => {
      enemyTurn(newLog);
    }, 1500);
  };

  const enemyTurn = (currentLog: string[]) => {
    if (!enemyFighter || !playerFighter) return;

    // Simple AI: use random available ability
    const availableAbilities = enemyFighter.abilities.filter(a => a.currentCooldown === 0);
    const randomAbility = availableAbilities[Math.floor(Math.random() * availableAbilities.length)];

    let newLog = [...currentLog];
    let damage = randomAbility.damage;

    if (randomAbility.type === 'heal') {
      const healAmount = Math.abs(damage);
      const newHp = Math.min(enemyFighter.hp + healAmount, enemyFighter.maxHp);
      setEnemyFighter(prev => prev ? { ...prev, hp: newHp } : null);
      newLog.push(`${enemyFighter.name} used ${randomAbility.name} and healed ${healAmount} HP!`);
    } else {
      const finalDamage = Math.max(1, damage - playerFighter.defense);
      const newPlayerHp = Math.max(0, playerFighter.hp - finalDamage);
      setPlayerFighter(prev => prev ? { ...prev, hp: newPlayerHp } : null);
      newLog.push(`${enemyFighter.name} used ${randomAbility.name} and dealt ${finalDamage} damage!`);

      if (newPlayerHp <= 0) {
        newLog.push(`${playerFighter.name} is defeated! You lose!`);
        setBattleResult('lose');
        endBattle(false);
        setBattleLog(newLog);
        return;
      }
    }

    // Set enemy ability cooldown
    setEnemyFighter(prev => {
      if (!prev) return null;
      const updatedAbilities = prev.abilities.map(a => 
        a.id === randomAbility.id ? { ...a, currentCooldown: a.cooldown } : a
      );
      return { ...prev, abilities: updatedAbilities };
    });

    setBattleLog(newLog);
    setPlayerTurn(true);
  };

  const endBattle = (won: boolean) => {
    setBattleActive(false);
    setShowResult(true);
    
    const pointsEarned = won ? (enemyFighter?.level || 1) * 100 : 25;
    
    setStats(prev => ({
      ...prev,
      wins: prev.wins + (won ? 1 : 0),
      losses: prev.losses + (won ? 0 : 1),
      totalBattles: prev.totalBattles + 1,
      winStreak: won ? prev.winStreak + 1 : 0,
      bestStreak: won ? Math.max(prev.bestStreak, prev.winStreak + 1) : prev.bestStreak,
      totalPointsEarned: prev.totalPointsEarned + pointsEarned
    }));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-green-400 bg-green-400/10';
      case 'rare': return 'border-blue-400 bg-blue-400/10';
      case 'epic': return 'border-purple-400 bg-purple-400/10';
      case 'legendary': return 'border-yellow-400 bg-yellow-400/10';
      default: return 'border-gray-400 bg-gray-400/10';
    }
  };

  const getAbilityColor = (type: string) => {
    switch (type) {
      case 'attack': return 'border-red-400 bg-red-400/10 text-red-400';
      case 'defense': return 'border-blue-400 bg-blue-400/10 text-blue-400';
      case 'heal': return 'border-green-400 bg-green-400/10 text-green-400';
      case 'special': return 'border-purple-400 bg-purple-400/10 text-purple-400';
      default: return 'border-gray-400 bg-gray-400/10 text-gray-400';
    }
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          className="bg-black/40 backdrop-blur-lg border border-cyan-400/30 rounded-3xl p-8 text-center max-w-md w-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {battleResult === 'win' ? '🏆' : '💀'}
          </motion.div>
          
          <h2 className="text-3xl font-bold text-white mb-6">
            {battleResult === 'win' ? 'Victory!' : 'Defeat!'}
          </h2>
          
          <div className="space-y-4 mb-8">
            <div className={`border rounded-xl p-4 ${battleResult === 'win' ? 'border-green-400/30 bg-green-400/10' : 'border-red-400/30 bg-red-400/10'}`}>
              <div className={`text-sm ${battleResult === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                Points Earned
              </div>
              <div className="text-2xl font-bold text-white">
                {battleResult === 'win' ? (enemyFighter?.level || 1) * 100 : 25}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-3">
                <div className="text-blue-400 text-xs">Win Rate</div>
                <div className="text-lg font-bold text-white">
                  {stats.totalBattles > 0 ? Math.round((stats.wins / stats.totalBattles) * 100) : 0}%
                </div>
              </div>
              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-3">
                <div className="text-yellow-400 text-xs">Win Streak</div>
                <div className="text-lg font-bold text-white">{stats.winStreak}</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <motion.button
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 px-6 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowResult(false)}
            >
              Continue
            </motion.button>
            
            <motion.button
              className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold py-3 px-6 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startBattle}
            >
              Battle Again
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!playerFighter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-8"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">⚔️ Battle Arena</h1>
            <p className="text-gray-300">Choose your fighter and enter the arena!</p>
          </motion.div>

          {stats.totalBattles > 0 && (
            <motion.div
              className="bg-black/40 backdrop-blur-lg border border-cyan-400/30 rounded-2xl p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-cyan-400 text-lg font-bold mb-4">Battle Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats.wins}</div>
                  <div className="text-green-400 text-sm">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats.losses}</div>
                  <div className="text-red-400 text-sm">Losses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats.bestStreak}</div>
                  <div className="text-yellow-400 text-sm">Best Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats.totalPointsEarned}</div>
                  <div className="text-purple-400 text-sm">Total Points</div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {fighters.map((fighter, index) => (
              <motion.div
                key={fighter.id}
                className={`bg-black/40 backdrop-blur-lg border-2 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 ${getRarityColor(fighter.rarity)}`}
                onClick={() => selectFighter(fighter)}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">{fighter.icon}</div>
                  <h3 className="text-xl font-bold text-white">{fighter.name}</h3>
                  <div className="text-sm text-gray-400">Level {fighter.level}</div>
                  <div className={`text-xs font-bold ${fighter.rarity === 'legendary' ? 'text-yellow-400' : fighter.rarity === 'epic' ? 'text-purple-400' : fighter.rarity === 'rare' ? 'text-blue-400' : 'text-green-400'}`}>
                    {fighter.rarity.toUpperCase()}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">HP:</span>
                    <span className="text-red-400 font-bold">{fighter.maxHp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Attack:</span>
                    <span className="text-orange-400 font-bold">{fighter.attack}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Defense:</span>
                    <span className="text-blue-400 font-bold">{fighter.defense}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Speed:</span>
                    <span className="text-green-400 font-bold">{fighter.speed}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-gray-400 mb-2">Abilities:</div>
                  <div className="space-y-1">
                    {fighter.abilities.map(ability => (
                      <div key={ability.id} className="flex items-center space-x-2">
                        <span className="text-lg">{ability.icon}</span>
                        <span className="text-xs text-white">{ability.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!battleActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          className="bg-black/40 backdrop-blur-lg border border-cyan-400/30 rounded-3xl p-8 text-center max-w-md w-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-4">{playerFighter.icon}</div>
          <h2 className="text-2xl font-bold text-white mb-2">{playerFighter.name}</h2>
          <div className="text-gray-400 mb-6">Ready for battle!</div>
          
          <div className="space-y-3">
            <motion.button
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 px-6 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startBattle}
            >
              Enter Arena
            </motion.button>
            
            <motion.button
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold py-3 px-6 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPlayerFighter(null)}
            >
              Change Fighter
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Battle Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Player Fighter */}
          <motion.div
            className="bg-black/40 backdrop-blur-lg border border-green-400/30 rounded-xl p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{playerFighter.icon}</div>
              <div className="flex-1">
                <div className="text-white font-bold">{playerFighter.name}</div>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-1">
                  <div 
                    className="bg-green-400 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(playerFighter.hp / playerFighter.maxHp) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-300">{playerFighter.hp}/{playerFighter.maxHp} HP</div>
              </div>
            </div>
          </motion.div>

          {/* Energy */}
          <motion.div
            className="bg-black/40 backdrop-blur-lg border border-blue-400/30 rounded-xl p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-blue-400 text-sm">Energy</div>
            <div className="text-2xl font-bold text-white">{playerEnergy}/{maxEnergy}</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(playerEnergy / maxEnergy) * 100}%` }}
              ></div>
            </div>
          </motion.div>

          {/* Enemy Fighter */}
          <motion.div
            className="bg-black/40 backdrop-blur-lg border border-red-400/30 rounded-xl p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{enemyFighter?.icon}</div>
              <div className="flex-1">
                <div className="text-white font-bold">{enemyFighter?.name}</div>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-1">
                  <div 
                    className="bg-red-400 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${((enemyFighter?.hp || 0) / (enemyFighter?.maxHp || 1)) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-300">{enemyFighter?.hp}/{enemyFighter?.maxHp} HP</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Battle Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Abilities */}
          <motion.div
            className="bg-black/40 backdrop-blur-lg border border-cyan-400/30 rounded-2xl p-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-cyan-400 text-lg font-bold mb-4">Abilities</h3>
            <div className="space-y-3">
              {playerFighter.abilities.map((ability) => (
                <motion.button
                  key={ability.id}
                  className={`w-full p-3 rounded-xl border-2 transition-all ${
                    ability.currentCooldown > 0 || playerEnergy < ability.cost || !playerTurn
                      ? 'border-gray-600 bg-gray-600/10 text-gray-400 cursor-not-allowed'
                      : getAbilityColor(ability.type) + ' hover:scale-105 cursor-pointer'
                  }`}
                  onClick={() => useAbility(ability)}
                  disabled={ability.currentCooldown > 0 || playerEnergy < ability.cost || !playerTurn}
                  whileHover={ability.currentCooldown === 0 && playerEnergy >= ability.cost && playerTurn ? { scale: 1.05 } : {}}
                  whileTap={ability.currentCooldown === 0 && playerEnergy >= ability.cost && playerTurn ? { scale: 0.95 } : {}}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{ability.icon}</span>
                      <div className="text-left">
                        <div className="font-bold">{ability.name}</div>
                        <div className="text-xs opacity-70">{ability.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        {ability.type === 'heal' ? `+${Math.abs(ability.damage)}` : ability.damage}
                      </div>
                      <div className="text-xs">
                        {ability.cost > 0 && `${ability.cost} energy`}
                      </div>
                      {ability.currentCooldown > 0 && (
                        <div className="text-xs text-red-400">
                          {ability.currentCooldown} turns
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Battle Log */}
          <motion.div
            className="lg:col-span-2 bg-black/40 backdrop-blur-lg border border-purple-400/30 rounded-2xl p-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-purple-400 text-lg font-bold mb-4">Battle Log</h3>
            <div className="bg-black/20 rounded-xl p-4 h-64 overflow-y-auto">
              {battleLog.map((log, index) => (
                <motion.div
                  key={index}
                  className="text-gray-300 text-sm mb-2 p-2 bg-gray-800/30 rounded"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {log}
                </motion.div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <div className={`text-lg font-bold ${playerTurn ? 'text-green-400' : 'text-orange-400'}`}>
                {playerTurn ? 'Your Turn' : 'Enemy Turn'}
              </div>
              {!playerTurn && (
                <motion.div
                  className="text-sm text-gray-400 mt-2"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Enemy is thinking...
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BattleArena;

