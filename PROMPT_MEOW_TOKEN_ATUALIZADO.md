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

**Adicionar MagicBento:**
```bash
npx jsrepo add https://reactbits.dev/default/Components/MagicBento
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

### **PASSO 6: CRIAR SIDEBAR NAVIGATION**

**Criar: `src/components/Sidebar.tsx`**
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

### **PASSO 7: CRIAR COMPONENTE PRINCIPAL**

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

### **PASSO 8: CRIAR CONTEÚDOS DAS SEÇÕES**

**Criar: `src/components/content/HomeContent.tsx`**
```typescript
import React from 'react'
import MagicBento from '../MagicBento/MagicBento'

interface HomeContentProps {
  user: any
}

const HomeContent: React.FC<HomeContentProps> = ({ user }) => {
  return (
    <div className="home-content">
      <div className="content-header">
        <h1 className="content-title">🏠 Bem-vindo ao MEOW TOKEN</h1>
        <p className="content-subtitle">
          Olá, {user?.wallet_address?.slice(0, 6)}...{user?.wallet_address?.slice(-4)}! 
          Explore o ecossistema MEOW e ganhe pontos.
        </p>
      </div>
      
      <div className="magic-bento-container">
        <MagicBento 
          textAutoHide={true}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          enableMagnetism={true}
          clickEffect={true}
          spotlightRadius={300}
          particleCount={12}
          glowColor="132, 0, 255"
        />
      </div>
    </div>
  )
}

