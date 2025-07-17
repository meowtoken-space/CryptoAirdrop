# 🚀 PROMPT COMPLETO PARA AGENTE REPLIT - SISTEMA DE PONTOS MEOW TOKEN

## 📋 INSTRUÇÕES GERAIS

Você é um desenvolvedor especialista em React/TypeScript e Supabase. Precisa implementar um **sistema de pontos revolucionário** no projeto CryptoAirdrop, substituindo qualquer sistema antigo existente e integrando com o banco de dados Supabase já configurado.

## 🎯 OBJETIVO PRINCIPAL

Implementar um sistema de pontos acumulativo onde:
- Cada jogo pode ser jogado **1x por dia**
- Reset automático às **21:00** (horário de Brasília)
- Pontos são salvos no Supabase na tabela `users` coluna `total_points`
- Sistema preparado para TGE (Token Generation Event)
- Interface cyberpunk responsiva

## 🗄️ CONFIGURAÇÃO DO BANCO DE DADOS

### Supabase já configurado:
- **Projeto:** meowtoken-space
- **Tabela:** `users` 
- **Colunas existentes:**
  - `wallet_address` (text, primary key)
  - `created_at` (timestamptz)
  - `total_points` (int8, default: 0) ← **NOVA COLUNA JÁ CRIADA**

### Carteira Admin:
```
DM5bzL1MWThBjhFVXRWzFtYKjqf5Vwhhs2jVzr68hYoV
```

## 🎮 JOGOS A SEREM INTEGRADOS

### 1. MeowClicker.tsx
- **Pontos por clique:** 1-5 (baseado em energia)
- **Limite diário:** 1000 cliques
- **Reset:** 21:00
- **Funcionalidades:** Sistema de energia, power-ups, animações

### 2. CryptoQuiz.tsx  
- **Pontos por resposta correta:** 10-50 (baseado em dificuldade)
- **Limite diário:** 20 perguntas
- **Reset:** 21:00
- **Funcionalidades:** Timer, streak bonus, explicações

### 3. LuckySpin.tsx
- **Pontos por spin:** 5-500 (baseado em raridade)
- **Limite diário:** 5 spins
- **Reset:** 21:00
- **Funcionalidades:** Roleta, cooldown, jackpot progressivo

### 4. TreasureHunt.tsx
- **Pontos por tesouro:** 20-200 (baseado em raridade)
- **Limite diário:** 3 mapas
- **Reset:** 21:00
- **Funcionalidades:** Mapas procedurais, sistema de dicas

### 5. BattleArena.tsx
- **Pontos por vitória:** 30-100 (baseado em streak)
- **Limite diário:** 10 batalhas
- **Reset:** 21:00
- **Funcionalidades:** Combate por turnos, matchmaking

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### 1. Criar Hook de Pontos (`usePoints.ts`)

