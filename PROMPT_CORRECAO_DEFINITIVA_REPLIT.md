# 🚨 PROMPT CORREÇÃO DEFINITIVA - REPLIT AGENT

## 🎯 **PROBLEMAS IDENTIFICADOS NO CÓDIGO:**

Após investigação completa, identifiquei os problemas raiz:

### **❌ PROBLEMA 1: CONFLITO DE AUTENTICAÇÃO**
- `App.tsx` usa `useAuth` para controlar acesso
- `Games.tsx` usa `useWallet` do Solana
- Dois sistemas não se comunicam

### **❌ PROBLEMA 2: HOOK usePoints INCORRETO**
- Tabela `user_points` pode não existir
- Nomes de colunas inconsistentes
- Falta verificação de carteira

### **❌ PROBLEMA 3: COMPONENTES DOS JOGOS VAZIOS**
- Jogos não renderizam conteúdo
- Falta implementação das funcionalidades
- CSS cyberpunk não aplicado

---

## 🔧 **INSTRUÇÕES OBRIGATÓRIAS:**

### **PASSO 1: CORRIGIR SISTEMA DE AUTENTICAÇÃO**

**PROBLEMA:** Games.tsx usa useWallet mas App.tsx usa useAuth.

**SOLUÇÃO:** Unificar usando apenas o sistema existente do projeto.

```typescript
// client/src/pages/Games.tsx - CORRIGIR COMPLETAMENTE:
import React, { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePoints } from '../hooks/usePoints'
import GlobalRanking from '../components/GlobalRanking'

// Importar TODOS os componentes de jogos
import MeowClicker from '../components/games/MeowClicker'
import CryptoQuiz from '../components/games/CryptoQuiz'
import LuckySpin from '../components/games/LuckySpin'
import TreasureHunt from '../components/games/TreasureHunt'
import BattleArena from '../components/games/BattleArena'

export default function Games() {
  const { user, isAuthenticated } = useAuth()
  const { totalPoints, dailyLimits, fetchUserPoints } = usePoints()

  useEffect(() => {
    if (isAuthenticated && user?.wallet_address) {
      fetchUserPoints(user.wallet_address)
    }
  }, [isAuthenticated, user, fetchUserPoints])

  if (!isAuthenticated || !user?.wallet_address) {
    return (
      <div className="games-connect">
        <h2>🎮 Jogos MEOW Token</h2>
        <p>Conecte sua carteira para acessar os jogos!</p>
      </div>
    )
  }

  return (
    <div className="games-page">
      {/* Header com pontos totais - CYBERPUNK NEON */}
      <div className="points-header">
        <h1 className="game-title">🎮 MEOW GAMES ARENA</h1>
        <div className="points-display">
          <div className="points-label">TOTAL POINTS</div>
          <div className="points-value">{totalPoints.toLocaleString()}</div>
        </div>
      </div>

      {/* Grid de jogos - TODOS NA MESMA PÁGINA */}
      <div className="games-grid">
        <MeowClicker />
        <CryptoQuiz />
        <LuckySpin />
        <TreasureHunt />
        <BattleArena />
      </div>

      {/* Ranking global */}
      <div className="ranking-section">
        <GlobalRanking />
      </div>
    </div>
  )
}
```

### **PASSO 2: CORRIGIR HOOK usePoints**

**PROBLEMA:** Hook usa tabela incorreta e nomes de colunas errados.

**SOLUÇÃO:** Usar tabela `users` que já existe no projeto.

