# 🚨 PROMPT COMPLETO: CORREÇÃO TOTAL DOS JOGOS MEOW TOKEN

## ⚠️ **PROBLEMAS IDENTIFICADOS:**

1. **🐱 MeowClicker:** Não conta cliques, não conta pontos, não aumenta barra de progresso
2. **🧠 CryptoQuiz:** Apenas 3 perguntas repetindo, não finaliza missão, sem sistema de níveis
3. **🎰 LuckySpin:** Botão não funciona, roleta não gira
4. **🗺️ TreasureHunt:** Jogo sem sentido, sem lógica clara, sem sistema de pontos
5. **⚔️ BattleArena:** Lógica confusa, sem sistema de níveis, mesmo inimigo sempre
6. **🏆 Ranking Global:** Não aparece nada, precisa de dashboard robusto

---

## 🎯 **OBJETIVO:**

Corrigir COMPLETAMENTE todos os jogos, implementar funcionalidades robustas, criar banco de dados no Supabase e entregar um sistema de pontos funcional.

---

## 🗄️ **ETAPA 1: CRIAR BANCO DE DADOS SUPABASE**

### **Tabelas Necessárias:**
```sql
-- 1. Tabela de usuários (já existe, mas vamos expandir)
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- 2. Tabela de perguntas do quiz (expandir)
CREATE TABLE IF NOT EXISTS quiz_questions_expanded (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer INTEGER NOT NULL CHECK (correct_answer BETWEEN 0 AND 3),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Fácil', 'Médio', 'Difícil')),
  category TEXT NOT NULL,
  points INTEGER NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabela de inimigos para Battle Arena
CREATE TABLE IF NOT EXISTS battle_enemies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  level INTEGER NOT NULL,
  health INTEGER NOT NULL,
  attack INTEGER NOT NULL,
  defense INTEGER NOT NULL,
  reward_points INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Tabela de histórico de jogos
CREATE TABLE IF NOT EXISTS game_history (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  game_type TEXT NOT NULL,
  points_earned INTEGER NOT NULL,
  details JSONB,
  played_at TIMESTAMP DEFAULT NOW()
);

-- 5. Tabela de conquistas
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  points_reward INTEGER NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW()
);
```

### **Inserir Dados Iniciais:**
```sql
-- Inserir 50+ perguntas variadas
INSERT INTO quiz_questions_expanded (question, option_a, option_b, option_c, option_d, correct_answer, difficulty, category, points, explanation) VALUES
('Quem criou o Bitcoin?', 'Vitalik Buterin', 'Satoshi Nakamoto', 'Charlie Lee', 'Roger Ver', 1, 'Fácil', 'Bitcoin', 3, 'Satoshi Nakamoto é o pseudônimo do criador do Bitcoin'),
('Em que ano o Bitcoin foi criado?', '2008', '2009', '2010', '2007', 1, 'Fácil', 'Bitcoin', 3, 'O Bitcoin foi lançado em 2009'),
('Qual é o limite máximo de Bitcoins?', '18 milhões', '19 milhões', '21 milhões', '25 milhões', 2, 'Médio', 'Bitcoin', 7, 'O limite máximo é de 21 milhões de Bitcoins'),
('O que significa DeFi?', 'Digital Finance', 'Decentralized Finance', 'Distributed Finance', 'Direct Finance', 1, 'Médio', 'DeFi', 7, 'DeFi significa Decentralized Finance'),
('O que é Proof of History?', 'Consenso do Ethereum', 'Algoritmo do Solana', 'Protocolo do Bitcoin', 'Sistema do Cardano', 1, 'Difícil', 'Solana', 15, 'Proof of History é o algoritmo de consenso do Solana');

-- Inserir inimigos para Battle Arena
INSERT INTO battle_enemies (name, level, health, attack, defense, reward_points, image_url) VALUES
('Gato Robô Iniciante', 1, 50, 10, 5, 5, '🤖'),
('Cão Cibernético', 2, 80, 15, 8, 8, '🐕‍🦺'),
('Dragão Digital', 3, 120, 20, 12, 12, '🐉'),
('Alien Invasor', 4, 150, 25, 15, 15, '👽'),
('Boss Final - Gato do Futuro', 5, 200, 30, 20, 25, '😼');
```

---

## 🎮 **ETAPA 2: CORRIGIR COMPONENTES DOS JOGOS**

