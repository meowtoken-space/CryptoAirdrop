# 🎮 SISTEMA DE PONTOS PARA TGE - MEOW TOKEN

## 🎯 CONCEITO

Sistema de pontos **acumulativo** onde usuários ganham Meow Points jogando, mas **não convertem automaticamente** em tokens. Os pontos ficam "congelados" até o **TGE (Token Generation Event)**, quando você define a taxa de conversão e distribui os tokens baseado no ranking final.

---

## 🏗️ ARQUITETURA SIMPLIFICADA

### **1. BANCO DE DADOS (Supabase)**

```sql
-- Usuários e seus pontos acumulados
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Histórico de pontuações por jogo
CREATE TABLE point_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  game_name TEXT NOT NULL,
  points_earned INTEGER NOT NULL,
  session_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ranking global (atualizado automaticamente)
CREATE TABLE global_ranking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  rank_position INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  percentage_of_total DECIMAL(5,2), -- % do total de pontos
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Snapshots para TGE (quando você quiser "congelar" os pontos)
CREATE TABLE tge_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_name TEXT NOT NULL,
  total_users INTEGER,
  total_points_distributed INTEGER,
  snapshot_data JSONB, -- Dados completos do ranking
  created_at TIMESTAMP DEFAULT NOW()
);

-- Configurações do sistema
CREATE TABLE system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir configurações iniciais
INSERT INTO system_config (config_key, config_value) VALUES
('points_per_click', '1'),
('points_per_quiz_correct', '10'),
('points_per_spin_win', '50'),
('daily_point_limit', '1000'),
('tge_active', 'false');
```

### **2. FUNÇÃO PARA ATUALIZAR RANKING**

```sql
-- Função para recalcular ranking automaticamente
CREATE OR REPLACE FUNCTION update_global_ranking()
RETURNS void AS $$
DECLARE
  total_points_sum INTEGER;
BEGIN
  -- Calcular total de pontos no sistema
  SELECT SUM(total_points) INTO total_points_sum FROM users WHERE total_points > 0;
  
  -- Atualizar ranking
  WITH ranked_users AS (
    SELECT 
      id,
      total_points,
      ROW_NUMBER() OVER (ORDER BY total_points DESC, created_at ASC) as rank_pos,
      CASE 
        WHEN total_points_sum > 0 THEN (total_points::DECIMAL / total_points_sum * 100)
        ELSE 0 
      END as percentage
    FROM users
    WHERE total_points > 0
  )
  INSERT INTO global_ranking (user_id, rank_position, total_points, percentage_of_total)
  SELECT id, rank_pos, total_points, percentage
  FROM ranked_users
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    rank_position = EXCLUDED.rank_position,
    total_points = EXCLUDED.total_points,
    percentage_of_total = EXCLUDED.percentage_of_total,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar ranking quando pontos mudarem
CREATE OR REPLACE FUNCTION trigger_update_ranking()
RETURNS trigger AS $$
BEGIN
  PERFORM update_global_ranking();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ranking_trigger
  AFTER UPDATE OF total_points ON users
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_update_ranking();
```

---

## 🎮 SISTEMA DE PONTOS

### **Hook para Gerenciar Pontos:**

