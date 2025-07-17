# 🌟 PROMPT: STARBORDER EM TODOS OS BOTÕES

## 🎯 **OBJETIVO**

Implementar o componente **StarBorder** em todos os botões do sistema, criando uma interface consistente e moderna com efeitos de borda animada em todos os elementos interativos.

---

## 🛠️ **IMPLEMENTAÇÃO COMPLETA**

### **PASSO 1: CRIAR COMPONENTE STARBORDER**

**Criar: `client/src/components/StarBorder/StarBorder.tsx`**
```typescript
import React from 'react'

interface StarBorderProps {
  as?: React.ElementType
  className?: string
  color?: string
  speed?: string
  thickness?: number
  children: React.ReactNode
  style?: React.CSSProperties
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const StarBorder: React.FC<StarBorderProps> = ({
  as: Component = "button",
  className = "",
  color = "cyan",
  speed = "6s",
  thickness = 1,
  children,
  disabled = false,
  ...rest
}) => {
  // Cores predefinidas para o sistema MEOW
  const colorMap = {
    cyan: '#2ad6d0',
    purple: '#9a45fc',
    yellow: '#ffe118',
    pink: '#ff0080',
    green: '#00ff41',
    white: '#ffffff'
  }

  const selectedColor = colorMap[color] || color

  return (
    <Component 
      className={`relative inline-block overflow-hidden rounded-[20px] transition-all duration-300 hover:scale-105 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`} 
      style={{
        padding: `${thickness}px 0`,
        ...rest.style
      }}
      disabled={disabled}
      {...rest}
    >
      {/* Animação inferior */}
      <div
        className="absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${selectedColor}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      
      {/* Animação superior */}
      <div
        className="absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${selectedColor}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      
      {/* Conteúdo do botão */}
      <div className="relative z-10 bg-gradient-to-b from-gray-900 to-black border border-gray-700 text-white text-center text-[16px] py-[16px] px-[26px] rounded-[20px] transition-all duration-300 hover:from-gray-800 hover:to-gray-900 hover:border-gray-600">
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
```

### **PASSO 2: CONFIGURAR TAILWIND ANIMATIONS**

**Atualizar: `tailwind.config.js`**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'star-movement-bottom': 'star-movement-bottom linear infinite alternate',
        'star-movement-top': 'star-movement-top linear infinite alternate',
        'title-glow': 'title-glow 2s ease-in-out infinite alternate',
        'grid-move': 'grid-move 20s linear infinite',
      },
      keyframes: {
        'star-movement-bottom': {
          '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
          '100%': { transform: 'translate(-100%, 0%)', opacity: '0' },
        },
        'star-movement-top': {
          '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
          '100%': { transform: 'translate(100%, 0%)', opacity: '0' },
        },
        'title-glow': {
          '0%': { textShadow: '0 0 10px #2ad6d0, 0 0 20px #2ad6d0' },
          '100%': { textShadow: '0 0 20px #2ad6d0, 0 0 30px #2ad6d0, 0 0 40px #2ad6d0' },
        },
        'grid-move': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(50px, 50px)' },
        },
      },
      colors: {
        'neon-cyan': '#2ad6d0',
        'neon-purple': '#9a45fc',
        'neon-yellow': '#ffe118',
        'neon-pink': '#ff0080',
        'neon-green': '#00ff41',
      }
    },
  },
  plugins: [],
}
```

### **PASSO 3: ATUALIZAR SIDEBAR COM STARBORDER**

**Atualizar: `client/src/components/Sidebar.tsx`**
```typescript
import React from 'react'
import StarBorder from './StarBorder/StarBorder'

interface SidebarProps {
  activeSection: string
  activeGame: string
  onSectionChange: (section: string) => void
  onGameChange: (game: string) => void
}