```typescript
// client/src/hooks/usePoints.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PointsData {
  total_points: number;
  last_reset: string;
  daily_limits: {
    meow_clicker: number;
    crypto_quiz: number;
    lucky_spin: number;
    treasure_hunt: number;
    battle_arena: number;
  };
}

export const usePoints = (walletAddress: string) => {
  const [points, setPoints] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se é hora do reset (21:00 BRT)
  const checkDailyReset = () => {
    const now = new Date();
    const brasilia = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const resetHour = 21; // 21:00
    
    const lastReset = new Date(points?.last_reset || 0);
    const shouldReset = brasilia.getHours() >= resetHour && 
                       (brasilia.getDate() !== lastReset.getDate() || 
                        brasilia.getMonth() !== lastReset.getMonth());
    
    return shouldReset;
  };

  // Adicionar pontos
  const addPoints = async (gameType: string, pointsToAdd: number) => {
    if (!walletAddress || !points) return false;

    // Verificar limite diário
    const dailyLimit = getDailyLimit(gameType);
    if (points.daily_limits[gameType] >= dailyLimit) {
      throw new Error(`Limite diário atingido para ${gameType}`);
    }

    try {
      // Atualizar no Supabase
      const { error } = await supabase
        .from('users')
        .update({
          total_points: points.total_points + pointsToAdd,
          daily_limits: {
            ...points.daily_limits,
            [gameType]: points.daily_limits[gameType] + 1
          }
        })
        .eq('wallet_address', walletAddress);

      if (error) throw error;

      // Atualizar estado local
      setPoints(prev => ({
        ...prev!,
        total_points: prev!.total_points + pointsToAdd,
        daily_limits: {
          ...prev!.daily_limits,
          [gameType]: prev!.daily_limits[gameType] + 1
        }
      }));

      return true;
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      return false;
    }
  };

  // Obter limite diário por jogo
  const getDailyLimit = (gameType: string) => {
    const limits = {
      meow_clicker: 1000,
      crypto_quiz: 20,
      lucky_spin: 5,
      treasure_hunt: 3,
      battle_arena: 10
    };
    return limits[gameType] || 0;
  };

  // Carregar dados do usuário
  useEffect(() => {
    if (!walletAddress) return;

    const loadUserData = async () => {
      try {
        let { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('wallet_address', walletAddress)
          .single();

        if (error && error.code === 'PGRST116') {
          // Usuário não existe, criar
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              wallet_address: walletAddress,
              total_points: 0
            })
            .select()
            .single();

          if (createError) throw createError;
          user = newUser;
        }

        const userData: PointsData = {
          total_points: user.total_points || 0,
          last_reset: user.last_reset || new Date().toISOString(),
          daily_limits: user.daily_limits || {
            meow_clicker: 0,
            crypto_quiz: 0,
            lucky_spin: 0,
            treasure_hunt: 0,
            battle_arena: 0
          }
        };

        // Verificar se precisa resetar
        if (checkDailyReset()) {
          await resetDailyLimits();
        } else {
          setPoints(userData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [walletAddress]);

  // Reset diário
  const resetDailyLimits = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          daily_limits: {
            meow_clicker: 0,
            crypto_quiz: 0,
            lucky_spin: 0,
            treasure_hunt: 0,
            battle_arena: 0
          },
          last_reset: new Date().toISOString()
        })
        .eq('wallet_address', walletAddress);

      if (error) throw error;

      setPoints(prev => ({
        ...prev!,
        daily_limits: {
          meow_clicker: 0,
          crypto_quiz: 0,
          lucky_spin: 0,
          treasure_hunt: 0,
          battle_arena: 0
        },
        last_reset: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Erro ao resetar limites:', error);
    }
  };

  return {
    points,
    loading,
    addPoints,
    getDailyLimit,
    checkDailyReset
  };
};
```

### 2. Componente de Display de Pontos (`PointsDisplay.tsx`)

