import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Treasure {
  id: string;
  type: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  icon: string;
  name: string;
  description: string;
}

interface MapCell {
  id: string;
  x: number;
  y: number;
  revealed: boolean;
  hasTreasure: boolean;
  treasure?: Treasure;
  isEmpty: boolean;
  isHint: boolean;
  hintDirection?: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';
}

interface GameStats {
  treasuresFound: number;
  totalPoints: number;
  mapsCompleted: number;
  bestFind: number;
  explorationRate: number;
}

const TreasureHunt: React.FC = () => {
  const [treasures] = useState<Treasure[]>([
    { id: '1', type: 'common', points: 25, icon: '💰', name: 'Gold Coins', description: 'A small pouch of gold coins' },
    { id: '2', type: 'common', points: 50, icon: '💎', name: 'Crystal Gem', description: 'A sparkling crystal gem' },
    { id: '3', type: 'rare', points: 100, icon: '👑', name: 'Royal Crown', description: 'An ancient royal crown' },
    { id: '4', type: 'rare', points: 150, icon: '⚔️', name: 'Magic Sword', description: 'A legendary magic sword' },
    { id: '5', type: 'epic', points: 300, icon: '🏺', name: 'Ancient Artifact', description: 'A mysterious ancient artifact' },
    { id: '6', type: 'epic', points: 500, icon: '📜', name: 'Treasure Map', description: 'A map leading to greater treasures' },
    { id: '7', type: 'legendary', points: 1000, icon: '🎭', name: 'Golden Mask', description: 'The legendary golden mask of pharaohs' },
    { id: '8', type: 'legendary', points: 2000, icon: '💍', name: 'Dragon Ring', description: 'The ultimate treasure - Dragon Ring of Power' },
  ]);

  const [mapGrid, setMapGrid] = useState<MapCell[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [movesLeft, setMovesLeft] = useState(20);
  const [foundTreasures, setFoundTreasures] = useState<Treasure[]>([]);
  const [stats, setStats] = useState<GameStats>({
    treasuresFound: 0,
    totalPoints: 0,
    mapsCompleted: 0,
    bestFind: 0,
    explorationRate: 0
  });
  const [showResult, setShowResult] = useState(false);
  const [lastFound, setLastFound] = useState<Treasure | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const GRID_SIZE = 6;

  const generateMap = () => {
    const grid: MapCell[] = [];
    
    // Create empty grid
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        grid.push({
          id: `${x}-${y}`,
          x,
          y,
          revealed: false,
          hasTreasure: false,
          isEmpty: true,
          isHint: false
        });
      }
    }

    // Place treasures randomly (3-5 treasures per map)
    const numTreasures = Math.floor(Math.random() * 3) + 3;
    const treasurePositions = new Set<string>();
    
    for (let i = 0; i < numTreasures; i++) {
      let x, y, position;
      do {
        x = Math.floor(Math.random() * GRID_SIZE);
        y = Math.floor(Math.random() * GRID_SIZE);
        position = `${x}-${y}`;
      } while (treasurePositions.has(position));
      
      treasurePositions.add(position);
      const cellIndex = y * GRID_SIZE + x;
      const randomTreasure = treasures[Math.floor(Math.random() * treasures.length)];
      
      grid[cellIndex] = {
        ...grid[cellIndex],
        hasTreasure: true,
        treasure: randomTreasure,
        isEmpty: false
      };
    }

    // Place hints near treasures
    treasurePositions.forEach(pos => {
      const [tx, ty] = pos.split('-').map(Number);
      const directions = [
        { x: -1, y: -1, dir: 'northwest' as const },
        { x: 0, y: -1, dir: 'north' as const },
        { x: 1, y: -1, dir: 'northeast' as const },
        { x: -1, y: 0, dir: 'west' as const },
        { x: 1, y: 0, dir: 'east' as const },
        { x: -1, y: 1, dir: 'southwest' as const },
        { x: 0, y: 1, dir: 'south' as const },
        { x: 1, y: 1, dir: 'southeast' as const },
      ];

      // Place 1-2 hints around each treasure
      const numHints = Math.floor(Math.random() * 2) + 1;
      const shuffledDirections = directions.sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < numHints && i < shuffledDirections.length; i++) {
        const { x: dx, y: dy, dir } = shuffledDirections[i];
        const hx = tx + dx;
        const hy = ty + dy;
        
        if (hx >= 0 && hx < GRID_SIZE && hy >= 0 && hy < GRID_SIZE) {
          const hintIndex = hy * GRID_SIZE + hx;
          if (!grid[hintIndex].hasTreasure) {
            grid[hintIndex] = {
              ...grid[hintIndex],
              isHint: true,
              isEmpty: false,
              hintDirection: getOppositeDirection(dir)
            };
          }
        }
      }
    });

    setMapGrid(grid);
  };

  const getOppositeDirection = (dir: string) => {
    const opposites: { [key: string]: any } = {
      'north': 'south',
      'south': 'north',
      'east': 'west',
      'west': 'east',
      'northeast': 'southwest',
      'northwest': 'southeast',
      'southeast': 'northwest',
      'southwest': 'northeast'
    };
    return opposites[dir];
  };

  const startNewGame = () => {
    generateMap();
    setGameActive(true);
    setMovesLeft(20);
    setFoundTreasures([]);
    setShowResult(false);
    setGameOver(false);
    setLastFound(null);
  };

  const revealCell = (cellId: string) => {
    if (!gameActive || movesLeft <= 0) return;

    const cellIndex = mapGrid.findIndex(cell => cell.id === cellId);
    if (cellIndex === -1 || mapGrid[cellIndex].revealed) return;

    const newGrid = [...mapGrid];
    newGrid[cellIndex].revealed = true;
    setMapGrid(newGrid);

    const cell = newGrid[cellIndex];
    setMovesLeft(prev => prev - 1);

    if (cell.hasTreasure && cell.treasure) {
      // Found treasure!
      setFoundTreasures(prev => [...prev, cell.treasure!]);
      setLastFound(cell.treasure);
      setShowResult(true);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        treasuresFound: prev.treasuresFound + 1,
        totalPoints: prev.totalPoints + cell.treasure!.points,
        bestFind: Math.max(prev.bestFind, cell.treasure!.points)
      }));

      setTimeout(() => setShowResult(false), 2000);
    }

    // Check if game should end
    const newMovesLeft = movesLeft - 1;
    const allTreasuresFound = newGrid.filter(c => c.hasTreasure).every(c => c.revealed);
    
    if (newMovesLeft <= 0 || allTreasuresFound) {
      setTimeout(() => {
        setGameActive(false);
        setGameOver(true);
        
        if (allTreasuresFound) {
          setStats(prev => ({
            ...prev,
            mapsCompleted: prev.mapsCompleted + 1,
            explorationRate: (newGrid.filter(c => c.revealed).length / newGrid.length) * 100
          }));
        }
      }, 1000);
    }
  };

  const getCellStyle = (cell: MapCell) => {
    if (!cell.revealed) {
      return 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 hover:border-cyan-400/50 cursor-pointer';
    }
    
    if (cell.hasTreasure) {
      const colors = {
        common: 'from-green-400 to-green-600 border-green-400',
        rare: 'from-blue-400 to-blue-600 border-blue-400',
        epic: 'from-purple-400 to-purple-600 border-purple-400',
        legendary: 'from-yellow-400 to-yellow-600 border-yellow-400'
      };
      return `bg-gradient-to-br ${colors[cell.treasure?.type || 'common']} text-white`;
    }
    
    if (cell.isHint) {
      return 'bg-gradient-to-br from-orange-400 to-orange-600 border-orange-400 text-white';
    }
    
    return 'bg-gradient-to-br from-gray-500 to-gray-600 border-gray-500 text-gray-300';
  };

  const getHintArrow = (direction?: string) => {
    const arrows = {
      'north': '⬆️',
      'south': '⬇️',
      'east': '➡️',
      'west': '⬅️',
      'northeast': '↗️',
      'northwest': '↖️',
      'southeast': '↘️',
      'southwest': '↙️'
    };
    return arrows[direction as keyof typeof arrows] || '❓';
  };

  if (gameOver) {
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
            🗺️
          </motion.div>
          
          <h2 className="text-3xl font-bold text-white mb-6">Exploration Complete!</h2>
          
          <div className="space-y-4 mb-8">
            <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-4">
              <div className="text-green-400 text-sm">Treasures Found</div>
              <div className="text-2xl font-bold text-white">{foundTreasures.length}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-3">
                <div className="text-blue-400 text-xs">Total Points</div>
                <div className="text-lg font-bold text-white">
                  {foundTreasures.reduce((sum, t) => sum + t.points, 0)}
                </div>
              </div>
              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-3">
                <div className="text-yellow-400 text-xs">Best Find</div>
                <div className="text-lg font-bold text-white">
                  {foundTreasures.length > 0 ? Math.max(...foundTreasures.map(t => t.points)) : 0}
                </div>
              </div>
            </div>

            {foundTreasures.length > 0 && (
              <div className="bg-purple-400/10 border border-purple-400/30 rounded-xl p-4">
                <div className="text-purple-400 text-sm mb-2">Treasures Collected</div>
                <div className="flex flex-wrap gap-2">
                  {foundTreasures.map((treasure, index) => (
                    <div key={index} className="text-2xl">{treasure.icon}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <motion.button
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 px-6 rounded-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startNewGame}
          >
            New Expedition
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!gameActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          className="bg-black/40 backdrop-blur-lg border border-cyan-400/30 rounded-3xl p-8 text-center max-w-md w-full"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🗺️
          </motion.div>
          
          <h1 className="text-3xl font-bold text-white mb-4">Treasure Hunt</h1>
          <p className="text-gray-300 mb-8">Explore the mysterious map and discover hidden treasures!</p>
          
          <div className="space-y-4 mb-8">
            <div className="bg-cyan-400/10 border border-cyan-400/30 rounded-xl p-4">
              <div className="text-cyan-400 text-sm">Game Rules</div>
              <div className="text-white text-sm mt-2">
                • 20 moves to find treasures<br/>
                • Orange cells give hints<br/>
                • Different rarities = more points<br/>
                • Complete maps for bonuses
              </div>
            </div>

            {stats.treasuresFound > 0 && (
              <div className="bg-purple-400/10 border border-purple-400/30 rounded-xl p-4">
                <div className="text-purple-400 text-sm">Your Stats</div>
                <div className="text-white text-sm mt-2">
                  Treasures: {stats.treasuresFound} | Points: {stats.totalPoints}<br/>
                  Maps Completed: {stats.mapsCompleted} | Best Find: {stats.bestFind}
                </div>
              </div>
            )}
          </div>
          
          <motion.button
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 px-6 rounded-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startNewGame}
          >
            Start Expedition
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Moves Left */}
          <motion.div
            className="bg-black/40 backdrop-blur-lg border border-orange-400/30 rounded-xl p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-orange-400 text-sm">Moves Left</div>
            <div className={`text-3xl font-bold ${movesLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
              {movesLeft}
            </div>
          </motion.div>

          {/* Treasures Found */}
          <motion.div
            className="bg-black/40 backdrop-blur-lg border border-green-400/30 rounded-xl p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-green-400 text-sm">Treasures Found</div>
            <div className="text-3xl font-bold text-white">{foundTreasures.length}</div>
          </motion.div>

          {/* Current Points */}
          <motion.div
            className="bg-black/40 backdrop-blur-lg border border-yellow-400/30 rounded-xl p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-yellow-400 text-sm">Points This Round</div>
            <div className="text-3xl font-bold text-white">
              {foundTreasures.reduce((sum, t) => sum + t.points, 0)}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Game Grid */}
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="bg-black/40 backdrop-blur-lg border border-cyan-400/30 rounded-3xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid grid-cols-6 gap-2 mb-6">
            {mapGrid.map((cell) => (
              <motion.div
                key={cell.id}
                className={`aspect-square border-2 rounded-xl flex items-center justify-center text-2xl font-bold transition-all ${getCellStyle(cell)}`}
                onClick={() => revealCell(cell.id)}
                whileHover={!cell.revealed ? { scale: 1.05 } : {}}
                whileTap={!cell.revealed ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: parseInt(cell.id.split('-')[0]) * 0.05 + parseInt(cell.id.split('-')[1]) * 0.05 }}
              >
                {cell.revealed ? (
                  cell.hasTreasure ? (
                    cell.treasure?.icon
                  ) : cell.isHint ? (
                    getHintArrow(cell.hintDirection)
                  ) : (
                    '🕳️'
                  )
                ) : (
                  '❓'
                )}
              </motion.div>
            ))}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
              <span className="text-gray-300">Unexplored</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-gray-300">Hint</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-300">Common</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-gray-300">Legendary</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && lastFound && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-black/80 backdrop-blur-lg border-2 border-yellow-400 rounded-3xl p-8 text-center max-w-md mx-4"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 0.5 }}
              >
                {lastFound.icon}
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white mb-2">Treasure Found!</h2>
              <div className="text-xl text-yellow-400 mb-2">{lastFound.name}</div>
              <div className="text-lg text-green-400 mb-4">+{lastFound.points} Points!</div>
              <div className="text-sm text-gray-300">{lastFound.description}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TreasureHunt;