```typescript
// hooks/usePointsSystem.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useWallet } from '@solana/wallet-adapter-react'

interface UserStats {
  totalPoints: number
  level: number
  xp: number
  gamesPlayed: number
  rankPosition: number
  percentageOfTotal: number
}

export const usePointsSystem = () => {
  const { publicKey } = useWallet()
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    level: 1,
    xp: 0,
    gamesPlayed: 0,
    rankPosition: 0,
    percentageOfTotal: 0
  })
  const [loading, setLoading] = useState(false)

  // Buscar estatísticas do usuário
  const fetchUserStats = async () => {
    if (!publicKey) return

    setLoading(true)
    try {
      // Buscar dados do usuário
      const { data: userData } = await supabase
        .from('users')
        .select('total_points, level, xp, games_played')
        .eq('wallet_address', publicKey.toString())
        .single()

      // Buscar posição no ranking
      const { data: rankData } = await supabase
        .from('global_ranking')
        .select('rank_position, percentage_of_total')
        .eq('user_id', userData?.id)
        .single()

      if (userData) {
        setUserStats({
          totalPoints: userData.total_points || 0,
          level: userData.level || 1,
          xp: userData.xp || 0,
          gamesPlayed: userData.games_played || 0,
          rankPosition: rankData?.rank_position || 0,
          percentageOfTotal: rankData?.percentage_of_total || 0
        })
      }
    } catch (error) {
      console.error('Erro ao buscar stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Adicionar pontos (sem conversão)
  const addPoints = async (gameName: string, pointsEarned: number, sessionData?: any) => {
    if (!publicKey) return { success: false, error: 'Wallet não conectada' }

    try {
      // 1. Buscar usuário atual
      const { data: user } = await supabase
        .from('users')
        .select('id, total_points, xp, games_played')
        .eq('wallet_address', publicKey.toString())
        .single()

      if (!user) {
        // Criar usuário se não existir
        const { data: newUser } = await supabase
          .from('users')
          .insert({
            wallet_address: publicKey.toString(),
            total_points: pointsEarned,
            xp: pointsEarned,
            level: Math.floor(pointsEarned / 1000) + 1,
            games_played: 1
          })
          .select('id')
          .single()

        // Registrar no histórico
        await supabase.from('point_history').insert({
          user_id: newUser.id,
          game_name: gameName,
          points_earned: pointsEarned,
          session_data: sessionData
        })

        await fetchUserStats()
        return { success: true, newPoints: pointsEarned }
      }

      // 2. Atualizar pontos do usuário existente
      const newTotalPoints = user.total_points + pointsEarned
      const newXp = user.xp + pointsEarned
      const newLevel = Math.floor(newXp / 1000) + 1
      const newGamesPlayed = user.games_played + 1

      await supabase
        .from('users')
        .update({
          total_points: newTotalPoints,
          xp: newXp,
          level: newLevel,
          games_played: newGamesPlayed,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      // 3. Registrar no histórico
      await supabase.from('point_history').insert({
        user_id: user.id,
        game_name: gameName,
        points_earned: pointsEarned,
        session_data: sessionData
      })

      // 4. Atualizar stats locais
      await fetchUserStats()

      return { 
        success: true, 
        newPoints: newTotalPoints,
        pointsEarned,
        newLevel 
      }
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error)
      return { success: false, error: 'Erro interno' }
    }
  }

  // Buscar histórico de pontos
  const getPointHistory = async (limit = 50) => {
    if (!publicKey) return []

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', publicKey.toString())
      .single()

    if (!user) return []

    const { data } = await supabase
      .from('point_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    return data || []
  }

  useEffect(() => {
    fetchUserStats()
  }, [publicKey])

  return {
    userStats,
    loading,
    addPoints,
    fetchUserStats,
    getPointHistory
  }
}
```

---

## 🏆 RANKING GLOBAL

### **Componente de Leaderboard:**

