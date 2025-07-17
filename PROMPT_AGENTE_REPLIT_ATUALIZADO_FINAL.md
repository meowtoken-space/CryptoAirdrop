# 🚀 PROMPT COMPLETO PARA AGENTE REPLIT - SISTEMA DE PONTOS MEOW TOKEN

## 📋 **INSTRUÇÕES PARA O AGENTE:**

Você deve implementar um **sistema de pontos gamificado completo** para o projeto CryptoAirdrop. Este sistema deve substituir qualquer sistema de pontos existente e criar uma experiência de jogos integrada na página Games.

---

## 🎯 **OBJETIVO PRINCIPAL:**

Criar uma página de jogos (`/games`) com 5 jogos funcionais integrados a um sistema de pontos robusto que salva dados no Supabase, com reset diário às 21:00 (horário de Brasília).

---

## 🗄️ **CONFIGURAÇÃO DO SUPABASE:**

### **Tabelas já existentes no banco:**
- `users` (com coluna `total_points`)
- `quiz_categories` (8 categorias: Bitcoin, Ethereum, DeFi, Solana, NFTs, Trading, Wallets, Segurança)
- `quiz_difficulties` (Fácil: 3pts, Médio: 7pts, Difícil: 15pts)
- `quiz_questions` (19+ perguntas categorizadas)