export default HomeContent
```

**Criar: `src/components/MagicBento/MagicBento.tsx`**
```typescript
import React, { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import './MagicBento.css'

interface MagicBentoProps {
  textAutoHide?: boolean
  enableStars?: boolean
  enableSpotlight?: boolean
  enableBorderGlow?: boolean
  enableTilt?: boolean
  enableMagnetism?: boolean
  clickEffect?: boolean
  spotlightRadius?: number
  particleCount?: number
  glowColor?: string
}

const MagicBento: React.FC<MagicBentoProps> = ({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  spotlightRadius = 300,
  particleCount = 12,
  glowColor = "132, 0, 255"
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const bentoCards = [
    {
      id: 1,
      title: "🎮 Jogos Únicos",
      description: "5 jogos Web3 exclusivos para ganhar pontos MEOW",
      label: "GAMES",
      gradient: "linear-gradient(135deg, #9a45fc 0%, #2ad6d0 100%)"
    },
    {
      id: 2,
      title: "💎 Sistema de Pontos",
      description: "Acumule pontos jogando e prepare-se para o TGE",
      label: "POINTS",
      gradient: "linear-gradient(135deg, #ffe118 0%, #ff0080 100%)"
    },
    {
      id: 3,
      title: "🚀 MEOW Token Ecosystem",
      description: "O futuro dos jogos Web3 na blockchain Solana. Participe da revolução dos tokens de jogos descentralizados e ganhe recompensas exclusivas.",
      label: "ECOSYSTEM",
      gradient: "linear-gradient(135deg, #00ff41 0%, #9a45fc 100%)"
    },
    {
      id: 4,
      title: "🏆 Ranking Global",
      description: "Compete com jogadores do mundo todo e suba no ranking para ganhar recompensas especiais e reconhecimento na comunidade MEOW.",
      label: "RANKING",
      gradient: "linear-gradient(135deg, #ff0080 0%, #ffe118 100%)"
    },
    {
      id: 5,
      title: "🎯 Missões Diárias",
      description: "Complete missões e conquiste recompensas",
      label: "MISSIONS",
      gradient: "linear-gradient(135deg, #2ad6d0 0%, #00ff41 100%)"
    },
    {
      id: 6,
      title: "🖼️ NFT Collection",
      description: "Colecione NFTs exclusivos da comunidade MEOW",
      label: "NFT",
      gradient: "linear-gradient(135deg, #9a45fc 0%, #ff0080 100%)"
    }
  ]

  useEffect(() => {
    if (!containerRef.current) return

    const cards = containerRef.current.querySelectorAll('.card')
    
    // Configurar efeitos GSAP
    cards.forEach((card) => {
      const cardElement = card as HTMLElement

      // Efeito de hover com tilt
      if (enableTilt) {
        cardElement.addEventListener('mouseenter', () => {
          gsap.to(cardElement, {
            duration: 0.3,
            rotationX: 5,
            rotationY: 5,
            scale: 1.02,
            ease: "power2.out"
          })
        })

        cardElement.addEventListener('mouseleave', () => {
          gsap.to(cardElement, {
            duration: 0.3,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "power2.out"
          })
        })
      }

      // Efeito de magnetismo
      if (enableMagnetism) {
        cardElement.addEventListener('mousemove', (e) => {
          const rect = cardElement.getBoundingClientRect()
          const x = e.clientX - rect.left - rect.width / 2
          const y = e.clientY - rect.top - rect.height / 2
          
          gsap.to(cardElement, {
            duration: 0.3,
            x: x * 0.1,
            y: y * 0.1,
            ease: "power2.out"
          })
        })

        cardElement.addEventListener('mouseleave', () => {
          gsap.to(cardElement, {
            duration: 0.3,
            x: 0,
            y: 0,
            ease: "power2.out"
          })
        })
      }

      // Efeito de clique
      if (clickEffect) {
        cardElement.addEventListener('click', () => {
          gsap.to(cardElement, {
            duration: 0.1,
            scale: 0.95,
            ease: "power2.out",
            yoyo: true,
            repeat: 1
          })
        })
      }

      // Efeito de borda brilhante
      if (enableBorderGlow) {
        cardElement.addEventListener('mousemove', (e) => {
          const rect = cardElement.getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width) * 100
          const y = ((e.clientY - rect.top) / rect.height) * 100
          
          cardElement.style.setProperty('--glow-x', `${x}%`)
          cardElement.style.setProperty('--glow-y', `${y}%`)
          cardElement.style.setProperty('--glow-intensity', '1')
        })

        cardElement.addEventListener('mouseleave', () => {
          cardElement.style.setProperty('--glow-intensity', '0')
        })
      }
    })

    // Spotlight global
    if (enableSpotlight) {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY })
      }

      document.addEventListener('mousemove', handleMouseMove)
      return () => document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [enableTilt, enableMagnetism, clickEffect, enableBorderGlow, enableSpotlight])

  return (
    <div className="bento-section" ref={containerRef}>
      {enableSpotlight && (
        <div 
          className="global-spotlight"
          style={{
            position: 'fixed',
            top: mousePosition.y - spotlightRadius / 2,
            left: mousePosition.x - spotlightRadius / 2,
            width: spotlightRadius,
            height: spotlightRadius,
            background: `radial-gradient(circle, rgba(${glowColor}, 0.1) 0%, transparent 70%)`,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 200
          }}
        />
      )}
      
      <div className={`card-grid ${textAutoHide ? 'card-grid--text-autohide' : ''}`}>
        {bentoCards.map((card) => (
          <div 
            key={card.id}
            className={`card ${enableBorderGlow ? 'card--border-glow' : ''} ${textAutoHide ? 'card--text-autohide' : ''}`}
            style={{
              background: `linear-gradient(135deg, rgba(6, 0, 16, 0.9) 0%, rgba(26, 13, 46, 0.9) 100%), ${card.gradient}`,
              backgroundBlendMode: 'overlay'
            }}
          >
            <div className="card__header">
              <span className="card__label" style={{ color: `rgb(${glowColor})` }}>
                {card.label}
              </span>
            </div>
            
            <div className="card__content">
              <h3 className="card__title">{card.title}</h3>
              <p className="card__description">{card.description}</p>
            </div>

            {enableStars && (
              <div className="particle-container">
                {Array.from({ length: Math.min(particleCount, 8) }).map((_, i) => (
                  <div
                    key={i}
                    className="particle"
                    style={{
                      position: 'absolute',
                      width: '2px',
                      height: '2px',
                      background: `rgb(${glowColor})`,
                      borderRadius: '50%',
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animation: `twinkle ${2 + Math.random() * 3}s infinite`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MagicBento
```

**Criar: `src/components/MagicBento/MagicBento.css`**
```css
:root {
  --hue: 27;
  --sat: 69%;
  --white: hsl(0, 0%, 100%);
  --purple-primary: rgba(132, 0, 255, 1);
  --purple-glow: rgba(132, 0, 255, 0.2);
  --purple-border: rgba(132, 0, 255, 0.8);
  --border-color: #392e4e;
  --background-dark: #060010;
  color-scheme: light dark;
}

.card-grid {
  display: grid;
  gap: 0.5em;
  padding: 0.75em;
  max-width: 54em;
  font-size: clamp(1rem, 0.9rem + 0.5vw, 1.5rem);
  margin: 0 auto;
}

.card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  aspect-ratio: 4/3;
  min-height: 200px;
  width: 100%;
  max-width: 100%;
  padding: 1.25em;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  background: var(--background-dark);
  font-weight: 300;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;

  --glow-x: 50%;
  --glow-y: 50%;
  --glow-intensity: 0;
  --glow-radius: 200px;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card__header,
.card__content {
  display: flex;
  position: relative;
  color: var(--white);
  z-index: 2;
}

.card__header {
  gap: 0.75em;
  justify-content: space-between;
}

.card__content {
  flex-direction: column;
}

.card__label {
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
  opacity: 0.8;
}

.card__title,
.card__description {
  --clamp-title: 1;
  --clamp-desc: 2;
}

.card__title {
  font-weight: 600;
  font-size: 18px;
  margin: 0 0 0.5em;
  color: var(--white);
}

.card__description {
  font-size: 14px;
  line-height: 1.4;
  opacity: 0.9;
  color: #cccccc;
}

.card--text-autohide .card__title,
.card--text-autohide .card__description {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card--text-autohide .card__title {
  -webkit-line-clamp: var(--clamp-title);
  line-clamp: var(--clamp-title);
}

.card--text-autohide .card__description {
  -webkit-line-clamp: var(--clamp-desc);
  line-clamp: var(--clamp-desc);
}

/* Border glow effect */
.card--border-glow::after {
  content: '';
  position: absolute;
  inset: 0;
  padding: 2px;
  background: radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y),
      rgba(132, 0, 255, calc(var(--glow-intensity) * 0.8)) 0%,
      rgba(132, 0, 255, calc(var(--glow-intensity) * 0.4)) 30%,
      transparent 60%);
  border-radius: inherit;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: subtract;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.card--border-glow:hover::after {
  opacity: 1;
}

.card--border-glow:hover {
  box-shadow: 0 4px 20px rgba(46, 24, 78, 0.4), 0 0 30px var(--purple-glow);
}

.particle-container {
  position: relative;
  overflow: hidden;
}

.particle::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: rgba(132, 0, 255, 0.2);
  border-radius: 50%;
  z-index: -1;
}

.particle-container:hover {
  box-shadow: 0 4px 20px rgba(46, 24, 78, 0.2), 0 0 30px var(--purple-glow);
}

/* Global spotlight styles */
.global-spotlight {
  mix-blend-mode: screen;
  will-change: transform, opacity;
  z-index: 200 !important;
  pointer-events: none;
}

.bento-section {
  position: relative;
  user-select: none;
}

/* Animação de partículas */
@keyframes twinkle {
  0%, 100% { 
    opacity: 0.3; 
    transform: scale(1);
  }
  50% { 
    opacity: 1; 
    transform: scale(1.2);
  }
}

/* Responsividade */
@media (max-width: 599px) {
  .card-grid {
    grid-template-columns: 1fr;
    width: 95%;
    margin: 0 auto;
    padding: 0.5em;
  }

  .card {
    width: 100%;
    min-height: 180px;
    aspect-ratio: 3/2;
  }

  .card__title {
    font-size: 16px;
  }

  .card__description {
    font-size: 13px;
  }
}

@media (min-width: 600px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .card:nth-child(3) {
    grid-column: span 2;
    grid-row: span 2;
  }

  .card:nth-child(4) {
    grid-column: 1/span 2;
    grid-row: 2/span 2;
  }

  .card:nth-child(6) {
    grid-column: 4;
    grid-row: 3;
  }
}

/* Integração com tema MEOW */
.home-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.magic-bento-container {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 600px;
}

/* Ajustes para o tema cyberpunk */
.card {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(154, 69, 252, 0.3);
}

.card:hover {
  border-color: rgba(42, 214, 208, 0.6);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(154, 69, 252, 0.2);
}
```

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

