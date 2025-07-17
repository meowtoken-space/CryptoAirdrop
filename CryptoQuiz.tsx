import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  explanation: string;
}

interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  streak: number;
  bestStreak: number;
  totalPoints: number;
}

const CryptoQuiz: React.FC = () => {
  const [questions] = useState<Question[]>([
    {
      id: 1,
      question: "What does 'HODL' mean in crypto?",
      options: ["Hold On for Dear Life", "High Order Digital Ledger", "Hybrid Online Data Link", "Hold Original Digital License"],
      correctAnswer: 0,
      difficulty: 'easy',
      category: 'Terminology',
      explanation: "HODL originated from a misspelled 'hold' in a Bitcoin forum post and became a popular crypto investment strategy."
    },
    {
      id: 2,
      question: "What is the maximum supply of Bitcoin?",
      options: ["21 million", "100 million", "1 billion", "Unlimited"],
      correctAnswer: 0,
      difficulty: 'easy',
      category: 'Bitcoin',
      explanation: "Bitcoin has a hard cap of 21 million coins, making it a deflationary asset."
    },
    {
      id: 3,
      question: "What consensus mechanism does Ethereum 2.0 use?",
      options: ["Proof of Work", "Proof of Stake", "Proof of Authority", "Delegated Proof of Stake"],
      correctAnswer: 1,
      difficulty: 'medium',
      category: 'Ethereum',
      explanation: "Ethereum transitioned from Proof of Work to Proof of Stake with the Ethereum 2.0 upgrade for better energy efficiency."
    },
    {
      id: 4,
      question: "What is a smart contract?",
      options: ["A legal document", "Self-executing code on blockchain", "A trading algorithm", "A wallet type"],
      correctAnswer: 1,
      difficulty: 'medium',
      category: 'Technology',
      explanation: "Smart contracts are self-executing contracts with terms directly written into code on the blockchain."
    },
    {
      id: 5,
      question: "What does DeFi stand for?",
      options: ["Digital Finance", "Decentralized Finance", "Distributed Finance", "Dynamic Finance"],
      correctAnswer: 1,
      difficulty: 'easy',
      category: 'DeFi',
      explanation: "DeFi (Decentralized Finance) refers to financial services built on blockchain technology without traditional intermediaries."
    },
    {
      id: 6,
      question: "What is the purpose of a blockchain oracle?",
      options: ["Mine new blocks", "Connect blockchain to external data", "Validate transactions", "Store private keys"],
      correctAnswer: 1,
      difficulty: 'hard',
      category: 'Technology',
      explanation: "Oracles provide external data to smart contracts, enabling them to interact with real-world information."
    },
    {
      id: 7,
      question: "What is a DAO?",
      options: ["Digital Asset Organization", "Decentralized Autonomous Organization", "Distributed Application Object", "Dynamic Asset Operation"],
      correctAnswer: 1,
      difficulty: 'medium',
      category: 'Governance',
      explanation: "A DAO is a Decentralized Autonomous Organization governed by smart contracts and community voting."
    },
    {
      id: 8,
      question: "What is the Lightning Network?",
      options: ["A new cryptocurrency", "Bitcoin's layer 2 scaling solution", "An Ethereum upgrade", "A mining pool"],
      correctAnswer: 1,
      difficulty: 'hard',
      category: 'Bitcoin',
      explanation: "The Lightning Network is a layer 2 payment protocol that enables fast, cheap Bitcoin transactions."
    },
    {
      id: 9,
      question: "What does NFT stand for?",
      options: ["New Financial Token", "Non-Fungible Token", "Network File Transfer", "Next Future Technology"],
      correctAnswer: 1,
      difficulty: 'easy',
      category: 'NFTs',
      explanation: "NFT stands for Non-Fungible Token, representing unique digital assets on the blockchain."
    },
    {
      id: 10,
      question: "What is yield farming?",
      options: ["Mining cryptocurrencies", "Earning rewards by providing liquidity", "Trading derivatives", "Staking tokens"],
      correctAnswer: 1,
      difficulty: 'medium',
      category: 'DeFi',
      explanation: "Yield farming involves providing liquidity to DeFi protocols in exchange for rewards and fees."
    }
  ]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [stats, setStats] = useState<QuizStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    streak: 0,
    bestStreak: 0,
    totalPoints: 0
  });
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0 && !showResult) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, showResult]);

  const startQuiz = () => {
    setIsActive(true);
    setCurrentQuestionIndex(0);
    setGameOver(false);
    setTimeLeft(30);
    setShowResult(false);
    setShowExplanation(false);
    setSelectedAnswer(null);
  };

  const handleTimeUp = () => {
    setSelectedAnswer(-1); // Indicate time's up
    setShowResult(true);
    setIsActive(false);
    updateStats(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    setIsActive(false);
    
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    updateStats(isCorrect);
  };

  const updateStats = (isCorrect: boolean) => {
    setStats(prev => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const points = isCorrect ? getPointsForQuestion(currentQuestion.difficulty, timeLeft) : 0;
      
      return {
        totalQuestions: prev.totalQuestions + 1,
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        totalPoints: prev.totalPoints + points
      };
    });
  };

  const getPointsForQuestion = (difficulty: string, timeRemaining: number) => {
    const basePoints = {
      easy: 10,
      medium: 20,
      hard: 30
    };
    const timeBonus = Math.floor(timeRemaining / 5) * 2;
    return basePoints[difficulty as keyof typeof basePoints] + timeBonus;
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowExplanation(false);
      setTimeLeft(30);
      setIsActive(true);
    } else {
      setGameOver(true);
      setIsActive(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowExplanation(false);
    setTimeLeft(30);
    setIsActive(false);
    setGameOver(false);
    setStats({
      totalQuestions: 0,
      correctAnswers: 0,
      streak: 0,
      bestStreak: 0,
      totalPoints: 0
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 border-green-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'hard': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getOptionStyle = (index: number) => {
    if (!showResult) {
      return selectedAnswer === index 
        ? 'border-cyan-400 bg-cyan-400/20' 
        : 'border-gray-600 hover:border-cyan-400/50 hover:bg-cyan-400/10';
    }
    
    if (index === currentQuestion.correctAnswer) {
      return 'border-green-400 bg-green-400/20 text-green-400';
    }
    
    if (selectedAnswer === index && index !== currentQuestion.correctAnswer) {
      return 'border-red-400 bg-red-400/20 text-red-400';
    }
    
    return 'border-gray-600 text-gray-400';
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
            🏆
          </motion.div>
          
          <h2 className="text-3xl font-bold text-white mb-6">Quiz Complete!</h2>
          
          <div className="space-y-4 mb-8">
            <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-4">
              <div className="text-green-400 text-sm">Final Score</div>
              <div className="text-2xl font-bold text-white">{stats.totalPoints} points</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-3">
                <div className="text-blue-400 text-xs">Accuracy</div>
                <div className="text-lg font-bold text-white">
                  {Math.round((stats.correctAnswers / stats.totalQuestions) * 100)}%
                </div>
              </div>
              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-3">
                <div className="text-yellow-400 text-xs">Best Streak</div>
                <div className="text-lg font-bold text-white">{stats.bestStreak}</div>
              </div>
            </div>
          </div>
          
          <motion.button
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 px-6 rounded-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetQuiz}
          >
            Play Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!isActive && !showResult) {
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
            🧠
          </motion.div>
          
          <h1 className="text-3xl font-bold text-white mb-4">Crypto Quiz</h1>
          <p className="text-gray-300 mb-8">Test your crypto knowledge and earn points!</p>
          
          <div className="space-y-4 mb-8">
            <div className="bg-cyan-400/10 border border-cyan-400/30 rounded-xl p-4">
              <div className="text-cyan-400 text-sm">Game Rules</div>
              <div className="text-white text-sm mt-2">
                • 30 seconds per question<br/>
                • Higher difficulty = more points<br/>
                • Time bonus for quick answers<br/>
                • Build streaks for extra rewards
              </div>
            </div>
          </div>
          
          <motion.button
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 px-6 rounded-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startQuiz}
          >
            Start Quiz
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Question Progress */}
          <motion.div
            className="bg-black/40 backdrop-blur-lg border border-cyan-400/30 rounded-xl p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-cyan-400 text-sm">Question</div>
            <div className="text-white text-xl font-bold">
              {currentQuestionIndex + 1}/{questions.length}
            </div>
          </motion.div>

          {/* Timer */}
          <motion.div
            className="bg-black/40 backdrop-blur-lg border border-orange-400/30 rounded-xl p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-orange-400 text-sm">Time Left</div>
            <div className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
              {timeLeft}s
            </div>
          </motion.div>

          {/* Streak */}
          <motion.div
            className="bg-black/40 backdrop-blur-lg border border-yellow-400/30 rounded-xl p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-yellow-400 text-sm">Streak</div>
            <div className="text-white text-xl font-bold">{stats.streak}</div>
          </motion.div>

          {/* Points */}
          <motion.div
            className="bg-black/40 backdrop-blur-lg border border-green-400/30 rounded-xl p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-green-400 text-sm">Points</div>
            <div className="text-white text-xl font-bold">{stats.totalPoints}</div>
          </motion.div>
        </div>
      </div>

      {/* Main Quiz Area */}
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="bg-black/40 backdrop-blur-lg border border-cyan-400/30 rounded-3xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentQuestionIndex}
        >
          {/* Question Header */}
          <div className="flex items-center justify-between mb-6">
            <div className={`px-3 py-1 rounded-full border text-sm ${getDifficultyColor(currentQuestion.difficulty)}`}>
              {currentQuestion.difficulty.toUpperCase()}
            </div>
            <div className="text-gray-400 text-sm">{currentQuestion.category}</div>
          </div>

          {/* Question */}
          <h2 className="text-2xl font-bold text-white mb-8">{currentQuestion.question}</h2>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={index}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${getOptionStyle(index)}`}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                whileHover={!showResult ? { scale: 1.02 } : {}}
                whileTap={!showResult ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mr-4 text-sm font-bold">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <div>{option}</div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Result and Explanation */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className={`p-4 rounded-xl border ${
                  selectedAnswer === currentQuestion.correctAnswer 
                    ? 'border-green-400 bg-green-400/10' 
                    : 'border-red-400 bg-red-400/10'
                }`}>
                  <div className={`font-bold ${
                    selectedAnswer === currentQuestion.correctAnswer ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {selectedAnswer === -1 
                      ? "⏰ Time's Up!" 
                      : selectedAnswer === currentQuestion.correctAnswer 
                        ? "🎉 Correct!" 
                        : "❌ Incorrect!"}
                  </div>
                  {selectedAnswer !== currentQuestion.correctAnswer && (
                    <div className="text-white mt-2">
                      Correct answer: {currentQuestion.options[currentQuestion.correctAnswer]}
                    </div>
                  )}
                </div>

                <motion.button
                  className="w-full bg-cyan-400/20 border border-cyan-400/30 text-cyan-400 py-2 px-4 rounded-xl"
                  onClick={() => setShowExplanation(!showExplanation)}
                  whileHover={{ scale: 1.02 }}
                >
                  {showExplanation ? 'Hide' : 'Show'} Explanation
                </motion.button>

                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-4"
                    >
                      <div className="text-blue-400 text-sm font-bold mb-2">Explanation:</div>
                      <div className="text-white text-sm">{currentQuestion.explanation}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 px-6 rounded-xl"
                  onClick={nextQuestion}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default CryptoQuiz;

