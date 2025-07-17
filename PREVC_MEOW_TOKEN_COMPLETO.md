# 🐱 PREVC - MEOW Token: Planejamento Completo para Claude Code

**Documento:** PREVC (Planejamento, Revisão, Execução, Validação e Confirmação)  
**Projeto:** MEOW Token - Sistema de Airdrop Gamificado  
**Autor:** Manus AI  
**Data:** 17 de Julho de 2025  
**Versão:** 1.0  

---

## 📋 **ÍNDICE**

1. [Planejamento (P)](#planejamento)
2. [Revisão (R)](#revisão)
3. [Execução (E)](#execução)
4. [Validação (V)](#validação)
5. [Confirmação (C)](#confirmação)
6. [Anexos e Referências](#anexos)

---

## 🎯 **PLANEJAMENTO (P)**

### **Visão Geral do Projeto**

O MEOW Token representa uma revolução no conceito de airdrops tradicionais, transformando a distribuição passiva de tokens em uma experiência interativa e gamificada. Este projeto combina elementos de jogos, blockchain Solana, sistema de pontos robusto e uma interface cyberpunk moderna para criar o mais avançado sistema de airdrop do mercado.

### **Objetivos Estratégicos**

**Objetivo Principal:** Desenvolver um ecossistema completo de airdrop gamificado que maximize o engajamento dos usuários através de jogos interativos, sistema de pontos transparente e integração nativa com a blockchain Solana.

**Objetivos Secundários:**
- Implementar cinco jogos únicos que recompensem os usuários com pontos válidos para o TGE (Token Generation Event)
- Criar um sistema de autenticação híbrido que combine login Google com conexão opcional de carteira Phantom
- Desenvolver uma interface cyberpunk responsiva que funcione perfeitamente em dispositivos desktop e mobile
- Estabelecer um sistema de pré-venda interativo com barra de progresso em tempo real
- Implementar medidas de segurança enterprise-grade para proteger dados e transações dos usuários

### **Arquitetura Técnica Planejada**

**Frontend Stack:**
- React 18 com TypeScript para tipagem estática e desenvolvimento robusto
- Tailwind CSS para estilização moderna e responsiva
- Vite como build tool para desenvolvimento otimizado
- Componentes modulares para máxima reutilização

**Backend e Banco de Dados:**
- Supabase como Backend-as-a-Service principal
- PostgreSQL para armazenamento de dados estruturados
- Row Level Security (RLS) para proteção granular de dados
- Real-time subscriptions para atualizações instantâneas

**Integração Blockchain:**
- Solana Web3.js para interação nativa com a blockchain
- Phantom Wallet como carteira principal suportada
- Jupiter API para funcionalidades de swap e preços
- Metaplex para padrões NFT quando necessário

### **Cronograma de Desenvolvimento**

**Fase 1 - Fundação (Dias 1-3):**
- Configuração do ambiente de desenvolvimento
- Implementação do sistema de autenticação híbrido
- Criação da estrutura base da interface

**Fase 2 - Core Features (Dias 4-7):**
- Desenvolvimento dos cinco jogos gamificados
- Implementação do sistema de pontos com Supabase
- Integração com carteiras Solana

**Fase 3 - Funcionalidades Avançadas (Dias 8-10):**
- Sistema de pré-venda com barra de progresso
- Ranking global em tempo real
- Otimizações de performance

**Fase 4 - Polimento e Deploy (Dias 11-14):**
- Testes de segurança e performance
- Documentação completa
- Deploy em produção

### **Recursos Necessários**

**Tecnológicos:**
- Ambiente de desenvolvimento configurado (Node.js, npm/yarn)
- Acesso ao Supabase com projeto configurado
- Chaves de API para integrações externas
- Domínio e hospedagem para deploy

**Humanos:**
- Claude Code como desenvolvedor principal
- Suporte técnico para questões específicas de blockchain
- Designer para refinamentos visuais (opcional)

---



## 🔍 **REVISÃO (R)**

### **Análise da Estrutura Atual do Projeto**

Após análise detalhada dos arquivos existentes no repositório, identificamos uma base sólida com mais de 80 documentos técnicos, prompts de implementação e scripts de banco de dados. A estrutura atual demonstra um planejamento meticuloso e abrangente que cobre todos os aspectos necessários para o desenvolvimento.

### **Documentação Existente - Análise Crítica**

**Pontos Fortes Identificados:**

A documentação existente apresenta qualidade excepcional em várias áreas críticas. O arquivo `GUIA_CONTROLE_TOTAL_SUPABASE.md` fornece instruções detalhadas para gerenciamento completo do banco de dados, incluindo operações CRUD, controle de usuários e monitoramento em tempo real. Esta documentação é particularmente valiosa pois permite controle administrativo total sem necessidade de conhecimento técnico avançado.

O `PRD_SISTEMA_LOGIN_MEOW_TOKEN.md` apresenta especificações técnicas precisas para implementação do sistema de autenticação híbrido. Este documento detalha o fluxo completo desde o login Google até a conexão opcional da carteira Phantom, incluindo verificação de email e medidas de segurança. A abordagem híbrida é inovadora no espaço Web3, oferecendo uma experiência de usuário superior comparada aos sistemas tradicionais que exigem carteira desde o primeiro acesso.

Os prompts de implementação, especialmente `PROMPT_AGENTE_REPLIT_ATUALIZADO_FINAL.md`, demonstram compreensão profunda dos desafios técnicos envolvidos. Estes documentos incluem instruções específicas para correção de bugs comuns, otimização de performance e implementação de funcionalidades avançadas.

**Áreas de Melhoria Identificadas:**

Embora a documentação seja abrangente, observamos algumas lacunas que devem ser endereçadas durante a implementação. A integração entre diferentes componentes poderia ser melhor documentada, especialmente as dependências entre o sistema de pontos e os jogos individuais. Adicionalmente, faltam especificações detalhadas para tratamento de edge cases, como comportamento do sistema durante falhas de rede ou indisponibilidade temporária do Supabase.

### **Análise dos Componentes de Jogos**

**MeowClicker - Análise Técnica:**

O componente MeowClicker representa um jogo incremental clássico adaptado para o contexto blockchain. A implementação atual inclui sistema de energia com regeneração automática, multiplicadores progressivos e animações visuais atrativas. O sistema de pontuação está integrado com o Supabase, garantindo persistência e validação dos dados.

Pontos de atenção incluem a necessidade de balanceamento cuidadoso para evitar farming excessivo de pontos. O sistema atual limita cliques diários, mas a implementação deve incluir validação server-side para prevenir manipulação client-side.

**CryptoQuiz - Análise de Conteúdo:**

O banco de dados de perguntas contém mais de 30 questões categorizadas por dificuldade, cobrindo tópicos desde conceitos básicos de blockchain até DeFi avançado. A classificação em três níveis (Fácil: 3 pontos, Médio: 7 pontos, Difícil: 15 pontos) oferece progressão natural e incentiva aprendizado.

A implementação deve focar na randomização efetiva das perguntas e prevenção de memorização de padrões. O sistema de timer adiciona pressão temporal apropriada, mas deve incluir tolerância para latência de rede.

**LuckySpin, TreasureHunt e BattleArena - Considerações de Design:**

Estes jogos representam diferentes mecânicas de gamificação, desde sorte pura (LuckySpin) até estratégia (BattleArena). A diversidade é crucial para manter diferentes tipos de usuários engajados. Cada jogo deve ter limites diários claros e sistemas anti-cheat robustos.

### **Avaliação da Integração Blockchain**

**Solana Web3.js - Implementação Atual:**

A escolha da Solana como blockchain base é estratégica, oferecendo transações rápidas e custos baixos essenciais para uma experiência de usuário fluida. A integração com Phantom Wallet está bem documentada, incluindo tratamento de erros e estados de conexão.

**Considerações de Segurança:**

O sistema atual implementa validação de assinatura para todas as transações relacionadas a pontos. Esta abordagem garante que apenas usuários com carteiras válidas possam acumular pontos elegíveis para o TGE. A implementação deve incluir rate limiting e detecção de comportamento anômalo.

### **Análise do Sistema de Banco de Dados**

**Estrutura do Supabase:**

O schema do banco de dados é bem estruturado, com tabelas normalizadas para usuários, jogos, pontos e transações. As políticas RLS estão configuradas adequadamente para proteger dados sensíveis. O sistema de triggers automáticos garante consistência de dados e atualizações em tempo real.

**Performance e Escalabilidade:**

A estrutura atual suporta crescimento significativo, mas deve incluir índices otimizados para consultas frequentes. O sistema de ranking global requer atenção especial para performance, especialmente com milhares de usuários simultâneos.

### **Interface e Experiência do Usuário**

**Design Cyberpunk - Análise Visual:**

A paleta de cores escolhida (#9a45fc, #2ad6d0, #ffe118, #0b0019) cria uma identidade visual forte e moderna. O tema cyberpunk é apropriado para o público-alvo crypto-nativo, mas deve manter usabilidade para usuários menos técnicos.

**Responsividade e Acessibilidade:**

A implementação deve priorizar experiência mobile, considerando que muitos usuários crypto acessam dApps via dispositivos móveis. Elementos de interface devem ser touch-friendly e navegação deve ser intuitiva.

---


## ⚡ **EXECUÇÃO (E)**

### **Configuração do Ambiente de Desenvolvimento**

**Pré-requisitos Essenciais:**

Antes de iniciar o desenvolvimento, é fundamental estabelecer um ambiente robusto que suporte todas as tecnologias necessárias. O ambiente deve incluir Node.js versão 18 ou superior, npm ou yarn como gerenciador de pacotes, e Git para controle de versão. Adicionalmente, recomenda-se o uso do Visual Studio Code com extensões específicas para React, TypeScript e Tailwind CSS.

**Clonagem e Configuração Inicial:**

```bash
# Clone do repositório
git clone https://github.com/meowtoken-space/CryptoAirdrop.git
cd CryptoAirdrop

# Instalação de dependências
npm install
# ou
yarn install

# Configuração de variáveis de ambiente
cp .env.example .env.local
```

**Estrutura de Pastas Recomendada:**

```
src/
├── components/
│   ├── games/
│   │   ├── MeowClicker.tsx
│   │   ├── CryptoQuiz.tsx
│   │   ├── LuckySpin.tsx
│   │   ├── TreasureHunt.tsx
│   │   └── BattleArena.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── GoogleAuth.tsx
│   │   └── WalletConnect.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingSpinner.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useWallet.ts
│   ├── usePoints.ts
│   └── useSupabase.ts
├── lib/
│   ├── supabase.ts
│   ├── solana.ts
│   └── utils.ts
├── pages/
│   ├── Home.tsx
│   ├── Games.tsx
│   ├── Ranking.tsx
│   └── Profile.tsx
└── styles/
    ├── globals.css
    └── components.css
```

### **Implementação do Sistema de Autenticação**

**Configuração do Supabase:**

O primeiro passo crítico envolve a configuração adequada do Supabase como backend principal. Esta configuração deve incluir a criação de um novo projeto, configuração das variáveis de ambiente e implementação das políticas de Row Level Security (RLS).

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Configuração de autenticação
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}
```

**Implementação do Hook de Autenticação:**

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

### **Desenvolvimento dos Componentes de Jogos**

**MeowClicker - Implementação Detalhada:**

O MeowClicker representa o jogo mais simples mas fundamental do ecossistema. Sua implementação deve focar na responsividade, feedback visual imediato e integração robusta com o sistema de pontos.

```typescript
// components/games/MeowClicker.tsx
import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { usePoints } from '../../hooks/usePoints'

export const MeowClicker: React.FC = () => {
  const [energy, setEnergy] = useState(100)
  const [clicks, setClicks] = useState(0)
  const [multiplier, setMultiplier] = useState(1)
  const { connected, publicKey } = useWallet()
  const { addPoints } = usePoints()

  // Sistema de regeneração de energia
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => Math.min(100, prev + 1))
    }, 5000) // Regenera 1 energia a cada 5 segundos

    return () => clearInterval(interval)
  }, [])

  // Sistema de multiplicadores
  useEffect(() => {
    if (clicks > 0 && clicks % 100 === 0) {
      setMultiplier(prev => prev + 0.1)
    }
  }, [clicks])

  const handleClick = async () => {
    if (!connected || !publicKey || energy <= 0) return

    const pointsEarned = 1 * multiplier
    setEnergy(prev => prev - 1)
    setClicks(prev => prev + 1)

    // Adicionar pontos ao sistema
    await addPoints('meowclicker', pointsEarned, publicKey.toString())
  }

  return (
    <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-6 rounded-lg">
      <h3 className="text-2xl font-bold text-white mb-4">🐱 Meow Clicker</h3>
      
      {/* Barra de energia */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Energia</span>
          <span>{energy}/100</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${energy}%` }}
          />
        </div>
      </div>

      {/* Botão principal */}
      <button
        onClick={handleClick}
        disabled={!connected || energy <= 0}
        className={`w-full h-32 rounded-lg text-6xl transition-all duration-200 ${
          connected && energy > 0
            ? 'bg-purple-600 hover:bg-purple-500 hover:scale-105 active:scale-95'
            : 'bg-gray-600 cursor-not-allowed'
        }`}
      >
        🐱
      </button>

      {/* Estatísticas */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-yellow-400">{clicks}</div>
          <div className="text-sm text-gray-300">Cliques</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-400">{multiplier.toFixed(1)}x</div>
          <div className="text-sm text-gray-300">Multiplicador</div>
        </div>
      </div>
    </div>
  )
}
```

**CryptoQuiz - Sistema de Perguntas:**

O CryptoQuiz requer implementação mais complexa, incluindo gerenciamento de estado para perguntas, timer, e sistema de pontuação baseado em dificuldade.

```typescript
// components/games/CryptoQuiz.tsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface Question {
  id: number
  question: string
  options: string[]
  correct_answer: number
  difficulty: 'easy' | 'medium' | 'hard'
  explanation: string
}

export const CryptoQuiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [score, setScore] = useState(0)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)

  // Carregar pergunta aleatória
  const loadRandomQuestion = async () => {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .order('RANDOM()')
      .limit(1)
      .single()

    if (data) {
      setCurrentQuestion(data)
      setSelectedAnswer(null)
      setTimeLeft(30)
    }
  }

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && currentQuestion) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      handleAnswer(null) // Tempo esgotado
    }
  }, [timeLeft, currentQuestion])

  const handleAnswer = async (answerIndex: number | null) => {
    if (!currentQuestion) return

    const isCorrect = answerIndex === currentQuestion.correct_answer
    let points = 0

    if (isCorrect) {
      // Pontuação baseada na dificuldade
      const basePoints = {
        easy: 3,
        medium: 7,
        hard: 15
      }[currentQuestion.difficulty]

      // Bônus de velocidade
      const speedBonus = timeLeft > 20 ? 1.5 : timeLeft > 10 ? 1.25 : 1
      points = Math.floor(basePoints * speedBonus)

      setScore(prev => prev + points)
    }

    setQuestionsAnswered(prev => prev + 1)

    // Adicionar pontos ao sistema
    if (points > 0) {
      await addPoints('cryptoquiz', points, publicKey?.toString())
    }

    // Carregar próxima pergunta após delay
    setTimeout(() => {
      if (questionsAnswered < 19) { // Limite de 20 perguntas por dia
        loadRandomQuestion()
      }
    }, 2000)
  }

  return (
    <div className="bg-gradient-to-br from-blue-900 to-purple-900 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-white">🧠 Crypto Quiz</h3>
        <div className="text-right">
          <div className="text-lg font-bold text-yellow-400">{score} pts</div>
          <div className="text-sm text-gray-300">{questionsAnswered}/20</div>
        </div>
      </div>

      {currentQuestion && (
        <>
          {/* Timer */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-300 mb-1">
              <span>Tempo</span>
              <span>{timeLeft}s</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  timeLeft > 10 ? 'bg-green-400' : 'bg-red-400'
                }`}
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              />
            </div>
          </div>

          {/* Pergunta */}
          <div className="mb-6">
            <div className="text-sm text-gray-300 mb-2">
              Dificuldade: {currentQuestion.difficulty.toUpperCase()}
            </div>
            <h4 className="text-lg font-semibold text-white">
              {currentQuestion.question}
            </h4>
          </div>

          {/* Opções */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`w-full p-3 text-left rounded-lg transition-all ${
                  selectedAnswer === null
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : selectedAnswer === index
                    ? index === currentQuestion.correct_answer
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                    : index === currentQuestion.correct_answer
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Explicação */}
          {selectedAnswer !== null && (
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <h5 className="font-semibold text-cyan-400 mb-2">Explicação:</h5>
              <p className="text-gray-300 text-sm">{currentQuestion.explanation}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

### **Integração com Solana e Phantom Wallet**

**Configuração do Wallet Adapter:**

```typescript
// lib/solana.ts
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { clusterApiUrl } from '@solana/web3.js'

const network = WalletAdapterNetwork.Mainnet
const endpoint = clusterApiUrl(network)

const wallets = [
  new PhantomWalletAdapter(),
]

export { endpoint, wallets }
```

**Hook para Gerenciamento de Pontos:**

```typescript
// hooks/usePoints.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useWallet } from '@solana/wallet-adapter-react'

export const usePoints = () => {
  const [totalPoints, setTotalPoints] = useState(0)
  const [dailyPoints, setDailyPoints] = useState(0)
  const [loading, setLoading] = useState(false)
  const { publicKey } = useWallet()

  const addPoints = async (gameType: string, points: number, walletAddress: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_points')
        .insert({
          wallet_address: walletAddress,
          game_type: gameType,
          points: points,
          earned_at: new Date().toISOString()
        })

      if (!error) {
        setTotalPoints(prev => prev + points)
        setDailyPoints(prev => prev + points)
      }

      return { success: !error, error }
    } catch (error) {
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPoints = async () => {
    if (!publicKey) return

    const { data, error } = await supabase
      .from('user_points')
      .select('points')
      .eq('wallet_address', publicKey.toString())

    if (data) {
      const total = data.reduce((sum, record) => sum + record.points, 0)
      setTotalPoints(total)
    }
  }

  useEffect(() => {
    if (publicKey) {
      fetchUserPoints()
    }
  }, [publicKey])

  return {
    totalPoints,
    dailyPoints,
    loading,
    addPoints,
    fetchUserPoints
  }
}
```

### **Sistema de Ranking Global**

**Componente de Ranking:**

```typescript
// components/Ranking.tsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface RankingEntry {
  wallet_address: string
  total_points: number
  rank: number
}

export const GlobalRanking: React.FC = () => {
  const [rankings, setRankings] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRankings()

    // Atualizar ranking a cada 30 segundos
    const interval = setInterval(fetchRankings, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchRankings = async () => {
    const { data, error } = await supabase
      .from('user_rankings')
      .select('*')
      .order('total_points', { ascending: false })
      .limit(50)

    if (data) {
      setRankings(data.map((entry, index) => ({
        ...entry,
        rank: index + 1
      })))
    }
    setLoading(false)
  }

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-purple-900 p-6 rounded-lg">
      <h3 className="text-2xl font-bold text-white mb-6">🏆 Ranking Global</h3>
      
      {loading ? (
        <div className="text-center text-gray-400">Carregando rankings...</div>
      ) : (
        <div className="space-y-2">
          {rankings.map((entry) => (
            <div
              key={entry.wallet_address}
              className={`flex items-center justify-between p-3 rounded-lg ${
                entry.rank <= 3
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-700'
                  : 'bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  entry.rank === 1 ? 'bg-yellow-400 text-black' :
                  entry.rank === 2 ? 'bg-gray-300 text-black' :
                  entry.rank === 3 ? 'bg-orange-400 text-black' :
                  'bg-gray-600 text-white'
                }`}>
                  {entry.rank}
                </div>
                <div>
                  <div className="font-mono text-white">
                    {formatWalletAddress(entry.wallet_address)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-yellow-400">
                  {entry.total_points.toLocaleString()}
                </div>
                <div className="text-sm text-gray-300">pontos</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---


## ✅ **VALIDAÇÃO (V)**

### **Testes de Funcionalidade**

**Testes de Autenticação:**

O sistema de autenticação híbrido requer validação rigorosa em múltiplos cenários. Os testes devem cobrir login com Google, verificação de email, conexão de carteira Phantom e transições entre estados autenticados e não autenticados. Cada fluxo deve ser testado em diferentes navegadores e dispositivos para garantir compatibilidade universal.

Cenários críticos incluem: usuário fazendo login apenas com Google, usuário conectando carteira após login, usuário tentando acessar jogos sem carteira conectada, e usuário desconectando carteira durante uma sessão ativa. Todos esses cenários devem resultar em comportamento previsível e mensagens de erro claras.

**Validação dos Jogos:**

Cada jogo requer bateria específica de testes para garantir funcionamento correto e prevenção de exploits. Para o MeowClicker, testes devem verificar: regeneração correta de energia, aplicação adequada de multiplicadores, limites diários funcionando, e impossibilidade de cliques sem energia ou carteira conectada.

O CryptoQuiz necessita validação de: carregamento aleatório de perguntas, funcionamento correto do timer, cálculo preciso de pontuação baseada em dificuldade e velocidade, e prevenção de respostas múltiplas para a mesma pergunta.

**Testes de Integração Blockchain:**

A integração com Solana deve ser testada extensivamente para garantir robustez. Testes devem incluir: conexão e desconexão de carteira, validação de assinatura para transações de pontos, comportamento durante falhas de rede, e recuperação após reconexão.

Cenários de edge case incluem: usuário mudando de carteira durante sessão ativa, múltiplas tentativas de conexão simultâneas, e comportamento quando Phantom não está instalado.

### **Testes de Performance**

**Carga do Sistema:**

O sistema deve suportar centenas de usuários simultâneos sem degradação significativa de performance. Testes de carga devem simular: múltiplos usuários jogando simultaneamente, atualizações frequentes do ranking global, e picos de tráfego durante eventos especiais.

Métricas importantes incluem: tempo de resposta para adição de pontos (< 500ms), atualização do ranking global (< 2 segundos), e carregamento inicial da aplicação (< 3 segundos).

**Otimização de Banco de Dados:**

Consultas ao Supabase devem ser otimizadas para performance máxima. Índices devem ser criados para: wallet_address, game_type, earned_at, e total_points. Consultas complexas como ranking global devem usar views materializadas quando possível.

### **Testes de Segurança**

**Validação de Entrada:**

Todos os inputs do usuário devem ser validados tanto no frontend quanto no backend. Testes devem verificar: prevenção de SQL injection, validação de endereços de carteira, sanitização de dados de entrada, e rate limiting para prevenir spam.

**Autenticação e Autorização:**

Políticas RLS do Supabase devem ser testadas rigorosamente para garantir que usuários só possam acessar seus próprios dados. Testes devem incluir: tentativas de acesso a dados de outros usuários, manipulação de tokens de autenticação, e bypass de verificações de carteira.

### **Testes de Usabilidade**

**Interface Mobile:**

A aplicação deve funcionar perfeitamente em dispositivos móveis. Testes devem cobrir: responsividade em diferentes tamanhos de tela, usabilidade de botões touch, performance em dispositivos com recursos limitados, e integração com carteiras mobile.

**Acessibilidade:**

A interface deve ser acessível para usuários com diferentes necessidades. Testes devem verificar: navegação por teclado, compatibilidade com leitores de tela, contraste adequado de cores, e tamanhos de fonte legíveis.

---

## 🎯 **CONFIRMAÇÃO (C)**

### **Critérios de Aceitação**

**Funcionalidades Obrigatórias:**

Para considerar o projeto completo, todas as funcionalidades core devem estar implementadas e funcionando corretamente. Isso inclui: sistema de autenticação híbrido totalmente funcional, cinco jogos implementados com sistema de pontos integrado, ranking global atualizando em tempo real, e interface cyberpunk responsiva.

Cada jogo deve ter: limites diários funcionando corretamente, sistema anti-cheat implementado, integração com Supabase para persistência de dados, e feedback visual adequado para todas as ações do usuário.

**Métricas de Performance:**

O sistema deve atender aos seguintes benchmarks: tempo de carregamento inicial inferior a 3 segundos, resposta de adição de pontos inferior a 500ms, atualização de ranking global inferior a 2 segundos, e suporte para pelo menos 500 usuários simultâneos sem degradação.

**Segurança e Confiabilidade:**

Todas as medidas de segurança devem estar implementadas: validação de carteira para todas as transações de pontos, políticas RLS configuradas corretamente no Supabase, rate limiting implementado para prevenir abuse, e logs de auditoria para todas as ações críticas.

### **Processo de Deploy**

**Ambiente de Staging:**

Antes do deploy em produção, o sistema deve ser testado em ambiente de staging que replica exatamente a configuração de produção. Todos os testes de funcionalidade, performance e segurança devem passar no staging antes de prosseguir.

**Deploy em Produção:**

O deploy deve seguir processo controlado com: backup completo do banco de dados antes de mudanças, deploy gradual com monitoramento de métricas, rollback plan preparado em caso de problemas, e verificação pós-deploy de todas as funcionalidades críticas.

**Monitoramento Pós-Deploy:**

Após o deploy, o sistema deve ser monitorado continuamente para: detecção precoce de problemas, análise de performance em condições reais, feedback dos usuários, e identificação de oportunidades de otimização.

### **Documentação Final**

**Documentação Técnica:**

A documentação deve incluir: guia completo de instalação e configuração, documentação de API para todas as integrações, guia de troubleshooting para problemas comuns, e especificações técnicas detalhadas de cada componente.

**Documentação do Usuário:**

Usuários devem ter acesso a: guia de primeiros passos, explicação detalhada de cada jogo, FAQ com perguntas comuns, e canais de suporte para dúvidas adicionais.

### **Plano de Manutenção**

**Atualizações Regulares:**

O sistema deve ter plano de manutenção que inclui: atualizações de segurança mensais, otimizações de performance baseadas em dados de uso, adição de novos jogos e funcionalidades, e correção proativa de bugs identificados.

**Backup e Recuperação:**

Estratégia de backup deve incluir: backups automáticos diários do banco de dados, backups semanais completos do sistema, testes regulares de procedimentos de recuperação, e plano de disaster recovery documentado.

---

## 📚 **ANEXOS E REFERÊNCIAS**

### **Estrutura Completa de Arquivos**

**Arquivos de Configuração:**
- `.env.example` - Template de variáveis de ambiente
- `package.json` - Dependências e scripts do projeto
- `tailwind.config.js` - Configuração do Tailwind CSS
- `tsconfig.json` - Configuração do TypeScript

**Componentes React:**
- `components/games/` - Todos os jogos implementados
- `components/auth/` - Sistema de autenticação
- `components/ui/` - Componentes de interface reutilizáveis
- `components/layout/` - Estrutura de layout da aplicação

**Hooks Customizados:**
- `hooks/useAuth.ts` - Gerenciamento de autenticação
- `hooks/useWallet.ts` - Integração com carteiras Solana
- `hooks/usePoints.ts` - Sistema de pontos
- `hooks/useSupabase.ts` - Integração com Supabase

**Utilitários e Configurações:**
- `lib/supabase.ts` - Cliente e configurações do Supabase
- `lib/solana.ts` - Configurações da blockchain Solana
- `lib/utils.ts` - Funções utilitárias gerais

### **Scripts SQL do Supabase**

**Tabelas Principais:**
```sql
-- Usuários
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  wallet_address TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pontos dos usuários
CREATE TABLE user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  game_type TEXT NOT NULL,
  points INTEGER NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Perguntas do quiz
CREATE TABLE quiz_questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  explanation TEXT NOT NULL,
  category TEXT NOT NULL
);
```

**Políticas RLS:**
```sql
-- Política para user_points
CREATE POLICY "Users can only see their own points" ON user_points
  FOR SELECT USING (wallet_address = auth.jwt() ->> 'wallet_address');

CREATE POLICY "Users can only insert their own points" ON user_points
  FOR INSERT WITH CHECK (wallet_address = auth.jwt() ->> 'wallet_address');
```

### **Comandos de Deploy**

**Desenvolvimento Local:**
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Executar em modo desenvolvimento
npm run dev
```

**Build para Produção:**
```bash
# Build da aplicação
npm run build

# Testar build localmente
npm run start

# Deploy (exemplo com Vercel)
vercel --prod
```

### **Variáveis de Ambiente Necessárias**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica_do_supabase

# Google OAuth
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret

# Solana
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Aplicação
NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET=sua_chave_secreta_aleatoria
```

### **Links e Recursos Importantes**

**Repositório GitHub:**
- URL: https://github.com/meowtoken-space/CryptoAirdrop
- Clone HTTPS: `git clone https://github.com/meowtoken-space/CryptoAirdrop.git`
- Download ZIP: https://github.com/meowtoken-space/CryptoAirdrop/archive/refs/heads/main.zip

**Documentação de Referência:**
- [Supabase Documentation](https://supabase.com/docs)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Phantom Wallet Integration](https://docs.phantom.app/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

**APIs Utilizadas:**
- Supabase: Backend-as-a-Service principal
- Google OAuth: Autenticação social
- Solana RPC: Interação com blockchain
- Jupiter API: Preços e swaps (futuro)

---

## 🎯 **CONCLUSÃO**

Este documento PREVC fornece um roadmap completo e detalhado para implementação do projeto MEOW Token usando Claude Code. Cada seção foi cuidadosamente elaborada para garantir que o desenvolvimento seja eficiente, seguro e resulte em um produto final de alta qualidade.

O projeto representa uma evolução significativa no conceito de airdrops, combinando gamificação, blockchain e experiência de usuário moderna para criar um ecossistema único e envolvente. A implementação seguindo este guia resultará em uma aplicação robusta, escalável e pronta para produção.

**Próximos Passos Recomendados:**
1. Clone o repositório no ambiente de desenvolvimento
2. Configure as variáveis de ambiente necessárias
3. Execute os scripts SQL no Supabase
4. Implemente os componentes seguindo a ordem sugerida
5. Teste cada funcionalidade conforme implementada
6. Deploy em ambiente de staging para testes finais
7. Deploy em produção com monitoramento ativo

**Autor:** Manus AI  
**Data de Criação:** 17 de Julho de 2025  
**Versão:** 1.0  
**Status:** Completo e Pronto para Implementação