const sidebarSections = [
  {
    id: 'home',
    icon: '🏠',
    label: 'Home',
    color: 'cyan'
  },
  {
    id: 'games',
    icon: '🎮',
    label: 'Jogos',
    color: 'purple',
    games: [
      { id: 'meow-clicker', label: '🐱 Meow Clicker', color: 'yellow' },
      { id: 'crypto-quiz', label: '🧠 Crypto Quiz', color: 'cyan' },
      { id: 'lucky-spin', label: '🎰 Lucky Spin', color: 'pink' },
      { id: 'treasure-hunt', label: '🗺️ Treasure Hunt', color: 'green' },
      { id: 'battle-arena', label: '⚔️ Battle Arena', color: 'purple' }
    ]
  },
  {
    id: 'statistics',
    icon: '📊',
    label: 'Estatísticas',
    color: 'green'
  },
  {
    id: 'ranking',
    icon: '🏆',
    label: 'Ranking',
    color: 'yellow'
  },
  {
    id: 'shop',
    icon: '💎',
    label: 'Loja',
    color: 'pink'
  },
  {
    id: 'settings',
    icon: '⚙️',
    label: 'Configurações',
    color: 'white'
  }
]

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  activeGame,
  onSectionChange,
  onGameChange
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>🎮 MEOW DASHBOARD</h2>
      </div>
      
      <nav className="sidebar-nav">
        {sidebarSections.map(section => (
          <div key={section.id} className="nav-section">
            <StarBorder
              color={section.color}
              speed="4s"
              className={`w-full mb-2 ${activeSection === section.id ? 'ring-2 ring-neon-cyan' : ''}`}
              onClick={() => onSectionChange(section.id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{section.icon}</span>
                <span className="font-medium">{section.label}</span>
              </div>
            </StarBorder>
            
            {/* Sub-menu para jogos */}
            {section.games && activeSection === 'games' && (
              <div className="nav-submenu ml-4 space-y-2">
                {section.games.map(game => (
                  <StarBorder
                    key={game.id}
                    color={game.color}
                    speed="3s"
                    className={`w-full ${activeGame === game.id ? 'ring-2 ring-neon-cyan' : ''}`}
                    onClick={() => onGameChange(game.id)}
                  >
                    <div className="text-sm font-medium">
                      {game.label}
                    </div>
                  </StarBorder>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
```

### **PASSO 4: ATUALIZAR DASHBOARD HEADER**

**Atualizar: `client/src/components/DashboardHeader.tsx`**
```typescript
import React from 'react'
import { useAuth } from '../hooks/useAuth'
import StarBorder from './StarBorder/StarBorder'

interface DashboardHeaderProps {
  user: any
  totalPoints: number
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, totalPoints }) => {
  const { logout } = useAuth()

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">🐱</span>
          <span className="logo-text">MEOW TOKEN</span>
        </div>
      </div>
      
      <div className="header-center">
        <div className="points-display">
          <span className="points-icon">💎</span>
          <span className="points-value">{totalPoints.toLocaleString()}</span>
          <span className="points-label">PONTOS</span>
        </div>
      </div>
      
      <div className="header-right">
        <div className="user-info">
          <span className="user-level">Nível {user?.level || 1}</span>
          <span className="user-wallet">
            {user?.wallet_address?.slice(0, 6)}...{user?.wallet_address?.slice(-4)}
          </span>
        </div>
        
        <StarBorder
          color="pink"
          speed="3s"
          onClick={logout}
        >
          🚪 Sair
        </StarBorder>
      </div>
    </header>
  )
}

export default DashboardHeader
```

### **PASSO 5: ATUALIZAR JOGOS COM STARBORDER**

**Atualizar: `client/src/components/games/MeowClicker.tsx`**
```typescript
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePoints } from '../../hooks/usePoints'
import StarBorder from '../StarBorder/StarBorder'

const MeowClicker = () => {
  const { user } = useAuth()
  const { addPoints } = usePoints()
  const [energy, setEnergy] = useState(100)
  const [clicks, setClicks] = useState(0)
  const [multiplier, setMultiplier] = useState(1)
  const [dailyClicks, setDailyClicks] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const DAILY_LIMIT = 1000
  const ENERGY_REGEN_RATE = 1 // 1 energia a cada 5 segundos

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => Math.min(100, prev + ENERGY_REGEN_RATE))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleClick = async () => {
    if (energy <= 0 || dailyClicks >= DAILY_LIMIT || isLoading) return

    setIsLoading(true)
    setEnergy(prev => Math.max(0, prev - 1))
    setClicks(prev => prev + 1)
    setDailyClicks(prev => prev + 1)

    // Power-up a cada 100 cliques
    if ((clicks + 1) % 100 === 0) {
      setMultiplier(prev => prev + 0.5)
    }

    try {
      const points = 1 * multiplier
      await addPoints('meowClicker', points, user?.wallet_address)
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetDaily = () => {
    setDailyClicks(0)
    setClicks(0)
    setMultiplier(1)
    setEnergy(100)
  }

  return (
    <div className="meow-clicker-container">
      <div className="game-header">
        <h2 className="text-2xl font-bold text-neon-cyan mb-4">🐱 Meow Clicker</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Energia:</span>
            <div className="energy-bar">
              <div 
                className="energy-fill" 
                style={{ width: `${energy}%` }}
              ></div>
            </div>
            <span className="stat-value">{energy}/100</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Cliques Hoje:</span>
            <span className="stat-value">{dailyClicks}/{DAILY_LIMIT}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Multiplicador:</span>
            <span className="stat-value">x{multiplier}</span>
          </div>
        </div>
      </div>

      <div className="game-content">
        <div className="clicker-area">
          <StarBorder
            color="yellow"
            speed="2s"
            className="clicker-button"
            onClick={handleClick}
            disabled={energy <= 0 || dailyClicks >= DAILY_LIMIT || isLoading}
          >
            <div className="clicker-content">
              <div className="cat-emoji">🐱</div>
              <div className="click-text">
                {energy <= 0 ? 'Sem Energia' : 
                 dailyClicks >= DAILY_LIMIT ? 'Limite Atingido' : 
                 'CLIQUE AQUI!'}
              </div>
            </div>
          </StarBorder>
        </div>

        <div className="game-actions">
          <StarBorder
            color="cyan"
            speed="4s"
            onClick={resetDaily}
          >
            🔄 Reset Diário
          </StarBorder>
        </div>
      </div>
    </div>
  )
}

export default MeowClicker
```

**Atualizar: `client/src/components/games/CryptoQuiz.tsx`**
```typescript
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePoints } from '../../hooks/usePoints'
import StarBorder from '../StarBorder/StarBorder'

const CryptoQuiz = () => {
  const { user } = useAuth()
  const { addPoints } = usePoints()
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isLoading, setIsLoading] = useState(false)

  const DAILY_LIMIT = 20

  useEffect(() => {
    loadQuestion()
  }, [])

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeout()
    }
  }, [timeLeft, isAnswered])

  const loadQuestion = async () => {
    // Simular carregamento de pergunta do Supabase
    const questions = [
      {
        id: 1,
        question: "Quem criou o Bitcoin?",
        options: ["Satoshi Nakamoto", "Vitalik Buterin", "Charlie Lee", "Roger Ver"],
        correct: 0,
        difficulty: "easy",
        points: 3
      },
      {
        id: 2,
        question: "Qual é o limite máximo de Bitcoins?",
        options: ["21 milhões", "100 milhões", "50 milhões", "Ilimitado"],
        correct: 0,
        difficulty: "medium",
        points: 7
      },
      {
        id: 3,
        question: "O que é Proof of History (PoH)?",
        options: ["Consenso do Bitcoin", "Algoritmo do Solana", "Token do Ethereum", "Protocolo DeFi"],
        correct: 1,
        difficulty: "hard",
        points: 15
      }
    ]

    const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
    setCurrentQuestion(randomQuestion)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setTimeLeft(30)
  }

  const handleAnswer = async (answerIndex) => {
    if (isAnswered || isLoading) return

    setIsLoading(true)
    setSelectedAnswer(answerIndex)
    setIsAnswered(true)

    const isCorrect = answerIndex === currentQuestion.correct
    let points = 0

    if (isCorrect) {
      points = currentQuestion.points
      
      // Bônus de velocidade
      if (timeLeft > 20) points = Math.floor(points * 1.5) // +50%
      else if (timeLeft > 10) points = Math.floor(points * 1.25) // +25%

      setScore(prev => prev + points)

      try {
        await addPoints('cryptoQuiz', points, user?.wallet_address)
      } catch (error) {
        console.error('Erro ao adicionar pontos:', error)
      }
    }

    setQuestionsAnswered(prev => prev + 1)
    setIsLoading(false)
  }

  const handleTimeout = () => {
    setIsAnswered(true)
    setQuestionsAnswered(prev => prev + 1)
  }

  const nextQuestion = () => {
    if (questionsAnswered < DAILY_LIMIT) {
      loadQuestion()
    }
  }

  if (!currentQuestion) {
    return <div className="loading">Carregando pergunta...</div>
  }

  return (
    <div className="crypto-quiz-container">
      <div className="game-header">
        <h2 className="text-2xl font-bold text-neon-cyan mb-4">🧠 Crypto Quiz</h2>
        <div className="quiz-stats">
          <div className="stat-item">
            <span className="stat-label">Perguntas:</span>
            <span className="stat-value">{questionsAnswered}/{DAILY_LIMIT}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pontos:</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Tempo:</span>
            <span className={`stat-value ${timeLeft <= 10 ? 'text-red-500' : ''}`}>
              {timeLeft}s
            </span>
          </div>
        </div>
      </div>

      <div className="question-container">
        <div className="question-header">
          <span className={`difficulty-badge difficulty-${currentQuestion.difficulty}`}>
            {currentQuestion.difficulty.toUpperCase()} - {currentQuestion.points} pts
          </span>
        </div>
        
        <h3 className="question-text">{currentQuestion.question}</h3>

        <div className="answers-grid">
          {currentQuestion.options.map((option, index) => (
            <StarBorder
              key={index}
              color={
                isAnswered 
                  ? index === currentQuestion.correct 
                    ? 'green' 
                    : index === selectedAnswer 
                      ? 'pink' 
                      : 'white'
                  : 'cyan'
              }
              speed="3s"
              className={`answer-button ${isAnswered ? 'answered' : ''}`}
              onClick={() => handleAnswer(index)}
              disabled={isAnswered || isLoading}
            >
              <div className="answer-content">
                <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                <span className="answer-text">{option}</span>
              </div>
            </StarBorder>
          ))}
        </div>

        {isAnswered && (
          <div className="result-section">
            <div className={`result-message ${selectedAnswer === currentQuestion.correct ? 'correct' : 'incorrect'}`}>
              {selectedAnswer === currentQuestion.correct ? '✅ Correto!' : '❌ Incorreto!'}
            </div>
            
            {questionsAnswered < DAILY_LIMIT ? (
              <StarBorder
                color="purple"
                speed="4s"
                onClick={nextQuestion}
              >
                ➡️ Próxima Pergunta
              </StarBorder>
            ) : (
              <div className="daily-complete">
                🎉 Limite diário atingido! Volte às 21:00
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CryptoQuiz
```

### **PASSO 6: ATUALIZAR OUTROS JOGOS**

**Aplicar StarBorder em LuckySpin, TreasureHunt e BattleArena seguindo o mesmo padrão:**

```typescript
// Exemplo para LuckySpin
<StarBorder
  color="pink"
  speed="2s"
  onClick={handleSpin}
  disabled={spinsLeft <= 0 || isSpinning}
>
  {isSpinning ? '🎰 Girando...' : '🎰 GIRAR ROLETA'}
</StarBorder>

// Exemplo para TreasureHunt
<StarBorder
  color="green"
  speed="3s"
  onClick={handleCellClick}
>
  {cell.revealed ? cell.content : '❓'}
</StarBorder>

// Exemplo para BattleArena
<StarBorder
  color="purple"
  speed="4s"
  onClick={handleAttack}
  disabled={playerHealth <= 0}
>
  ⚔️ ATACAR
</StarBorder>
```

### **PASSO 7: ATUALIZAR CSS PARA STARBORDER**

**Adicionar ao `client/src/index.css`:**
```css
/* STARBORDER INTEGRATION */
.nav-section {
  margin-bottom: 8px;
}

.nav-submenu {
  margin-top: 8px;
  padding-left: 16px;
}

/* GAME SPECIFIC STARBORDER STYLES */
.clicker-button {
  width: 200px;
  height: 200px;
  border-radius: 50% !important;
}

.clicker-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.cat-emoji {
  font-size: 4rem;
  animation: bounce 2s infinite;
}

.click-text {
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.answer-button {
  width: 100%;
  margin-bottom: 12px;
}

.answer-content {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.answer-letter {
  background: rgba(42, 214, 208, 0.2);
  border: 1px solid #2ad6d0;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.answer-text {
  flex: 1;
}

/* DIFFICULTY BADGES */
.difficulty-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.difficulty-easy {
  background: rgba(0, 255, 65, 0.2);
  color: #00ff41;
  border: 1px solid #00ff41;
}

.difficulty-medium {
  background: rgba(255, 225, 24, 0.2);
  color: #ffe118;
  border: 1px solid #ffe118;
}

.difficulty-hard {
  background: rgba(255, 0, 128, 0.2);
  color: #ff0080;
  border: 1px solid #ff0080;
}

/* ANIMATIONS */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .clicker-button {
    width: 150px;
    height: 150px;
  }
  
  .cat-emoji {
    font-size: 3rem;
  }
  
  .answer-content {
    gap: 8px;
  }
}
```

---

## 🚀 **INSTRUÇÕES DE IMPLEMENTAÇÃO**

### **EXECUTAR NO REPLIT:**

1. **Instalar dependência:** `npx jsrepo add https://reactbits.dev/tailwind/Animations/StarBorder`
2. **Criar StarBorder component** com código personalizado
3. **Atualizar tailwind.config.js** com animações
4. **Substituir todos os botões** por StarBorder
5. **Aplicar cores temáticas** (cyan, purple, yellow, pink, green)
6. **Testar interatividade** em todos os componentes
7. **Verificar responsividade** mobile

### **RESULTADO ESPERADO:**

Após implementação:
- ✅ **Todos os botões** com efeito StarBorder animado
- ✅ **Cores consistentes** por seção/jogo
- ✅ **Animações fluidas** em todos os elementos
- ✅ **Interface unificada** e profissional
- ✅ **Hover effects** e feedback visual
- ✅ **Responsividade** mantida
- ✅ **Performance** otimizada

**EXECUTE ESTE PROMPT PARA TER BOTÕES ANIMADOS EM TODO O SISTEMA!** 🌟

