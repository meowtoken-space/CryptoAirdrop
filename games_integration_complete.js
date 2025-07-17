// games_integration_complete.js - Integração completa dos jogos com sistema de pontos

import { meowPoints, addGamePoints } from './supabase_client_config.js'

// ========================================
// CONFIGURAÇÕES DOS JOGOS
// ========================================

export const GAME_CONFIGS = {
  meow_clicker: {
    name: 'Meow Clicker',
    points_per_click: 10,
    experience_per_click: 5,
    max_clicks_per_session: 100,
    cooldown_ms: 100, // 100ms entre cliques
    power_ups: {
      double_points: { duration: 30000, multiplier: 2 },
      triple_points: { duration: 15000, multiplier: 3 },
      mega_click: { duration: 10000, multiplier: 5 }
    }
  },
  
  crypto_quiz: {
    name: 'Crypto Quiz',
    points_per_correct: 100,
    experience_per_correct: 50,
    points_per_streak: 50, // bonus por sequência
    max_questions_per_session: 20,
    time_bonus_threshold: 5000, // ms para bonus de velocidade
    time_bonus_points: 25
  },
  
  lucky_spin: {
    name: 'Lucky Spin',
    cooldown_ms: 300000, // 5 minutos
    rewards: {
      common: { points: 50, experience: 25, probability: 0.5 },
      rare: { points: 200, experience: 100, probability: 0.3 },
      epic: { points: 500, experience: 250, probability: 0.15 },
      legendary: { points: 1000, experience: 500, probability: 0.04 },
      jackpot: { points: 5000, experience: 2500, probability: 0.01 }
    }
  },
  
  treasure_hunt: {
    name: 'Treasure Hunt',
    points_per_treasure: 150,
    experience_per_treasure: 75,
    bonus_per_map_completion: 500,
    map_size: 10,
    treasures_per_map: 5,
    hint_cost: 10 // pontos para comprar dica
  },
  
  battle_arena: {
    name: 'Battle Arena',
    points_per_win: 300,
    experience_per_win: 150,
    points_per_loss: 50,
    experience_per_loss: 25,
    streak_bonus: 100, // bonus por vitórias consecutivas
    max_battles_per_session: 25
  }
}

// ========================================
// CLASSE BASE PARA JOGOS
// ========================================

class BaseGame {
  constructor(gameType) {
    this.gameType = gameType
    this.config = GAME_CONFIGS[gameType]
    this.sessionData = {
      activities: 0,
      points_earned: 0,
      experience_earned: 0,
      start_time: Date.now()
    }
    this.isActive = false
  }

  // Inicializar jogo
  async initialize() {
    try {
      // Verificar se sistema de pontos está inicializado
      if (!meowPoints.isInitialized) {
        throw new Error('Sistema de pontos não inicializado')
      }

      this.isActive = true
      console.log(`🎮 ${this.config.name} inicializado`)
      return { success: true }
    } catch (error) {
      console.error(`❌ Erro ao inicializar ${this.config.name}:`, error)
      return { success: false, error: error.message }
    }
  }

  // Adicionar pontos com validações
  async awardPoints(points, experience = 0, metadata = {}) {
    if (!this.isActive) {
      throw new Error('Jogo não está ativo')
    }

    try {
      const result = await addGamePoints(
        this.gameType,
        points,
        experience,
        {
          ...metadata,
          session_id: this.sessionData.start_time,
          game_session_data: this.sessionData
        }
      )

      if (result.success) {
        this.sessionData.activities++
        this.sessionData.points_earned += points
        this.sessionData.experience_earned += experience
        
        // Disparar evento de pontos ganhos
        this.onPointsAwarded(points, experience, metadata)
      }

      return result
    } catch (error) {
      console.error(`❌ Erro ao adicionar pontos em ${this.config.name}:`, error)
      return { success: false, error: error.message }
    }
  }

  // Callback para pontos ganhos (pode ser sobrescrito)
  onPointsAwarded(points, experience, metadata) {
    if (window.showPointsNotification) {
      window.showPointsNotification(points, experience, this.config.name)
    }
  }