```typescript
// components/GlobalRanking.tsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface RankingEntry {
  rank_position: number
  total_points: number
  percentage_of_total: number
  user: {
    wallet_address: string
    username: string
    level: number
    games_played: number
    last_activity: string
  }
}

export const GlobalRanking: React.FC = () => {
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchRanking = async () => {
    setLoading(true)

    try {
      // Buscar ranking
      const { data: rankingData } = await supabase
        .from('global_ranking')
        .select(`
          rank_position,
          total_points,
          percentage_of_total,
          user:users(
            wallet_address,
            username,
            level,
            games_played,
            last_activity
          )
        `)
        .order('rank_position', { ascending: true })
        .limit(100)

      // Buscar estatísticas gerais
      const { data: statsData } = await supabase
        .from('users')
        .select('total_points')
        .gt('total_points', 0)

      if (rankingData) {
        setRanking(rankingData)
      }

      if (statsData) {
        setTotalUsers(statsData.length)
        setTotalPoints(statsData.reduce((sum, user) => sum + user.total_points, 0))
      }
    } catch (error) {
      console.error('Erro ao buscar ranking:', error)
    } finally {
      setLoading(false)
    }
  }

  // Subscription para atualizações em tempo real
  useEffect(() => {
    fetchRanking()

    const subscription = supabase
      .channel('ranking_updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'global_ranking'
        }, 
        () => {
          fetchRanking()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const formatWallet = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return '👑'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${position}`
    }
  }

  const getLastActivityText = (lastActivity: string) => {
    const diff = Date.now() - new Date(lastActivity).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d atrás`
    if (hours > 0) return `${hours}h atrás`
    return 'Agora'
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">🏆 Ranking Global</h1>
        
        {/* Estatísticas gerais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-white">Total de Usuários</h3>
            <p className="text-3xl font-bold text-purple-400">{totalUsers.toLocaleString()}</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-900 to-cyan-900 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-white">Pontos Distribuídos</h3>
            <p className="text-3xl font-bold text-cyan-400">{totalPoints.toLocaleString()}</p>
          </div>
          
          <div className="bg-gradient-to-r from-cyan-900 to-teal-900 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-white">Média por Usuário</h3>
            <p className="text-3xl font-bold text-teal-400">
              {totalUsers > 0 ? Math.round(totalPoints / totalUsers).toLocaleString() : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Lista do ranking */}
      <div className="bg-gray-900/50 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Top 100 Jogadores</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-400 mt-4">Carregando ranking...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ranking.map((entry) => (
              <div
                key={entry.user.wallet_address}
                className={`flex items-center justify-between p-4 rounded-lg transition-all hover:bg-gray-800/50 ${
                  entry.rank_position <= 3
                    ? 'bg-gradient-to-r from-yellow-900/20 to-purple-900/20 border border-yellow-500/30'
                    : 'bg-gray-800/30'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold w-16 text-center">
                    {getRankIcon(entry.rank_position)}
                  </div>
                  
                  <div>
                    <p className="font-medium text-white">
                      {entry.user.username || formatWallet(entry.user.wallet_address)}
                    </p>
                    <div className="flex space-x-4 text-sm text-gray-400">
                      <span>Level {entry.user.level}</span>
                      <span>{entry.user.games_played} jogos</span>
                      <span>{getLastActivityText(entry.user.last_activity)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-400">
                    {entry.total_points.toLocaleString()}
                  </p>
                  <div className="text-sm text-gray-400">
                    <p>{entry.percentage_of_total.toFixed(2)}% do total</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 👨‍💼 DASHBOARD ADMINISTRATIVO

### **Painel de Controle para Você:**

```typescript
// components/AdminDashboard.tsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface AdminStats {
  totalUsers: number
  totalPoints: number
  activeUsers24h: number
  topGames: Array<{
    game_name: string
    total_points: number
    sessions: number
  }>
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPoints: 0,
    activeUsers24h: 0,
    topGames: []
  })
  const [tgeRate, setTgeRate] = useState('1000') // 1000 pontos = 1 token
  const [loading, setLoading] = useState(false)

  const fetchAdminStats = async () => {
    setLoading(true)

    try {
      // Total de usuários e pontos
      const { data: usersData } = await supabase
        .from('users')
        .select('total_points, last_activity')
        .gt('total_points', 0)

      // Usuários ativos nas últimas 24h
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const activeUsers = usersData?.filter(user => 
        new Date(user.last_activity) > new Date(yesterday)
      ).length || 0

      // Jogos mais populares
      const { data: gamesData } = await supabase
        .from('point_history')
        .select('game_name, points_earned')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      const gameStats = gamesData?.reduce((acc, session) => {
        if (!acc[session.game_name]) {
          acc[session.game_name] = { total_points: 0, sessions: 0 }
        }
        acc[session.game_name].total_points += session.points_earned
        acc[session.game_name].sessions += 1
        return acc
      }, {} as Record<string, { total_points: number, sessions: number }>) || {}

      const topGames = Object.entries(gameStats)
        .map(([game_name, data]) => ({ game_name, ...data }))
        .sort((a, b) => b.total_points - a.total_points)
        .slice(0, 5)

      setStats({
        totalUsers: usersData?.length || 0,
        totalPoints: usersData?.reduce((sum, user) => sum + user.total_points, 0) || 0,
        activeUsers24h: activeUsers,
        topGames
      })
    } catch (error) {
      console.error('Erro ao buscar stats admin:', error)
    } finally {
      setLoading(false)
    }
  }

  // Criar snapshot para TGE
  const createTGESnapshot = async () => {
    if (!confirm('Criar snapshot para TGE? Esta ação não pode ser desfeita.')) return

    try {
      // Buscar ranking atual
      const { data: rankingData } = await supabase
        .from('global_ranking')
        .select(`
          rank_position,
          total_points,
          percentage_of_total,
          user:users(wallet_address, username, level)
        `)
        .order('rank_position', { ascending: true })

      // Criar snapshot
      await supabase.from('tge_snapshots').insert({
        snapshot_name: `TGE_${new Date().toISOString().split('T')[0]}`,
        total_users: stats.totalUsers,
        total_points_distributed: stats.totalPoints,
        snapshot_data: rankingData
      })

      alert('Snapshot criado com sucesso!')
    } catch (error) {
      console.error('Erro ao criar snapshot:', error)
      alert('Erro ao criar snapshot')
    }
  }

  // Calcular distribuição de tokens
  const calculateTokenDistribution = () => {
    const rate = parseInt(tgeRate)
    if (!rate) return []

    return stats.topGames.map(game => ({
      ...game,
      tokens: Math.floor(game.total_points / rate)
    }))
  }

  // Exportar dados para CSV
  const exportRankingCSV = async () => {
    try {
      const { data } = await supabase
        .from('global_ranking')
        .select(`
          rank_position,
          total_points,
          percentage_of_total,
          user:users(wallet_address, username, level, games_played)
        `)
        .order('rank_position', { ascending: true })

      if (!data) return

      const csv = [
        'Posição,Wallet,Username,Level,Jogos,Pontos,% Total,Tokens (estimativa)',
        ...data.map(entry => {
          const tokens = Math.floor(entry.total_points / parseInt(tgeRate))
          return [
            entry.rank_position,
            entry.user.wallet_address,
            entry.user.username || '',
            entry.user.level,
            entry.user.games_played,
            entry.total_points,
            entry.percentage_of_total.toFixed(2) + '%',
            tokens
          ].join(',')
        })
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meow_ranking_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    } catch (error) {
      console.error('Erro ao exportar CSV:', error)
    }
  }

  useEffect(() => {
    fetchAdminStats()
    const interval = setInterval(fetchAdminStats, 30000) // Atualizar a cada 30s
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-white mb-8">🎛️ Dashboard Administrativo</h1>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-2">Total Usuários</h3>
          <p className="text-3xl font-bold text-purple-400">{stats.totalUsers.toLocaleString()}</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-900 to-cyan-900 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-2">Total Pontos</h3>
          <p className="text-3xl font-bold text-cyan-400">{stats.totalPoints.toLocaleString()}</p>
        </div>
        
        <div className="bg-gradient-to-r from-cyan-900 to-teal-900 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-2">Ativos 24h</h3>
          <p className="text-3xl font-bold text-teal-400">{stats.activeUsers24h.toLocaleString()}</p>
        </div>
        
        <div className="bg-gradient-to-r from-teal-900 to-green-900 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-2">Tokens Estimados</h3>
          <p className="text-3xl font-bold text-green-400">
            {Math.floor(stats.totalPoints / parseInt(tgeRate)).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Controles TGE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900/50 p-6 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-4">⚙️ Configurações TGE</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Taxa de Conversão (pontos por token)</label>
              <input
                type="number"
                value={tgeRate}
                onChange={(e) => setTgeRate(e.target.value)}
                className="w-full p-3 rounded-lg bg-black/20 text-white border border-gray-600"
                placeholder="1000"
              />
              <p className="text-sm text-gray-400 mt-1">
                Exemplo: 1000 = cada 1000 pontos vira 1 token
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={createTGESnapshot}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:opacity-90"
              >
                📸 Criar Snapshot TGE
              </button>
              
              <button
                onClick={exportRankingCSV}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-lg hover:opacity-90"
              >
                📊 Exportar CSV
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 p-6 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-4">🎮 Jogos Populares (7 dias)</h2>
          
          <div className="space-y-3">
            {stats.topGames.map((game, index) => (
              <div key={game.game_name} className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                <div>
                  <p className="font-medium text-white">{game.game_name}</p>
                  <p className="text-sm text-gray-400">{game.sessions} sessões</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-400">{game.total_points.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">
                    ~{Math.floor(game.total_points / parseInt(tgeRate))} tokens
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botão de atualização */}
      <div className="text-center">
        <button
          onClick={fetchAdminStats}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? '🔄 Atualizando...' : '🔄 Atualizar Dados'}
        </button>
      </div>
    </div>
  )
}
```

---

## 🎮 INTEGRAÇÃO COM JOGOS

### **Hook Simplificado para Jogos:**

```typescript
// hooks/useGameIntegration.ts
import { usePointsSystem } from './usePointsSystem'

export const useGameIntegration = () => {
  const { addPoints } = usePointsSystem()

  // Meow Clicker
  const submitMeowClickerScore = async (clicks: number) => {
    const points = clicks * 1 // 1 ponto por clique
    return await addPoints('Meow Clicker', points, { clicks })
  }

  // Crypto Quiz
  const submitQuizScore = async (correctAnswers: number, totalQuestions: number, timeSpent: number) => {
    const basePoints = correctAnswers * 10
    const timeBonus = Math.max(0, 300 - timeSpent) // Bônus por velocidade
    const totalPoints = basePoints + Math.floor(timeBonus / 10)
    
    return await addPoints('Crypto Quiz', totalPoints, {
      correctAnswers,
      totalQuestions,
      timeSpent,
      accuracy: (correctAnswers / totalQuestions) * 100
    })
  }

  // Lucky Spin
  const submitSpinScore = async (prize: number, spinType: string) => {
    return await addPoints('Lucky Spin', prize, { prize, spinType })
  }

  // Treasure Hunt
  const submitTreasureScore = async (treasuresFound: number, mapCompleted: boolean) => {
    const basePoints = treasuresFound * 25
    const completionBonus = mapCompleted ? 100 : 0
    const totalPoints = basePoints + completionBonus
    
    return await addPoints('Treasure Hunt', totalPoints, {
      treasuresFound,
      mapCompleted,
      completionBonus
    })
  }

  // Battle Arena
  const submitBattleScore = async (won: boolean, enemyLevel: number, damageDealt: number) => {
    const winPoints = won ? enemyLevel * 20 : enemyLevel * 5
    const damageBonus = Math.floor(damageDealt / 100)
    const totalPoints = winPoints + damageBonus
    
    return await addPoints('Battle Arena', totalPoints, {
      won,
      enemyLevel,
      damageDealt,
      winPoints,
      damageBonus
    })
  }

  return {
    submitMeowClickerScore,
    submitQuizScore,
    submitSpinScore,
    submitTreasureScore,
    submitBattleScore
  }
}
```

---

## 📊 SISTEMA DE SNAPSHOT PARA TGE

### **Componente para Gerenciar Snapshots:**

```typescript
// components/TGEManager.tsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Snapshot {
  id: string
  snapshot_name: string
  total_users: number
  total_points_distributed: number
  created_at: string
  snapshot_data: any[]
}

export const TGEManager: React.FC = () => {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null)
  const [tokenRate, setTokenRate] = useState(1000)

  const fetchSnapshots = async () => {
    const { data } = await supabase
      .from('tge_snapshots')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setSnapshots(data)
    }
  }

  const calculateTokenDistribution = (snapshot: Snapshot) => {
    if (!snapshot.snapshot_data) return []

    return snapshot.snapshot_data.map((entry: any) => ({
      ...entry,
      tokens_to_receive: Math.floor(entry.total_points / tokenRate),
      percentage_of_tokens: ((entry.total_points / snapshot.total_points_distributed) * 100).toFixed(2)
    }))
  }

  const exportTokenDistribution = (snapshot: Snapshot) => {
    const distribution = calculateTokenDistribution(snapshot)
    
    const csv = [
      'Rank,Wallet,Username,Pontos,Tokens,% dos Tokens',
      ...distribution.map((entry: any) => [
        entry.rank_position,
        entry.user.wallet_address,
        entry.user.username || '',
        entry.total_points,
        entry.tokens_to_receive,
        entry.percentage_of_tokens + '%'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `token_distribution_${snapshot.snapshot_name}.csv`
    a.click()
  }

  useEffect(() => {
    fetchSnapshots()
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-6">🎯 Gerenciador TGE</h1>

      {/* Lista de snapshots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-4">📸 Snapshots Criados</h2>
          
          <div className="space-y-3">
            {snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                onClick={() => setSelectedSnapshot(snapshot)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedSnapshot?.id === snapshot.id
                    ? 'bg-purple-900/50 border border-purple-500'
                    : 'bg-black/20 hover:bg-black/30'
                }`}
              >
                <h3 className="font-bold text-white">{snapshot.snapshot_name}</h3>
                <div className="text-sm text-gray-400 mt-1">
                  <p>{snapshot.total_users} usuários</p>
                  <p>{snapshot.total_points_distributed.toLocaleString()} pontos</p>
                  <p>{new Date(snapshot.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalhes do snapshot selecionado */}
        <div className="bg-gray-900/50 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-4">⚙️ Configuração de Tokens</h2>
          
          {selectedSnapshot ? (
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Taxa de Conversão</label>
                <input
                  type="number"
                  value={tokenRate}
                  onChange={(e) => setTokenRate(parseInt(e.target.value) || 1000)}
                  className="w-full p-3 rounded-lg bg-black/20 text-white border border-gray-600"
                />
                <p className="text-sm text-gray-400 mt-1">
                  {tokenRate} pontos = 1 token
                </p>
              </div>

              <div className="bg-black/20 p-4 rounded-lg">
                <h3 className="font-bold text-white mb-2">Resumo da Distribuição</h3>
                <p className="text-gray-300">
                  Total de tokens: {Math.floor(selectedSnapshot.total_points_distributed / tokenRate).toLocaleString()}
                </p>
                <p className="text-gray-300">
                  Usuários beneficiados: {selectedSnapshot.total_users}
                </p>
                <p className="text-gray-300">
                  Média por usuário: {Math.floor(selectedSnapshot.total_points_distributed / selectedSnapshot.total_users / tokenRate)} tokens
                </p>
              </div>

              <button
                onClick={() => exportTokenDistribution(selectedSnapshot)}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-lg hover:opacity-90"
              >
                📊 Exportar Distribuição de Tokens
              </button>
            </div>
          ) : (
            <p className="text-gray-400">Selecione um snapshot para configurar a distribuição de tokens</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## 🚀 IMPLEMENTAÇÃO NO SEU PROJETO

### **1. Configurar Supabase:**
```bash
npm install @supabase/supabase-js
```

### **2. Executar as Queries SQL:**
- Copiar e executar todas as queries SQL no Supabase
- Configurar RLS (Row Level Security)

### **3. Integrar os Hooks:**
- Adicionar `usePointsSystem.ts` e `useGameIntegration.ts`
- Integrar com seus jogos existentes

### **4. Adicionar Componentes:**
- `GlobalRanking.tsx` para o ranking público
- `AdminDashboard.tsx` para você controlar
- `TGEManager.tsx` para gerenciar snapshots

### **5. Configurar Variáveis:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

## 🎯 BENEFÍCIOS DESTA ABORDAGEM

✅ **Controle Total:** Você decide quando e como distribuir tokens
✅ **Transparência:** Ranking público para engajamento
✅ **Flexibilidade:** Pode ajustar taxa de conversão no TGE
✅ **Histórico:** Todos os pontos ficam registrados
✅ **Escalável:** Suporta milhões de usuários
✅ **Tempo Real:** Rankings atualizados automaticamente
✅ **Admin Friendly:** Dashboard completo para você

**Este sistema é perfeito para acumular pontos até o TGE e depois distribuir tokens baseado no ranking final!** 🔥