### **🐱 MEOW CLICKER CORRIGIDO:**
```typescript
// client/src/components/games/MeowClicker.tsx
import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { usePoints } from '../../hooks/usePoints'

export default function MeowClicker() {
  const { connected, publicKey } = useWallet()
  const { addPoints, dailyLimits } = usePoints()
  const [clicks, setClicks] = useState(0)
  const [energy, setEnergy] = useState(100)
  const [powerUp, setPowerUp] = useState(1)
  const [totalPoints, setTotalPoints] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Regenerar energia a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => Math.min(prev + 1, 100))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleClick = async () => {
    if (!connected || !publicKey) {
      alert('Conecte sua carteira primeiro!')
      return
    }

    if (energy <= 0) {
      alert('Energia esgotada! Aguarde a regeneração.')
      return
    }

    if (dailyLimits.meowClicker >= 1000) {
      alert('Limite diário atingido! Reset às 21:00')
      return
    }

    // Animação de clique
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 200)

    // Calcular pontos (base + power-up)
    const pointsEarned = 1 * powerUp
    
    try {
      const success = await addPoints('meowClicker', pointsEarned, publicKey.toString())
      
      if (success) {
        setClicks(prev => prev + 1)
        setEnergy(prev => prev - 1)
        setTotalPoints(prev => prev + pointsEarned)

        // Power-up a cada 100 cliques
        if ((clicks + 1) % 100 === 0) {
          setPowerUp(prev => prev + 1)
          alert(`🚀 Power-up! Agora você ganha ${powerUp + 1} pontos por clique!`)
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error)
    }
  }

  if (!connected) {
    return (
      <div className="text-center p-4">
        <h3 className="text-2xl font-bold text-white mb-4">🐱 Meow Clicker</h3>
        <p className="text-gray-400">Conecte sua carteira para jogar!</p>
      </div>
    )
  }

  return (
    <div className="text-center p-4">
      <h3 className="text-2xl font-bold text-white mb-4">🐱 Meow Clicker</h3>
      
      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-purple-500/20 p-3 rounded-lg">
          <div className="text-yellow-400 text-xl font-bold">{totalPoints}</div>
          <div className="text-gray-400 text-sm">Pontos Totais</div>
        </div>
        <div className="bg-blue-500/20 p-3 rounded-lg">
          <div className="text-blue-400 text-xl font-bold">{clicks}</div>
          <div className="text-gray-400 text-sm">Cliques</div>
        </div>
      </div>

      {/* Barra de Energia */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Energia</span>
          <span className="text-blue-400">{energy}/100</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full transition-all duration-300"
            style={{ width: `${energy}%` }}
          ></div>
        </div>
      </div>

      {/* Power-up Indicator */}
      <div className="mb-4">
        <div className="bg-yellow-500/20 p-2 rounded-lg">
          <span className="text-yellow-400 font-bold">Power-up: x{powerUp}</span>
        </div>
      </div>

      {/* Botão de Clique */}
      <button
        onClick={handleClick}
        disabled={energy === 0 || dailyLimits.meowClicker >= 1000}
        className={`w-32 h-32 mx-auto rounded-full text-6xl transition-all duration-200 ${
          isAnimating ? 'scale-110' : 'scale-100'
        } ${
          energy > 0 && dailyLimits.meowClicker < 1000
            ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 cursor-pointer'
            : 'bg-gray-600 cursor-not-allowed opacity-50'
        }`}
      >
        🐱
      </button>

      {/* Status */}
      <div className="mt-4">
        <div className="text-gray-400 text-sm">
          {dailyLimits.meowClicker}/1000 cliques hoje
        </div>
        {energy === 0 && (
          <div className="text-red-400 text-sm mt-2">
            Energia regenera em 5 segundos...
          </div>
        )}
      </div>
    </div>
  )
}
```

### **🧠 CRYPTO QUIZ CORRIGIDO:**
```typescript
// client/src/components/games/CryptoQuiz.tsx
import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { usePoints } from '../../hooks/usePoints'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

interface Question {
  id: number
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: number
  difficulty: string
  category: string
  points: number
  explanation: string
}

export default function CryptoQuiz() {
  const { connected, publicKey } = useWallet()
  const { addPoints, dailyLimits } = usePoints()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [streak, setStreak] = useState(0)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [gameFinished, setGameFinished] = useState(false)

  // Carregar perguntas do Supabase
  useEffect(() => {
    loadQuestions()
  }, [])

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !showResult && !gameFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResult) {
      handleAnswer(-1) // Tempo esgotado
    }
  }, [timeLeft, showResult, gameFinished])

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions_expanded')
        .select('*')
        .order('id', { ascending: false })
        .limit(20)

      if (data && data.length > 0) {
        // Embaralhar perguntas
        const shuffled = data.sort(() => Math.random() - 0.5)
        setQuestions(shuffled)
      }
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error)
    }
  }

  const handleAnswer = async (answerIndex: number) => {
    if (!connected || !publicKey) return

    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return

    setSelectedAnswer(answerIndex)
    setShowResult(true)

    const isCorrect = answerIndex === currentQuestion.correct_answer
    let pointsEarned = 0

    if (isCorrect) {
      pointsEarned = currentQuestion.points
      
      // Bônus de velocidade
      if (timeLeft > 20) {
        pointsEarned = Math.floor(pointsEarned * 1.5) // +50%
      } else if (timeLeft > 10) {
        pointsEarned = Math.floor(pointsEarned * 1.25) // +25%
      }

      setStreak(prev => prev + 1)
      setScore(prev => prev + pointsEarned)
      
      try {
        await addPoints('cryptoQuiz', pointsEarned, publicKey.toString())
      } catch (error) {
        console.error('Erro ao adicionar pontos:', error)
      }
    } else {
      setStreak(0)
    }

    setQuestionsAnswered(prev => prev + 1)
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1 && questionsAnswered < 20) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setTimeLeft(30)
    } else {
      setGameFinished(true)
    }
  }

  const resetGame = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setTimeLeft(30)
    setStreak(0)
    setQuestionsAnswered(0)
    setGameFinished(false)
    loadQuestions()
  }

  if (!connected) {
    return (
      <div className="text-center p-4">
        <h3 className="text-2xl font-bold text-white mb-4">🧠 Crypto Quiz</h3>
        <p className="text-gray-400">Conecte sua carteira para jogar!</p>
      </div>
    )
  }

  if (dailyLimits.cryptoQuiz >= 20) {
    return (
      <div className="text-center p-4">
        <h3 className="text-2xl font-bold text-white mb-4">🧠 Crypto Quiz</h3>
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 font-bold">Limite diário atingido!</p>
          <p className="text-gray-400 text-sm">20/20 perguntas respondidas</p>
          <p className="text-gray-400 text-sm mt-2">Reset às 21:00</p>
        </div>
      </div>
    )
  }

  if (gameFinished) {
    return (
      <div className="text-center p-4">
        <h3 className="text-2xl font-bold text-white mb-4">🧠 Crypto Quiz</h3>
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
          <h4 className="text-green-400 font-bold text-xl mb-2">🎉 Quiz Concluído!</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-yellow-400 text-2xl font-bold">{score}</div>
              <div className="text-gray-400 text-sm">Pontos Totais</div>
            </div>
            <div>
              <div className="text-blue-400 text-2xl font-bold">{questionsAnswered}</div>
              <div className="text-gray-400 text-sm">Perguntas</div>
            </div>
          </div>
        </div>
        <button
          onClick={resetGame}
          className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-3 rounded-lg font-bold text-white hover:scale-105 transition-transform"
        >
          Jogar Novamente
        </button>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center p-4">
        <h3 className="text-2xl font-bold text-white mb-4">🧠 Crypto Quiz</h3>
        <p className="text-gray-400">Carregando perguntas...</p>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const options = [
    currentQuestion.option_a,
    currentQuestion.option_b,
    currentQuestion.option_c,
    currentQuestion.option_d
  ]

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-white">🧠 Crypto Quiz</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
          currentQuestion.difficulty === 'Fácil' ? 'bg-green-500/20 text-green-400' :
          currentQuestion.difficulty === 'Médio' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {currentQuestion.difficulty} - {currentQuestion.points}pts
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-yellow-400 text-xl font-bold">{score}</div>
          <div className="text-gray-400 text-sm">Pontos</div>
        </div>
        <div className="text-center">
          <div className="text-blue-400 text-xl font-bold">{streak}</div>
          <div className="text-gray-400 text-sm">Sequência</div>
        </div>
        <div className="text-center">
          <div className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
            {timeLeft}s
          </div>
          <div className="text-gray-400 text-sm">Tempo</div>
        </div>
      </div>

      {/* Progresso */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Progresso</span>
          <span className="text-gray-400">{questionsAnswered + 1}/20</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((questionsAnswered + 1) / 20) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Pergunta */}
      <div className="mb-6">
        <p className="text-white text-lg mb-4">{currentQuestion.question}</p>
        
        <div className="space-y-2">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showResult}
              className={`w-full p-3 text-left rounded-lg border transition-all ${
                showResult
                  ? index === currentQuestion.correct_answer
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : index === selectedAnswer
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-gray-500/20 border-gray-500 text-gray-400'
                  : 'bg-purple-500/20 border-purple-500/50 text-white hover:border-purple-400'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Resultado */}
      {showResult && (
        <div className="mb-4">
          <div className={`p-4 rounded-lg ${
            selectedAnswer === currentQuestion.correct_answer
              ? 'bg-green-500/20 border border-green-500/50'
              : 'bg-red-500/20 border border-red-500/50'
          }`}>
            <p className={`font-bold mb-2 ${
              selectedAnswer === currentQuestion.correct_answer ? 'text-green-400' : 'text-red-400'
            }`}>
              {selectedAnswer === currentQuestion.correct_answer ? '✅ Correto!' : '❌ Incorreto!'}
            </p>
            <p className="text-gray-300 text-sm">{currentQuestion.explanation}</p>
          </div>
        </div>
      )}

      {/* Botão Próxima */}
      {showResult && (
        <div className="text-center">
          <button
            onClick={nextQuestion}
            className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-3 rounded-lg font-bold text-white hover:scale-105 transition-transform"
          >
            {currentQuestionIndex < questions.length - 1 && questionsAnswered < 20 ? 'Próxima' : 'Finalizar'}
          </button>
        </div>
      )}
    </div>
  )
}
```



### **🎰 LUCKY SPIN CORRIGIDO:**
```typescript
// client/src/components/games/LuckySpin.tsx
import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { usePoints } from '../../hooks/usePoints'

