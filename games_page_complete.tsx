import React, { useState, useEffect } from 'react';

// Componente MeowClicker
const MeowClicker = () => {
  const [points, setPoints] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [multiplier, setMultiplier] = useState(1);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);

  const handleClick = () => {
    if (energy > 0) {
      const earnedPoints = 1 * multiplier;
      setPoints(prev => prev + earnedPoints);
      setEnergy(prev => Math.max(0, prev - 1));
      setStreak(prev => prev + 1);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => Math.min(100, prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 rounded-xl border border-cyan-500/30 backdrop-blur-sm">
      <h3 className="text-2xl font-bold text-cyan-400 mb-4 text-center">🐱 Meow Clicker</h3>
      
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-yellow-400 mb-2">{points.toLocaleString()} MEOW</div>
        <div className="text-lg text-cyan-300">Streak: {streak}</div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Energy</span>
          <span>{energy}/100</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${energy}%` }}
          ></div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleClick}
          disabled={energy === 0}
          className="w-32 h-32 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full border-4 border-cyan-400 hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-400/50"
        >
          <span className="text-6xl">🐱</span>
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
        <div className="bg-black/30 p-2 rounded text-center">
          <div className="text-yellow-400">2x Multi</div>
          <div className="text-gray-300">50 MEOW</div>
        </div>
        <div className="bg-black/30 p-2 rounded text-center">
          <div className="text-orange-400">5x Multi</div>
          <div className="text-gray-300">150 MEOW</div>
        </div>
        <div className="bg-black/30 p-2 rounded text-center">
          <div className="text-red-400">10x Multi</div>
          <div className="text-gray-300">300 MEOW</div>
        </div>
      </div>
    </div>
  );
};

// Componente CryptoQuiz
const CryptoQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);

  const questions = [
    {
      question: "Qual é a primeira criptomoeda?",
      options: ["Bitcoin", "Ethereum", "Litecoin", "Dogecoin"],
      correct: 0,
      difficulty: "easy"
    },
    {
      question: "O que significa DeFi?",
      options: ["Digital Finance", "Decentralized Finance", "Distributed Finance", "Direct Finance"],
      correct: 1,
      difficulty: "medium"
    },
    {
      question: "Qual blockchain usa Proof of Stake?",
      options: ["Bitcoin", "Ethereum 2.0", "Litecoin", "Bitcoin Cash"],
      correct: 1,
      difficulty: "hard"
    }
  ];

  const startQuiz = () => {
    setGameActive(true);
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(30);
  };

  const answerQuestion = (answerIndex) => {
    if (answerIndex === questions[currentQuestion].correct) {
      setScore(prev => prev + (questions[currentQuestion].difficulty === 'hard' ? 30 : questions[currentQuestion].difficulty === 'medium' ? 20 : 10));
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(30);
    } else {
      setGameActive(false);
    }
  };

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      answerQuestion(-1);
    }
  }, [timeLeft, gameActive]);

  return (
    <div className="bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 p-6 rounded-xl border border-green-500/30 backdrop-blur-sm">
      <h3 className="text-2xl font-bold text-green-400 mb-4 text-center">🧠 Crypto Quiz</h3>
      
      {!gameActive ? (
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-4">Score: {score}</div>
          <button
            onClick={startQuiz}
            className="bg-gradient-to-r from-green-500 to-blue-500 px-6 py-3 rounded-lg font-bold text-white hover:scale-105 transition-all"
          >
            Iniciar Quiz
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between mb-4">
            <span className="text-green-300">Pergunta {currentQuestion + 1}/{questions.length}</span>
            <span className="text-yellow-400">⏰ {timeLeft}s</span>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-4">{questions[currentQuestion].question}</h4>
            <div className="space-y-2">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => answerQuestion(index)}
                  className="w-full p-3 bg-black/30 hover:bg-green-500/30 rounded-lg text-left transition-all border border-green-500/20 hover:border-green-400"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente LuckySpin
const LuckySpin = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [userPoints, setUserPoints] = useState(1000);

  const prizes = [
    { name: "10 MEOW", value: 10, color: "text-green-400" },
    { name: "25 MEOW", value: 25, color: "text-blue-400" },
    { name: "50 MEOW", value: 50, color: "text-purple-400" },
    { name: "100 MEOW", value: 100, color: "text-yellow-400" },
    { name: "250 MEOW", value: 250, color: "text-orange-400" },
    { name: "500 MEOW", value: 500, color: "text-red-400" },
    { name: "1000 MEOW", value: 1000, color: "text-pink-400" },
    { name: "5000 MEOW", value: 5000, color: "text-cyan-400" }
  ];

  const spin = () => {
    if (userPoints >= 50 && !spinning) {
      setSpinning(true);
      setUserPoints(prev => prev - 50);
      
      setTimeout(() => {
        const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
        setResult(randomPrize);
        setUserPoints(prev => prev + randomPrize.value);
        setSpinning(false);
      }, 3000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 p-6 rounded-xl border border-yellow-500/30 backdrop-blur-sm">
      <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-center">🎰 Lucky Spin</h3>
      
      <div className="text-center mb-6">
        <div className="text-2xl font-bold text-white mb-2">Seus MEOW: {userPoints}</div>
        <div className="text-sm text-gray-300">Custo: 50 MEOW por spin</div>
      </div>

      <div className="flex justify-center mb-6">
        <div className={`w-32 h-32 rounded-full border-4 border-yellow-400 flex items-center justify-center ${spinning ? 'animate-spin' : ''} bg-gradient-to-br from-yellow-500 to-orange-500`}>
          <span className="text-4xl">🎰</span>
        </div>
      </div>

      {result && !spinning && (
        <div className="text-center mb-4 p-4 bg-black/30 rounded-lg">
          <div className="text-lg font-bold text-green-400">Você ganhou!</div>
          <div className={`text-2xl font-bold ${result.color}`}>{result.name}</div>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={spin}
          disabled={spinning || userPoints < 50}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-3 rounded-lg font-bold text-white hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {spinning ? 'Girando...' : 'GIRAR'}
        </button>
      </div>
    </div>
  );
};

// Componente TreasureHunt
const TreasureHunt = () => {
  const [grid, setGrid] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [treasuresFound, setTreasuresFound] = useState(0);
  const [movesLeft, setMovesLeft] = useState(20);
  const [gameActive, setGameActive] = useState(false);

  const initializeGame = () => {
    const newGrid = Array(36).fill(0);
    const treasurePositions = [];
    
    // Adicionar tesouros aleatórios
    while (treasurePositions.length < 8) {
      const pos = Math.floor(Math.random() * 36);
      if (!treasurePositions.includes(pos)) {
        treasurePositions.push(pos);
        newGrid[pos] = Math.floor(Math.random() * 4) + 1; // 1-4 tipos de tesouro
      }
    }
    
    setGrid(newGrid);
    setRevealed(Array(36).fill(false));
    setTreasuresFound(0);
    setMovesLeft(20);
    setGameActive(true);
  };

  const revealCell = (index) => {
    if (!gameActive || revealed[index] || movesLeft === 0) return;
    
    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);
    setMovesLeft(prev => prev - 1);
    
    if (grid[index] > 0) {
      setTreasuresFound(prev => prev + 1);
    }
  };

  const getTreasureIcon = (value) => {
    const icons = ['', '💎', '🏆', '👑', '⭐'];
    return icons[value] || '';
  };

  return (
    <div className="bg-gradient-to-br from-amber-900 via-yellow-900 to-orange-900 p-6 rounded-xl border border-amber-500/30 backdrop-blur-sm">
      <h3 className="text-2xl font-bold text-amber-400 mb-4 text-center">🗺️ Treasure Hunt</h3>
      
      <div className="flex justify-between mb-4 text-center">
        <div>
          <div className="text-amber-400 font-bold">Tesouros</div>
          <div className="text-white text-xl">{treasuresFound}/8</div>
        </div>
        <div>
          <div className="text-amber-400 font-bold">Movimentos</div>
          <div className="text-white text-xl">{movesLeft}</div>
        </div>
      </div>

      {!gameActive ? (
        <div className="text-center">
          <button
            onClick={initializeGame}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 rounded-lg font-bold text-white hover:scale-105 transition-all"
          >
            Nova Expedição
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-1 mb-4">
          {grid.map((cell, index) => (
            <button
              key={index}
              onClick={() => revealCell(index)}
              className={`w-8 h-8 rounded border text-xs ${
                revealed[index]
                  ? cell > 0
                    ? 'bg-yellow-500 border-yellow-400'
                    : 'bg-gray-600 border-gray-500'
                  : 'bg-amber-800 border-amber-600 hover:bg-amber-700'
              }`}
            >
              {revealed[index] ? getTreasureIcon(cell) : '?'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente BattleArena
const BattleArena = () => {
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [playerEnergy, setPlayerEnergy] = useState(50);
  const [battleActive, setBattleActive] = useState(false);
  const [battleLog, setBattleLog] = useState([]);

  const fighters = [
    { name: "Cyber Cat", hp: 80, attack: 15, defense: 10, rarity: "common" },
    { name: "Crypto Dragon", hp: 120, attack: 20, defense: 15, rarity: "rare" },
    { name: "Neon Wolf", hp: 90, attack: 25, defense: 8, rarity: "rare" },
    { name: "Quantum Phoenix", hp: 150, attack: 30, defense: 20, rarity: "epic" }
  ];

  const startBattle = () => {
    setBattleActive(true);
    setPlayerHP(100);
    setEnemyHP(100);
    setPlayerEnergy(50);
    setBattleLog(["Batalha iniciada!"]);
  };

  const attack = () => {
    if (!battleActive || playerEnergy < 10) return;
    
    const damage = Math.floor(Math.random() * 20) + 10;
    setEnemyHP(prev => Math.max(0, prev - damage));
    setPlayerEnergy(prev => prev - 10);
    setBattleLog(prev => [...prev, `Você causou ${damage} de dano!`]);
    
    // Enemy attack
    setTimeout(() => {
      const enemyDamage = Math.floor(Math.random() * 15) + 8;
      setPlayerHP(prev => Math.max(0, prev - enemyDamage));
      setBattleLog(prev => [...prev, `Inimigo causou ${enemyDamage} de dano!`]);
    }, 1000);
  };

  const defend = () => {
    if (!battleActive || playerEnergy < 5) return;
    
    setPlayerEnergy(prev => prev - 5);
    setBattleLog(prev => [...prev, "Você se defendeu!"]);
  };

  useEffect(() => {
    if (battleActive) {
      const interval = setInterval(() => {
        setPlayerEnergy(prev => Math.min(50, prev + 2));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [battleActive]);

  return (
    <div className="bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 p-6 rounded-xl border border-red-500/30 backdrop-blur-sm">
      <h3 className="text-2xl font-bold text-red-400 mb-4 text-center">⚔️ Battle Arena</h3>
      
      {!battleActive ? (
        <div className="text-center">
          <button
            onClick={startBattle}
            className="bg-gradient-to-r from-red-500 to-purple-500 px-6 py-3 rounded-lg font-bold text-white hover:scale-105 transition-all"
          >
            Iniciar Batalha
          </button>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-blue-400 font-bold">Você</div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-1">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${playerHP}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-300">{playerHP}/100 HP</div>
            </div>
            <div className="text-center">
              <div className="text-red-400 font-bold">Inimigo</div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-1">
                <div 
                  className="bg-red-500 h-3 rounded-full transition-all"
                  style={{ width: `${enemyHP}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-300">{enemyHP}/100 HP</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-center text-yellow-400 font-bold mb-1">Energia: {playerEnergy}/50</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all"
                style={{ width: `${(playerEnergy/50)*100}%` }}
              ></div>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={attack}
              disabled={playerEnergy < 10}
              className="flex-1 bg-red-600 hover:bg-red-500 px-4 py-2 rounded font-bold disabled:opacity-50"
            >
              Atacar (10 energia)
            </button>
            <button
              onClick={defend}
              disabled={playerEnergy < 5}
              className="flex-1 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-bold disabled:opacity-50"
            >
              Defender (5 energia)
            </button>
          </div>

          <div className="bg-black/30 p-3 rounded max-h-24 overflow-y-auto">
            {battleLog.slice(-3).map((log, index) => (
              <div key={index} className="text-sm text-gray-300">{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente principal Games
const Games = () => {
  const [selectedGame, setSelectedGame] = useState('clicker');

  const games = [
    { id: 'clicker', name: 'Meow Clicker', icon: '🐱', component: MeowClicker },
    { id: 'quiz', name: 'Crypto Quiz', icon: '🧠', component: CryptoQuiz },
    { id: 'spin', name: 'Lucky Spin', icon: '🎰', component: LuckySpin },
    { id: 'hunt', name: 'Treasure Hunt', icon: '🗺️', component: TreasureHunt },
    { id: 'battle', name: 'Battle Arena', icon: '⚔️', component: BattleArena }
  ];

  const SelectedGameComponent = games.find(game => game.id === selectedGame)?.component || MeowClicker;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            🎮 MEOW GAMES ARENA
          </h1>
          <p className="text-gray-300 text-lg">Jogue, ganhe MEOW tokens e divirta-se!</p>
        </div>

        {/* Game Selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                selectedGame === game.id
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white scale-105 shadow-lg'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600'
              }`}
            >
              <span className="text-2xl mr-2">{game.icon}</span>
              {game.name}
            </button>
          ))}
        </div>

        {/* Game Container */}
        <div className="max-w-2xl mx-auto">
          <SelectedGameComponent />
        </div>

        {/* Stats Panel */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/30 p-4 rounded-xl border border-cyan-500/30">
            <h3 className="text-cyan-400 font-bold mb-2">🏆 Total Ganho</h3>
            <div className="text-2xl font-bold text-white">12,450 MEOW</div>
          </div>
          <div className="bg-black/30 p-4 rounded-xl border border-purple-500/30">
            <h3 className="text-purple-400 font-bold mb-2">🎯 Jogos Jogados</h3>
            <div className="text-2xl font-bold text-white">87</div>
          </div>
          <div className="bg-black/30 p-4 rounded-xl border border-yellow-500/30">
            <h3 className="text-yellow-400 font-bold mb-2">⭐ Nível</h3>
            <div className="text-2xl font-bold text-white">15</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games;