  // Obter estatísticas da sessão
  getSessionStats() {
    return {
      ...this.sessionData,
      duration: Date.now() - this.sessionData.start_time,
      game: this.config.name
    }
  }

  // Finalizar sessão
  finishSession() {
    this.isActive = false
    const stats = this.getSessionStats()
    console.log(`🏁 Sessão de ${this.config.name} finalizada:`, stats)
    return stats
  }
}

// ========================================
// IMPLEMENTAÇÕES ESPECÍFICAS DOS JOGOS
// ========================================

// Meow Clicker
export class MeowClickerGame extends BaseGame {
  constructor() {
    super('meow_clicker')
    this.clickCount = 0
    this.lastClickTime = 0
    this.activePowerUps = new Map()
    this.energy = 100
    this.maxEnergy = 100
    this.energyRegenRate = 1 // energia por segundo
  }

  async initialize() {
    const result = await super.initialize()
    if (result.success) {
      this.startEnergyRegen()
    }
    return result
  }

  // Sistema de energia
  startEnergyRegen() {
    setInterval(() => {
      if (this.energy < this.maxEnergy) {
        this.energy = Math.min(this.maxEnergy, this.energy + this.energyRegenRate)
        this.updateEnergyDisplay()
      }
    }, 1000)
  }

  // Processar clique
  async processClick() {
    const now = Date.now()
    
    // Verificar cooldown
    if (now - this.lastClickTime < this.config.cooldown_ms) {
      return { success: false, error: 'Clique muito rápido!' }
    }

    // Verificar energia
    if (this.energy < 1) {
      return { success: false, error: 'Energia insuficiente!' }
    }

    // Verificar limite de sessão
    if (this.clickCount >= this.config.max_clicks_per_session) {
      return { success: false, error: 'Limite de cliques da sessão atingido!' }
    }

    try {
      this.lastClickTime = now
      this.clickCount++
      this.energy--

      // Calcular pontos com power-ups
      let points = this.config.points_per_click
      let experience = this.config.experience_per_click

      // Aplicar power-ups ativos
      for (const [powerUpType, powerUp] of this.activePowerUps) {
        if (now < powerUp.expiresAt) {
          points *= powerUp.multiplier
          experience *= powerUp.multiplier
        } else {
          this.activePowerUps.delete(powerUpType)
        }
      }

      // Adicionar pontos
      const result = await this.awardPoints(points, experience, {
        click_number: this.clickCount,
        energy_used: 1,
        power_ups_active: Array.from(this.activePowerUps.keys())
      })

      if (result.success) {
        this.updateClickDisplay()
        this.updateEnergyDisplay()
        
        // Verificar se deve ativar power-up aleatório
        if (Math.random() < 0.05) { // 5% de chance
          this.activateRandomPowerUp()
        }
      }

      return result
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Ativar power-up aleatório
  activateRandomPowerUp() {
    const powerUpTypes = Object.keys(this.config.power_ups)
    const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]
    const powerUp = this.config.power_ups[randomType]
    
    this.activePowerUps.set(randomType, {
      ...powerUp,
      expiresAt: Date.now() + powerUp.duration
    })

    console.log(`⚡ Power-up ativado: ${randomType}`)
    if (window.showPowerUpNotification) {
      window.showPowerUpNotification(randomType, powerUp.duration)
    }
  }

  // Atualizar displays
  updateClickDisplay() {
    const element = document.getElementById('click-count')
    if (element) element.textContent = this.clickCount
  }

  updateEnergyDisplay() {
    const element = document.getElementById('energy-bar')
    if (element) {
      element.style.width = `${(this.energy / this.maxEnergy) * 100}%`
    }
    
    const text = document.getElementById('energy-text')
    if (text) text.textContent = `${this.energy}/${this.maxEnergy}`
  }
}

// Crypto Quiz
export class CryptoQuizGame extends BaseGame {
  constructor() {
    super('crypto_quiz')
    this.currentQuestion = 0
    this.correctAnswers = 0
    this.streak = 0
    this.maxStreak = 0
    this.questions = []
    this.startTime = 0
  }