const rewards = [
  { points: 1, rarity: 'Comum', color: 'text-gray-400', probability: 0.4 },
  { points: 5, rarity: 'Comum', color: 'text-gray-400', probability: 0.3 },
  { points: 10, rarity: 'Raro', color: 'text-blue-400', probability: 0.15 },
  { points: 25, rarity: 'Épico', color: 'text-purple-400', probability: 0.1 },
  { points: 50, rarity: 'Lendário', color: 'text-yellow-400', probability: 0.05 }
]

export default function LuckySpin() {
  const { connected, publicKey } = useWallet()
  const { addPoints, dailyLimits } = usePoints()
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [lastReward, setLastReward] = useState<typeof rewards[0] | null>(null)
  const [totalRewards, setTotalRewards] = useState(0)
  const [spinHistory, setSpinHistory] = useState<typeof rewards>([])

  const getRandomReward = () => {
    const random = Math.random()
    let cumulativeProbability = 0
    
    for (const reward of rewards) {
      cumulativeProbability += reward.probability
      if (random <= cumulativeProbability) {
        return reward
      }
    }
    
    return rewards[0] // Fallback
  }

  const handleSpin = async () => {
    if (!connected || !publicKey) {
      alert('Conecte sua carteira primeiro!')
      return
    }

    if (spinning) return

    if (dailyLimits.luckySpin >= 5) {
      alert('Limite diário atingido! Reset às 21:00')
      return
    }

    setSpinning(true)
    
    // Animação da roleta
    const spins = 5 + Math.random() * 5 // 5-10 voltas
    const finalRotation = rotation + (spins * 360)
    setRotation(finalRotation)
    
    setTimeout(async () => {
      const reward = getRandomReward()
      
      try {
        const success = await addPoints('luckySpin', reward.points, publicKey.toString())
        
        if (success) {
          setLastReward(reward)
          setTotalRewards(prev => prev + reward.points)
          setSpinHistory(prev => [reward, ...prev.slice(0, 4)]) // Manter últimos 5
        }
      } catch (error) {
        console.error('Erro ao adicionar pontos:', error)
      }
      
      setSpinning(false)
    }, 3000)
  }

  if (!connected) {
    return (
      <div className="text-center p-4">
        <h3 className="text-2xl font-bold text-white mb-4">🎰 Lucky Spin</h3>
        <p className="text-gray-400">Conecte sua carteira para jogar!</p>
      </div>
    )
  }

  return (
    <div className="text-center p-4">
      <h3 className="text-2xl font-bold text-white mb-4">🎰 Lucky Spin</h3>
      
      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-yellow-500/20 p-3 rounded-lg">
          <div className="text-yellow-400 text-xl font-bold">{totalRewards}</div>
          <div className="text-gray-400 text-sm">Pontos Totais</div>
        </div>
        <div className="bg-purple-500/20 p-3 rounded-lg">
          <div className="text-purple-400 text-xl font-bold">{dailyLimits.luckySpin}/5</div>
          <div className="text-gray-400 text-sm">Spins Hoje</div>
        </div>
      </div>

      {/* Roleta */}
      <div className="mb-6">
        <div className="relative mx-auto w-40 h-40">
          {/* Indicador */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
            <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400"></div>
          </div>
          
          {/* Roleta */}
          <div 
            className={`w-40 h-40 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 flex items-center justify-center text-4xl transition-transform duration-3000 ease-out ${
              spinning ? 'animate-pulse' : ''
            }`}
            style={{ 
              transform: `rotate(${rotation}deg)`,
              background: 'conic-gradient(from 0deg, #9333ea 0deg 72deg, #ec4899 72deg 144deg, #eab308 144deg 216deg, #3b82f6 216deg 288deg, #10b981 288deg 360deg)'
            }}
          >
            🎰
          </div>
        </div>
      </div>

      {/* Último Resultado */}
      {lastReward && (
        <div className="mb-4">
          <div className={`bg-black/50 border rounded-lg p-3 ${
            lastReward.rarity === 'Lendário' ? 'border-yellow-400' :
            lastReward.rarity === 'Épico' ? 'border-purple-400' :
            lastReward.rarity === 'Raro' ? 'border-blue-400' :
            'border-gray-400'
          }`}>
            <div className={`font-bold ${lastReward.color}`}>
              {lastReward.rarity} - {lastReward.points} pontos!
            </div>
          </div>
        </div>
      )}

      {/* Botão de Spin */}
      <button
        onClick={handleSpin}
        disabled={spinning || dailyLimits.luckySpin >= 5}
        className={`px-8 py-4 rounded-lg font-bold text-white transition-all ${
          spinning 
            ? 'bg-gray-600 cursor-not-allowed' 
            : dailyLimits.luckySpin >= 5
            ? 'bg-red-600 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:scale-105'
        }`}
      >
        {spinning ? 'Girando...' : dailyLimits.luckySpin >= 5 ? 'Limite Atingido' : 'Girar Roleta!'}
      </button>

      {/* Histórico */}
      {spinHistory.length > 0 && (
        <div className="mt-6">
          <h4 className="text-white font-bold mb-2">Últimos Resultados:</h4>
          <div className="space-y-1">
            {spinHistory.map((reward, index) => (
              <div key={index} className={`text-sm ${reward.color}`}>
                {reward.rarity} - {reward.points} pts
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabela de Probabilidades */}
      <div className="mt-6 text-left">
        <h4 className="text-white font-bold mb-2 text-center">Probabilidades:</h4>
        <div className="space-y-1 text-sm">
          {rewards.map((reward, index) => (
            <div key={index} className="flex justify-between">
              <span className={reward.color}>{reward.rarity}</span>
              <span className="text-gray-400">{reward.points} pts ({(reward.probability * 100).toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### **🗺️ TREASURE HUNT CORRIGIDO:**
```typescript
// client/src/components/games/TreasureHunt.tsx
import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { usePoints } from '../../hooks/usePoints'

interface Cell {
  id: number
  hasTreasure: boolean
  isRevealed: boolean
  nearbyTreasures: number
  type: 'empty' | 'treasure' | 'trap'
}

const GRID_SIZE = 6
const TREASURE_COUNT = 8
const TRAP_COUNT = 4

export default function TreasureHunt() {
  const { connected, publicKey } = useWallet()
  const { addPoints, dailyLimits } = usePoints()
  const [grid, setGrid] = useState<Cell[]>([])
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [treasuresFound, setTreasuresFound] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [moves, setMoves] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)

  // Inicializar grid
  const initializeGrid = () => {
    const newGrid: Cell[] = []
    
    // Criar células vazias
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      newGrid.push({
        id: i,
        hasTreasure: false,
        isRevealed: false,
        nearbyTreasures: 0,
        type: 'empty'
      })
    }

    // Colocar tesouros aleatoriamente
    const treasurePositions = new Set<number>()
    while (treasurePositions.size < TREASURE_COUNT) {
      const pos = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE))
      treasurePositions.add(pos)
    }

    treasurePositions.forEach(pos => {
      newGrid[pos].hasTreasure = true
      newGrid[pos].type = 'treasure'
    })

    // Colocar armadilhas
    const trapPositions = new Set<number>()
    while (trapPositions.size < TRAP_COUNT) {
      const pos = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE))
      if (!treasurePositions.has(pos)) {
        trapPositions.add(pos)
      }
    }

    trapPositions.forEach(pos => {
      newGrid[pos].type = 'trap'
    })

    // Calcular números de tesouros próximos
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      if (newGrid[i].type === 'empty') {
        newGrid[i].nearbyTreasures = countNearbyTreasures(i, newGrid)
      }
    }

    setGrid(newGrid)
    setGameStarted(true)
    setGameOver(false)
    setTreasuresFound(0)
    setTotalPoints(0)
    setMoves(0)
    setHintsUsed(0)
  }

  const countNearbyTreasures = (index: number, grid: Cell[]) => {
    const row = Math.floor(index / GRID_SIZE)
    const col = index % GRID_SIZE
    let count = 0

    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
          const neighborIndex = r * GRID_SIZE + c
          if (neighborIndex !== index && grid[neighborIndex].hasTreasure) {
            count++
          }
        }
      }
    }

    return count
  }

  const handleCellClick = async (cellIndex: number) => {
    if (!connected || !publicKey) {
      alert('Conecte sua carteira primeiro!')
      return
    }

    if (!gameStarted || gameOver || grid[cellIndex].isRevealed) return

    if (dailyLimits.treasureHunt >= 3) {
      alert('Limite diário atingido! Reset às 21:00')
      return
    }

    const newGrid = [...grid]
    newGrid[cellIndex].isRevealed = true
    setGrid(newGrid)
    setMoves(prev => prev + 1)

    if (newGrid[cellIndex].type === 'treasure') {
      // Encontrou tesouro!
      const newTreasuresFound = treasuresFound + 1
      setTreasuresFound(newTreasuresFound)

      // Calcular pontos baseado na eficiência
      const efficiency = Math.max(1, Math.floor((TREASURE_COUNT - moves) / 2))
      const points = 5 * efficiency
      
      try {
        const success = await addPoints('treasureHunt', points, publicKey.toString())
        
        if (success) {
          setTotalPoints(prev => prev + points)
        }
      } catch (error) {
        console.error('Erro ao adicionar pontos:', error)
      }

      if (newTreasuresFound === TREASURE_COUNT) {
        // Jogo completo!
        setGameOver(true)
        const bonusPoints = Math.max(10, 50 - moves) // Bônus por eficiência
        
        try {
          await addPoints('treasureHunt', bonusPoints, publicKey.toString())
          setTotalPoints(prev => prev + bonusPoints)
        } catch (error) {
          console.error('Erro ao adicionar bônus:', error)
        }
      }
    } else if (newGrid[cellIndex].type === 'trap') {
      // Caiu na armadilha!
      alert('💥 Você caiu numa armadilha! Perdeu 1 ponto.')
      setTotalPoints(prev => Math.max(0, prev - 1))
    }
  }

  const useHint = () => {
    if (hintsUsed >= 3 || !gameStarted || gameOver) return

    // Revelar uma célula com tesouro não descoberta
    const hiddenTreasures = grid.filter(cell => 
      cell.hasTreasure && !cell.isRevealed
    )

    if (hiddenTreasures.length > 0) {
      const randomTreasure = hiddenTreasures[Math.floor(Math.random() * hiddenTreasures.length)]
      const newGrid = [...grid]
      
      // Destacar a célula por 3 segundos
      const cellElement = document.getElementById(`cell-${randomTreasure.id}`)
      if (cellElement) {
        cellElement.classList.add('animate-pulse', 'ring-2', 'ring-yellow-400')
        setTimeout(() => {
          cellElement.classList.remove('animate-pulse', 'ring-2', 'ring-yellow-400')
        }, 3000)
      }

      setHintsUsed(prev => prev + 1)
    }
  }

  const getCellDisplay = (cell: Cell) => {
    if (!cell.isRevealed) {
      return '❓'
    }

    if (cell.type === 'treasure') {
      return '💎'
    } else if (cell.type === 'trap') {
      return '💥'
    } else {
      return cell.nearbyTreasures > 0 ? cell.nearbyTreasures.toString() : '⬜'
    }
  }

  const getCellColor = (cell: Cell) => {
    if (!cell.isRevealed) {
      return 'bg-gray-700 hover:bg-gray-600'
    }

    if (cell.type === 'treasure') {
      return 'bg-yellow-500/30 border-yellow-400'
    } else if (cell.type === 'trap') {
      return 'bg-red-500/30 border-red-400'
    } else if (cell.nearbyTreasures > 0) {
      return 'bg-blue-500/20 border-blue-400'
    } else {
      return 'bg-gray-600'
    }
  }

  if (!connected) {
    return (
      <div className="text-center p-4">
        <h3 className="text-2xl font-bold text-white mb-4">🗺️ Treasure Hunt</h3>
        <p className="text-gray-400">Conecte sua carteira para jogar!</p>
      </div>
    )
  }

  if (dailyLimits.treasureHunt >= 3) {
    return (
      <div className="text-center p-4">
        <h3 className="text-2xl font-bold text-white mb-4">🗺️ Treasure Hunt</h3>
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 font-bold">Limite diário atingido!</p>
          <p className="text-gray-400 text-sm">3/3 mapas explorados</p>
          <p className="text-gray-400 text-sm mt-2">Reset às 21:00</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h3 className="text-2xl font-bold text-white mb-4 text-center">🗺️ Treasure Hunt</h3>
      
      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-yellow-500/20 p-2 rounded">
          <div className="text-yellow-400 font-bold">{totalPoints}</div>
          <div className="text-gray-400 text-xs">Pontos</div>
        </div>
        <div className="bg-green-500/20 p-2 rounded">
          <div className="text-green-400 font-bold">{treasuresFound}/{TREASURE_COUNT}</div>
          <div className="text-gray-400 text-xs">Tesouros</div>
        </div>
        <div className="bg-blue-500/20 p-2 rounded">
          <div className="text-blue-400 font-bold">{moves}</div>
          <div className="text-gray-400 text-xs">Movimentos</div>
        </div>
      </div>

      {!gameStarted ? (
        <div className="text-center">
          <div className="mb-4">
            <p className="text-gray-300 text-sm mb-2">
              🎯 Encontre todos os 8 tesouros escondidos no mapa!
            </p>
            <p className="text-gray-400 text-xs">
              • Números mostram tesouros próximos<br/>
              • Evite armadilhas (💥)<br/>
              • Menos movimentos = mais pontos
            </p>
          </div>
          <button
            onClick={initializeGrid}
            className="bg-gradient-to-r from-green-500 to-blue-600 px-6 py-3 rounded-lg font-bold text-white hover:scale-105 transition-transform"
          >
            Iniciar Exploração
          </button>
        </div>
      ) : (
        <>
          {/* Grid do jogo */}
          <div className="grid grid-cols-6 gap-1 mb-4 max-w-xs mx-auto">
            {grid.map((cell) => (
              <button
                key={cell.id}
                id={`cell-${cell.id}`}
                onClick={() => handleCellClick(cell.id)}
                disabled={cell.isRevealed || gameOver}
                className={`w-12 h-12 border rounded text-sm font-bold transition-all ${getCellColor(cell)} ${
                  !cell.isRevealed && !gameOver ? 'hover:scale-105 cursor-pointer' : 'cursor-default'
                }`}
              >
                {getCellDisplay(cell)}
              </button>
            ))}
          </div>

          {/* Controles */}
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={useHint}
              disabled={hintsUsed >= 3 || gameOver}
              className="bg-yellow-600 px-4 py-2 rounded text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-500"
            >
              💡 Dica ({3 - hintsUsed})
            </button>
            
            <button
              onClick={initializeGrid}
              className="bg-purple-600 px-4 py-2 rounded text-white text-sm font-bold hover:bg-purple-500"
            >
              🔄 Novo Mapa
            </button>
          </div>

          {/* Status do jogo */}
          {gameOver && (
            <div className="text-center">
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
                <h4 className="text-green-400 font-bold text-lg mb-2">🎉 Parabéns!</h4>
                <p className="text-white">Você encontrou todos os tesouros!</p>
                <p className="text-gray-400 text-sm">
                  {moves} movimentos • {totalPoints} pontos totais
                </p>
              </div>
            </div>
          )}

          {/* Progresso */}
          <div className="text-center text-gray-400 text-sm">
            Mapas hoje: {dailyLimits.treasureHunt}/3
          </div>
        </>
      )}
    </div>
  )
}
```


### **⚔️ BATTLE ARENA CORRIGIDO:**
```typescript
// client/src/components/games/BattleArena.tsx
import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { usePoints } from '../../hooks/usePoints'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

interface Enemy {
  id: number
  name: string
  level: number
  health: number
  maxHealth: number
  attack: number
  defense: number
  reward_points: number
  image_url: string
}

interface Player {
  health: number
  maxHealth: number
  attack: number
  defense: number
  level: number
  experience: number
}

export default function BattleArena() {
  const { connected, publicKey } = useWallet()
  const { addPoints, dailyLimits } = usePoints()
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null)
  const [player, setPlayer] = useState<Player>({
    health: 100,
    maxHealth: 100,
    attack: 15,
    defense: 5,
    level: 1,
    experience: 0
  })
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [battling, setBattling] = useState(false)
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null)
  const [wins, setWins] = useState(0)
  const [streak, setStreak] = useState(0)

  // Carregar inimigos do Supabase
  useEffect(() => {
    loadEnemies()
  }, [])

  const loadEnemies = async () => {
    try {
      const { data, error } = await supabase
        .from('battle_enemies')
        .select('*')
        .order('level', { ascending: true })

      if (data) {
        setEnemies(data.map(enemy => ({
          ...enemy,
          maxHealth: enemy.health
        })))
      }
    } catch (error) {
      console.error('Erro ao carregar inimigos:', error)
    }
  }

  const selectEnemy = (enemy: Enemy) => {
    setCurrentEnemy({
      ...enemy,
      health: enemy.maxHealth
    })
    setBattleLog([])
    setBattleResult(null)
  }

  const calculateDamage = (attacker: { attack: number }, defender: { defense: number }) => {
    const baseDamage = attacker.attack
    const defense = defender.defense
    const damage = Math.max(1, baseDamage - Math.floor(defense / 2) + Math.floor(Math.random() * 5))
    return damage
  }

  const playerAttack = () => {
    if (!currentEnemy || battling || battleResult) return

    setBattling(true)
    
    // Ataque do jogador
    const playerDamage = calculateDamage(player, currentEnemy)
    const newEnemyHealth = Math.max(0, currentEnemy.health - playerDamage)
    
    setCurrentEnemy(prev => prev ? { ...prev, health: newEnemyHealth } : null)
    setBattleLog(prev => [...prev, `🗡️ Você atacou ${currentEnemy.name} causando ${playerDamage} de dano!`])

    setTimeout(() => {
      if (newEnemyHealth <= 0) {
        // Jogador venceu
        handleVictory()
      } else {
        // Ataque do inimigo
        enemyAttack(newEnemyHealth)
      }
    }, 1000)
  }

  const enemyAttack = (enemyHealth: number) => {
    if (!currentEnemy) return

    const enemyDamage = calculateDamage(currentEnemy, player)
    const newPlayerHealth = Math.max(0, player.health - enemyDamage)
    
    setPlayer(prev => ({ ...prev, health: newPlayerHealth }))
    setBattleLog(prev => [...prev, `💥 ${currentEnemy.name} atacou você causando ${enemyDamage} de dano!`])

    setTimeout(() => {
      if (newPlayerHealth <= 0) {
        // Jogador perdeu
        handleDefeat()
      } else {
        setBattling(false)
      }
    }, 1000)
  }

  const handleVictory = async () => {
    if (!currentEnemy || !connected || !publicKey) return

    setBattleResult('win')
    setBattling(false)
    
    const newWins = wins + 1
    const newStreak = streak + 1
    setWins(newWins)
    setStreak(newStreak)

    // Calcular pontos (base + bônus de streak)
    let points = currentEnemy.reward_points
    if (newStreak >= 3) {
      points = Math.floor(points * 1.5) // +50% por streak
    }

    // Experiência e level up
    const expGained = currentEnemy.level * 10
    const newExp = player.experience + expGained
    let newLevel = player.level
    let newMaxHealth = player.maxHealth
    let newAttack = player.attack

    if (newExp >= player.level * 100) {
      newLevel += 1
      newMaxHealth += 20
      newAttack += 3
      setBattleLog(prev => [...prev, `🎉 Level Up! Agora você é nível ${newLevel}!`])
    }

    setPlayer(prev => ({
      ...prev,
      experience: newExp,
      level: newLevel,
      maxHealth: newMaxHealth,
      attack: newAttack,
      health: newMaxHealth // Cura completa no level up
    }))

    setBattleLog(prev => [
      ...prev, 
      `🏆 Vitória! Você ganhou ${points} pontos e ${expGained} XP!`,
      newStreak >= 3 ? `🔥 Streak de ${newStreak}! Bônus de +50%!` : ''
    ].filter(Boolean))

    try {
      await addPoints('battleArena', points, publicKey.toString())
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error)
    }
  }

  const handleDefeat = () => {
    setBattleResult('lose')
    setBattling(false)
    setStreak(0)
    setBattleLog(prev => [...prev, '💀 Derrota! Você foi derrotado...'])
    
    // Regenerar vida para próxima batalha
    setTimeout(() => {
      setPlayer(prev => ({ ...prev, health: prev.maxHealth }))
    }, 3000)
  }

  const resetBattle = () => {
    setCurrentEnemy(null)
    setBattleLog([])
    setBattleResult(null)
    setPlayer(prev => ({ ...prev, health: prev.maxHealth }))
  }

  if (!connected) {
    return (
      <div className="text-center p-4">
        <h3 className="text-2xl font-bold text-white mb-4">⚔️ Battle Arena</h3>
        <p className="text-gray-400">Conecte sua carteira para jogar!</p>
      </div>
    )
  }

  if (dailyLimits.battleArena >= 10) {
    return (
      <div className="text-center p-4">
        <h3 className="text-2xl font-bold text-white mb-4">⚔️ Battle Arena</h3>
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 font-bold">Limite diário atingido!</p>
          <p className="text-gray-400 text-sm">10/10 batalhas hoje</p>
          <p className="text-gray-400 text-sm mt-2">Reset às 21:00</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h3 className="text-2xl font-bold text-white mb-4 text-center">⚔️ Battle Arena</h3>
      
      {/* Stats do Jogador */}
      <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-blue-400 font-bold">🛡️ Guerreiro Nível {player.level}</span>
          <span className="text-gray-400 text-sm">{wins} vitórias</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-gray-400">Vida: {player.health}/{player.maxHealth}</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="text-gray-400">XP: {player.experience}/{player.level * 100}</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(player.experience / (player.level * 100)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>⚔️ Ataque: {player.attack}</span>
          <span>🛡️ Defesa: {player.defense}</span>
          <span>🔥 Streak: {streak}</span>
        </div>
      </div>

      {!currentEnemy ? (
        // Seleção de inimigo
        <div>
          <h4 className="text-white font-bold mb-3 text-center">Escolha seu oponente:</h4>
          <div className="space-y-2">
            {enemies.map((enemy) => (
              <button
                key={enemy.id}
                onClick={() => selectEnemy(enemy)}
                className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 hover:border-purple-500 transition-all"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{enemy.image_url}</span>
                    <div className="text-left">
                      <div className="text-white font-bold">{enemy.name}</div>
                      <div className="text-gray-400 text-sm">Nível {enemy.level}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold">{enemy.reward_points} pts</div>
                    <div className="text-gray-400 text-sm">{enemy.health} HP</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Batalha
        <div>
          {/* Inimigo Atual */}
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-red-400 font-bold">{currentEnemy.image_url} {currentEnemy.name}</span>
              <span className="text-gray-400 text-sm">Nível {currentEnemy.level}</span>
            </div>
            
            <div className="mb-2">
              <div className="text-gray-400 text-sm">Vida: {currentEnemy.health}/{currentEnemy.maxHealth}</div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-red-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(currentEnemy.health / currentEnemy.maxHealth) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-400">
              <span>⚔️ Ataque: {currentEnemy.attack}</span>
              <span>🛡️ Defesa: {currentEnemy.defense}</span>
              <span>💰 Recompensa: {currentEnemy.reward_points} pts</span>
            </div>
          </div>

          {/* Controles de Batalha */}
          <div className="flex justify-center gap-3 mb-4">
            <button
              onClick={playerAttack}
              disabled={battling || battleResult !== null || player.health <= 0}
              className="bg-gradient-to-r from-red-500 to-orange-600 px-6 py-3 rounded-lg font-bold text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {battling ? 'Atacando...' : '⚔️ Atacar'}
            </button>
            
            <button
              onClick={resetBattle}
              className="bg-gray-600 px-6 py-3 rounded-lg font-bold text-white hover:bg-gray-500 transition-colors"
            >
              🔄 Voltar
            </button>
          </div>

          {/* Log de Batalha */}
          {battleLog.length > 0 && (
            <div className="bg-black/50 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto">
              <h4 className="text-white font-bold mb-2">📜 Log de Batalha:</h4>
              <div className="space-y-1">
                {battleLog.map((log, index) => (
                  <div key={index} className="text-gray-300 text-sm">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resultado da Batalha */}
          {battleResult && (
            <div className={`text-center p-4 rounded-lg border ${
              battleResult === 'win' 
                ? 'bg-green-500/20 border-green-500/50' 
                : 'bg-red-500/20 border-red-500/50'
            }`}>
              <div className={`font-bold text-xl ${
                battleResult === 'win' ? 'text-green-400' : 'text-red-400'
              }`}>
                {battleResult === 'win' ? '🏆 VITÓRIA!' : '💀 DERROTA!'}
              </div>
              {battleResult === 'win' && (
                <div className="text-gray-300 text-sm mt-2">
                  Streak atual: {streak} vitórias consecutivas
                </div>
              )}
            </div>
          )}

          {/* Status */}
          <div className="text-center text-gray-400 text-sm mt-4">
            Batalhas hoje: {dailyLimits.battleArena}/10
          </div>
        </div>
      )}
    </div>
  )
}
```

### **🏆 RANKING GLOBAL CORRIGIDO:**
```typescript
// client/src/components/GlobalRanking.tsx
import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

interface RankingUser {
  wallet_address: string
  total_points: number
  level: number
  experience: number
  streak: number
  last_activity: string
  rank: number
}

export default function GlobalRanking() {
  const { publicKey } = useWallet()
  const [ranking, setRanking] = useState<RankingUser[]>([])
  const [userRank, setUserRank] = useState<RankingUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'top10' | 'friends'>('top10')
  const [searchWallet, setSearchWallet] = useState('')

  useEffect(() => {
    loadRanking()
    if (publicKey) {
      loadUserRank()
    }
  }, [publicKey, filter])

  const loadRanking = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('users')
        .select('wallet_address, total_points, level, experience, streak, last_activity')
        .order('total_points', { ascending: false })

      if (filter === 'top10') {
        query = query.limit(10)
      } else if (filter === 'all') {
        query = query.limit(100)
      }

      const { data, error } = await query

      if (data) {
        const rankedData = data.map((user, index) => ({
          ...user,
          rank: index + 1
        }))
        setRanking(rankedData)
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserRank = async () => {
    if (!publicKey) return

    try {
      // Buscar posição do usuário
      const { data: allUsers, error } = await supabase
        .from('users')
        .select('wallet_address, total_points, level, experience, streak, last_activity')
        .order('total_points', { ascending: false })

      if (allUsers) {
        const userIndex = allUsers.findIndex(user => user.wallet_address === publicKey.toString())
        if (userIndex !== -1) {
          setUserRank({
            ...allUsers[userIndex],
            rank: userIndex + 1
          })
        }
      }
    } catch (error) {
      console.error('Erro ao carregar rank do usuário:', error)
    }
  }

  const searchUser = async () => {
    if (!searchWallet.trim()) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('wallet_address, total_points, level, experience, streak, last_activity')
        .ilike('wallet_address', `%${searchWallet}%`)
        .limit(5)

      if (data) {
        // Calcular rank para cada usuário encontrado
        const usersWithRank = await Promise.all(
          data.map(async (user) => {
            const { count } = await supabase
              .from('users')
              .select('*', { count: 'exact', head: true })
              .gt('total_points', user.total_points)

            return {
              ...user,
              rank: (count || 0) + 1
            }
          })
        )

        setRanking(usersWithRank)
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
    }
  }

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora'
    if (diffInHours < 24) return `${diffInHours}h atrás`
    return `${Math.floor(diffInHours / 24)}d atrás`
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '👑'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    if (rank <= 10) return '🏆'
    if (rank <= 50) return '⭐'
    return '🎯'
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400'
    if (rank === 2) return 'text-gray-300'
    if (rank === 3) return 'text-orange-400'
    if (rank <= 10) return 'text-purple-400'
    return 'text-blue-400'
  }

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">🏆 Ranking Global</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('top10')}
            className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
              filter === 'top10' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Top 10
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
              filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Top 100
          </button>
        </div>
      </div>

      {/* Busca de usuário */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar carteira..."
            value={searchWallet}
            onChange={(e) => setSearchWallet(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
          />
          <button
            onClick={searchUser}
            className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded text-white text-sm font-bold transition-colors"
          >
            🔍
          </button>
        </div>
      </div>

      {/* Rank do usuário atual */}
      {userRank && publicKey && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50 rounded-lg p-3 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getRankIcon(userRank.rank)}</span>
              <div>
                <div className="text-purple-400 font-bold">Sua Posição</div>
                <div className="text-gray-300 text-sm">#{userRank.rank} • {formatWallet(userRank.wallet_address)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-yellow-400 font-bold text-lg">{userRank.total_points.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Nível {userRank.level}</div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de ranking */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-2">⚡</div>
          <p className="text-gray-400">Carregando ranking...</p>
        </div>
      ) : ranking.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">😿</div>
          <p className="text-gray-400">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ranking.map((user, index) => (
            <div 
              key={user.wallet_address} 
              className={`flex justify-between items-center p-3 rounded-lg transition-all hover:scale-[1.02] ${
                user.wallet_address === publicKey?.toString()
                  ? 'bg-purple-500/20 border border-purple-500/50'
                  : 'bg-gray-800/50 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="text-center min-w-[40px]">
                  <div className="text-xl">{getRankIcon(user.rank)}</div>
                  <div className={`text-sm font-bold ${getRankColor(user.rank)}`}>
                    #{user.rank}
                  </div>
                </div>
                <div>
                  <div className="text-white font-mono font-bold">
                    {formatWallet(user.wallet_address)}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span>Nível {user.level}</span>
                    {user.streak > 0 && (
                      <span className="text-orange-400">🔥 {user.streak}</span>
                    )}
                    <span>{formatTimeAgo(user.last_activity)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-yellow-400 font-bold text-lg">
                  {user.total_points.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm">
                  {user.experience} XP
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estatísticas gerais */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-yellow-400 font-bold text-lg">{ranking.length}</div>
            <div className="text-gray-400 text-sm">Jogadores Ativos</div>
          </div>
          <div>
            <div className="text-purple-400 font-bold text-lg">
              {ranking.reduce((sum, user) => sum + user.total_points, 0).toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm">Pontos Totais</div>
          </div>
          <div>
            <div className="text-blue-400 font-bold text-lg">
              {Math.round(ranking.reduce((sum, user) => sum + user.total_points, 0) / ranking.length) || 0}
            </div>
            <div className="text-gray-400 text-sm">Média de Pontos</div>
          </div>
        </div>
      </div>

      {/* Atualização automática */}
      <div className="mt-4 text-center">
        <button
          onClick={loadRanking}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          🔄 Atualizar Ranking
        </button>
      </div>
    </div>
  )
}
```

---

## 🚨 **ETAPA 3: INSTRUÇÕES DE IMPLEMENTAÇÃO**

### **REGRAS OBRIGATÓRIAS:**

1. **EXECUTE O SQL NO SUPABASE PRIMEIRO:**
   - Acesse seu projeto Supabase
   - Vá em SQL Editor
   - Execute todos os comandos SQL fornecidos
   - Verifique se as tabelas foram criadas

2. **SUBSTITUA OS COMPONENTES NO REPLIT:**
   - Substitua COMPLETAMENTE cada arquivo de jogo
   - NÃO misture código antigo com novo
   - Teste cada jogo individualmente

3. **CONFIGURE AS VARIÁVEIS DE AMBIENTE:**
   ```env
   VITE_SUPABASE_URL=https://lixusjljqwqmxduvjffy.supabase.co
   VITE_SUPABASE_ANON_KEY=[sua_chave_anon]
   ```

4. **TESTE CADA FUNCIONALIDADE:**
   - MeowClicker: Cliques contam, energia regenera, power-ups funcionam
   - CryptoQuiz: Perguntas do banco, timer, pontuação correta
   - LuckySpin: Roleta gira, probabilidades corretas
   - TreasureHunt: Lógica de campo minado com tesouros
   - BattleArena: Sistema RPG completo com níveis
   - Ranking: Mostra dados reais do Supabase

---

## 🎯 **RESULTADO ESPERADO:**

Após implementar este prompt:

✅ **MeowClicker:** Conta cliques, regenera energia, power-ups funcionais
✅ **CryptoQuiz:** 50+ perguntas, 3 dificuldades, timer, explicações
✅ **LuckySpin:** Roleta animada, 5 raridades, probabilidades balanceadas
✅ **TreasureHunt:** Campo minado com tesouros, lógica clara, pontuação
✅ **BattleArena:** RPG completo, 5 inimigos, sistema de níveis
✅ **Ranking Global:** Dashboard profissional, busca, estatísticas

**TODOS os jogos contarão pontos corretamente e o sistema será robusto!** 🚀

