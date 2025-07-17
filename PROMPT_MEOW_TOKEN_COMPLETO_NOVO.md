# 🚀 PROMPT COMPLETO: MEOW TOKEN SISTEMA FINAL

## 🎯 **OBJETIVO PRINCIPAL**

Criar sistema completo MEOW TOKEN com sidebar navigation, 8 seções principais, jogos funcionais, banco Supabase integrado, backgrounds animados e interface cyberpunk moderna.

---

## 🏗️ **ESTRUTURA FINAL DO SISTEMA**

### **MENU PRINCIPAL (SIDEBAR):**
```
Home
Games
Missions
Ranking
NFT
Learning
Pre-Sale
Tokenomics
```

---

## 🛠️ **IMPLEMENTAÇÃO COMPLETA**

### **PASSO 1: INSTALAR DEPENDÊNCIAS**

```bash
npm install gsap ogl @solana/wallet-adapter-react @solana/wallet-adapter-wallets @solana/wallet-adapter-react-ui @solana/web3.js @supabase/supabase-js
```

### **PASSO 2: CONFIGURAR VARIÁVEIS DE AMBIENTE**

**Criar: `.env`**
```env
VITE_SUPABASE_URL=https://lixusjljqwqmxduvjffy.supabase.co
VITE_SUPABASE_ANON_KEY=[sua_chave_anon_aqui]
VITE_ADMIN_WALLET=DM5bzL1MWThBjhFVXRWzFtYKjqf5Vwhhs2jVzr68hYoV
```

### **PASSO 3: CONFIGURAR TAILWIND**

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
        'float': 'float 3s ease-in-out infinite',
        'spin': 'spin 1s linear infinite',
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
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
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

### **PASSO 4: CRIAR BANCO DE DADOS SUPABASE**