  async loadQuestions() {
    // Carregar perguntas do quiz (pode ser de uma API ou arquivo local)
    this.questions = await this.getQuizQuestions()
    return this.questions.length > 0
  }

  async startQuiz() {
    if (!await this.loadQuestions()) {
      return { success: false, error: 'Não foi possível carregar as perguntas' }
    }

    this.currentQuestion = 0
    this.correctAnswers = 0
    this.streak = 0
    this.startTime = Date.now()
    
    return await this.initialize()
  }

  async answerQuestion(selectedAnswer, questionStartTime) {
    if (this.currentQuestion >= this.questions.length) {
      return { success: false, error: 'Quiz já finalizado' }
    }

    const question = this.questions[this.currentQuestion]
    const isCorrect = selectedAnswer === question.correct_answer
    const answerTime = Date.now() - questionStartTime

    let points = 0
    let experience = 0

    if (isCorrect) {
      this.correctAnswers++
      this.streak++
      this.maxStreak = Math.max(this.maxStreak, this.streak)

      // Pontos base
      points = this.config.points_per_correct
      experience = this.config.experience_per_correct

      // Bonus por streak
      if (this.streak > 1) {
        points += this.config.points_per_streak * (this.streak - 1)
      }

      // Bonus por velocidade
      if (answerTime < this.config.time_bonus_threshold) {
        points += this.config.time_bonus_points
      }

      // Adicionar pontos
      await this.awardPoints(points, experience, {
        question_id: question.id,
        answer_time_ms: answerTime,
        streak: this.streak,
        is_correct: true
      })
    } else {
      this.streak = 0
      
      // Registrar resposta incorreta (sem pontos)
      await this.awardPoints(0, 0, {
        question_id: question.id,
        answer_time_ms: answerTime,
        streak: 0,
        is_correct: false
      })
    }

    this.currentQuestion++

    return {
      success: true,
      is_correct: isCorrect,
      points_earned: points,
      experience_earned: experience,
      streak: this.streak,
      question_number: this.currentQuestion,
      total_questions: this.questions.length,
      quiz_finished: this.currentQuestion >= this.questions.length
    }
  }

  async getQuizQuestions() {
    // Perguntas de exemplo sobre Solana e DeFi
    return [
      {
        id: 1,
        question: "Qual é o consenso usado pela blockchain Solana?",
        options: ["Proof of Work", "Proof of Stake", "Proof of History", "Delegated Proof of Stake"],
        correct_answer: 2,
        explanation: "Solana usa Proof of History (PoH) combinado com Proof of Stake."
      },
      {
        id: 2,
        question: "O que significa DeFi?",
        options: ["Digital Finance", "Decentralized Finance", "Distributed Finance", "Direct Finance"],
        correct_answer: 1,
        explanation: "DeFi significa Decentralized Finance (Finanças Descentralizadas)."
      },
      {
        id: 3,
        question: "Qual é a moeda nativa da Solana?",
        options: ["ETH", "BTC", "SOL", "ADA"],
        correct_answer: 2,
        explanation: "SOL é a moeda nativa da blockchain Solana."
      },
      // Adicionar mais perguntas aqui...
    ]
  }

  getQuizStats() {
    return {
      ...this.getSessionStats(),
      correct_answers: this.correctAnswers,
      total_questions: this.questions.length,
      accuracy: this.questions.length > 0 ? (this.correctAnswers / this.questions.length) * 100 : 0,
      max_streak: this.maxStreak
    }
  }
}

// Lucky Spin
export class LuckySpinGame extends BaseGame {
  constructor() {
    super('lucky_spin')
    this.lastSpinTime = 0
    this.spinHistory = []
  }

