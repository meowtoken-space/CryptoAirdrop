// gameIntegration.js - Integração com os jogos do Meow Token
class GameIntegration {
  constructor() {
    this.pointsSystem = window.meowPoints;
    this.cooldowns = new Map(); // Para controlar cooldowns dos jogos
    this.dailyLimits = new Map(); // Para controlar limites diários
    this.init();
  }

  init() {
    // Configurar limites diários por jogo
    this.dailyLimits.set('Meow Clicker', 500); // Máximo 500 pontos por dia
    this.dailyLimits.set('Crypto Quiz', 300);
    this.dailyLimits.set('Lucky Spin', 200);
    this.dailyLimits.set('Treasure Hunt', 400);
    this.dailyLimits.set('Battle Arena', 600);
    this.dailyLimits.set('Social Media', 150);
  }

  // Verificar se usuário pode ganhar pontos (limite diário)
  canEarnPoints(gameName, pointsToEarn) {
    const userData = this.pointsSystem.getUserData();
    if (!userData) return false;

    const today = new Date().toDateString();
    const todayHistory = userData.gameHistory.filter(session => 
      new Date(session.timestamp).toDateString() === today &&
      session.gameName === gameName
    );

    const todayPoints = todayHistory.reduce((sum, session) => sum + session.pointsEarned, 0);
    const dailyLimit = this.dailyLimits.get(gameName) || 1000;

    return (todayPoints + pointsToEarn) <= dailyLimit;
  }

  // Verificar cooldown
  checkCooldown(gameName, cooldownMinutes = 0) {
    if (cooldownMinutes === 0) return true;

    const lastPlay = this.cooldowns.get(gameName);
    if (!lastPlay) return true;

    const now = Date.now();
    const cooldownMs = cooldownMinutes * 60 * 1000;
    return (now - lastPlay) >= cooldownMs;
  }

  // Definir cooldown
  setCooldown(gameName) {
    this.cooldowns.set(gameName, Date.now());
  }

  // Meow Clicker - Sistema de cliques
  submitMeowClickerScore(clicks, energyUsed, powerUpsUsed = []) {
    const basePoints = clicks * 1; // 1 ponto por clique
    let bonusPoints = 0;

    // Bônus por eficiência energética
    if (energyUsed > 0) {
      const efficiency = clicks / energyUsed;
      if (efficiency > 2) bonusPoints += Math.floor(efficiency * 5);
    }

    // Bônus por power-ups
    powerUpsUsed.forEach(powerUp => {
      switch (powerUp.type) {
        case '2x_multiplier':
          bonusPoints += clicks * 1;
          break;
        case '5x_multiplier':
          bonusPoints += clicks * 4;
          break;
        case '10x_multiplier':
          bonusPoints += clicks * 9;
          break;
      }
    });

    const totalPoints = basePoints + bonusPoints;

    // Verificar limite diário
    if (!this.canEarnPoints('Meow Clicker', totalPoints)) {
      return { 
        success: false, 
        error: 'Limite diário de pontos atingido para Meow Clicker',
        dailyLimit: this.dailyLimits.get('Meow Clicker')
      };
    }

    return this.pointsSystem.addPoints('Meow Clicker', totalPoints, {
      clicks,
      energyUsed,
      efficiency: energyUsed > 0 ? clicks / energyUsed : 0,
      powerUpsUsed,
      bonusPoints,
      basePoints
    });
  }