**Execute no SQL Editor do Supabase:**
```sql
-- Tabela principal de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_daily_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de jogos
CREATE TABLE IF NOT EXISTS game_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  points_earned INTEGER DEFAULT 0,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de perguntas do quiz
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de inimigos para Battle Arena
CREATE TABLE IF NOT EXISTS battle_enemies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  health INTEGER NOT NULL,
  attack INTEGER NOT NULL,
  defense INTEGER NOT NULL,
  level INTEGER NOT NULL,
  reward_points INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de missões
CREATE TABLE IF NOT EXISTS missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'achievement')),
  target_value INTEGER NOT NULL,
  reward_points INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de progresso de missões
CREATE TABLE IF NOT EXISTS mission_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  current_value INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mission_id)
);

-- Tabela de NFTs
CREATE TABLE IF NOT EXISTS nfts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  price_points INTEGER NOT NULL,
  supply INTEGER NOT NULL,
  minted INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de NFTs dos usuários
CREATE TABLE IF NOT EXISTS user_nfts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nft_id UUID REFERENCES nfts(id) ON DELETE CASCADE,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, nft_id)
);

-- Inserir perguntas do quiz
INSERT INTO quiz_questions (question, options, correct_answer, difficulty, points, category) VALUES
('Quem criou o Bitcoin?', '["Satoshi Nakamoto", "Vitalik Buterin", "Charlie Lee", "Roger Ver"]', 0, 'easy', 3, 'bitcoin'),
('Em que ano o Bitcoin foi criado?', '["2008", "2009", "2010", "2007"]', 1, 'easy', 3, 'bitcoin'),
('Qual é o limite máximo de Bitcoins?', '["21 milhões", "100 milhões", "50 milhões", "Ilimitado"]', 0, 'medium', 7, 'bitcoin'),
('O que significa DeFi?', '["Decentralized Finance", "Digital Finance", "Distributed Finance", "Dynamic Finance"]', 0, 'easy', 3, 'defi'),
('Quem criou o Ethereum?', '["Vitalik Buterin", "Satoshi Nakamoto", "Charles Hoskinson", "Gavin Wood"]', 0, 'easy', 3, 'ethereum'),
('O que é yield farming?', '["Estratégia para ganhar recompensas em DeFi", "Mineração de Bitcoin", "Compra de NFTs", "Trading de altcoins"]', 0, 'medium', 7, 'defi'),
('O que significa NFT?', '["Non-Fungible Token", "New Financial Technology", "Network File Transfer", "Next Future Token"]', 0, 'easy', 3, 'nft'),
('O que é Proof of History (PoH)?', '["Algoritmo de consenso do Solana", "Protocolo do Bitcoin", "Sistema do Ethereum", "Método de staking"]', 0, 'hard', 15, 'solana'),
('Quantas transações por segundo o Solana processa?', '["65.000+", "15", "2.000", "100.000"]', 0, 'hard', 15, 'solana'),
('O que é uma carteira de criptomoedas?', '["Software para armazenar chaves privadas", "Banco digital", "Exchange de crypto", "Mineradora"]', 0, 'easy', 3, 'wallet'),
('O que significa HODL?', '["Hold On for Dear Life", "High Order Digital Ledger", "Hash of Distributed Ledger", "Hybrid Online Data Link"]', 0, 'medium', 7, 'trading'),
('O que é uma ordem stop-loss?', '["Ordem para limitar perdas", "Ordem para maximizar ganhos", "Ordem de compra automática", "Ordem de staking"]', 0, 'medium', 7, 'trading'),
('O que é staking?', '["Processo de validar transações e ganhar recompensas", "Mineração de Bitcoin", "Compra de tokens", "Venda de NFTs"]', 0, 'medium', 7, 'defi'),
('O que é uma seed phrase?', '["Sequência de palavras para recuperar carteira", "Senha da exchange", "Código do smart contract", "Hash da transação"]', 0, 'easy', 3, 'wallet'),
('O que significa AMM?', '["Automated Market Maker", "Advanced Money Management", "Algorithmic Mining Method", "Asset Management Module"]', 0, 'medium', 7, 'defi');

-- Inserir inimigos para Battle Arena
INSERT INTO battle_enemies (name, health, attack, defense, level, reward_points, image_url) VALUES
('Goblin Trader', 50, 15, 5, 1, 10, '🧌'),
('Crypto Orc', 80, 20, 8, 2, 15, '👹'),
('DeFi Dragon', 120, 30, 12, 3, 25, '🐉'),
('NFT Demon', 150, 35, 15, 4, 35, '😈'),
('Blockchain Boss', 200, 45, 20, 5, 50, '👑');

-- Inserir missões
INSERT INTO missions (title, description, type, target_value, reward_points) VALUES
('Primeiro Clique', 'Clique 10 vezes no MeowClicker', 'achievement', 10, 50),
('Quiz Master', 'Responda 5 perguntas no CryptoQuiz', 'daily', 5, 30),
('Lucky Player', 'Gire a roleta 3 vezes', 'daily', 3, 25),
('Treasure Hunter', 'Complete 2 caças ao tesouro', 'daily', 2, 40),
('Warrior', 'Vença 3 batalhas na arena', 'daily', 3, 45),
('Point Collector', 'Acumule 1000 pontos', 'achievement', 1000, 100),
('Weekly Champion', 'Ganhe 500 pontos em uma semana', 'weekly', 500, 200),
('Streak Master', 'Mantenha streak de 7 dias', 'achievement', 7, 150);

-- Inserir NFTs
INSERT INTO nfts (name, description, image_url, rarity, price_points, supply) VALUES
('Meow Cat Common', 'Gato básico da coleção MEOW', '🐱', 'common', 100, 1000),
('Meow Cat Rare', 'Gato raro com acessórios', '😸', 'rare', 500, 200),
('Meow Cat Epic', 'Gato épico com poderes especiais', '😻', 'epic', 1500, 50),
('Meow Cat Legendary', 'Gato lendário único', '🦁', 'legendary', 5000, 10),
('Crypto Crown', 'Coroa dourada de crypto', '👑', 'epic', 2000, 25),
('Diamond Collar', 'Coleira de diamante', '💎', 'rare', 800, 100),
('Laser Eyes', 'Olhos laser cyberpunk', '👀', 'legendary', 10000, 5);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_game_history_user ON game_history(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_progress_user ON mission_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_nfts_user ON user_nfts(user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nfts ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança (permitir acesso público para o projeto)
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON game_history FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON mission_progress FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON user_nfts FOR ALL USING (true);
CREATE POLICY "Allow read access" ON quiz_questions FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON battle_enemies FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON missions FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON nfts FOR SELECT USING (true);
```

### **PASSO 5: CRIAR ESTRUTURA DE COMPONENTES**