  async spin() {
    const now = Date.now()
    
    // Verificar cooldown
    if (now - this.lastSpinTime < this.config.cooldown_ms) {
      const remainingTime = this.config.cooldown_ms - (now - this.lastSpinTime)
      return { 
        success: false, 
        error: 'Cooldown ativo',
        remaining_time: remainingTime
      }
    }

    try {
      this.lastSpinTime = now
      
      // Determinar recompensa baseada na probabilidade
      const reward = this.determineReward()
      
      // Adicionar pontos
      const result = await this.awardPoints(reward.points, reward.experience, {
        reward_type: reward.type,
        spin_number: this.spinHistory.length + 1
      })

      if (result.success) {
        this.spinHistory.push({
          timestamp: now,
          reward: reward,
          points: reward.points,
          experience: reward.experience
        })

        // Mostrar animação da roleta
        if (window.showSpinAnimation) {
          window.showSpinAnimation(reward)
        }
      }

      return {
        ...result,
        reward: reward,
        next_spin_available: now + this.config.cooldown_ms
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  determineReward() {
    const random = Math.random()
    let cumulativeProbability = 0

    for (const [type, reward] of Object.entries(this.config.rewards)) {
      cumulativeProbability += reward.probability
      if (random <= cumulativeProbability) {
        return { type, ...reward }
      }
    }

    // Fallback para common
    return { type: 'common', ...this.config.rewards.common }
  }

  getSpinHistory() {
    return this.spinHistory
  }

  getNextSpinTime() {
    return this.lastSpinTime + this.config.cooldown_ms
  }
}

// Treasure Hunt
export class TreasureHuntGame extends BaseGame {
  constructor() {
    super('treasure_hunt')
    this.currentMap = null
    this.playerPosition = { x: 0, y: 0 }
    this.treasuresFound = 0
    this.hintsUsed = 0
  }

  async generateNewMap() {
    const size = this.config.map_size
    const treasureCount = this.config.treasures_per_map
    
    this.currentMap = {
      size: size,
      treasures: this.generateTreasurePositions(size, treasureCount),
      discovered: new Set(),
      playerPosition: { x: Math.floor(size/2), y: Math.floor(size/2) }
    }

    this.playerPosition = this.currentMap.playerPosition
    this.treasuresFound = 0
    this.hintsUsed = 0

    return await this.initialize()
  }

  generateTreasurePositions(size, count) {
    const positions = []
    const used = new Set()

    while (positions.length < count) {
      const x = Math.floor(Math.random() * size)
      const y = Math.floor(Math.random() * size)
      const key = `${x},${y}`

      if (!used.has(key)) {
        used.add(key)
        positions.push({ 
          x, 
          y, 
          type: this.getTreasureType(),
          found: false 
        })
      }
    }

    return positions
  }

  getTreasureType() {
    const random = Math.random()
    if (random < 0.1) return 'legendary'
    if (random < 0.3) return 'rare'
    return 'common'
  }

  async movePlayer(direction) {
    if (!this.currentMap) {
      return { success: false, error: 'Nenhum mapa ativo' }
    }

    const { x, y } = this.playerPosition
    let newX = x
    let newY = y

    switch (direction) {
      case 'up': newY = Math.max(0, y - 1); break
      case 'down': newY = Math.min(this.currentMap.size - 1, y + 1); break
      case 'left': newX = Math.max(0, x - 1); break
      case 'right': newX = Math.min(this.currentMap.size - 1, x + 1); break
      default: return { success: false, error: 'Direção inválida' }
    }

    this.playerPosition = { x: newX, y: newY }

    // Verificar se encontrou tesouro
    const treasure = this.currentMap.treasures.find(t => 
      t.x === newX && t.y === newY && !t.found
    )

    if (treasure) {
      return await this.collectTreasure(treasure)
    }

    return {
      success: true,
      position: this.playerPosition,
      hint: this.getProximityHint()
    }
  }

  async collectTreasure(treasure) {
    treasure.found = true
    this.treasuresFound++

    let points = this.config.points_per_treasure
    let experience = this.config.experience_per_treasure

    // Multiplicador baseado no tipo do tesouro
    const multipliers = { common: 1, rare: 2, legendary: 5 }
    const multiplier = multipliers[treasure.type] || 1
    
    points *= multiplier
    experience *= multiplier

    const result = await this.awardPoints(points, experience, {
      treasure_type: treasure.type,
      treasure_position: { x: treasure.x, y: treasure.y },
      treasures_found: this.treasuresFound,
      map_progress: this.treasuresFound / this.currentMap.treasures.length
    })

    // Verificar se completou o mapa
    if (this.treasuresFound === this.currentMap.treasures.length) {
      await this.completeMap()
    }

    return {
      ...result,
      treasure: treasure,
      treasures_found: this.treasuresFound,
      map_completed: this.treasuresFound === this.currentMap.treasures.length
    }
  }

  async completeMap() {
    const bonusPoints = this.config.bonus_per_map_completion
    const bonusExperience = bonusPoints / 2

    await this.awardPoints(bonusPoints, bonusExperience, {
      map_completed: true,
      treasures_found: this.treasuresFound,
      hints_used: this.hintsUsed,
      efficiency_bonus: this.hintsUsed === 0 ? 1.5 : 1.0
    })

    console.log('🗺️ Mapa completado! Bonus recebido!')
  }

  getProximityHint() {
    if (!this.currentMap) return null

    const { x, y } = this.playerPosition
    let closestDistance = Infinity
    let closestTreasure = null

    for (const treasure of this.currentMap.treasures) {
      if (!treasure.found) {
        const distance = Math.abs(treasure.x - x) + Math.abs(treasure.y - y)
        if (distance < closestDistance) {
          closestDistance = distance
          closestTreasure = treasure
        }
      }
    }

    if (closestDistance <= 2) {
      return 'Muito quente! 🔥'
    } else if (closestDistance <= 4) {
      return 'Quente! 🌡️'
    } else if (closestDistance <= 6) {
      return 'Morno 😐'
    } else {
      return 'Frio ❄️'
    }
  }

  async buyHint() {
    // Implementar sistema de compra de dicas com pontos
    const cost = this.config.hint_cost
    
    // Verificar se tem pontos suficientes
    const userData = await meowPoints.getUserData()
    if (!userData.success || userData.data.total_points < cost) {
      return { success: false, error: 'Pontos insuficientes para comprar dica' }
    }

    // Deduzir pontos
    await this.awardPoints(-cost, 0, {
      hint_purchased: true,
      hint_number: this.hintsUsed + 1
    })

    this.hintsUsed++

    // Fornecer dica específica
    const hint = this.getSpecificHint()
    
    return {
      success: true,
      hint: hint,
      cost: cost,
      hints_used: this.hintsUsed
    }
  }

  getSpecificHint() {
    const { x, y } = this.playerPosition
    const unFoundTreasures = this.currentMap.treasures.filter(t => !t.found)
    
    if (unFoundTreasures.length === 0) return "Todos os tesouros foram encontrados!"
    
    const closest = unFoundTreasures.reduce((prev, curr) => {
      const prevDist = Math.abs(prev.x - x) + Math.abs(prev.y - y)
      const currDist = Math.abs(curr.x - x) + Math.abs(curr.y - y)
      return currDist < prevDist ? curr : prev
    })

    const direction = this.getDirectionHint(closest)
    return `Há um tesouro ${closest.type} ${direction}`
  }

  getDirectionHint(treasure) {
    const { x, y } = this.playerPosition
    const dx = treasure.x - x
    const dy = treasure.y - y

    let direction = ""
    if (dy < 0) direction += "ao norte "
    if (dy > 0) direction += "ao sul "
    if (dx < 0) direction += "a oeste"
    if (dx > 0) direction += "a leste"

    return direction || "bem próximo"
  }
}

// Battle Arena
export class BattleArenaGame extends BaseGame {
  constructor() {
    super('battle_arena')
    this.playerStats = {
      hp: 100,
      attack: 20,
      defense: 10,
      speed: 15
    }
    this.wins = 0
    this.losses = 0
    this.winStreak = 0
    this.currentBattle = null
  }

  async startBattle() {
    if (this.sessionData.activities >= this.config.max_battles_per_session) {
      return { success: false, error: 'Limite de batalhas da sessão atingido' }
    }

    // Gerar oponente baseado no nível do jogador
    const opponent = this.generateOpponent()
    
    this.currentBattle = {
      opponent: opponent,
      playerHp: this.playerStats.hp,
      opponentHp: opponent.hp,
      turn: Math.random() < 0.5 ? 'player' : 'opponent',
      log: []
    }

    return {
      success: true,
      battle: this.currentBattle,
      player_stats: this.playerStats
    }
  }

  generateOpponent() {
    const types = ['Crypto Bear', 'DeFi Dragon', 'NFT Knight', 'Blockchain Beast', 'Token Tiger']
    const type = types[Math.floor(Math.random() * types.length)]
    
    // Gerar stats baseadas no nível do jogador
    const baseStats = 15 + Math.floor(Math.random() * 10)
    
    return {
      name: type,
      hp: baseStats * 5,
      attack: baseStats + Math.floor(Math.random() * 5),
      defense: baseStats + Math.floor(Math.random() * 5),
      speed: baseStats + Math.floor(Math.random() * 5)
    }
  }

  async performAction(action, target = null) {
    if (!this.currentBattle) {
      return { success: false, error: 'Nenhuma batalha ativa' }
    }

    if (this.currentBattle.turn !== 'player') {
      return { success: false, error: 'Não é seu turno' }
    }

    const result = await this.executeAction('player', action, target)
    
    // Verificar se batalha terminou
    if (this.currentBattle.opponentHp <= 0) {
      return await this.endBattle('victory')
    }

    // Turno do oponente
    this.currentBattle.turn = 'opponent'
    const opponentAction = this.getOpponentAction()
    const opponentResult = await this.executeAction('opponent', opponentAction.action, opponentAction.target)

    // Verificar se jogador perdeu
    if (this.currentBattle.playerHp <= 0) {
      return await this.endBattle('defeat')
    }

    // Próximo turno do jogador
    this.currentBattle.turn = 'player'

    return {
      success: true,
      player_action: result,
      opponent_action: opponentResult,
      battle_state: this.currentBattle
    }
  }

  async executeAction(actor, action, target) {
    const isPlayer = actor === 'player'
    const attacker = isPlayer ? this.playerStats : this.currentBattle.opponent
    const defender = isPlayer ? this.currentBattle.opponent : this.playerStats
    const attackerHpKey = isPlayer ? 'playerHp' : 'opponentHp'
    const defenderHpKey = isPlayer ? 'opponentHp' : 'playerHp'

    let damage = 0
    let healing = 0
    let message = ''

    switch (action) {
      case 'attack':
        damage = Math.max(1, attacker.attack - defender.defense + Math.floor(Math.random() * 5))
        this.currentBattle[defenderHpKey] = Math.max(0, this.currentBattle[defenderHpKey] - damage)
        message = `${isPlayer ? 'Você' : attacker.name} atacou causando ${damage} de dano!`
        break
        
      case 'defend':
        // Reduzir dano do próximo ataque
        message = `${isPlayer ? 'Você' : attacker.name} se defendeu!`
        break
        
      case 'heal':
        healing = Math.floor(attacker.hp * 0.2)
        this.currentBattle[attackerHpKey] = Math.min(attacker.hp, this.currentBattle[attackerHpKey] + healing)
        message = `${isPlayer ? 'Você' : attacker.name} se curou em ${healing} HP!`
        break
    }

    this.currentBattle.log.push(message)

    return {
      action: action,
      damage: damage,
      healing: healing,
      message: message
    }
  }

  getOpponentAction() {
    const actions = ['attack', 'defend', 'heal']
    const weights = [0.6, 0.2, 0.2] // 60% attack, 20% defend, 20% heal
    
    // Ajustar pesos baseado na vida
    const hpPercentage = this.currentBattle.opponentHp / this.currentBattle.opponent.hp
    if (hpPercentage < 0.3) {
      weights[2] = 0.5 // Mais chance de curar quando com pouca vida
      weights[0] = 0.3
      weights[1] = 0.2
    }

    const random = Math.random()
    let cumulative = 0
    
    for (let i = 0; i < actions.length; i++) {
      cumulative += weights[i]
      if (random <= cumulative) {
        return { action: actions[i], target: null }
      }
    }

    return { action: 'attack', target: null }
  }

  async endBattle(result) {
    const isVictory = result === 'victory'
    
    let points = 0
    let experience = 0

    if (isVictory) {
      this.wins++
      this.winStreak++
      
      points = this.config.points_per_win
      experience = this.config.experience_per_win
      
      // Bonus por sequência de vitórias
      if (this.winStreak > 1) {
        const streakBonus = this.config.streak_bonus * (this.winStreak - 1)
        points += streakBonus
      }
    } else {
      this.losses++
      this.winStreak = 0
      
      points = this.config.points_per_loss
      experience = this.config.experience_per_loss
    }

    const pointsResult = await this.awardPoints(points, experience, {
      battle_result: result,
      opponent: this.currentBattle.opponent.name,
      win_streak: this.winStreak,
      battle_duration: Date.now() - this.currentBattle.startTime
    })

    const battleResult = {
      ...pointsResult,
      result: result,
      points_earned: points,
      experience_earned: experience,
      win_streak: this.winStreak,
      battle_log: this.currentBattle.log,
      stats: {
        wins: this.wins,
        losses: this.losses,
        win_rate: this.wins / (this.wins + this.losses) * 100
      }
    }

    this.currentBattle = null
    return battleResult
  }

  getBattleStats() {
    return {
      wins: this.wins,
      losses: this.losses,
      win_rate: this.wins / (this.wins + this.losses) * 100,
      win_streak: this.winStreak,
      total_battles: this.wins + this.losses
    }
  }
}

// ========================================
// GERENCIADOR GLOBAL DOS JOGOS
// ========================================

export class GameManager {
  constructor() {
    this.games = {
      meow_clicker: new MeowClickerGame(),
      crypto_quiz: new CryptoQuizGame(),
      lucky_spin: new LuckySpinGame(),
      treasure_hunt: new TreasureHuntGame(),
      battle_arena: new BattleArenaGame()
    }
    this.activeGame = null
  }

  // Obter instância de um jogo
  getGame(gameType) {
    return this.games[gameType]
  }

  // Ativar um jogo
  async activateGame(gameType) {
    if (!this.games[gameType]) {
      throw new Error(`Jogo não encontrado: ${gameType}`)
    }

    this.activeGame = gameType
    return await this.games[gameType].initialize()
  }

  // Obter estatísticas de todos os jogos
  async getAllGameStats() {
    const stats = {}
    
    for (const [gameType, game] of Object.entries(this.games)) {
      if (game.getSessionStats) {
        stats[gameType] = game.getSessionStats()
      }
    }

    return stats
  }

  // Finalizar todas as sessões
  finishAllSessions() {
    const results = {}
    
    for (const [gameType, game] of Object.entries(this.games)) {
      if (game.isActive) {
        results[gameType] = game.finishSession()
      }
    }

    return results
  }
}

// Instância global do gerenciador
export const gameManager = new GameManager()

// Funções de conveniência para cada jogo
export const initMeowClicker = () => gameManager.activateGame('meow_clicker')
export const initCryptoQuiz = () => gameManager.activateGame('crypto_quiz')
export const initLuckySpin = () => gameManager.activateGame('lucky_spin')
export const initTreasureHunt = () => gameManager.activateGame('treasure_hunt')
export const initBattleArena = () => gameManager.activateGame('battle_arena')

// Exportar classes individuais
export {
  MeowClickerGame,
  CryptoQuizGame,
  LuckySpinGame,
  TreasureHuntGame,
  BattleArenaGame
}

console.log('🎮 Sistema de Jogos Integrado carregado!')