```typescript
// client/src/hooks/usePoints.ts - CORRIGIR COMPLETAMENTE:
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

export interface DailyLimits {
  meowClicker: number
  cryptoQuiz: number
  luckySpin: number
  treasureHunt: number
  battleArena: number
}

export const usePoints = () => {
  const [totalPoints, setTotalPoints] = useState(0)
  const [dailyLimits, setDailyLimits] = useState<DailyLimits>({
    meowClicker: 0,
    cryptoQuiz: 0,
    luckySpin: 0,
    treasureHunt: 0,
    battleArena: 0
  })

  // Função para adicionar pontos
  const addPoints = async (gameType: keyof DailyLimits, points: number, walletAddress: string) => {
    try {
      console.log('Adicionando pontos:', { gameType, points, walletAddress })

      // Verificar se já existe o usuário na tabela users
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle()

      if (selectError) {
        console.error('Erro ao buscar usuário:', selectError)
        return false
      }

      if (existingUser) {
        // Atualizar pontos existentes
        const newTotalPoints = (existingUser.points || 0) + points
        
        const { error } = await supabase
          .from('users')
          .update({
            points: newTotalPoints,
            updated_at: new Date().toISOString()
          })
          .eq('wallet_address', walletAddress)

        if (error) {
          console.error('Erro ao atualizar pontos:', error)
          return false
        }

        setTotalPoints(newTotalPoints)
      } else {
        // Criar novo usuário
        const newUser = {
          wallet_address: walletAddress,
          points: points,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { error } = await supabase
          .from('users')
          .insert(newUser)

        if (error) {
          console.error('Erro ao criar usuário:', error)
          return false
        }

        setTotalPoints(points)
      }

      // Atualizar estado local
      setDailyLimits(prev => ({
        ...prev,
        [gameType]: prev[gameType] + 1
      }))

      console.log('Pontos adicionados com sucesso!')
      return true

    } catch (error) {
      console.error('Erro ao adicionar pontos:', error)
      return false
    }
  }

  // Função para buscar pontos do usuário
  const fetchUserPoints = async (walletAddress: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle()

      if (error) {
        console.error('Erro ao buscar pontos:', error)
        return
      }

      if (data) {
        setTotalPoints(data.points || 0)
        // Reset daily limits (implementar lógica de reset diário depois)
        setDailyLimits({
          meowClicker: 0,
          cryptoQuiz: 0,
          luckySpin: 0,
          treasureHunt: 0,
          battleArena: 0
        })
      } else {
        // Usuário não existe, resetar para 0
        setTotalPoints(0)
        setDailyLimits({
          meowClicker: 0,
          cryptoQuiz: 0,
          luckySpin: 0,
          treasureHunt: 0,
          battleArena: 0
        })
      }

    } catch (error) {
      console.error('Erro ao buscar pontos:', error)
    }
  }

  return {
    totalPoints,
    dailyLimits,
    addPoints,
    fetchUserPoints
  }
}
```

### **PASSO 3: IMPLEMENTAR JOGOS FUNCIONAIS**

**PROBLEMA:** Componentes dos jogos estão vazios ou não funcionam.

**SOLUÇÃO:** Implementar cada jogo com funcionalidades completas.

```typescript
// client/src/components/games/MeowClicker.tsx - IMPLEMENTAR:
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePoints } from '../../hooks/usePoints'

const MeowClicker = () => {
  const { user } = useAuth()
  const { addPoints } = usePoints()
  const [clicks, setClicks] = useState(0)
  const [energy, setEnergy] = useState(100)
  const [isLoading, setIsLoading] = useState(false)

  // Regenerar energia a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => Math.min(100, prev + 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleClick = async () => {
    if (energy <= 0 || isLoading || !user?.wallet_address) return

    setIsLoading(true)
    setEnergy(prev => prev - 1)
    setClicks(prev => prev + 1)

    // Adicionar 1 ponto por clique
    const success = await addPoints('meowClicker', 1, user.wallet_address)
    
    if (success) {
      console.log('Ponto adicionado!')
    }

    setIsLoading(false)
  }

  return (
    <div className="game-card meow-clicker">
      <h3 className="game-title">🐱 Meow Clicker</h3>
      
      <div className="game-stats">
        <div>Cliques: {clicks}</div>
        <div>Energia: {energy}/100</div>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${energy}%` }}
        ></div>
      </div>

      <button 
        className="cyber-button meow-button"
        onClick={handleClick}
        disabled={energy <= 0 || isLoading}
      >
        {isLoading ? '...' : '🐱 MEOW!'}
      </button>

      <div className="game-info">
        <p>Clique no gato para ganhar pontos!</p>
        <p>Energia regenera 1 a cada 5 segundos</p>
      </div>
    </div>
  )
}

export default MeowClicker
```

```typescript
// client/src/components/games/CryptoQuiz.tsx - IMPLEMENTAR:
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePoints } from '../../hooks/usePoints'
import { supabase } from '../../lib/supabase'

interface Question {
  id: number
  question: string
  options: string[]
  correct_answer: number
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
}