**Estrutura de pastas:**
```
src/
├── components/
│   ├── RippleGrid/
│   │   └── RippleGrid.tsx
│   ├── StarBorder/
│   │   └── StarBorder.tsx
│   ├── MagicBento/
│   │   ├── MagicBento.tsx
│   │   └── MagicBento.css
│   ├── BackgroundWrapper/
│   │   └── BackgroundWrapper.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── MainDashboard.tsx
│   ├── content/
│   │   ├── HomeContent.tsx
│   │   ├── GamesContent.tsx
│   │   ├── MissionsContent.tsx
│   │   ├── RankingContent.tsx
│   │   ├── NFTContent.tsx
│   │   ├── LearningContent.tsx
│   │   ├── PreSaleContent.tsx
│   │   └── TokenomicsContent.tsx
│   └── games/
│       ├── MeowClicker.tsx
│       ├── CryptoQuiz.tsx
│       ├── LuckySpin.tsx
│       ├── TreasureHunt.tsx
│       └── BattleArena.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── usePoints.ts
│   └── useSupabase.ts
└── lib/
    └── supabase.ts
```

### **PASSO 6: CRIAR COMPONENTE PRINCIPAL**

**Criar: `src/components/MainDashboard.tsx`**
```typescript
import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePoints } from '../hooks/usePoints'
import Sidebar from './Sidebar'
import Header from './Header'
import BackgroundWrapper from './BackgroundWrapper/BackgroundWrapper'

// Importar conteúdos
import HomeContent from './content/HomeContent'
import GamesContent from './content/GamesContent'
import MissionsContent from './content/MissionsContent'
import RankingContent from './content/RankingContent'
import NFTContent from './content/NFTContent'
import LearningContent from './content/LearningContent'
import PreSaleContent from './content/PreSaleContent'
import TokenomicsContent from './content/TokenomicsContent'

const MainDashboard = () => {
  const { user } = useAuth()
  const { totalPoints } = usePoints()
  const [activeSection, setActiveSection] = useState('home')
  const [activeGame, setActiveGame] = useState('meow-clicker')

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <HomeContent user={user} />
      case 'games':
        return <GamesContent activeGame={activeGame} setActiveGame={setActiveGame} />
      case 'missions':
        return <MissionsContent user={user} />
      case 'ranking':
        return <RankingContent />
      case 'nft':
        return <NFTContent user={user} />
      case 'learning':
        return <LearningContent />
      case 'presale':
        return <PreSaleContent user={user} />
      case 'tokenomics':
        return <TokenomicsContent />
      default:
        return <HomeContent user={user} />
    }
  }

  const getBackgroundVariant = () => {
    if (activeSection === 'home') return 'home'
    if (activeSection === 'games') return 'games'
    if (activeSection === 'nft') return 'nft'
    return 'default'
  }

  return (
    <BackgroundWrapper variant={getBackgroundVariant()}>
      <div className="dashboard-container">
        <Header user={user} totalPoints={totalPoints} />
        
        <div className="dashboard-body">
          <Sidebar 
            activeSection={activeSection}
            activeGame={activeGame}
            onSectionChange={setActiveSection}
            onGameChange={setActiveGame}
          />
          
          <main className="main-content">
            <div className="content-wrapper">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </BackgroundWrapper>
  )
}

export default MainDashboard
```

### **PASSO 7: CRIAR SIDEBAR NAVIGATION**