  // Crypto Quiz - Sistema de perguntas
  submitQuizScore(correctAnswers, totalQuestions, timeSpent, difficulty = 'medium') {
    // Pontos base por resposta correta
    const difficultyMultiplier = {
      'easy': 5,
      'medium': 10,
      'hard': 15
    };

    const basePoints = correctAnswers * (difficultyMultiplier[difficulty] || 10);
    
    // Bônus por velocidade (máximo 300 segundos)
    const timeBonus = Math.max(0, 300 - timeSpent);
    const speedBonus = Math.floor(timeBonus / 10);
    
    // Bônus por precisão
    const accuracy = (correctAnswers / totalQuestions) * 100;
    let accuracyBonus = 0;
    if (accuracy === 100) accuracyBonus = 50;
    else if (accuracy >= 90) accuracyBonus = 30;
    else if (accuracy >= 80) accuracyBonus = 15;

    // Bônus por streak (perguntas consecutivas corretas)
    let streakBonus = 0;
    if (correctAnswers >= 5) streakBonus = 25;
    if (correctAnswers >= 8) streakBonus = 50;
    if (correctAnswers === totalQuestions && totalQuestions >= 10) streakBonus = 100;

    const totalPoints = basePoints + speedBonus + accuracyBonus + streakBonus;

    // Verificar limite diário
    if (!this.canEarnPoints('Crypto Quiz', totalPoints)) {
      return { 
        success: false, 
        error: 'Limite diário de pontos atingido para Crypto Quiz',
        dailyLimit: this.dailyLimits.get('Crypto Quiz')
      };
    }

    return this.pointsSystem.addPoints('Crypto Quiz', totalPoints, {
      correctAnswers,
      totalQuestions,
      timeSpent,
      difficulty,
      accuracy,
      basePoints,
      speedBonus,
      accuracyBonus,
      streakBonus
    });
  }

  // Lucky Spin - Sistema de roleta
  submitSpinScore(prize, spinType = 'normal', spinCost = 50) {
    // Verificar cooldown (1 hora para spins normais)
    const cooldownMinutes = spinType === 'premium' ? 30 : 60;
    
    if (!this.checkCooldown('Lucky Spin', cooldownMinutes)) {
      const lastSpin = this.cooldowns.get('Lucky Spin');
      const nextSpin = new Date(lastSpin + (cooldownMinutes * 60 * 1000));
      return { 
        success: false, 
        error: `Aguarde até ${nextSpin.toLocaleTimeString('pt-BR')} para girar novamente`,
        nextSpinTime: nextSpin
      };
    }

    // Verificar se usuário tem pontos suficientes para o spin
    const userData = this.pointsSystem.getUserData();
    if (userData && userData.totalPoints < spinCost) {
      return { 
        success: false, 
        error: `Você precisa de ${spinCost} pontos para girar`,
        currentPoints: userData.totalPoints
      };
    }

    // Deduzir custo do spin dos pontos atuais
    const netPoints = prize - spinCost;

    // Verificar limite diário
    if (netPoints > 0 && !this.canEarnPoints('Lucky Spin', netPoints)) {
      return { 
        success: false, 
        error: 'Limite diário de pontos atingido para Lucky Spin',
        dailyLimit: this.dailyLimits.get('Lucky Spin')
      };
    }

    // Definir cooldown
    this.setCooldown('Lucky Spin');

    return this.pointsSystem.addPoints('Lucky Spin', netPoints, {
      prize,
      spinType,
      spinCost,
      netGain: netPoints,
      timestamp: new Date().toISOString()
    });
  }