const CryptoQuiz = () => {
  const { user } = useAuth()
  const { addPoints } = usePoints()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)

  // Carregar perguntas do Supabase
  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions_expanded')
        .select('*')
        .limit(20)

      if (error) {
        console.error('Erro ao carregar perguntas:', error)
        return
      }

      if (data && data.length > 0) {
        setQuestions(data)
        // Selecionar primeira pergunta aleatória
        const randomIndex = Math.floor(Math.random() * data.length)
        setCurrentQuestion(data[randomIndex])
      }
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error)
    }
  }

  const handleAnswer = async (answerIndex: number) => {
    if (!currentQuestion || !user?.wallet_address || isLoading) return

    setIsLoading(true)
    setSelectedAnswer(answerIndex)

    // Verificar se resposta está correta
    const isCorrect = answerIndex === currentQuestion.correct_answer
    
    if (isCorrect) {
      // Adicionar pontos baseado na dificuldade
      const points = currentQuestion.points || 3
      await addPoints('cryptoQuiz', points, user.wallet_address)
    }

    // Aguardar 2 segundos para mostrar resultado
    setTimeout(() => {
      // Próxima pergunta ou finalizar
      const remainingQuestions = questions.filter(q => q.id !== currentQuestion.id)
      
      if (remainingQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingQuestions.length)
        setCurrentQuestion(remainingQuestions[randomIndex])
        setQuestions(remainingQuestions)
        setSelectedAnswer(null)
      } else {
        setGameComplete(true)
      }
      
      setIsLoading(false)
    }, 2000)
  }

  if (gameComplete) {
    return (
      <div className="game-card crypto-quiz">
        <h3 className="game-title">🧠 Crypto Quiz</h3>
        <div className="game-complete">
          <h4>Quiz Completo! 🎉</h4>
          <p>Volte amanhã para mais perguntas!</p>
          <button 
            className="cyber-button"
            onClick={() => {
              setGameComplete(false)
              loadQuestions()
            }}
          >
            Jogar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="game-card crypto-quiz">
        <h3 className="game-title">🧠 Crypto Quiz</h3>
        <div className="loading">Carregando perguntas...</div>
      </div>
    )
  }

  return (
    <div className="game-card crypto-quiz">
      <h3 className="game-title">🧠 Crypto Quiz</h3>
      
      <div className="question-container">
        <div className="difficulty-badge">
          {currentQuestion.difficulty} - {currentQuestion.points}pts
        </div>
        
        <h4 className="question">{currentQuestion.question}</h4>
        
        <div className="options">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={`option-button ${
                selectedAnswer === index 
                  ? index === currentQuestion.correct_answer 
                    ? 'correct' 
                    : 'incorrect'
                  : ''
              }`}
              onClick={() => handleAnswer(index)}
              disabled={isLoading || selectedAnswer !== null}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CryptoQuiz
```

### **PASSO 4: ADICIONAR CSS CYBERPUNK NEON**

**PROBLEMA:** Falta CSS cyberpunk para os jogos.

**SOLUÇÃO:** Adicionar CSS completo no arquivo principal.

```css
/* Adicionar ao client/src/index.css - CSS CYBERPUNK NEON: */

/* VARIÁVEIS CYBERPUNK NEON */
:root {
  --neon-purple: #9a45fc;
  --neon-cyan: #2ad6d0;
  --neon-yellow: #ffe118;
  --neon-pink: #ff0080;
  --neon-green: #00ff41;
  --dark-bg: #0b0019;
  --dark-card: #1a0d2e;
  --dark-border: #2d1b3d;
}

/* PÁGINA GAMES CYBERPUNK */
.games-page {
  background: linear-gradient(135deg, #0b0019 0%, #1a0d2e 50%, #0b0019 100%);
  min-height: 100vh;
  padding: 20px;
  position: relative;
  overflow-x: hidden;
}

/* EFEITO DE GRID CYBERPUNK NO FUNDO */
.games-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(154, 69, 252, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(154, 69, 252, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-move 20s linear infinite;
  z-index: -1;
}

@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

/* HEADER DE PONTOS */
.points-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background: linear-gradient(145deg, #1a0d2e, #2d1b3d);
  border-radius: 15px;
  border: 2px solid var(--neon-purple);
  box-shadow: 0 0 30px rgba(154, 69, 252, 0.5);
}

.game-title {
  font-size: 32px;
  font-weight: bold;
  color: var(--neon-cyan);
  text-shadow: 
    0 0 10px var(--neon-cyan),
    0 0 20px var(--neon-cyan),
    0 0 30px var(--neon-cyan);
  margin-bottom: 15px;
  animation: title-glow 2s ease-in-out infinite alternate;
}

@keyframes title-glow {
  from { text-shadow: 0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan); }
  to { text-shadow: 0 0 20px var(--neon-cyan), 0 0 30px var(--neon-cyan), 0 0 40px var(--neon-cyan); }
}

.points-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.points-label {
  color: var(--neon-yellow);
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 2px;
}

.points-value {
  color: var(--neon-green);
  font-size: 28px;
  font-weight: bold;
  text-shadow: 0 0 15px var(--neon-green);
}

/* GRID DE JOGOS RESPONSIVO */
.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  margin: 30px 0;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

/* CARDS DOS JOGOS CYBERPUNK NEON */
.game-card {
  background: linear-gradient(145deg, #1a0d2e, #2d1b3d);
  border: 2px solid transparent;
  border-radius: 15px;
  padding: 25px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 
    0 0 20px rgba(154, 69, 252, 0.3),
    inset 0 0 20px rgba(42, 214, 208, 0.1);
}

/* BORDA NEON ANIMADA */
.game-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, 
    var(--neon-purple), 
    var(--neon-cyan), 
    var(--neon-yellow), 
    var(--neon-pink),
    var(--neon-purple)
  );
  background-size: 400% 400%;
  border-radius: 15px;
  z-index: -1;
  animation: neon-border 3s ease-in-out infinite;
}

@keyframes neon-border {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* HOVER EFFECT CYBERPUNK */
.game-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 
    0 20px 40px rgba(154, 69, 252, 0.5),
    0 0 60px rgba(42, 214, 208, 0.3),
    inset 0 0 30px rgba(255, 225, 24, 0.1);
}

/* TÍTULOS DOS JOGOS NEON */
.game-card h3 {
  font-size: 20px;
  font-weight: bold;
  color: var(--neon-cyan);
  text-shadow: 
    0 0 10px var(--neon-cyan),
    0 0 20px var(--neon-cyan);
  margin-bottom: 15px;
  text-align: center;
}

/* BOTÕES CYBERPUNK NEON */
.cyber-button {
  background: linear-gradient(45deg, var(--neon-purple), var(--neon-pink));
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  padding: 12px 24px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 
    0 0 20px rgba(154, 69, 252, 0.5),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
  width: 100%;
  margin: 10px 0;
}

.cyber-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.cyber-button:hover::before {
  left: 100%;
}

.cyber-button:hover {
  transform: scale(1.05);
  box-shadow: 
    0 0 30px rgba(154, 69, 252, 0.8),
    0 0 60px rgba(255, 0, 128, 0.4);
}

.cyber-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* BARRAS DE PROGRESSO NEON */
.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(45, 27, 61, 0.8);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  margin: 10px 0;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-purple));
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
  box-shadow: 
    0 0 10px var(--neon-cyan),
    0 0 20px var(--neon-purple);
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: progress-shine 2s linear infinite;
}