### **Configuração de conexão:**
```typescript
// Use as variáveis de ambiente já configuradas no projeto
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 🎮 **JOGOS A IMPLEMENTAR:**

### **1. MEOW CLICKER**
- **Pontos:** 1 ponto por clique (máximo 1000 cliques/dia)
- **Mecânica:** Sistema de energia, power-ups, multiplicadores
- **Reset:** Diário às 21:00
- **Interface:** Botão grande de clique, contador de energia, power-ups visuais

### **2. CRYPTO QUIZ**
- **Pontos:** Fácil (3pts), Médio (7pts), Difícil (15pts)
- **Bônus velocidade:** +50% se responder em 10s, +25% se responder em 20s
- **Mecânica:** Timer de 30s, perguntas aleatórias do Supabase
- **Limite:** 20 perguntas por dia
- **Interface:** Timer visual, indicador de dificuldade, estatísticas

### **3. LUCKY SPIN**
- **Pontos:** 1-50 pontos (baseado na raridade)
- **Raridades:** Comum (1-5pts), Raro (10-20pts), Épico (25-35pts), Lendário (40-50pts)
- **Limite:** 5 spins por dia
- **Interface:** Roleta animada, indicadores de raridade

### **4. TREASURE HUNT**
- **Pontos:** 5-25 pontos por tesouro encontrado
- **Mecânica:** Mapa procedural, sistema de dicas, tesouros escondidos
- **Limite:** 3 mapas por dia
- **Interface:** Grid de mapa, sistema de dicas, contador de tesouros

### **5. BATTLE ARENA**
- **Pontos:** 3-15 pontos por vitória (baseado na dificuldade do oponente)
- **Mecânica:** Combate por turnos, stats de ataque/defesa, sequências de vitória
- **Limite:** 10 batalhas por dia
- **Interface:** Arena visual, stats do jogador, histórico de batalhas

---

## 🔧 **SISTEMA DE PONTOS (usePoints.ts):**

```typescript
import { createClient } from '@supabase/supabase-js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useState, useEffect } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const usePoints = () => {
  const { publicKey } = useWallet()
  const [points, setPoints] = useState(0)
  const [dailyLimits, setDailyLimits] = useState({
    meowClicker: 0,
    cryptoQuiz: 0,
    luckySpin: 0,
    treasureHunt: 0,
    battleArena: 0
  })

  // Função para verificar se é um novo dia (reset às 21:00)
  const isNewDay = (lastReset: string) => {
    const now = new Date()
    const lastResetDate = new Date(lastReset)
    const today21h = new Date()
    today21h.setHours(21, 0, 0, 0)
    
    if (now.getHours() >= 21) {
      return lastResetDate < today21h
    } else {
      const yesterday21h = new Date(today21h)
      yesterday21h.setDate(yesterday21h.getDate() - 1)
      return lastResetDate < yesterday21h
    }
  }

  // Função para adicionar pontos
  const addPoints = async (gameType: string, pointsToAdd: number) => {
    if (!publicKey) return false

    try {
      // Verificar limites diários
      const limits = {
        meowClicker: 1000,
        cryptoQuiz: 20,
        luckySpin: 5,
        treasureHunt: 3,
        battleArena: 10
      }

      if (dailyLimits[gameType] >= limits[gameType]) {
        throw new Error('Limite diário atingido')
      }

      // Atualizar pontos no Supabase
      const { data, error } = await supabase
        .from('users')
        .upsert({
          wallet_address: publicKey.toString(),
          total_points: points + pointsToAdd,
          last_activity: new Date().toISOString(),
          [`${gameType}_daily`]: dailyLimits[gameType] + 1
        })

      if (error) throw error

      setPoints(prev => prev + pointsToAdd)
      setDailyLimits(prev => ({
        ...prev,
        [gameType]: prev[gameType] + 1
      }))

      return true
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error)
      return false
    }
  }

  // Carregar dados do usuário
  useEffect(() => {
    if (publicKey) {
      loadUserData()
    }
  }, [publicKey])

  const loadUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', publicKey.toString())
        .single()

      if (data) {
        setPoints(data.total_points || 0)
        
        // Verificar se precisa resetar limites diários
        if (data.last_reset && isNewDay(data.last_reset)) {
          // Reset automático
          await supabase
            .from('users')
            .update({
              meowClicker_daily: 0,
              cryptoQuiz_daily: 0,
              luckySpin_daily: 0,
              treasureHunt_daily: 0,
              battleArena_daily: 0,
              last_reset: new Date().toISOString()
            })
            .eq('wallet_address', publicKey.toString())
          
          setDailyLimits({
            meowClicker: 0,
            cryptoQuiz: 0,
            luckySpin: 0,
            treasureHunt: 0,
            battleArena: 0
          })
        } else {
          setDailyLimits({
            meowClicker: data.meowClicker_daily || 0,
            cryptoQuiz: data.cryptoQuiz_daily || 0,
            luckySpin: data.luckySpin_daily || 0,
            treasureHunt: data.treasureHunt_daily || 0,
            battleArena: data.battleArena_daily || 0
          })
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  return {
    points,
    dailyLimits,
    addPoints,
    loadUserData
  }
}
```

---

## 🎨 **INTERFACE DA PÁGINA GAMES:**

### **Layout Principal:**
```tsx
// pages/Games.tsx
import { useWallet } from '@solana/wallet-adapter-react'
import { usePoints } from '../hooks/usePoints'
import MeowClicker from '../components/games/MeowClicker'
import CryptoQuiz from '../components/games/CryptoQuiz'
import LuckySpin from '../components/games/LuckySpin'
import TreasureHunt from '../components/games/TreasureHunt'
import BattleArena from '../components/games/BattleArena'

export default function Games() {
  const { connected } = useWallet()
  const { points, dailyLimits } = usePoints()

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">🎮 Meow Games</h1>
          <p className="text-gray-300 mb-8">Conecte sua carteira para começar a jogar!</p>
          <button className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-3 rounded-lg font-bold text-white hover:scale-105 transition-transform">
            Conectar Carteira
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Header com pontos totais */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-white">🎮 Meow Games</h1>
            <div className="text-right">
              <p className="text-gray-300">Pontos Totais</p>
              <p className="text-3xl font-bold text-yellow-400">{points.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de jogos */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MeowClicker />
        <CryptoQuiz />
        <LuckySpin />
        <TreasureHunt />
        <BattleArena />
      </div>

      {/* Ranking global */}
      <div className="max-w-7xl mx-auto mt-8">
        <GlobalRanking />
      </div>
    </div>
  )
}
```

### **Estilo CSS (games.css):**
```css
/* Tema cyberpunk para jogos */
.game-card {
  background: linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(30,0,60,0.4) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(147, 51, 234, 0.3);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
}

.game-card:hover {
  transform: translateY(-5px);
  border-color: rgba(147, 51, 234, 0.6);
  box-shadow: 0 20px 40px rgba(147, 51, 234, 0.2);
}

.points-display {
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
  font-size: 1.5rem;
}

.daily-limit {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
}

.game-button {
  background: linear-gradient(135deg, #8b5cf6, #a855f7);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.game-button:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(139, 92, 246, 0.4);
}

.game-button:disabled {
  background: rgba(107, 114, 128, 0.5);
  cursor: not-allowed;
  transform: none;
}
```

---

## 🎯 **COMPONENTE CRYPTO QUIZ ATUALIZADO:**

```tsx
// components/games/CryptoQuiz.tsx
import { useState, useEffect } from 'react'
import { usePoints } from '../../hooks/usePoints'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Question {
  id: number
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  difficulty: 'Fácil' | 'Médio' | 'Difícil'
  category: string
  points: number
}

export default function CryptoQuiz() {
  const { addPoints, dailyLimits } = usePoints()
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [score, setScore] = useState(0)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [streak, setStreak] = useState(0)

  // Carregar pergunta aleatória
  const loadRandomQuestion = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select(`
          *,
          quiz_categories(name),
          quiz_difficulties(name, points)
        `)
        .order('id', { ascending: false })

      if (data && data.length > 0) {
        const randomQuestion = data[Math.floor(Math.random() * data.length)]
        setCurrentQuestion({
          ...randomQuestion,
          difficulty: randomQuestion.quiz_difficulties.name,
          category: randomQuestion.quiz_categories.name,
          points: randomQuestion.quiz_difficulties.points
        })
        setTimeLeft(30)
        setSelectedAnswer(null)
        setShowResult(false)
      }
    } catch (error) {
      console.error('Erro ao carregar pergunta:', error)
    }
  }

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !showResult && currentQuestion) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResult) {
      handleAnswer(-1) // Tempo esgotado
    }
  }, [timeLeft, showResult, currentQuestion])

  // Responder pergunta
  const handleAnswer = async (answerIndex: number) => {
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
      
      await addPoints('cryptoQuiz', pointsEarned)
    } else {
      setStreak(0)
    }

    setQuestionsAnswered(prev => prev + 1)
  }

  // Próxima pergunta
  const nextQuestion = () => {
    if (questionsAnswered < 20 && dailyLimits.cryptoQuiz < 20) {
      loadRandomQuestion()
    }
  }

  // Inicializar
  useEffect(() => {
    if (dailyLimits.cryptoQuiz < 20) {
      loadRandomQuestion()
    }
  }, [dailyLimits])

  if (dailyLimits.cryptoQuiz >= 20) {
    return (
      <div className="game-card">
        <h3 className="text-2xl font-bold text-white mb-4">🧠 Crypto Quiz</h3>
        <div className="text-center">
          <p className="text-gray-300 mb-4">Limite diário atingido!</p>
          <div className="daily-limit">20/20 perguntas respondidas</div>
          <p className="text-sm text-gray-400 mt-2">Reset às 21:00</p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="game-card">
        <h3 className="text-2xl font-bold text-white mb-4">🧠 Crypto Quiz</h3>
        <div className="text-center">
          <p className="text-gray-300">Carregando pergunta...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="game-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-white">🧠 Crypto Quiz</h3>
        <div className="text-right">
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
            currentQuestion.difficulty === 'Fácil' ? 'bg-green-500/20 text-green-400' :
            currentQuestion.difficulty === 'Médio' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {currentQuestion.difficulty} - {currentQuestion.points}pts
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-gray-400 text-sm">Pontos</p>
          <p className="points-display">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Sequência</p>
          <p className="text-white font-bold">{streak}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Tempo</p>
          <p className={`font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
            {timeLeft}s
          </p>
        </div>
      </div>

      {/* Pergunta */}
      <div className="mb-6">
        <p className="text-white text-lg mb-4">{currentQuestion.question}</p>
        
        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => (
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

      {/* Botões */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">
          {dailyLimits.cryptoQuiz}/20 perguntas hoje
        </div>
        
        {showResult && (
          <button
            onClick={nextQuestion}
            disabled={questionsAnswered >= 20 || dailyLimits.cryptoQuiz >= 20}
            className="game-button"
          >
            {questionsAnswered >= 20 || dailyLimits.cryptoQuiz >= 20 ? 'Concluído' : 'Próxima'}
          </button>
        )}
      </div>
    </div>
  )
}
```

---

## 🏆 **RANKING GLOBAL:**

```tsx
// components/GlobalRanking.tsx
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function GlobalRanking() {
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRanking()
  }, [])

  const loadRanking = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('wallet_address, total_points')
        .order('total_points', { ascending: false })
        .limit(10)

      if (data) {
        setRanking(data)
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
      <h2 className="text-2xl font-bold text-white mb-6">🏆 Ranking Global</h2>
      
      {loading ? (
        <p className="text-gray-400">Carregando ranking...</p>
      ) : (
        <div className="space-y-3">
          {ranking.map((user, index) => (
            <div key={user.wallet_address} className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className={`font-bold ${
                  index === 0 ? 'text-yellow-400' :
                  index === 1 ? 'text-gray-300' :
                  index === 2 ? 'text-orange-400' :
                  'text-white'
                }`}>
                  #{index + 1}
                </span>
                <span className="text-gray-300 font-mono">
                  {user.wallet_address.slice(0, 4)}...{user.wallet_address.slice(-4)}
                </span>
              </div>
              <span className="points-display">{user.total_points.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## ⚙️ **CONFIGURAÇÕES IMPORTANTES:**

### **Carteira Admin:**
```typescript
const ADMIN_WALLET = "DM5bzL1MWThBjhFVXRWzFtYKjqf5Vwhhs2jVzr68hYoV"
```

### **Limites Diários:**
- MeowClicker: 1000 cliques
- CryptoQuiz: 20 perguntas
- LuckySpin: 5 spins
- TreasureHunt: 3 mapas
- BattleArena: 10 batalhas

### **Reset Diário:**
- Horário: 21:00 (horário de Brasília)
- Automático via função `isNewDay()`

### **Sistema de Pontuação:**
- CryptoQuiz: Fácil (3pts), Médio (7pts), Difícil (15pts)
- Bônus velocidade: +50% (≤10s), +25% (≤20s)
- Outros jogos: Pontuação variável conforme mecânica

---

## 🎯 **RESULTADO ESPERADO:**

Após implementar este prompt, o usuário terá:

1. ✅ **Página Games funcional** com 5 jogos integrados
2. ✅ **Sistema de pontos robusto** conectado ao Supabase
3. ✅ **CryptoQuiz avançado** com 19+ perguntas categorizadas
4. ✅ **Reset diário automático** às 21:00
5. ✅ **Interface cyberpunk** responsiva e moderna
6. ✅ **Ranking global** em tempo real
7. ✅ **Limites diários** configuráveis
8. ✅ **Sistema anti-fraude** integrado

**O sistema será o mais avançado do mercado crypto, superando projetos como ai16z, Cookie DAO e outros!**