  // Treasure Hunt - Sistema de caça ao tesouro
  submitTreasureScore(treasuresFound, mapCompleted, mapSize = 'medium', hintsUsed = 0) {
    const sizeMultiplier = {
      'small': 15,
      'medium': 25,
      'large': 40
    };

    const basePoints = treasuresFound * (sizeMultiplier[mapSize] || 25);
    
    // Bônus por completar o mapa
    let completionBonus = 0;
    if (mapCompleted) {
      completionBonus = mapSize === 'large' ? 150 : mapSize === 'medium' ? 100 : 50;
    }

    // Penalidade por usar muitas dicas
    let hintPenalty = 0;
    if (hintsUsed > 3) {
      hintPenalty = (hintsUsed - 3) * 10;
    }

    // Bônus por eficiência (encontrar tesouros sem dicas)
    let efficiencyBonus = 0;
    if (hintsUsed === 0 && treasuresFound >= 5) {
      efficiencyBonus = 50;
    }

    const totalPoints = Math.max(0, basePoints + completionBonus + efficiencyBonus - hintPenalty);

    // Verificar limite diário
    if (!this.canEarnPoints('Treasure Hunt', totalPoints)) {
      return { 
        success: false, 
        error: 'Limite diário de pontos atingido para Treasure Hunt',
        dailyLimit: this.dailyLimits.get('Treasure Hunt')
      };
    }

    return this.pointsSystem.addPoints('Treasure Hunt', totalPoints, {
      treasuresFound,
      mapCompleted,
      mapSize,
      hintsUsed,
      basePoints,
      completionBonus,
      efficiencyBonus,
      hintPenalty
    });
  }

  // Battle Arena - Sistema de combate
  submitBattleScore(won, enemyLevel, damageDealt, battleDuration, comboCount = 0) {
    // Pontos base por vitória/derrota
    const basePoints = won ? enemyLevel * 20 : enemyLevel * 5;
    
    // Bônus por dano causado
    const damageBonus = Math.floor(damageDealt / 100);
    
    // Bônus por velocidade da batalha
    let speedBonus = 0;
    if (battleDuration < 30) speedBonus = 50;
    else if (battleDuration < 60) speedBonus = 25;
    
    // Bônus por combos
    const comboBonus = comboCount * 5;
    
    // Bônus por derrotar inimigo de nível alto
    let levelBonus = 0;
    if (won && enemyLevel >= 10) levelBonus = 100;
    else if (won && enemyLevel >= 5) levelBonus = 50;

    const totalPoints = basePoints + damageBonus + speedBonus + comboBonus + levelBonus;

    // Verificar limite diário
    if (!this.canEarnPoints('Battle Arena', totalPoints)) {
      return { 
        success: false, 
        error: 'Limite diário de pontos atingido para Battle Arena',
        dailyLimit: this.dailyLimits.get('Battle Arena')
      };
    }

    return this.pointsSystem.addPoints('Battle Arena', totalPoints, {
      won,
      enemyLevel,
      damageDealt,
      battleDuration,
      comboCount,
      basePoints,
      damageBonus,
      speedBonus,
      comboBonus,
      levelBonus
    });
  }

  // Recompensas sociais (Twitter, Telegram, etc.)
  submitSocialReward(platform, action, verified = false, extraData = {}) {
    const socialPoints = {
      'twitter_follow': 50,
      'twitter_retweet': 25,
      'twitter_like': 10,
      'twitter_comment': 30,
      'telegram_join': 40,
      'telegram_invite': 20,
      'discord_join': 35,
      'discord_message': 15,
      'instagram_follow': 30,
      'instagram_story': 20,
      'youtube_subscribe': 45,
      'youtube_like': 15,
      'tiktok_follow': 25,
      'tiktok_share': 20
    };

    const basePoints = socialPoints[`${platform}_${action}`] || 10;
    
    // Bônus por verificação
    const verificationBonus = verified ? Math.floor(basePoints * 0.5) : 0;
    
    // Bônus por primeira vez na plataforma
    let firstTimeBonus = 0;
    const userData = this.pointsSystem.getUserData();
    if (userData) {
      const platformHistory = userData.gameHistory.filter(session => 
        session.gameName === 'Social Media' && 
        session.sessionData.platform === platform
      );
      
      if (platformHistory.length === 0) {
        firstTimeBonus = 25; // Bônus por primeira interação na plataforma
      }
    }

    const totalPoints = basePoints + verificationBonus + firstTimeBonus;

    // Verificar limite diário
    if (!this.canEarnPoints('Social Media', totalPoints)) {
      return { 
        success: false, 
        error: 'Limite diário de pontos atingido para Social Media',
        dailyLimit: this.dailyLimits.get('Social Media')
      };
    }

    return this.pointsSystem.addPoints('Social Media', totalPoints, {
      platform,
      action,
      verified,
      basePoints,
      verificationBonus,
      firstTimeBonus,
      ...extraData
    });
  }