**Criar: `src/components/Sidebar.tsx`**
```typescript
import React from 'react'
import StarBorder from './StarBorder/StarBorder'

interface SidebarProps {
  activeSection: string
  activeGame: string
  onSectionChange: (section: string) => void
  onGameChange: (game: string) const sidebarSections = [
  {
    id: 'home',
    icon: '🏠',
    label: 'Home',
    color: 'cyan'
  },
  {
    id: 'games',
    icon: '🎮',
    label: 'Games',
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
    id: 'missions',
    icon: '🎯',
    label: 'Missions',
    color: 'green'
  },
  {
    id: 'ranking',
    icon: '🏆',
    label: 'Ranking',
    color: 'yellow'
  },
  {
    id: 'nft',
    icon: '🖼️',
    label: 'NFT',
    color: 'pink'
  },
  {
    id: 'learning',
    icon: '📚',
    label: 'Learning',
    color: 'cyan'
  },
  {
    id: 'presale',
    icon: '💰',
    label: 'Pre-Sale',
    color: 'green'
  },
  {
    id: 'tokenomics',
    icon: '📊',
    label: 'Tokenomics',
    color: 'purple'
  }
]
    id: 'presale',
    icon: '💰',
    label: 'Pre-Sale',
    color: 'green'
  },
  {
    id: 'tokenomics',
    icon: '📊',
    label: 'Tokenomics',
    color: 'purple'
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
        <h2>🐱 MEOW TOKEN</h2>
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

### **PASSO 8: CRIAR HOOK DE AUTENTICAÇÃO**

**Criar: `src/hooks/useAuth.ts`**
```typescript
import { useState, useEffect, createContext, useContext } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  wallet_address: string
  points: number
  level: number
  xp: number
  streak: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publicKey, connected, connect, disconnect } = useWallet()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const login = async () => {
    try {
      if (!connected) {
        await connect()
      }
    } catch (error) {
      console.error('Erro ao conectar carteira:', error)
    }
  }

  const logout = async () => {
    try {
      await disconnect()
      setUser(null)
    } catch (error) {
      console.error('Erro ao desconectar carteira:', error)
    }
  }

  const createOrGetUser = async (walletAddress: string) => {
    try {
      // Verificar se usuário existe
      let { data: existingUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (!existingUser) {
        // Criar novo usuário
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{ wallet_address: walletAddress }])
          .select()
          .single()

        if (createError) throw createError
        return newUser
      }

      return existingUser
    } catch (error) {
      console.error('Erro ao criar/buscar usuário:', error)
      return null
    }
  }

  useEffect(() => {
    const handleWalletChange = async () => {
      setIsLoading(true)
      
      if (connected && publicKey) {
        const walletAddress = publicKey.toString()
        const userData = await createOrGetUser(walletAddress)
        setUser(userData)
      } else {
        setUser(null)
      }
      
      setIsLoading(false)
    }

    handleWalletChange()
  }, [connected, publicKey])

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

### **PASSO 9: CRIAR HOOK DE PONTOS**

**Criar: `src/hooks/usePoints.ts`**
```typescript
import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

export const usePoints = () => {
  const { user } = useAuth()
  const [totalPoints, setTotalPoints] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const addPoints = async (gameType: string, points: number, walletAddress: string) => {
    if (!user || !walletAddress) return false

    setIsLoading(true)
    try {
      // Atualizar pontos do usuário
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ 
          points: user.points + points,
          xp: user.xp + points,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', walletAddress)
        .select()
        .single()

      if (updateError) throw updateError

      // Registrar no histórico
      const { error: historyError } = await supabase
        .from('game_history')
        .insert([{
          user_id: user.id,
          game_type: gameType,
          points_earned: points,
          details: { timestamp: new Date().toISOString() }
        }])

      if (historyError) throw historyError

      setTotalPoints(updatedUser.points)
      return true
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const refreshPoints = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('points')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setTotalPoints(data.points)
    } catch (error) {
      console.error('Erro ao atualizar pontos:', error)
    }
  }

  useEffect(() => {
    if (user) {
      setTotalPoints(user.points)
    }
  }, [user])

  return {
    totalPoints,
    addPoints,
    refreshPoints,
    isLoading
  }
}
```

### **PASSO 10: CRIAR APP PRINCIPAL**

**Atualizar: `src/App.tsx`**
```typescript
import React from 'react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { AuthProvider } from './hooks/useAuth'
import MainDashboard from './components/MainDashboard'

// Importar CSS do wallet
import '@solana/wallet-adapter-react-ui/styles.css'

const App = () => {
  const network = WalletAdapterNetwork.Devnet
  const endpoint = clusterApiUrl(network)
  const wallets = [new PhantomWalletAdapter()]

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AuthProvider>
            <div className="app">
              <MainDashboard />
            </div>
          </AuthProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App
```

### **PASSO 11: CRIAR CSS GLOBAL**