```typescript
// client/src/components/PointsDisplay.tsx
import React from 'react';
import { usePoints } from '../hooks/usePoints';

interface PointsDisplayProps {
  walletAddress: string;
  className?: string;
}

export const PointsDisplay: React.FC<PointsDisplayProps> = ({ 
  walletAddress, 
  className = '' 
}) => {
  const { points, loading } = usePoints(walletAddress);

  if (loading) {
    return (
      <div className={`points-display loading ${className}`}>
        <div className="points-shimmer"></div>
      </div>
    );
  }

  return (
    <div className={`points-display ${className}`}>
      <div className="points-container">
        <div className="points-icon">🎯</div>
        <div className="points-info">
          <div className="points-label">Meow Points</div>
          <div className="points-value">
            {points?.total_points?.toLocaleString() || '0'}
          </div>
        </div>
      </div>
      
      <div className="points-glow"></div>
      
      <style jsx>{`
        .points-display {
          background: linear-gradient(135deg, #9a45fc 0%, #2ad6d0 100%);
          border-radius: 15px;
          padding: 15px 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(154, 69, 252, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .points-container {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 2;
        }
        
        .points-icon {
          font-size: 24px;
          filter: drop-shadow(0 0 10px rgba(255, 225, 24, 0.8));
        }
        
        .points-info {
          flex: 1;
        }
        
        .points-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 2px;
        }
        
        .points-value {
          font-size: 20px;
          font-weight: bold;
          color: #ffe118;
          text-shadow: 0 0 10px rgba(255, 225, 24, 0.5);
        }
        
        .points-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 225, 24, 0.1) 0%, transparent 70%);
          animation: pulse 2s ease-in-out infinite;
        }
        
        .loading .points-shimmer {
          width: 120px;
          height: 40px;
          background: linear-gradient(90deg, #333 25%, #555 50%, #333 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};
```

### 3. Componente de Ranking (`Leaderboard.tsx`)

```typescript
// client/src/components/Leaderboard.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface LeaderboardEntry {
  wallet_address: string;
  total_points: number;
  rank: number;
}

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('wallet_address, total_points')
          .order('total_points', { ascending: false })
          .limit(100);

        if (error) throw error;

        const leaderboardData = data.map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));

        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Erro ao carregar leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();

    // Atualizar a cada 30 segundos
    const interval = setInterval(loadLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  if (loading) {
    return (
      <div className="leaderboard loading">
        <div className="leaderboard-header">
          <h2>🏆 Ranking Global</h2>
        </div>
        <div className="loading-entries">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="entry-shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>🏆 Ranking Global</h2>
        <div className="total-players">
          {leaderboard.length} jogadores
        </div>
      </div>
      
      <div className="leaderboard-list">
        {leaderboard.map((entry) => (
          <div 
            key={entry.wallet_address} 
            className={`leaderboard-entry ${entry.rank <= 3 ? 'top-three' : ''}`}
          >
            <div className="rank">
              {getRankIcon(entry.rank)}
            </div>
            <div className="wallet">
              {formatWallet(entry.wallet_address)}
            </div>
            <div className="points">
              {entry.total_points.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .leaderboard {
          background: rgba(11, 0, 25, 0.9);
          border-radius: 20px;
          padding: 25px;
          border: 1px solid rgba(154, 69, 252, 0.3);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }
        
        .leaderboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(154, 69, 252, 0.2);
        }
        
        .leaderboard-header h2 {
          color: #ffe118;
          font-size: 24px;
          margin: 0;
          text-shadow: 0 0 10px rgba(255, 225, 24, 0.5);
        }
        
        .total-players {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }
        
        .leaderboard-list {
          max-height: 400px;
          overflow-y: auto;
        }
        
        .leaderboard-entry {
          display: flex;
          align-items: center;
          padding: 12px 15px;
          margin-bottom: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        
        .leaderboard-entry:hover {
          background: rgba(154, 69, 252, 0.1);
          border-color: rgba(154, 69, 252, 0.3);
          transform: translateY(-2px);
        }
        
        .leaderboard-entry.top-three {
          background: linear-gradient(135deg, rgba(255, 225, 24, 0.1) 0%, rgba(154, 69, 252, 0.1) 100%);
          border-color: rgba(255, 225, 24, 0.3);
        }
        
        .rank {
          width: 50px;
          font-size: 18px;
          font-weight: bold;
          color: #ffe118;
          text-align: center;
        }
        
        .wallet {
          flex: 1;
          color: #2ad6d0;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          margin-left: 15px;
        }
        
        .points {
          color: #9a45fc;
          font-weight: bold;
          font-size: 16px;
          text-shadow: 0 0 5px rgba(154, 69, 252, 0.5);
        }
        
        .loading-entries .entry-shimmer {
          height: 50px;
          background: linear-gradient(90deg, #333 25%, #555 50%, #333 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 12px;
          margin-bottom: 8px;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};
```

## 🔄 MODIFICAÇÕES NOS JOGOS EXISTENTES

### Para cada jogo (MeowClicker, CryptoQuiz, LuckySpin, TreasureHunt, BattleArena):

1. **Importar o hook:**
```typescript
import { usePoints } from '../hooks/usePoints';
```

2. **Usar no componente:**
```typescript
const { points, addPoints, getDailyLimit } = usePoints(walletAddress);
```

3. **Verificar limite antes de jogar:**
```typescript
const canPlay = points?.daily_limits[gameType] < getDailyLimit(gameType);
```

4. **Adicionar pontos após ação:**
```typescript
const handleGameAction = async () => {
  try {
    const success = await addPoints(gameType, pointsEarned);
    if (success) {
      // Mostrar feedback de sucesso
      showNotification(`+${pointsEarned} pontos!`);
    }
  } catch (error) {
    showNotification(error.message);
  }
};
```

## 📱 INTEGRAÇÃO NA PÁGINA GAMES

### Modificar `client/src/pages/Games.tsx`:

```typescript
import React from 'react';
import { PointsDisplay } from '../components/PointsDisplay';
import { Leaderboard } from '../components/Leaderboard';
import { MeowClicker } from '../components/MeowClicker';
import { CryptoQuiz } from '../components/CryptoQuiz';
import { LuckySpin } from '../components/LuckySpin';
import { TreasureHunt } from '../components/TreasureHunt';
import { BattleArena } from '../components/BattleArena';

export const Games: React.FC = () => {
  const walletAddress = "DM5bzL1MWThBjhFVXRWzFtYKjqf5Vwhhs2jVzr68hYoV"; // Obter da carteira conectada

  return (
    <div className="games-page">
      <div className="games-header">
        <h1>🎮 Meow Games</h1>
        <PointsDisplay walletAddress={walletAddress} />
      </div>
      
      <div className="games-grid">
        <div className="games-section">
          <div className="game-card">
            <MeowClicker walletAddress={walletAddress} />
          </div>
          
          <div className="game-card">
            <CryptoQuiz walletAddress={walletAddress} />
          </div>
          
          <div className="game-card">
            <LuckySpin walletAddress={walletAddress} />
          </div>
          
          <div className="game-card">
            <TreasureHunt walletAddress={walletAddress} />
          </div>
          
          <div className="game-card">
            <BattleArena walletAddress={walletAddress} />
          </div>
        </div>
        
        <div className="leaderboard-section">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
};
```

## 🎨 ESTILOS CYBERPUNK

### Adicionar ao `client/src/index.css`:

```css
/* Sistema de Pontos - Tema Cyberpunk */
.games-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0b0019 0%, #1a0033 50%, #0b0019 100%);
  padding: 20px;
}

.games-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(154, 69, 252, 0.3);
}

.games-header h1 {
  color: #ffe118;
  font-size: 32px;
  text-shadow: 0 0 20px rgba(255, 225, 24, 0.5);
  margin: 0;
}

.games-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.games-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.game-card {
  background: rgba(11, 0, 25, 0.8);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid rgba(154, 69, 252, 0.3);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
}

.game-card:hover {
  transform: translateY(-5px);
  border-color: rgba(42, 214, 208, 0.5);
  box-shadow: 0 15px 50px rgba(42, 214, 208, 0.2);
}

.leaderboard-section {
  position: sticky;
  top: 20px;
  height: fit-content;
}

/* Notificações de Pontos */
.points-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #9a45fc 0%, #2ad6d0 100%);
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  font-weight: bold;
  z-index: 1000;
  animation: slideIn 0.3s ease, slideOut 0.3s ease 2.7s;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}

/* Responsivo */
@media (max-width: 768px) {
  .games-grid {
    grid-template-columns: 1fr;
  }
  
  .games-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .games-section {
    grid-template-columns: 1fr;
  }
}
```

## ⚠️ INSTRUÇÕES IMPORTANTES

### 1. REMOVER SISTEMA ANTIGO:
- Procure e remova qualquer sistema de pontos existente
- Delete arquivos relacionados a pontuação antiga
- Limpe imports não utilizados

### 2. CONFIGURAÇÃO SUPABASE:
- Use a configuração existente em `client/src/lib/supabase.ts`
- NÃO altere as credenciais do Supabase
- A tabela `users` com coluna `total_points` já existe

### 3. RESET DIÁRIO:
- Implementar verificação às 21:00 (horário de Brasília)
- Resetar apenas os limites diários, NÃO os pontos totais
- Usar timezone "America/Sao_Paulo"

### 4. SEGURANÇA:
- Validar todas as entradas do usuário
- Implementar rate limiting
- Logs de todas as ações de pontos
- Verificar limites antes de adicionar pontos

### 5. PERFORMANCE:
- Cache local dos dados de pontos
- Atualizações otimistas na UI
- Debounce em ações repetitivas
- Lazy loading do leaderboard

## 🚀 RESULTADO ESPERADO

Após a implementação, o usuário deve ter:

✅ **Sistema de pontos funcionando** com reset diário às 21:00
✅ **5 jogos integrados** com limites diários
✅ **Ranking global** atualizado em tempo real  
✅ **Interface cyberpunk** responsiva e moderna
✅ **Integração Supabase** salvando pontos corretamente
✅ **Preparação para TGE** com dados exportáveis

## 📞 SUPORTE

Se encontrar problemas:
1. Verifique a conexão com Supabase
2. Confirme se a tabela `users` existe com coluna `total_points`
3. Teste o reset diário manualmente
4. Valide os limites de cada jogo
5. Monitore o console para erros

**IMPORTANTE:** Este sistema é preparado para TGE - os pontos acumulam sem conversão automática até o momento do Token Generation Event.

---

**🎯 EXECUTE ESTE PROMPT NO AGENTE REPLIT PARA IMPLEMENTAÇÃO COMPLETA!**

