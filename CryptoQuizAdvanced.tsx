// CryptoQuizAdvanced.tsx - Componente React avançado para CryptoQuiz
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (usar suas chaves)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

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
  category?: {
    name: string;
    description: string;
  };
  difficulty?: {
    name: string;
    points: number;
  };
}

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Difficulty {
  id: number;
  name: string;
  points: number;
}

interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  totalPoints: number;
  streak: number;
  bestStreak: number;
}

const CryptoQuizAdvanced: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [stats, setStats] = useState<QuizStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    totalPoints: 0,
    streak: 0,
    bestStreak: 0
  });
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  // Carregar categorias e dificuldades
  useEffect(() => {
    loadCategories();
    loadDifficulties();
    loadStats();
  }, []);

  // Timer para perguntas
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

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

  const loadDifficulties = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_difficulties')
        .select('*')
        .order('points');
      
      if (error) throw error;
      setDifficulties(data || []);
    } catch (error) {
      console.error('Erro ao carregar dificuldades:', error);
    }
  };

  const loadStats = () => {
    const savedStats = localStorage.getItem('cryptoQuizStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  };

  const saveStats = (newStats: QuizStats) => {
    setStats(newStats);
    localStorage.setItem('cryptoQuizStats', JSON.stringify(newStats));
  };

  const loadRandomQuestion = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('quiz_questions')
        .select(`
          *,
          category:quiz_categories(*),
          difficulty:quiz_difficulties(*)
        `);

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
        setCurrentQuestion(data[randomIndex]);
        setTimeLeft(30);
        setTimerActive(true);
      }
    } catch (error) {
      console.error('Erro ao carregar pergunta:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    setTimerActive(false);
    const correct = selectedAnswer === currentQuestion.correct_answer;
    setIsCorrect(correct);
    setShowResult(true);

    // Calcular pontos com bonus de velocidade
    let points = 0;
    if (correct && currentQuestion.difficulty) {
      const basePoints = currentQuestion.difficulty.points;
      const timeBonus = Math.floor((timeLeft / 30) * basePoints * 0.5);
      points = basePoints + timeBonus;
    }

    // Atualizar estatísticas
    const newStats = {
      ...stats,
      totalQuestions: stats.totalQuestions + 1,
      correctAnswers: correct ? stats.correctAnswers + 1 : stats.correctAnswers,
      totalPoints: stats.totalPoints + points,
      streak: correct ? stats.streak + 1 : 0,
      bestStreak: correct ? Math.max(stats.bestStreak, stats.streak + 1) : stats.bestStreak
    };
    saveStats(newStats);

    // Salvar pontos no sistema principal (integração com usePoints)
    if (correct && window.MeowPoints) {
      window.MeowPoints.addPoints('crypto_quiz', points);
    }
  };

  const handleTimeUp = () => {
    if (!showResult) {
      setSelectedAnswer('');
      handleSubmitAnswer();
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestion(null);
    setSelectedAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    loadRandomQuestion();
  };

  const startGame = () => {
    setGameStarted(true);
    loadRandomQuestion();
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentQuestion(null);
    setSelectedAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setTimerActive(false);
    setTimeLeft(30);
  };

  const getOptionLetter = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  const getOptionClass = (option: string) => {
    if (!showResult) {
      return selectedAnswer === option 
        ? 'bg-purple-600 border-purple-400' 
        : 'bg-gray-800 border-gray-600 hover:border-purple-400';
    }
    
    if (option === currentQuestion?.correct_answer) {
      return 'bg-green-600 border-green-400';
    }
    if (option === selectedAnswer && option !== currentQuestion?.correct_answer) {
      return 'bg-red-600 border-red-400';
    }
    return 'bg-gray-800 border-gray-600';
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🧠 Crypto Quiz Avançado
            </h1>
            <p className="text-xl text-gray-300">
              Teste seus conhecimentos sobre DeFi, Blockchain e Criptomoedas
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.totalQuestions}</div>
              <div className="text-sm text-gray-400">Perguntas</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.correctAnswers}</div>
              <div className="text-sm text-gray-400">Acertos</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.totalPoints}</div>
              <div className="text-sm text-gray-400">Pontos</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">{stats.bestStreak}</div>
              <div className="text-sm text-gray-400">Melhor Sequência</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Configurações do Quiz</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoria
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dificuldade
                </label>
                <select
                  value={selectedDifficulty || ''}
                  onChange={(e) => setSelectedDifficulty(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Todas as dificuldades</option>
                  {difficulties.map(difficulty => (
                    <option key={difficulty.id} value={difficulty.id}>
                      {difficulty.name} ({difficulty.points} pts)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Botão Iniciar */}
          <div className="text-center">
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105"
            >
              🚀 Iniciar Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Carregando pergunta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={resetGame}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ← Voltar
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="text-white">
              Sequência: <span className="text-yellow-400 font-bold">{stats.streak}</span>
            </div>
            <div className="text-white">
              Pontos: <span className="text-green-400 font-bold">{stats.totalPoints}</span>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white">Tempo restante:</span>
            <span className={`font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
              {timeLeft}s
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                timeLeft <= 10 ? 'bg-red-500' : 'bg-purple-500'
              }`}
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Pergunta */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex space-x-2">
              {currentQuestion.category && (
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                  {currentQuestion.category.name}
                </span>
              )}
              {currentQuestion.difficulty && (
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  {currentQuestion.difficulty.name} - {currentQuestion.difficulty.points} pts
                </span>
              )}
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-6">
            {currentQuestion.question}
          </h2>

          {/* Opções */}
          <div className="space-y-3">
            {[
              { letter: 'A', text: currentQuestion.option_a },
              { letter: 'B', text: currentQuestion.option_b },
              { letter: 'C', text: currentQuestion.option_c },
              { letter: 'D', text: currentQuestion.option_d }
            ].map((option) => (
              <button
                key={option.letter}
                onClick={() => handleAnswerSelect(option.letter)}
                disabled={showResult}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-300 ${getOptionClass(option.letter)}`}
              >
                <span className="font-bold mr-3">{option.letter})</span>
                {option.text}
              </button>
            ))}
          </div>

          {/* Botão Confirmar */}
          {!showResult && (
            <div className="mt-6 text-center">
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
              >
                Confirmar Resposta
              </button>
            </div>
          )}
        </div>

        {/* Resultado */}
        {showResult && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className={`text-center mb-4 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              <div className="text-4xl mb-2">
                {isCorrect ? '🎉' : '❌'}
              </div>
              <div className="text-2xl font-bold">
                {isCorrect ? 'Correto!' : 'Incorreto!'}
              </div>
              {isCorrect && currentQuestion.difficulty && (
                <div className="text-lg text-yellow-400 mt-2">
                  +{currentQuestion.difficulty.points + Math.floor((timeLeft / 30) * currentQuestion.difficulty.points * 0.5)} pontos
                  {timeLeft > 20 && <span className="text-sm"> (bonus velocidade!)</span>}
                </div>
              )}
            </div>

            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <h4 className="font-bold text-white mb-2">Explicação:</h4>
              <p className="text-gray-300">{currentQuestion.explanation}</p>
            </div>

            <div className="text-center">
              <button
                onClick={handleNextQuestion}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
              >
                Próxima Pergunta →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoQuizAdvanced;

