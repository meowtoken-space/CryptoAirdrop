# 🚀 PROMPT: SISTEMA DE JOGOS COM SIDEBAR NAVIGATION

## 🎯 **OBJETIVO PRINCIPAL**

Transformar o sistema atual em uma **Single Page Application (SPA)** com sidebar navigation dinâmica, onde o menu lateral controla todo o conteúdo sem recarregar a página, inspirado em Notion, Manus.ai e Figma.

---

## 🏗️ **ESTRUTURA SIDEBAR NAVIGATION**

### **LAYOUT PRINCIPAL:**
```
┌─────────────────────────────────────────┐
│ Header (Wallet + Points)                │
├──────────┬──────────────────────────────┤
│          │                              │
│ SIDEBAR  │        MAIN CONTENT          │
│          │                              │
│ 🎮 Games │   [Conteúdo dinâmico aqui]   │
│ 📊 Stats │                              │
│ 🏆 Rank  │                              │
│ 💎 Shop  │                              │
│ ⚙️ Config│                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

### **MENU LATERAL (SIDEBAR):**
```typescript
// Estrutura do menu lateral
const sidebarItems = [
  {
    id: 'games',
    icon: '🎮',
    label: 'Jogos',
    component: 'GamesContent',
    subItems: [
      { id: 'meow-clicker', label: '🐱 Meow Clicker' },
      { id: 'crypto-quiz', label: '🧠 Crypto Quiz' },
      { id: 'lucky-spin', label: '🎰 Lucky Spin' },
      { id: 'treasure-hunt', label: '🗺️ Treasure Hunt' },
      { id: 'battle-arena', label: '⚔️ Battle Arena' }
    ]
  },
  {
    id: 'statistics',
    icon: '📊',
    label: 'Estatísticas',
    component: 'StatsContent'
  },
  {
    id: 'ranking',
    icon: '🏆',
    label: 'Ranking',
    component: 'RankingContent'
  },
  {
    id: 'shop',
    icon: '💎',
    label: 'Loja',
    component: 'ShopContent'
  },
  {
    id: 'settings',
    icon: '⚙️',
    label: 'Configurações',
    component: 'SettingsContent'
  }
]
```

---

## 🎮 **SISTEMA DE JOGOS COM APIs**

### **ARQUITETURA DE JOGOS:**

#### **OPÇÃO 1: APIs EXTERNAS + WEBHOOKS**
```typescript
// Estrutura de API para cada jogo
interface GameAPI {
  id: string
  name: string
  endpoint: string
  webhook: string
  scoreMultiplier: number
  dailyLimit: number
}