@keyframes progress-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* STATS DOS JOGOS */
.game-stats {
  display: flex;
  justify-content: space-between;
  margin: 15px 0;
  color: var(--neon-yellow);
  font-weight: bold;
}

.game-info {
  margin-top: 15px;
  color: #cccccc;
  font-size: 12px;
  text-align: center;
}

/* QUIZ ESPECÍFICO */
.question-container {
  margin: 20px 0;
}

.difficulty-badge {
  background: var(--neon-purple);
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
  display: inline-block;
  margin-bottom: 15px;
}

.question {
  color: white;
  margin: 15px 0;
  font-size: 16px;
  line-height: 1.4;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-button {
  background: rgba(45, 27, 61, 0.8);
  border: 1px solid var(--neon-purple);
  border-radius: 8px;
  color: white;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.option-button:hover {
  background: rgba(154, 69, 252, 0.3);
  border-color: var(--neon-cyan);
}

.option-button.correct {
  background: rgba(0, 255, 65, 0.3);
  border-color: var(--neon-green);
}

.option-button.incorrect {
  background: rgba(255, 0, 128, 0.3);
  border-color: var(--neon-pink);
}

/* RESPONSIVIDADE MOBILE */
@media (max-width: 768px) {
  .games-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 0 10px;
  }
  
  .game-card {
    padding: 20px;
  }
  
  .game-title {
    font-size: 24px;
  }
  
  .points-value {
    font-size: 24px;
  }
}
```

---

## 🚀 **IMPLEMENTAÇÃO OBRIGATÓRIA:**

### **EXECUTE ESTAS CORREÇÕES NA ORDEM:**

1. **Corrigir Games.tsx** - Usar useAuth ao invés de useWallet
2. **Corrigir usePoints.ts** - Usar tabela users existente
3. **Implementar MeowClicker.tsx** - Jogo funcional completo
4. **Implementar CryptoQuiz.tsx** - Quiz com perguntas do Supabase
5. **Adicionar CSS cyberpunk** - Visual neon completo
6. **Implementar outros jogos** - LuckySpin, TreasureHunt, BattleArena

### **VERIFICAÇÕES OBRIGATÓRIAS:**

- ✅ Games.tsx usa useAuth (não useWallet)
- ✅ usePoints.ts usa tabela users
- ✅ Todos os jogos renderizam conteúdo
- ✅ CSS cyberpunk aplicado
- ✅ Pontos funcionando corretamente
- ✅ Carteira detectada automaticamente

---

## ✅ **RESULTADO ESPERADO:**

Após implementar:
- ✅ **Página Games funcional** - Detecta carteira automaticamente
- ✅ **Jogos funcionando** - MeowClicker e CryptoQuiz completos
- ✅ **Sistema de pontos robusto** - Conectado ao Supabase
- ✅ **Visual cyberpunk neon** - Efeitos avançados
- ✅ **Zero erros** - Sistema estável e confiável

**EXECUTE ESTE PROMPT AGORA PARA CORRIGIR TODOS OS PROBLEMAS!** 🚀