**Criar: `src/index.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --neon-cyan: #2ad6d0;
  --neon-purple: #9a45fc;
  --neon-yellow: #ffe118;
  --neon-pink: #ff0080;
  --neon-green: #00ff41;
  --dark-bg: #0b0019;
  --dark-border: #392e4e;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--dark-bg);
  color: white;
  overflow-x: hidden;
}

.app {
  min-height: 100vh;
  width: 100%;
}

/* DASHBOARD LAYOUT */
.dashboard-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
}

.dashboard-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* SIDEBAR */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, rgba(26, 13, 46, 0.95) 0%, rgba(45, 27, 61, 0.95) 100%);
  border-right: 2px solid var(--neon-purple);
  box-shadow: 0 0 30px rgba(154, 69, 252, 0.3);
  overflow-y: auto;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
}

.sidebar-header {
  padding: 25px 20px;
  border-bottom: 1px solid var(--dark-border);
  text-align: center;
}

.sidebar-header h2 {
  color: var(--neon-cyan);
  text-shadow: 0 0 15px var(--neon-cyan);
  font-size: 18px;
  margin: 0;
  letter-spacing: 1px;
  font-weight: bold;
}

.sidebar-nav {
  padding: 20px 15px;
}

.nav-section {
  margin-bottom: 8px;
}

.nav-submenu {
  margin-top: 8px;
  padding-left: 16px;
}

/* HEADER */
.header {
  height: 70px;
  background: linear-gradient(90deg, rgba(26, 13, 46, 0.95), rgba(45, 27, 61, 0.95));
  border-bottom: 2px solid var(--neon-purple);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: 0 2px 20px rgba(154, 69, 252, 0.3);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: var(--neon-cyan);
  text-shadow: 0 0 15px var(--neon-cyan);
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.points-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(42, 214, 208, 0.1);
  padding: 8px 20px;
  border-radius: 25px;
  border: 1px solid var(--neon-cyan);
  box-shadow: 0 0 15px rgba(42, 214, 208, 0.3);
  backdrop-filter: blur(5px);
}

.points-icon {
  font-size: 18px;
}

.points-value {
  color: var(--neon-green);
  font-weight: bold;
  font-size: 18px;
  text-shadow: 0 0 10px var(--neon-green);
}

.points-label {
  color: var(--neon-cyan);
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* MAIN CONTENT */
.main-content {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

.content-wrapper {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* CONTENT HEADERS */
.content-header {
  margin-bottom: 30px;
  text-align: center;
}

.content-title {
  font-size: 32px;
  font-weight: bold;
  color: var(--neon-cyan);
  text-shadow: 
    0 0 10px var(--neon-cyan),
    0 0 20px var(--neon-cyan);
  margin-bottom: 10px;
  animation: title-glow 2s ease-in-out infinite alternate;
}

.content-subtitle {
  color: #cccccc;
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
}

/* RESPONSIVIDADE */
@media (max-width: 768px) {
  .sidebar {
    width: 70px;
  }
  
  .sidebar-header h2 {
    font-size: 14px;
  }
  
  .header {
    padding: 0 15px;
  }
  
  .header-center {
    display: none;
  }
  
  .content-wrapper {
    padding: 20px;
  }
  
  .content-title {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 60px;
  }
  
  .content-wrapper {
    padding: 15px;
  }
}
```

---

## 🚀 **INSTRUÇÕES DE IMPLEMENTAÇÃO**

### **EXECUTAR NO REPLIT:**

1. **Criar projeto Vite React TypeScript**
2. **Instalar todas as dependências** listadas
3. **Configurar variáveis de ambiente** (.env)
4. **Executar SQL no Supabase** para criar banco
5. **Criar estrutura de pastas** conforme especificado
6. **Implementar todos os componentes** na ordem
7. **Configurar Tailwind** com animações
8. **Testar conexão** Phantom Wallet
9. **Verificar integração** Supabase
10. **Implementar jogos** e funcionalidades

### **RESULTADO ESPERADO:**

Sistema completo com:
- ✅ **8 seções principais** funcionais
- ✅ **Sidebar navigation** moderna
- ✅ **Background RippleGrid** animado
- ✅ **StarBorder** em todos os botões
- ✅ **MagicBento** na Home
- ✅ **5 jogos** integrados
- ✅ **Sistema de pontos** robusto
- ✅ **Banco Supabase** completo
- ✅ **Interface cyberpunk** profissional

**EXECUTE ESTE PROMPT PARA TER O SISTEMA MEOW TOKEN COMPLETO!** 🚀🐱

