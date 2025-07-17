// CryptoQuiz_integrado.tsx - Versão integrada com sistema de pontos
import React, { useState, useEffect, useCallback } from 'react';

// Tipos para o sistema de pontos
interface PointsResult {
  success: boolean;
  pointsEarned?: number;
  error?: string;
  levelUp?: boolean;
  newLevel?: number;
  sessionData?: {
    basePoints: number;
    speedBonus: number;
    accuracyBonus: number;
    streakBonus: number;
    difficultyMultiplier: number;
  };
}

// Declaração global para o sistema de pontos
declare global {
  interface Window {
    gameIntegration?: {
      submitQuizScore: (correct: number, total: number, time: number, difficulty: string) => PointsResult;
      getDailyLimitsRemaining: () => Record<string, number>;
    };
    meowUI?: {
      showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
    };
    meowPoints?: {
      getUserData: () => any;
    };
  }
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
  category: string;
}

interface QuizStats {
  correct: number;
  total: number;
  timeSpent: number;
  streak: number;
  pointsEarned: number;
}

const CryptoQuiz: React.FC = () => {
  // Estados do quiz
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizStats, setQuizStats] = useState<QuizStats>({
    correct: 0,
    total: 0,
    timeSpent: 0,
    streak: 0,
    pointsEarned: 0
  });
  
  // Estados de tempo
  const [startTime, setStartTime] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30); // 30 segundos por pergunta
  
  // Estados do jogo
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Estados do sistema de pontos
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(300);
  const [dailyUsed, setDailyUsed] = useState(0);
  const [lastPointsBreakdown, setLastPointsBreakdown] = useState<any>(null);

  // Banco de perguntas
  const questionBank: Question[] = [
    {
      id: 1,
      question: "O que significa 'HODL' no mundo das criptomoedas?",
      options: ["Hold On for Dear Life", "High Order Digital Ledger", "Hash of Distributed Ledger", "Holding Original Digital License"],
      correct: 0,
      difficulty: 'easy',
      explanation: "HODL significa 'Hold On for Dear Life' e se refere à estratégia de manter criptomoedas por longo prazo.",
      category: "Terminologia"
    },
    {
      id: 2,
      question: "Qual é o limite máximo de Bitcoin que pode existir?",
      options: ["18 milhões", "21 milhões", "25 milhões", "Ilimitado"],
      correct: 1,
      difficulty: 'easy',
      explanation: "O Bitcoin tem um limite máximo de 21 milhões de moedas, programado no protocolo.",
      category: "Bitcoin"
    },
    {
      id: 3,
      question: "O que é um 'Smart Contract'?",
      options: ["Um contrato físico", "Um programa que executa automaticamente", "Um tipo de carteira", "Uma exchange descentralizada"],
      correct: 1,
      difficulty: 'medium',
      explanation: "Smart Contracts são programas que executam automaticamente quando condições específicas são atendidas.",
      category: "Blockchain"
    },
    {
      id: 4,
      question: "Qual blockchain é conhecida por usar Proof of Stake?",
      options: ["Bitcoin", "Ethereum 2.0", "Litecoin", "Bitcoin Cash"],
      correct: 1,
      difficulty: 'medium',
      explanation: "Ethereum 2.0 migrou para Proof of Stake, sendo mais eficiente energeticamente que Proof of Work.",
      category: "Consensus"
    },
    {
      id: 5,
      question: "O que é 'Impermanent Loss' em DeFi?",
      options: ["Perda permanente de tokens", "Perda temporária em pools de liquidez", "Taxa de transação", "Erro de smart contract"],
      correct: 1,
      difficulty: 'hard',
      explanation: "Impermanent Loss é a perda temporária que pode ocorrer ao fornecer liquidez em pools AMM.",
      category: "DeFi"
    },
    {
      id: 6,
      question: "Qual é a principal função de um 'Oracle' em blockchain?",
      options: ["Minerar blocos", "Conectar dados externos", "Validar transações", "Criar tokens"],
      correct: 1,
      difficulty: 'hard',
      explanation: "Oracles conectam blockchains com dados do mundo real, permitindo que smart contracts acessem informações externas.",
      category: "Infraestrutura"
    },
    {
      id: 7,
      question: "O que significa 'Gas' na rede Ethereum?",
      options: ["Combustível físico", "Taxa de transação", "Tipo de token", "Algoritmo de consenso"],
      correct: 1,
      difficulty: 'medium',
      explanation: "Gas é a unidade que mede o custo computacional das operações na rede Ethereum.",
      category: "Ethereum"
    },
    {
      id: 8,
      question: "Qual é a diferença entre Layer 1 e Layer 2?",
      options: ["Não há diferença", "Layer 1 é a blockchain principal, Layer 2 são soluções de escala", "Layer 2 é mais segura", "Layer 1 é mais rápida"],
      correct: 1,
      difficulty: 'hard',
      explanation: "Layer 1 é a blockchain base (como Ethereum), Layer 2 são soluções construídas sobre ela para melhorar escalabilidade.",
      category: "Arquitetura"
    }
  ];

  // Verificar conexão da carteira
  useEffect(() => {
    const checkWalletConnection = () => {
      if (window.meowPoints) {
        try {
          const userData = window.meowPoints.getUserData();
          setIsWalletConnected(!!userData.walletAddress);
        } catch (error) {
          setIsWalletConnected(false);
        }
      }
    };

    checkWalletConnection();
    const interval = setInterval(checkWalletConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  // Verificar limites diários
  useEffect(() => {
    const checkDailyLimits = () => {
      if (window.gameIntegration) {
        try {
          const limits = window.gameIntegration.getDailyLimitsRemaining();
          const quizLimit = limits['Crypto Quiz'] || 0;
          setDailyUsed(300 - quizLimit);
        } catch (error) {
          console.error('Erro ao verificar limites:', error);
        }
      }
    };

    checkDailyLimits();
    const interval = setInterval(checkDailyLimits, 30000);
    return () => clearInterval(interval);
  }, []);

  // Timer da pergunta
  useEffect(() => {
    if (gameState === 'playing' && !isAnswered && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      // Tempo esgotado
      handleTimeUp();
    }
  }, [gameState, isAnswered, timeLeft]);

  // Iniciar quiz
  const startQuiz = () => {
    const selectedQuestions = questionBank
      .filter(q => q.difficulty === difficulty)
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
    
    setQuestions(selectedQuestions);
    setCurrentQuestionIndex(0);
    setQuizStats({ correct: 0, total: 0, timeSpent: 0, streak: 0, pointsEarned: 0 });
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setTimeLeft(30);
    setGameState('playing');
    setIsAnswered(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  // Selecionar resposta
  const selectAnswer = (answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correct;
    const questionTime = Date.now() - (questionStartTime || Date.now());
    
    // Atualizar estatísticas
    setQuizStats(prev => ({
      ...prev,
      total: prev.total + 1,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      timeSpent: prev.timeSpent + questionTime,
      streak: isCorrect ? prev.streak + 1 : 0
    }));

    // Mostrar explicação
    setShowExplanation(true);
    
    // Próxima pergunta após 3 segundos
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  // Tempo esgotado
  const handleTimeUp = () => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    setSelectedAnswer(-1); // Indica que o tempo esgotou
    
    const questionTime = 30000; // 30 segundos
    
    setQuizStats(prev => ({
      ...prev,
      total: prev.total + 1,
      timeSpent: prev.timeSpent + questionTime,
      streak: 0
    }));

    setShowExplanation(true);
    
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  // Próxima pergunta
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
      setTimeLeft(30);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  // Finalizar quiz
  const finishQuiz = () => {
    const totalTime = Date.now() - (startTime || Date.now());
    const finalStats = {
      ...quizStats,
      timeSpent: totalTime
    };

    // 🆕 INTEGRAÇÃO COM SISTEMA DE PONTOS
    if (isWalletConnected && window.gameIntegration) {
      try {
        const result = window.gameIntegration.submitQuizScore(
          finalStats.correct,
          finalStats.total,
          Math.floor(totalTime / 1000), // Converter para segundos
          difficulty
        );

        if (result.success && result.pointsEarned) {
          setQuizStats(prev => ({ ...prev, pointsEarned: result.pointsEarned! }));
          setLastPointsBreakdown(result.sessionData);
          
          // Mostrar notificação
          if (window.meowUI) {
            window.meowUI.showNotification(
              `🧠 Quiz concluído! +${result.pointsEarned} pontos Meow!`, 
              'success'
            );
          }

          // Verificar level up
          if (result.levelUp) {
            if (window.meowUI) {
              window.meowUI.showNotification(
                `🎉 Level Up! Agora você é nível ${result.newLevel}!`, 
                'success'
              );
            }
          }

        } else if (result.error) {
          if (window.meowUI) {
            window.meowUI.showNotification(
              `⚠️ ${result.error}`, 
              'warning'
            );
          }
        }
      } catch (error) {
        console.error('Erro ao submeter pontos:', error);
      }
    }

    setGameState('finished');
  };

  // Reiniciar quiz
  const resetQuiz = () => {
    setGameState('menu');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setQuizStats({ correct: 0, total: 0, timeSpent: 0, streak: 0, pointsEarned: 0 });
    setLastPointsBreakdown(null);
  };

  // Conectar carteira
  const connectWallet = () => {
    if (window.meowUI) {
      window.meowUI.showNotification(
        '🔗 Clique no botão "Conectar Carteira" no topo da página!', 
        'info'
      );
    }
  };

  // Renderizar menu
  if (gameState === 'menu') {
    return (
      <div className="crypto-quiz-container">
        <div className="quiz-menu">
          <div className="menu-header">
            <h1>🧠 Crypto Quiz</h1>
            <p>Teste seus conhecimentos sobre criptomoedas e blockchain!</p>
          </div>

          {/* Status da carteira */}
          {!isWalletConnected && (
            <div className="wallet-warning" onClick={connectWallet}>
              <span>⚠️ Conecte sua carteira para ganhar pontos Meow!</span>
            </div>
          )}

          {/* Limite diário */}
          {isWalletConnected && (
            <div className="daily-limit">
              <span>📊 Limite diário: {dailyUsed}/{dailyLimit} pontos usados</span>
              <div className="limit-bar">
                <div 
                  className="limit-fill" 
                  style={{ width: `${(dailyUsed / dailyLimit) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Seleção de dificuldade */}
          <div className="difficulty-selection">
            <h3>Escolha a dificuldade:</h3>
            <div className="difficulty-buttons">
              {(['easy', 'medium', 'hard'] as const).map(level => (
                <button
                  key={level}
                  className={`difficulty-btn ${difficulty === level ? 'selected' : ''}`}
                  onClick={() => setDifficulty(level)}
                >
                  <div className="difficulty-icon">
                    {level === 'easy' ? '😊' : level === 'medium' ? '🤔' : '🔥'}
                  </div>
                  <div className="difficulty-name">
                    {level === 'easy' ? 'Fácil' : level === 'medium' ? 'Médio' : 'Difícil'}
                  </div>
                  <div className="difficulty-multiplier">
                    {level === 'easy' ? '1x' : level === 'medium' ? '1.5x' : '2x'} pontos
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Regras do quiz */}
          <div className="quiz-rules">
            <h3>📋 Regras:</h3>
            <ul>
              <li>🎯 10 perguntas sobre criptomoedas</li>
              <li>⏰ 30 segundos por pergunta</li>
              <li>🏆 Pontos baseados em precisão e velocidade</li>
              <li>🔥 Bônus por sequências de acertos</li>
              <li>💎 Multiplicador por dificuldade</li>
            </ul>
          </div>

          <button className="start-quiz-btn" onClick={startQuiz}>
            🚀 Iniciar Quiz
          </button>
        </div>

        {/* Estilos CSS */}
        <style jsx>{`
          .crypto-quiz-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }

          .quiz-menu {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            padding: 40px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            text-align: center;
          }

          .menu-header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #9a45fc, #2ad6d0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .menu-header p {
            color: #b0b0b0;
            font-size: 1.1rem;
            margin-bottom: 30px;
          }

          .wallet-warning {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 25px;
          }

          .wallet-warning:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
          }

          .daily-limit {
            background: rgba(255, 255, 255, 0.05);
            padding: 15px 25px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 25px;
          }

          .limit-bar {
            position: relative;
            background: rgba(255, 255, 255, 0.1);
            height: 8px;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 10px;
          }

          .limit-fill {
            height: 100%;
            background: linear-gradient(90deg, #22c55e, #ef4444);
            transition: width 0.3s ease;
          }

          .difficulty-selection {
            margin: 30px 0;
          }

          .difficulty-selection h3 {
            color: #9a45fc;
            margin-bottom: 20px;
          }

          .difficulty-buttons {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }

          .difficulty-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            color: white;
          }

          .difficulty-btn:hover {
            transform: translateY(-3px);
            border-color: #9a45fc;
            box-shadow: 0 6px 20px rgba(154, 69, 252, 0.2);
          }

          .difficulty-btn.selected {
            border-color: #9a45fc;
            background: rgba(154, 69, 252, 0.1);
          }

          .difficulty-icon {
            font-size: 2rem;
            margin-bottom: 10px;
          }

          .difficulty-name {
            font-weight: bold;
            margin-bottom: 5px;
          }

          .difficulty-multiplier {
            color: #ffe118;
            font-size: 0.9rem;
          }

          .quiz-rules {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 25px;
            margin: 30px 0;
            text-align: left;
          }

          .quiz-rules h3 {
            color: #2ad6d0;
            margin-bottom: 15px;
            text-align: center;
          }

          .quiz-rules ul {
            list-style: none;
            padding: 0;
          }

          .quiz-rules li {
            padding: 8px 0;
            color: #b0b0b0;
          }

          .start-quiz-btn {
            background: linear-gradient(135deg, #9a45fc, #7c3aed);
            color: white;
            border: none;
            padding: 15px 40px;
            border-radius: 25px;
            font-size: 1.2rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(154, 69, 252, 0.3);
          }

          .start-quiz-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(154, 69, 252, 0.4);
          }

          @media (max-width: 768px) {
            .quiz-menu {
              padding: 25px;
            }

            .difficulty-buttons {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    );
  }

  // Renderizar quiz em andamento
  if (gameState === 'playing') {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div className="crypto-quiz-container">
        <div className="quiz-game">
          {/* Header do quiz */}
          <div className="quiz-header">
            <div className="quiz-progress">
              <span>Pergunta {currentQuestionIndex + 1} de {questions.length}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="quiz-stats">
              <div className="stat">
                <span className="stat-label">✅ Corretas</span>
                <span className="stat-value">{quizStats.correct}</span>
              </div>
              <div className="stat">
                <span className="stat-label">🔥 Sequência</span>
                <span className="stat-value">{quizStats.streak}</span>
              </div>
              <div className="stat">
                <span className="stat-label">⏰ Tempo</span>
                <span className="stat-value">{timeLeft}s</span>
              </div>
            </div>
          </div>

          {/* Timer visual */}
          <div className="timer-bar">
            <div 
              className="timer-fill" 
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            />
          </div>

          {/* Pergunta */}
          <div className="question-container">
            <div className="question-category">{currentQuestion.category}</div>
            <h2 className="question-text">{currentQuestion.question}</h2>
            
            {/* Opções de resposta */}
            <div className="answers-grid">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`answer-btn ${
                    selectedAnswer === index ? 'selected' : ''
                  } ${
                    isAnswered && index === currentQuestion.correct ? 'correct' : ''
                  } ${
                    isAnswered && selectedAnswer === index && index !== currentQuestion.correct ? 'incorrect' : ''
                  } ${
                    isAnswered && selectedAnswer === -1 && index === currentQuestion.correct ? 'correct' : ''
                  }`}
                  onClick={() => selectAnswer(index)}
                  disabled={isAnswered}
                >
                  <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="answer-text">{option}</span>
                </button>
              ))}
            </div>

            {/* Explicação */}
            {showExplanation && (
              <div className="explanation">
                <h4>💡 Explicação:</h4>
                <p>{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        </div>

        {/* Estilos CSS para o jogo */}
        <style jsx>{`
          .quiz-game {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            padding: 30px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .quiz-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 20px;
          }

          .quiz-progress span {
            color: #9a45fc;
            font-weight: bold;
            margin-bottom: 8px;
            display: block;
          }

          .progress-bar {
            width: 200px;
            height: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            overflow: hidden;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #9a45fc, #2ad6d0);
            transition: width 0.3s ease;
          }

          .quiz-stats {
            display: flex;
            gap: 20px;
          }

          .stat {
            text-align: center;
          }

          .stat-label {
            display: block;
            font-size: 0.8rem;
            color: #b0b0b0;
            margin-bottom: 4px;
          }

          .stat-value {
            display: block;
            font-size: 1.2rem;
            font-weight: bold;
            color: #ffffff;
          }

          .timer-bar {
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 30px;
          }

          .timer-fill {
            height: 100%;
            background: linear-gradient(90deg, #22c55e, #eab308, #ef4444);
            transition: width 1s linear;
          }

          .question-container {
            text-align: center;
          }

          .question-category {
            background: linear-gradient(135deg, #2ad6d0, #0891b2);
            color: white;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 20px;
          }

          .question-text {
            font-size: 1.4rem;
            color: #ffffff;
            margin-bottom: 30px;
            line-height: 1.5;
          }

          .answers-grid {
            display: grid;
            gap: 15px;
            margin-bottom: 30px;
          }

          .answer-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 15px 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 15px;
            text-align: left;
            color: white;
          }

          .answer-btn:hover:not(:disabled) {
            border-color: #9a45fc;
            background: rgba(154, 69, 252, 0.1);
          }

          .answer-btn.selected {
            border-color: #9a45fc;
            background: rgba(154, 69, 252, 0.2);
          }

          .answer-btn.correct {
            border-color: #22c55e;
            background: rgba(34, 197, 94, 0.2);
          }

          .answer-btn.incorrect {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.2);
          }

          .answer-btn:disabled {
            cursor: not-allowed;
          }

          .answer-letter {
            background: rgba(255, 255, 255, 0.2);
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            flex-shrink: 0;
          }

          .answer-text {
            flex: 1;
          }

          .explanation {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            text-align: left;
            margin-top: 20px;
          }

          .explanation h4 {
            color: #ffe118;
            margin-bottom: 10px;
          }

          .explanation p {
            color: #b0b0b0;
            line-height: 1.5;
          }

          @media (max-width: 768px) {
            .quiz-header {
              flex-direction: column;
              text-align: center;
            }

            .quiz-stats {
              justify-content: center;
            }

            .question-text {
              font-size: 1.2rem;
            }

            .answer-btn {
              padding: 12px 15px;
            }
          }
        `}</style>
      </div>
    );
  }

  // Renderizar resultados finais
  return (
    <div className="crypto-quiz-container">
      <div className="quiz-results">
        <div className="results-header">
          <h1>🎉 Quiz Concluído!</h1>
          <div className="final-score">
            {quizStats.correct}/{quizStats.total} corretas
          </div>
        </div>

        {/* Estatísticas detalhadas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-title">Precisão</div>
            <div className="stat-value">{Math.round((quizStats.correct / quizStats.total) * 100)}%</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-title">Tempo Total</div>
            <div className="stat-value">{Math.round(quizStats.timeSpent / 1000)}s</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-title">Melhor Sequência</div>
            <div className="stat-value">{quizStats.streak}</div>
          </div>
          
          <div className="stat-card points-card">
            <div className="stat-icon">💎</div>
            <div className="stat-title">Pontos Meow</div>
            <div className="stat-value">{quizStats.pointsEarned}</div>
          </div>
        </div>

        {/* Breakdown de pontos */}
        {lastPointsBreakdown && (
          <div className="points-breakdown">
            <h3>📊 Breakdown de Pontos</h3>
            <div className="breakdown-grid">
              <div className="breakdown-item">
                <span>Respostas Corretas:</span>
                <span>+{lastPointsBreakdown.basePoints}</span>
              </div>
              <div className="breakdown-item">
                <span>Bônus de Velocidade:</span>
                <span>+{lastPointsBreakdown.speedBonus}</span>
              </div>
              <div className="breakdown-item">
                <span>Bônus de Precisão:</span>
                <span>+{lastPointsBreakdown.accuracyBonus}</span>
              </div>
              <div className="breakdown-item">
                <span>Bônus de Sequência:</span>
                <span>+{lastPointsBreakdown.streakBonus}</span>
              </div>
              <div className="breakdown-item total">
                <span>Multiplicador ({difficulty}):</span>
                <span>x{lastPointsBreakdown.difficultyMultiplier}</span>
              </div>
            </div>
          </div>
        )}

        {/* Performance */}
        <div className="performance-rating">
          <h3>🏆 Performance</h3>
          <div className="rating">
            {quizStats.correct >= 9 ? '🌟 Excelente!' :
             quizStats.correct >= 7 ? '👍 Muito Bom!' :
             quizStats.correct >= 5 ? '👌 Bom!' :
             '💪 Continue Praticando!'}
          </div>
        </div>

        {/* Ações */}
        <div className="results-actions">
          <button className="action-btn primary" onClick={resetQuiz}>
            🔄 Jogar Novamente
          </button>
          <button className="action-btn secondary" onClick={() => setDifficulty(
            difficulty === 'easy' ? 'medium' : 
            difficulty === 'medium' ? 'hard' : 'easy'
          )}>
            📈 Mudar Dificuldade
          </button>
        </div>
      </div>

      {/* Estilos CSS para resultados */}
      <style jsx>{`
        .quiz-results {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }

        .results-header h1 {
          font-size: 2.5rem;
          margin-bottom: 15px;
          background: linear-gradient(135deg, #9a45fc, #2ad6d0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .final-score {
          font-size: 2rem;
          font-weight: bold;
          color: #ffe118;
          margin-bottom: 30px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 25px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-3px);
          border-color: #9a45fc;
        }

        .points-card {
          border-color: #ffe118;
          background: rgba(255, 225, 24, 0.1);
        }

        .stat-icon {
          font-size: 2.5rem;
          margin-bottom: 10px;
        }

        .stat-title {
          color: #b0b0b0;
          font-size: 0.9rem;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: bold;
          color: #ffffff;
        }

        .points-breakdown {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 25px;
          margin-bottom: 30px;
          text-align: left;
        }

        .points-breakdown h3 {
          color: #ffe118;
          text-align: center;
          margin-bottom: 20px;
        }

        .breakdown-grid {
          display: grid;
          gap: 10px;
        }

        .breakdown-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .breakdown-item.total {
          border-top: 2px solid #ffe118;
          border-bottom: none;
          font-weight: bold;
          color: #ffe118;
          margin-top: 10px;
          padding-top: 15px;
        }

        .performance-rating {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 25px;
          margin-bottom: 30px;
        }

        .performance-rating h3 {
          color: #9a45fc;
          margin-bottom: 15px;
        }

        .rating {
          font-size: 1.5rem;
          font-weight: bold;
          color: #ffe118;
        }

        .results-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 12px 30px;
          border: none;
          border-radius: 25px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #9a45fc, #7c3aed);
          color: white;
          box-shadow: 0 4px 15px rgba(154, 69, 252, 0.3);
        }

        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .action-btn:hover {
          transform: translateY(-2px);
        }

        .action-btn.primary:hover {
          box-shadow: 0 6px 20px rgba(154, 69, 252, 0.4);
        }

        @media (max-width: 768px) {
          .quiz-results {
            padding: 25px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .results-actions {
            flex-direction: column;
            align-items: center;
          }

          .action-btn {
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>
    </div>
  );
};

export default CryptoQuiz;

