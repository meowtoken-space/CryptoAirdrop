// supabase_client_config.js - Configuração do cliente Supabase para o sistema de pontos

import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase (substitua pelas suas chaves)
const supabaseUrl = process.env.SUPABASE_URL || 'https://lixusjljqwqmxduvjffy.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sua_chave_anonima_aqui'

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Configurações do sistema de pontos
export const POINTS_CONFIG = {
  // Limites diários por jogo
  DAILY_LIMITS: {
    meow_clicker: { max_points: 10000, max_activities: 100 },
    crypto_quiz: { max_points: 5000, max_activities: 20 },
    lucky_spin: { max_points: 3000, max_activities: 10 },
    treasure_hunt: { max_points: 8000, max_activities: 15 },
    battle_arena: { max_points: 12000, max_activities: 25 }
  },
  
  // Multiplicadores de pontos
  MULTIPLIERS: {
    base: 1.0,
    weekend: 1.5,
    special_events: 2.0,
    level_bonus: true
  },
  
  // Anti-cheat
  ANTI_CHEAT: {
    max_points_per_minute: 1000,
    max_activities_per_minute: 10,
    suspicious_threshold: 5000
  },
  
  // Configurações gerais
  LEADERBOARD_SIZE: 100,
  ACHIEVEMENTS_ENABLED: true
}

// Classe principal do sistema de pontos
export class MeowPointsSystem {
  constructor() {
    this.currentUser = null
    this.isInitialized = false
  }

  // Inicializar sistema
  async initialize(walletAddress) {
    try {
      this.currentUser = walletAddress
      
      // Configurar contexto do usuário para RLS
      await supabase.rpc('set_config', {
        parameter: 'app.current_user_wallet',
        value: walletAddress
      })
      
      // Criar usuário se não existir
      await this.ensureUserExists(walletAddress)
      
      this.isInitialized = true
      console.log('✅ Sistema de pontos inicializado para:', walletAddress)
      
      return { success: true, message: 'Sistema inicializado com sucesso' }
    } catch (error) {
      console.error('❌ Erro ao inicializar sistema:', error)
      return { success: false, error: error.message }
    }
  }

  // Garantir que usuário existe no banco
  async ensureUserExists(walletAddress) {
    const { data, error } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('wallet_address', walletAddress)
      .single()

    if (error && error.code === 'PGRST116') {
      // Usuário não existe, criar
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          wallet_address: walletAddress,
          total_points: 0,
          experience_points: 0,
          level_id: 1,
          is_active: true,
          last_activity: new Date().toISOString()
        })