const gameAPIs: GameAPI[] = [
  {
    id: 'meow-clicker',
    name: 'Meow Clicker',
    endpoint: '/api/games/meow-clicker',
    webhook: '/webhook/points/meow-clicker',
    scoreMultiplier: 1,
    dailyLimit: 1000
  },
  {
    id: 'crypto-quiz',
    name: 'Crypto Quiz',
    endpoint: '/api/games/crypto-quiz',
    webhook: '/webhook/points/crypto-quiz',
    scoreMultiplier: 3,
    dailyLimit: 20
  }
  // ... outros jogos
]
```

#### **OPÇÃO 2: JOGOS INTEGRADOS + WEBHOOKS INTERNOS**
```typescript
// Sistema híbrido: jogos React + API de pontos
const gameSystem = {
  // Jogos renderizados em React
  games: {
    'meow-clicker': MeowClickerComponent,
    'crypto-quiz': CryptoQuizComponent,
    'lucky-spin': LuckySpinComponent,
    'treasure-hunt': TreasureHuntComponent,
    'battle-arena': BattleArenaComponent
  },
  
  // API interna para pontos
  pointsAPI: {
    endpoint: '/api/points/add',
    webhook: '/webhook/game-action',
    validation: true,
    antiCheat: true
  }
}
```

---

## 🛠️ **IMPLEMENTAÇÃO TÉCNICA**

### **1. COMPONENTE PRINCIPAL (App.tsx):**
```typescript
import React, { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import Header from './components/Header'

const App = () => {
  const { user, isAuthenticated } = useAuth()
  const [activeSection, setActiveSection] = useState('games')
  const [activeSubSection, setActiveSubSection] = useState('meow-clicker')

  if (!isAuthenticated) {
    return <LandingPage />
  }

  return (
    <div className="app-container">
      {/* Header fixo com wallet e pontos */}
      <Header user={user} />
      
      <div className="app-body">
        {/* Sidebar navigation */}
        <Sidebar 
          activeSection={activeSection}
          activeSubSection={activeSubSection}
          onSectionChange={setActiveSection}
          onSubSectionChange={setActiveSubSection}
        />
        
        {/* Conteúdo principal dinâmico */}
        <MainContent 
          section={activeSection}
          subSection={activeSubSection}
          user={user}
        />
      </div>
    </div>
  )
}

export default App
```

### **2. SIDEBAR COMPONENT:**
```typescript
import React from 'react'
import { sidebarItems } from '../config/navigation'

interface SidebarProps {
  activeSection: string
  activeSubSection: string
  onSectionChange: (section: string) => void
  onSubSectionChange: (subSection: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  activeSubSection,
  onSectionChange,
  onSubSectionChange
}) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🎮 MEOW GAMES</h2>
      </div>
      
      <nav className="sidebar-nav">
        {sidebarItems.map(item => (
          <div key={item.id} className="nav-item">
            <button
              className={`nav-button ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => onSectionChange(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
            
            {/* Sub-items para jogos */}
            {item.subItems && activeSection === item.id && (
              <div className="nav-subitems">
                {item.subItems.map(subItem => (
                  <button
                    key={subItem.id}
                    className={`nav-subbutton ${activeSubSection === subItem.id ? 'active' : ''}`}
                    onClick={() => onSubSectionChange(subItem.id)}
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
```

### **3. MAIN CONTENT COMPONENT:**
```typescript
import React from 'react'
import GamesContent from './content/GamesContent'
import StatsContent from './content/StatsContent'
import RankingContent from './content/RankingContent'
import ShopContent from './content/ShopContent'
import SettingsContent from './content/SettingsContent'

interface MainContentProps {
  section: string
  subSection: string
  user: any
}

const MainContent: React.FC<MainContentProps> = ({ section, subSection, user }) => {
  const renderContent = () => {
    switch (section) {
      case 'games':
        return <GamesContent activeGame={subSection} user={user} />
      case 'statistics':
        return <StatsContent user={user} />
      case 'ranking':
        return <RankingContent />
      case 'shop':
        return <ShopContent user={user} />
      case 'settings':
        return <SettingsContent user={user} />
      default:
        return <GamesContent activeGame="meow-clicker" user={user} />
    }
  }

  return (
    <div className="main-content">
      <div className="content-container">
        {renderContent()}
      </div>
    </div>
  )
}

export default MainContent
```

### **4. GAMES CONTENT COMPONENT:**
```typescript
import React from 'react'
import MeowClicker from '../games/MeowClicker'
import CryptoQuiz from '../games/CryptoQuiz'
import LuckySpin from '../games/LuckySpin'
import TreasureHunt from '../games/TreasureHunt'
import BattleArena from '../games/BattleArena'

interface GamesContentProps {
  activeGame: string
  user: any
}

const GamesContent: React.FC<GamesContentProps> = ({ activeGame, user }) => {
  const renderGame = () => {
    switch (activeGame) {
      case 'meow-clicker':
        return <MeowClicker user={user} />
      case 'crypto-quiz':
        return <CryptoQuiz user={user} />
      case 'lucky-spin':
        return <LuckySpin user={user} />
      case 'treasure-hunt':
        return <TreasureHunt user={user} />
      case 'battle-arena':
        return <BattleArena user={user} />
      default:
        return <MeowClicker user={user} />
    }
  }

  return (
    <div className="games-content">
      <div className="game-header">
        <h1>🎮 {activeGame.replace('-', ' ').toUpperCase()}</h1>
      </div>
      
      <div className="game-container">
        {renderGame()}
      </div>
    </div>
  )
}

export default GamesContent
```

---

## 🎯 **SISTEMA DE PONTOS COM WEBHOOKS**

### **API DE PONTOS:**
```typescript
// /api/points/add
export async function addPoints(req: Request) {
  try {
    const { gameId, points, walletAddress, gameData } = req.body
    
    // Validação anti-cheat
    const isValid = await validateGameAction(gameId, gameData, walletAddress)
    if (!isValid) {
      return { error: 'Invalid game action' }
    }
    
    // Verificar limites diários
    const dailyLimit = await checkDailyLimit(gameId, walletAddress)
    if (dailyLimit.exceeded) {
      return { error: 'Daily limit exceeded' }
    }
    
    // Adicionar pontos no Supabase
    const result = await supabase
      .from('users')
      .update({ 
        points: user.points + points,
        xp: user.xp + points 
      })
      .eq('wallet_address', walletAddress)
    
    // Registrar no histórico
    await supabase
      .from('game_history')
      .insert({
        user_id: user.id,
        game_type: gameId,
        points_earned: points,
        details: gameData
      })
    
    // Webhook para notificações
    await triggerWebhook('points_added', {
      walletAddress,
      gameId,
      points,
      timestamp: new Date()
    })
    
    return { success: true, newTotal: user.points + points }
    
  } catch (error) {
    console.error('Erro ao adicionar pontos:', error)
    return { error: 'Internal server error' }
  }
}
```

### **WEBHOOK SYSTEM:**
```typescript
// Sistema de webhooks para eventos
const webhookEvents = {
  points_added: '/webhook/points-added',
  level_up: '/webhook/level-up',
  achievement_unlocked: '/webhook/achievement',
  daily_reset: '/webhook/daily-reset'
}

async function triggerWebhook(event: string, data: any) {
  try {
    const webhookUrl = webhookEvents[event]
    if (!webhookUrl) return
    
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString()
      })
    })
  } catch (error) {
    console.error('Webhook error:', error)
  }
}
```

---

## 🎨 **CSS PARA SIDEBAR NAVIGATION**

```css
/* Layout principal */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--dark-bg);
  color: white;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #1a0d2e 0%, #2d1b3d 100%);
  border-right: 2px solid var(--neon-purple);
  box-shadow: 0 0 30px rgba(154, 69, 252, 0.3);
  overflow-y: auto;
  transition: all 0.3s ease;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--dark-border);
  text-align: center;
}

.sidebar-header h2 {
  color: var(--neon-cyan);
  text-shadow: 0 0 15px var(--neon-cyan);
  font-size: 18px;
  margin: 0;
}

/* Navigation */
.sidebar-nav {
  padding: 20px 0;
}

.nav-item {
  margin-bottom: 5px;
}

.nav-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  color: #cccccc;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.nav-button:hover {
  background: rgba(154, 69, 252, 0.2);
  color: var(--neon-cyan);
  transform: translateX(5px);
}

.nav-button.active {
  background: linear-gradient(90deg, rgba(154, 69, 252, 0.3), transparent);
  color: var(--neon-cyan);
  border-right: 3px solid var(--neon-cyan);
  box-shadow: 0 0 15px rgba(42, 214, 208, 0.3);
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.nav-label {
  flex: 1;
  text-align: left;
}

/* Sub-items */
.nav-subitems {
  background: rgba(0, 0, 0, 0.2);
  border-left: 2px solid var(--neon-purple);
  margin-left: 20px;
}

.nav-subbutton {
  width: 100%;
  padding: 8px 20px;
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  text-align: left;
}

.nav-subbutton:hover {
  background: rgba(42, 214, 208, 0.1);
  color: var(--neon-cyan);
}

.nav-subbutton.active {
  background: rgba(42, 214, 208, 0.2);
  color: var(--neon-cyan);
  font-weight: bold;
}

/* Main content */
.main-content {
  flex: 1;
  overflow-y: auto;
  background: linear-gradient(135deg, #0b0019 0%, #1a0d2e 50%, #0b0019 100%);
}

.content-container {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.header {
  height: 70px;
  background: linear-gradient(90deg, #1a0d2e, #2d1b3d);
  border-bottom: 2px solid var(--neon-purple);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: 0 2px 20px rgba(154, 69, 252, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.points-display {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(42, 214, 208, 0.1);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--neon-cyan);
}

.points-value {
  color: var(--neon-green);
  font-weight: bold;
  font-size: 16px;
  text-shadow: 0 0 10px var(--neon-green);
}

/* Responsividade */
@media (max-width: 768px) {
  .sidebar {
    width: 60px;
    overflow: visible;
  }
  
  .nav-label {
    display: none;
  }
  
  .nav-subitems {
    position: absolute;
    left: 60px;
    top: 0;
    background: #1a0d2e;
    border: 1px solid var(--neon-purple);
    border-radius: 8px;
    min-width: 200px;
    z-index: 1000;
  }
  
  .content-container {
    padding: 20px;
  }
}
```

---

## 🚀 **INSTRUÇÕES DE IMPLEMENTAÇÃO**

### **PASSO 1: ESTRUTURA BASE**
1. Criar componentes Sidebar, MainContent, Header
2. Implementar sistema de navegação com estado
3. Configurar roteamento interno (sem React Router)

### **PASSO 2: SISTEMA DE JOGOS**
1. Refatorar jogos existentes para o novo layout
2. Implementar API de pontos com validação
3. Criar sistema de webhooks

### **PASSO 3: CONTEÚDO DINÂMICO**
1. Criar componentes para cada seção (Stats, Ranking, Shop, Settings)
2. Implementar transições suaves
3. Adicionar loading states

### **PASSO 4: MELHORIAS**
1. Adicionar animações de transição
2. Implementar sistema de notificações
3. Otimizar performance

---

## ✅ **RESULTADO ESPERADO**

Sistema completo com:
- ✅ **Sidebar navigation** estilo Notion/Figma
- ✅ **Conteúdo dinâmico** sem reload
- ✅ **5 jogos funcionais** integrados
- ✅ **API robusta** com webhooks
- ✅ **Sistema de pontos** otimizado
- ✅ **Interface moderna** e responsiva
- ✅ **Performance** excelente

**IMPLEMENTE ESTE SISTEMA AGORA PARA TER UMA INTERFACE PROFISSIONAL E FUNCIONAL!** 🚀

