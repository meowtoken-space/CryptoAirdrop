// CryptoQuizReclassificado.tsx - Sistema de Pontuação Equilibrado
// Fácil: 3 pontos | Médio: 7 pontos | Difícil: 15 pontos

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Question {
  id: number;
  category_id: number;
  difficulty_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  tags: string[];
  category_name?: string;
  difficulty_name?: string;
  points?: number;
}

interface GameStats {
  totalQuestions: number;
  correctAnswers: number;
  totalPoints: number;
  streak: number;
  bestStreak: number;
  averageTime: number;
}

const CryptoQuizReclassificado: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    totalPoints: 0,
    streak: 0,
    bestStreak: 0,
    averageTime: 0
  });
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [difficulties] = useState([
    { id: 1, name: 'Fácil', points: 3, color: '#10B981', description: 'Conceitos básicos' },
    { id: 2, name: 'Médio', points: 7, color: '#F59E0B', description: 'Conhecimento intermediário' },
    { id: 3, name: 'Difícil', points: 15, color: '#EF4444', description: 'Conceitos avançados' }
  ]);

  // Timer effect
  useEffect(() => {
    if (gameStarted && !showResult && !gameEnded && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, gameStarted, showResult, gameEnded]);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadRandomQuestion = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('quiz_questions')
        .select(`
          *,
          quiz_categories(name),
          quiz_difficulties(name, points)
        `);

      // Apply filters
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }
      if (selectedDifficulty) {
        query = query.eq('difficulty_id', selectedDifficulty);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        const question = data[randomIndex];
        
        // Format question with category and difficulty info
        const formattedQuestion: Question = {
          ...question,
          category_name: question.quiz_categories?.name,
          difficulty_name: question.quiz_difficulties?.name,
          points: question.quiz_difficulties?.points
        };
        
        setCurrentQuestion(formattedQuestion);
        setQuestionStartTime(Date.now());
        setTimeLeft(30);
        setSelectedAnswer('');
        setShowResult(false);
      }
    } catch (error) {
      console.error('Erro ao carregar pergunta:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = () => {
    setShowResult(true);
    setIsCorrect(false);
    updateStats(false, 0, 30);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;
    
    const timeSpent = (Date.now() - questionStartTime) / 1000;
    const correct = selectedAnswer === currentQuestion.correct_answer;
    
    setIsCorrect(correct);
    setShowResult(true);
    
    // Calculate points with speed bonus
    let points = 0;
    if (correct && currentQuestion.points) {
      points = currentQuestion.points;
      
      // Speed bonus: +50% if answered in first 10 seconds
      if (timeSpent <= 10) {
        points = Math.floor(points * 1.5);
      }
      // Speed bonus: +25% if answered in first 20 seconds
      else if (timeSpent <= 20) {
        points = Math.floor(points * 1.25);
      }
    }
    
    updateStats(correct, points, timeSpent);
  };

  const updateStats = (correct: boolean, points: number, timeSpent: number) => {
    setGameStats(prev => {
      const newStreak = correct ? prev.streak + 1 : 0;
      const newBestStreak = Math.max(prev.bestStreak, newStreak);
      const newTotalQuestions = prev.totalQuestions + 1;
      const newCorrectAnswers = prev.correctAnswers + (correct ? 1 : 0);
      const newTotalPoints = prev.totalPoints + points;
      const newAverageTime = ((prev.averageTime * prev.totalQuestions) + timeSpent) / newTotalQuestions;
      
      return {
        totalQuestions: newTotalQuestions,
        correctAnswers: newCorrectAnswers,
        totalPoints: newTotalPoints,
        streak: newStreak,
        bestStreak: newBestStreak,
        averageTime: newAverageTime
      };
    });
  };

  const handleNextQuestion = () => {
    if (gameStats.totalQuestions >= 20) {
      setGameEnded(true);
      saveGameResults();
    } else {
      loadRandomQuestion();
    }
  };

  const saveGameResults = async () => {
    try {
      // Save to user's total points (integrate with your points system)
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.rpc('add_user_points', {
          user_wallet: userData.user.id,
          points_to_add: gameStats.totalPoints,
          source: 'crypto_quiz'
        });
      }
    } catch (error) {
      console.error('Erro ao salvar resultados:', error);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameEnded(false);
    setGameStats({
      totalQuestions: 0,
      correctAnswers: 0,
      totalPoints: 0,
      streak: 0,
      bestStreak: 0,
      averageTime: 0
    });
    loadRandomQuestion();
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameEnded(false);
    setCurrentQuestion(null);
    setSelectedAnswer('');
    setShowResult(false);
    setTimeLeft(30);
  };

  const getDifficultyColor = (difficultyId: number) => {
    const difficulty = difficulties.find(d => d.id === difficultyId);
    return difficulty?.color || '#6B7280';
  };

  const getDifficultyInfo = (difficultyId: number) => {
    return difficulties.find(d => d.id === difficultyId);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🧠 Crypto Quiz Avançado
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Sistema de Pontuação Equilibrado - Teste seus conhecimentos!
            </p>
          </div>

          {/* Difficulty Explanation */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {difficulties.map((diff) => (
              <div key={diff.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center mb-4">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: diff.color }}
                  ></div>
                  <h3 className="text-xl font-bold text-white">{diff.name}</h3>
                </div>
                <p className="text-gray-300 mb-2">{diff.description}</p>
                <div className="text-2xl font-bold" style={{ color: diff.color }}>
                  {diff.points} pontos
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  + Bônus de velocidade até 50%
                </p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Filtros (Opcional)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Categoria:</label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Dificuldade:</label>
                <select
                  value={selectedDifficulty || ''}
                  onChange={(e) => setSelectedDifficulty(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600"
                >
                  <option value="">Todas as dificuldades</option>
                  {difficulties.map((diff) => (
                    <option key={diff.id} value={diff.id}>{diff.name} ({diff.points} pts)</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105"
            >
              🚀 Iniciar Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameEnded) {
    const accuracy = gameStats.totalQuestions > 0 ? (gameStats.correctAnswers / gameStats.totalQuestions) * 100 : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">🎉 Quiz Finalizado!</h2>
              <p className="text-xl text-gray-300">Parabéns! Aqui estão seus resultados:</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">{gameStats.totalPoints}</div>
                <div className="text-green-100">Pontos Totais</div>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">{accuracy.toFixed(1)}%</div>
                <div className="text-blue-100">Precisão</div>
              </div>
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">{gameStats.bestStreak}</div>
                <div className="text-purple-100">Melhor Sequência</div>
              </div>
              <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">{gameStats.averageTime.toFixed(1)}s</div>
                <div className="text-orange-100">Tempo Médio</div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 mr-4"
              >
                🔄 Jogar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Carregando pergunta...</p>
        </div>
      </div>
    );
  }

  const difficultyInfo = getDifficultyInfo(currentQuestion.difficulty_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with stats */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700">
              <span className="text-gray-300">Pergunta: </span>
              <span className="text-white font-bold">{gameStats.totalQuestions + 1}/20</span>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700">
              <span className="text-gray-300">Pontos: </span>
              <span className="text-white font-bold">{gameStats.totalPoints}</span>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700">
              <span className="text-gray-300">Sequência: </span>
              <span className="text-white font-bold">{gameStats.streak}</span>
            </div>
          </div>
          
          <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${timeLeft <= 10 ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-800/50 text-white border border-gray-700'}`}>
            ⏱️ {timeLeft}s
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 mb-6">
          {/* Question Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                {currentQuestion.category_name}
              </span>
              <span 
                className="px-3 py-1 rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: getDifficultyColor(currentQuestion.difficulty_id) }}
              >
                {difficultyInfo?.name} - {difficultyInfo?.points} pts
              </span>
            </div>
          </div>

          {/* Question */}
          <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="grid gap-4 mb-8">
            {['A', 'B', 'C', 'D'].map((letter) => {
              const optionKey = `option_${letter.toLowerCase()}` as keyof Question;
              const optionText = currentQuestion[optionKey] as string;
              
              let buttonClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ";
              
              if (showResult) {
                if (letter === currentQuestion.correct_answer) {
                  buttonClass += "bg-green-600 border-green-500 text-white";
                } else if (letter === selectedAnswer && letter !== currentQuestion.correct_answer) {
                  buttonClass += "bg-red-600 border-red-500 text-white";
                } else {
                  buttonClass += "bg-gray-700 border-gray-600 text-gray-300";
                }
              } else {
                if (selectedAnswer === letter) {
                  buttonClass += "bg-blue-600 border-blue-500 text-white";
                } else {
                  buttonClass += "bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500";
                }
              }

              return (
                <button
                  key={letter}
                  onClick={() => handleAnswerSelect(letter)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  <span className="font-bold mr-3">{letter})</span>
                  {optionText}
                </button>
              );
            })}
          </div>

          {/* Action Button */}
          {!showResult ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className={`w-full py-4 rounded-xl font-bold text-xl transition-all duration-300 ${
                selectedAnswer
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              ✅ Confirmar Resposta
            </button>
          ) : (
            <div>
              {/* Result */}
              <div className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-green-600/20 border border-green-500' : 'bg-red-600/20 border border-red-500'}`}>
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{isCorrect ? '✅' : '❌'}</span>
                  <span className={`font-bold text-xl ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? 'Correto!' : 'Incorreto!'}
                  </span>
                  {isCorrect && (
                    <span className="ml-4 bg-yellow-500 text-black px-3 py-1 rounded-full font-bold">
                      +{currentQuestion.points} pts
                    </span>
                  )}
                </div>
                <p className="text-gray-300">{currentQuestion.explanation}</p>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl text-xl transition-all duration-300"
              >
                {gameStats.totalQuestions >= 19 ? '🏁 Finalizar Quiz' : '➡️ Próxima Pergunta'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CryptoQuizReclassificado;