      if (insertError) {
        throw new Error(`Erro ao criar usuário: ${insertError.message}`)
      }
    } else if (error) {
      throw new Error(`Erro ao verificar usuário: ${error.message}`)
    }
  }

  // Adicionar pontos ao usuário
  async addPoints(points, experiencePoints = 0, activityType = 'manual', gameType = null, metadata = {}) {
    if (!this.isInitialized) {
      throw new Error('Sistema não inicializado. Chame initialize() primeiro.')
    }

    try {
      // Verificar limites diários
      const canAdd = await this.checkDailyLimits(activityType, gameType, points)
      if (!canAdd.allowed) {
        return { success: false, error: canAdd.reason }
      }

      // Aplicar multiplicadores
      const finalPoints = this.applyMultipliers(points, activityType)
      const finalExp = this.applyMultipliers(experiencePoints, activityType)

      // Usar função do banco para adicionar pontos
      const { data, error } = await supabase.rpc('add_user_points', {
        wallet_addr: this.currentUser,
        points: finalPoints,
        exp_points: finalExp,
        activity_type: activityType,
        game_type: gameType,
        metadata: metadata
      })

      if (error) {
        throw new Error(`Erro ao adicionar pontos: ${error.message}`)
      }

      // Atualizar limites diários
      await this.updateDailyLimits(activityType, gameType, finalPoints)

      // Verificar conquistas
      await this.checkAchievements(activityType, gameType, metadata)

      return {
        success: true,
        data: data,
        points_added: finalPoints,
        experience_added: finalExp
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar pontos:', error)
      return { success: false, error: error.message }
    }
  }

  // Verificar limites diários
  async checkDailyLimits(activityType, gameType, points) {
    if (!gameType || !POINTS_CONFIG.DAILY_LIMITS[gameType]) {
      return { allowed: true }
    }

    const today = new Date().toISOString().split('T')[0]
    const limits = POINTS_CONFIG.DAILY_LIMITS[gameType]

    const { data, error } = await supabase
      .from('daily_limits')
      .select('*')
      .eq('user_wallet', this.currentUser)
      .eq('activity_type', activityType)
      .eq('game_type', gameType)
      .eq('last_reset_date', today)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao verificar limites:', error)
      return { allowed: true } // Em caso de erro, permitir
    }

    if (data) {
      if (data.points_earned_today + points > limits.max_points) {
        return {
          allowed: false,
          reason: `Limite diário de pontos atingido para ${gameType} (${limits.max_points})`
        }
      }
      if (data.activities_count >= limits.max_activities) {
        return {
          allowed: false,
          reason: `Limite diário de atividades atingido para ${gameType} (${limits.max_activities})`
        }
      }
    }

    return { allowed: true }
  }

  // Atualizar limites diários
  async updateDailyLimits(activityType, gameType, points) {
    if (!gameType) return

    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase
      .from('daily_limits')
      .upsert({
        user_wallet: this.currentUser,
        activity_type: activityType,
        game_type: gameType,
        last_reset_date: today,
        points_earned_today: supabase.raw(`COALESCE(points_earned_today, 0) + ${points}`),
        activities_count: supabase.raw(`COALESCE(activities_count, 0) + 1`)
      }, {
        onConflict: 'user_wallet,activity_type,game_type,last_reset_date'
      })

    if (error) {
      console.error('Erro ao atualizar limites diários:', error)
    }
  }

  // Aplicar multiplicadores
  applyMultipliers(points, activityType) {
    let multiplier = POINTS_CONFIG.MULTIPLIERS.base

    // Multiplicador de fim de semana
    const now = new Date()
    const isWeekend = now.getDay() === 0 || now.getDay() === 6
    if (isWeekend) {
      multiplier *= POINTS_CONFIG.MULTIPLIERS.weekend
    }

    // Outros multiplicadores podem ser adicionados aqui

    return Math.floor(points * multiplier)
  }

  // Verificar conquistas
  async checkAchievements(activityType, gameType, metadata) {
    if (!POINTS_CONFIG.ACHIEVEMENTS_ENABLED) return

    try {
      // Buscar conquistas relevantes
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .or(`category.eq.games,category.eq.milestones`)

      if (error) {
        console.error('Erro ao buscar conquistas:', error)
        return
      }

      // Verificar cada conquista
      for (const achievement of achievements) {
        await this.checkSingleAchievement(achievement, activityType, gameType, metadata)
      }
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error)
    }
  }

  // Verificar conquista individual
  async checkSingleAchievement(achievement, activityType, gameType, metadata) {
    try {
      // Verificar se usuário já tem esta conquista
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_wallet', this.currentUser)
        .eq('achievement_id', achievement.id)
        .single()

      if (existing) return // Já tem a conquista

      const requirements = achievement.requirements
      let unlocked = false

      // Lógica de verificação baseada nos requisitos
      if (requirements.game && requirements.game === gameType) {
        if (requirements.action === 'first_click' && activityType === 'game') {
          unlocked = true
        } else if (requirements.total_clicks) {
          // Verificar total de cliques
          const { data: activities } = await supabase
            .from('point_activities')
            .select('id')
            .eq('user_wallet', this.currentUser)
            .eq('game_type', gameType)

          if (activities && activities.length >= requirements.total_clicks) {
            unlocked = true
          }
        }
      }

      // Verificar conquistas de marcos
      if (requirements.total_points) {
        const { data: user } = await supabase
          .from('users')
          .select('total_points')
          .eq('wallet_address', this.currentUser)
          .single()

        if (user && user.total_points >= requirements.total_points) {
          unlocked = true
        }
      }

      // Desbloquear conquista se atendeu os requisitos
      if (unlocked) {
        await this.unlockAchievement(achievement)
      }
    } catch (error) {
      console.error('Erro ao verificar conquista individual:', error)
    }
  }

  // Desbloquear conquista
  async unlockAchievement(achievement) {
    try {
      // Adicionar conquista ao usuário
      const { error: insertError } = await supabase
        .from('user_achievements')
        .insert({
          user_wallet: this.currentUser,
          achievement_id: achievement.id,
          unlocked_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Erro ao inserir conquista:', insertError)
        return
      }

      // Adicionar pontos de recompensa
      if (achievement.points_reward > 0 || achievement.experience_reward > 0) {
        await this.addPoints(
          achievement.points_reward,
          achievement.experience_reward,
          'achievement',
          null,
          { achievement_id: achievement.id, achievement_name: achievement.name }
        )
      }

      // Disparar evento de conquista desbloqueada
      this.onAchievementUnlocked(achievement)

      console.log('🏆 Conquista desbloqueada:', achievement.name)
    } catch (error) {
      console.error('Erro ao desbloquear conquista:', error)
    }
  }

  // Callback para conquista desbloqueada (pode ser sobrescrito)
  onAchievementUnlocked(achievement) {
    // Implementar notificação visual aqui
    if (window.showAchievementNotification) {
      window.showAchievementNotification(achievement)
    }
  }

  // Obter dados do usuário
  async getUserData() {
    if (!this.isInitialized) {
      throw new Error('Sistema não inicializado')
    }

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('wallet_address', this.currentUser)
        .single()

      if (error) {
        throw new Error(`Erro ao buscar dados do usuário: ${error.message}`)
      }

      return { success: true, data }
    } catch (error) {
      console.error('❌ Erro ao obter dados do usuário:', error)
      return { success: false, error: error.message }
    }
  }

  // Obter ranking global
  async getGlobalRanking(limit = 100) {
    try {
      const { data, error } = await supabase.rpc('get_global_ranking', {
        limit_size: limit
      })

      if (error) {
        throw new Error(`Erro ao buscar ranking: ${error.message}`)
      }

      return { success: true, data }
    } catch (error) {
      console.error('❌ Erro ao obter ranking:', error)
      return { success: false, error: error.message }
    }
  }

  // Obter conquistas do usuário
  async getUserAchievements() {
    if (!this.isInitialized) {
      throw new Error('Sistema não inicializado')
    }

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements (
            name,
            description,
            icon,
            category,
            rarity,
            points_reward,
            experience_reward
          )
        `)
        .eq('user_wallet', this.currentUser)
        .order('unlocked_at', { ascending: false })

      if (error) {
        throw new Error(`Erro ao buscar conquistas: ${error.message}`)
      }

      return { success: true, data }
    } catch (error) {
      console.error('❌ Erro ao obter conquistas:', error)
      return { success: false, error: error.message }
    }
  }

  // Criar snapshot para TGE
  async createTGESnapshot(snapshotName, description = '', conversionRate = null) {
    try {
      // Obter ranking completo
      const ranking = await this.getGlobalRanking(10000) // Todos os usuários
      
      if (!ranking.success) {
        throw new Error('Erro ao obter ranking para snapshot')
      }

      const totalUsers = ranking.data.length
      const totalPoints = ranking.data.reduce((sum, user) => sum + user.total_points, 0)

      const { data, error } = await supabase
        .from('tge_snapshots')
        .insert({
          snapshot_name: snapshotName,
          description: description,
          total_users: totalUsers,
          total_points: totalPoints,
          conversion_rate: conversionRate,
          snapshot_data: ranking.data,
          created_at: new Date().toISOString(),
          created_by: this.currentUser
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Erro ao criar snapshot: ${error.message}`)
      }

      return { success: true, data }
    } catch (error) {
      console.error('❌ Erro ao criar snapshot TGE:', error)
      return { success: false, error: error.message }
    }
  }
}

// Instância global do sistema
export const meowPoints = new MeowPointsSystem()

// Funções de conveniência
export const initializePoints = (walletAddress) => meowPoints.initialize(walletAddress)
export const addGamePoints = (game, points, exp = 0, metadata = {}) => 
  meowPoints.addPoints(points, exp, 'game', game, metadata)
export const getUserStats = () => meowPoints.getUserData()
export const getLeaderboard = (limit) => meowPoints.getGlobalRanking(limit)

// Exportar configurações
export { POINTS_CONFIG }

console.log('📦 Sistema de Pontos Meow Token carregado!')