  // Missões especiais
  submitMissionReward(missionId, missionName, difficulty = 'medium') {
    const difficultyPoints = {
      'easy': 100,
      'medium': 200,
      'hard': 350,
      'legendary': 500
    };

    const basePoints = difficultyPoints[difficulty] || 200;
    
    // Verificar se missão já foi completada
    const userData = this.pointsSystem.getUserData();
    if (userData) {
      const missionHistory = userData.gameHistory.filter(session => 
        session.gameName === 'Special Mission' && 
        session.sessionData.missionId === missionId
      );
      
      if (missionHistory.length > 0) {
        return { 
          success: false, 
          error: 'Missão já foi completada anteriormente'
        };
      }
    }

    return this.pointsSystem.addPoints('Special Mission', basePoints, {
      missionId,
      missionName,
      difficulty,
      completedAt: new Date().toISOString()
    });
  }

  // Bônus por referência
  submitReferralBonus(referredWallet, bonusType = 'new_user') {
    const bonusPoints = {
      'new_user': 100,      // Usuário novo se registrou
      'first_game': 50,     // Usuário referido jogou primeiro jogo
      'active_week': 75,    // Usuário referido ativo por uma semana
      'level_5': 150        // Usuário referido chegou ao nível 5
    };

    const points = bonusPoints[bonusType] || 50;

    return this.pointsSystem.addPoints('Referral Bonus', points, {
      referredWallet,
      bonusType,
      timestamp: new Date().toISOString()
    });
  }

  // Obter estatísticas de jogos
  getGameStats() {
    return this.pointsSystem.getGameStats();
  }

  // Obter limites diários restantes
  getDailyLimitsRemaining() {
    const userData = this.pointsSystem.getUserData();
    if (!userData) return {};

    const today = new Date().toDateString();
    const limits = {};

    this.dailyLimits.forEach((limit, gameName) => {
      const todayHistory = userData.gameHistory.filter(session => 
        new Date(session.timestamp).toDateString() === today &&
        session.gameName === gameName
      );

      const todayPoints = todayHistory.reduce((sum, session) => sum + session.pointsEarned, 0);
      limits[gameName] = {
        limit,
        used: todayPoints,
        remaining: Math.max(0, limit - todayPoints),
        percentage: Math.min(100, (todayPoints / limit) * 100)
      };
    });

    return limits;
  }

  // Obter cooldowns ativos
  getActiveCooldowns() {
    const cooldowns = {};
    const now = Date.now();

    this.cooldowns.forEach((lastPlay, gameName) => {
      const cooldownMinutes = gameName === 'Lucky Spin' ? 60 : 0;
      if (cooldownMinutes > 0) {
        const cooldownMs = cooldownMinutes * 60 * 1000;
        const timeLeft = Math.max(0, cooldownMs - (now - lastPlay));
        
        if (timeLeft > 0) {
          cooldowns[gameName] = {
            timeLeft: timeLeft,
            nextPlay: new Date(now + timeLeft),
            minutes: Math.ceil(timeLeft / (60 * 1000))
          };
        }
      }
    });

    return cooldowns;
  }

  // Resetar cooldowns (apenas para desenvolvimento)
  resetCooldowns() {
    this.cooldowns.clear();
  }

  // Resetar limites diários (apenas para desenvolvimento)
  resetDailyLimits() {
    // Esta função não faz nada, pois os limites são baseados na data
    // Os limites são automaticamente resetados a cada novo dia
    console.log('Limites diários são resetados automaticamente a cada novo dia');
  }
}

// Instância global
window.gameIntegration = new GameIntegration();

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameIntegration;
}

